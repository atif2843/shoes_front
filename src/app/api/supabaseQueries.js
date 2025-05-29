import supabase from './auth/supabaseClient';

// Get trending products
export async function getTrendingProducts() {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      productImages (
        prod_images
      )
    `)
    .eq('trending', true);

  if (error) throw error;
  return data;
}

// Get all brands
export async function getAllBrands() {
  const { data, error } = await supabase
    .from('brands')
    .select('*');

  if (error) throw error;
  return data;
}

// Get products grouped by productType
export async function getProductsBySports() {
    const { data, error } = await supabase
    .from('products')
    .select(`
        *,
        productImages (
            prod_images
        )
    `)
    .ilike('productType', '%sports%')
    .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
}

// Get latest 5 products
export async function getNewArrivals() {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      productImages (
        prod_images
      )
    `)
    .order('releaseDate', { ascending: false })
    .limit(10);

  if (error) throw error;
  return data;
}

// Get latest 5 brands from products
export async function getTopBrands() {
  // First, get the latest 5 brands
  const { data: brands, error: brandsError } = await supabase
    .from('brands')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5);

  if (brandsError) throw brandsError;

  // Then, for each brand, get their products
  const brandsWithProducts = await Promise.all(
    brands.map(async (brand) => {
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select(`
          *,
          productImages (
            prod_images
          )
        `)
        .eq('brand', brand.name)
        .limit(4); // Get 4 products per brand

      if (productsError) throw productsError;

      return {
        ...brand,
        products: products || []
      };
    })
  );

  return brandsWithProducts;
}

// Get trending products
export async function getRecommendedProducts(slug) {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      productImages (
        prod_images
      )
    `)
    .eq('brand', slug);

  if (error) throw error;
  return data;
}

// Get product by slug
export async function getProductBySlug(slug) {
  try {
    
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        productImages (
          prod_images,
          prod_id
        )
      `)
      .eq('slug', slug)
      .single();

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    if (!data) {
      return null;
    }

    // Transform the data to match the expected format
    const transformedData = {
      ...data,
      images: data.productImages.map(img => img.prod_images),
      productImages: undefined, // Remove the original productImages array
      // Ensure all required fields are present
      name: data.name || '',
      sellPrice: data.sellPrice || 0,
      originalPrice: data.originalPrice || null,
      brand: data.brand || '',
      gender: data.gender || '',
      productType: data.productType || '',
      size: data.size || [],
      stock: data.stock || 0,
      description: data.description || '',
      slug: data.slug || ''
    };
    return transformedData;
  } catch (error) {
    console.error('Error in getProductBySlug:', error);
    throw error;
  }
}

// Add item to wishlist
export async function addToWishlist(userId, productId) {
  try {
    if (!userId || !productId) {
      return false;
    }

    // First check if the item is already in the wishlist
    const isAlreadyInWishlist = await isInWishlist(userId, productId);
    if (isAlreadyInWishlist) {
      return true;
    }

    const { data, error } = await supabase
      .from('wishlist')
      .insert([
        { user_id: userId, product_id: productId }
      ])
      .select();

    if (error) {
      console.error('Error adding to wishlist:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in addToWishlist:', error);
    return false;
  }
}

// Remove item from wishlist
export async function removeFromWishlist(userId, productId) {
  try {
    if (!userId || !productId) {
      return false;
    }

    const { error } = await supabase
      .from('wishlist')
      .delete()
      .eq('user_id', userId)
      .eq('product_id', productId);

    if (error) {
      console.error('Error removing from wishlist:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in removeFromWishlist:', error);
    return false;
  }
}

// Check if item is in wishlist
export async function isInWishlist(userId, productId) {
  try {
    if (!userId || !productId) {
      return false;
    }

    const { data, error } = await supabase
      .from('wishlist')
      .select('*')
      .eq('user_id', userId)
      .eq('product_id', productId)
      .maybeSingle();

    if (error) {
      console.error('Error checking wishlist:', error);
      return false;
    }

    return !!data;
  } catch (error) {
    console.error('Error in isInWishlist:', error);
    return false;
  }
}


export async function getUserData(userId) {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching user data:', error);
    throw error;
  }
}

// Get trending products with pagination
export async function getTrendingProductsAll(lastId = null, limit = 5) {
  try {
    let query = supabase
      .from('products')
      .select('*, productImages(prod_images)', { count: 'exact' })
      .eq('trending', true)
      .order('created_at', { ascending: false })
      .limit(limit);

    // If lastId is provided, fetch products after that ID
    if (lastId) {
      query = query.lt('id', lastId);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching trending products:', error);
      throw error;
    }

    // Get the last product's ID for next pagination
    const lastProductId = data.length > 0 ? data[data.length - 1].id : null;

    return {
      products: data.map(product => ({
        ...product,
        images: product.productImages.map(img => img.prod_images)
      })),
      lastProductId,
      hasMore: data.length === limit
    };
  } catch (error) {
    console.error('Error in getTrendingProducts:', error);
    throw error;
  }
}

// Get products by sports with pagination
export async function getProductsBySportsAll(lastId = null, limit = 5) {
  try {
    let query = supabase
      .from('products')
      .select('*, productImages(prod_images)', { count: 'exact' })
      .ilike('productType', '%sports%')
      .order('created_at', { ascending: false })
      .limit(limit);

    // If lastId is provided, fetch products after that ID
    if (lastId) {
      query = query.lt('id', lastId);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching sports products:', error);
      throw error;
    }

    // Get the last product's ID for next pagination
    const lastProductId = data.length > 0 ? data[data.length - 1].id : null;

    return {
      products: data.map(product => ({
        ...product,
        images: product.productImages.map(img => img.prod_images)
      })),
      lastProductId,
      hasMore: data.length === limit
    };
  } catch (error) {
    console.error('Error in getProductsBySportsAll:', error);
    throw error;
  }
}

// Get new arrivals with pagination
export async function getNewArrivalsAll(lastId = null, limit = 5) {
  try {
    let query = supabase
      .from('products')
      .select('*, productImages(prod_images)', { count: 'exact' })
      .order('releaseDate', { ascending: false })
      .limit(limit);

    // If lastId is provided, fetch products after that ID
    if (lastId) {
      query = query.lt('id', lastId);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching new arrivals:', error);
      throw error;
    }

    // Get the last product's ID for next pagination
    const lastProductId = data.length > 0 ? data[data.length - 1].id : null;

    return {
      products: data.map(product => ({
        ...product,
        images: product.productImages.map(img => img.prod_images)
      })),
      lastProductId,
      hasMore: data.length === limit
    };
  } catch (error) {
    console.error('Error in getNewArrivalsAll:', error);
    throw error;
  }
}

// Get all brands with pagination
export async function getBrandsAll(lastId = null, limit = 6) {
  try {
    let query = supabase
      .from('brands')
      .select('*')
      .order('name', { ascending: true })
      .limit(limit);

    if (lastId) {
      // Use a more reliable pagination approach
      // Get brands with names that come after the last brand's name
      const { data: lastBrand } = await supabase
        .from('brands')
        .select('name')
        .eq('id', lastId)
        .single();
      
      if (lastBrand) {
        query = query.gt('name', lastBrand.name);
      }
    }

    const { data, error } = await query;

    if (error) throw error;

    const lastBrandId = data.length > 0 ? data[data.length - 1].id : null;
    const hasMore = data.length === limit;

    return {
      brands: data,
      lastBrandId,
      hasMore
    };
  } catch (error) {
    console.error('Error in getBrandsAll:', error);
    throw error;
  }
}

export async function getProductDetails(slug) {
  try {
    const { data: product, error } = await supabase
      .from('products')
      .select(`
        *,
        productImages (
          prod_images
        )
      `)
      .eq('slug', slug)
      .single();

    if (error) throw error;

    if (!product) {
      throw new Error('Product not found');
    }

    // Format the product data
    const formattedProduct = {
      ...product,
      images: product.productImages?.map(img => img.prod_images) || [],
      sizes: product.sizes?.map(size => ({
        size: size.size,
        stock: size.stock
      })) || []
    };

    return formattedProduct;
  } catch (error) {
    console.error('Error fetching product details:', error);
    throw error;
  }
}

export const getUserOrders = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('Order_details')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching user orders:', error);
    return [];
  }
};

export const getUserWishlist = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('wishlist')
      .select(`
        *,
        products (
          id,
          name,
          sellPrice,
          productImages (
            prod_images
          ),
          brand,
          slug
        )
      `)
      .eq('user_id', userId);

    if (error) throw error;
    
    // Transform the data to match the expected format
    return data.map(item => ({
      ...item,
      products: item.products ? {
        ...item.products,
        price: item.products.sellPrice,
        image: item.products.productImages?.[0]?.prod_images || null
      } : null
    }));
  } catch (error) {
    console.error('Error fetching user wishlist:', error);
    return [];
  }
};

export const getUserProfile = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
};
