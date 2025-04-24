"use client";
import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Minus, Plus, Pencil, LogOut, Upload } from "lucide-react";
import useAuthStore from "@/store/useAuthModal";
import { auth, logOut } from "@/lib/firebase";
import { supabase } from "@/lib/supabaseClient";
import { getUserOrders, getUserWishlist, getUserProfile } from "@/app/api/supabaseQueries";
import { toast } from "sonner";

// Create a Supabase client with service role key for admin access
const supabaseAdmin = supabase;

export default function UserProfile() {
  const { isLoggedIn, loginSuccess, user_id } = useAuthStore();
  const user = auth.currentUser;
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.displayName || "",
    email: user?.email || "",
    address: user?.address || "",
    phone: user?.phone || "",
    custom_img: user?.custom_img || "",
  });
  const [orders, setOrders] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [activeTab, setActiveTab] = useState("orders");
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: user.displayName || "",
        email: user.email || "",
        address: user.address || "",
        phone: user.phone || "",
        custom_img: user.custom_img || "",
      }));
      fetchUserData();
    }
  }, [user, user_id]);

  const fetchUserData = async () => {
    if (!user_id) return;

    setIsLoading(true);
    try {
      // Fetch orders, wishlist, and profile data
      const [ordersData, wishlistData, profileData] = await Promise.all([
        getUserOrders(user_id),
        getUserWishlist(user_id),
        getUserProfile(user_id)
      ]);

      setOrders(ordersData || []);
      setWishlist(wishlistData || []);

      if (profileData) {
        setFormData(prev => ({
          ...prev,
          address: profileData.address || "",
          phone: profileData.phone || "",
          custom_img: profileData.custom_img || "",
          name: profileData.name || "",
          email: profileData.email || "",
        }));
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      toast.error("Failed to load user data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdateProfile = async () => {
    if (!user_id) {
      toast.error("User not logged in");
      return;
    }

    try {
      console.log("Updating profile with data:", {
        id: user_id,
        name: formData.name,
        email: formData.email,
        address: formData.address,
        phone: formData.phone,
        custom_img: formData.custom_img,
      });

      // First update the user profile in the users table
      const { data, error: userError } = await supabase
        .from('users')
        .upsert({
          id: user_id,
          name: formData.name,
          email: formData.email,
          address: formData.address,
          phone: formData.phone,
          custom_img: formData.custom_img,
        })
        .select();

      if (userError) {
        console.error("Supabase error:", userError);
        throw userError;
      }

      console.log("Profile update response:", data);

      // If the update was successful, refresh the user data
      await fetchUserData();
      
      setIsEditing(false);
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error(error.message || "Failed to update profile");
    }
  };

  const handleSave = async () => {
    if (!user_id) {
      toast.error("User not logged in");
      return;
    }

    try {
      // Validate required fields
      if (!formData.name || !formData.email) {
        toast.error("Name and email are required");
        return;
      }

      // Update the profile
      await handleUpdateProfile();
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error("Failed to save profile");
    }
  };

  const handleLogout = async () => {
    await logOut();
    loginSuccess(false);
  };

  const getInitials = (name) => {
    if (!name || typeof name !== "string") return "O";
    const nameParts = name.trim().split(" ");
    return nameParts.length > 1
      ? (nameParts[0][0] + nameParts[1][0]).toUpperCase()
      : nameParts[0][0].toUpperCase();
  };

  const handleImageUpload = async (e) => {
    if (!user_id) {
      toast.error("User not logged in");
      return;
    }

    const file = e.target.files[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast.error("Please upload an image file");
      return;
    }

    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image size should be less than 2MB");
      return;
    }

    // Create a preview URL immediately
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);

    setIsUploading(true);
    try {
      // First, get the user's current profile to find the existing image
      const { data: userData, error: userError } = await supabaseAdmin
        .from('users')
        .select('custom_img')
        .eq('id', user_id)
        .single();

      if (userError) {
        console.error('Error fetching user data:', userError);
        throw new Error('Failed to fetch user data');
      }

      // If there's an existing image, delete it from storage
      if (userData.custom_img) {
        try {
          // Extract the file path from the URL
          const urlParts = userData.custom_img.split('/');
          const filePath = urlParts.slice(urlParts.indexOf('user') + 1).join('/');
          
          if (filePath) {
            // Delete the existing file
            const { error: deleteError } = await supabaseAdmin.storage
              .from('user')
              .remove([filePath]);
            
            if (deleteError) {
              console.error('Error deleting existing image:', deleteError);
              // Continue with upload even if delete fails
            }
          }
        } catch (deleteError) {
          console.error('Error in delete process:', deleteError);
          // Continue with upload even if delete fails
        }
      }

      // Create a unique file path
      const fileExt = file.name.split('.').pop();
      const filePath = `${user_id}/profile.${fileExt}`;

      // Upload to Supabase storage
      const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
        .from('user')
        .upload(filePath, file, {
          upsert: true,
          contentType: `image/${fileExt}`,
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw new Error('Failed to upload image');
      }

      // Get the public URL
      const { data: { publicUrl } } = supabaseAdmin.storage
        .from('user')
        .getPublicUrl(filePath);

      console.log("Image uploaded successfully, public URL:", publicUrl);

      // Update the user's profile with the new image URL
      const { error: updateError } = await supabaseAdmin
        .from('users')
        .update({ custom_img: publicUrl })
        .eq('id', user_id);

      if (updateError) {
        console.error('Update error:', updateError);
        throw new Error('Failed to update user profile');
      }

      // Update the local state with the returned image URL
      setFormData(prev => ({
        ...prev,
        custom_img: publicUrl
      }));
      
      // Show success message
      toast.success("Profile image updated successfully");
      
      // Refresh user data to get the updated profile
      await fetchUserData();
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error(error.message || "Failed to upload image");
      // Revert the preview if upload fails
      setImagePreview(null);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="w-full mx-auto px-8 py-4">
      <div className="flex justify-between flex-wrap gap-14">
        <div className="flex-1">
          <div className="flex gap-4 mb-6">
            <Button
              className={
                activeTab === "orders"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200"
              }
              onClick={() => setActiveTab("orders")}
            >
              My Orders
            </Button>
            <Button
              className={
                activeTab === "wishlist"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200"
              }
              onClick={() => setActiveTab("wishlist")}
            >
              My Wishlist
            </Button>
          </div>

          {isLoading ? (
            <div className="text-center py-8">
              <p>Loading...</p>
            </div>
          ) : (
            <>
              {activeTab === "orders" && (
                <>
                  <h2 className="text-xl font-bold mb-2">My Orders</h2>
                  <p className="text-gray-600 mb-4">
                    Here you can find all the products you have purchased.
                  </p>
                  {orders.length === 0 ? (
                    <p className="text-gray-500">No orders found.</p>
                  ) : (
                    orders.map((order) => (
                      <Card
                        key={order.id}
                        className="p-4 mb-4 border"
                      >
                        <div className="flex flex-col">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                            <div>
                              <p className="text-sm text-gray-500">Order#: {order.order_id}</p>
                              <h3 className="font-bold text-lg">{order.name}</h3>
                            </div>
                            <p className="text-lg font-semibold">₹ {order.price.toLocaleString()}</p>
                          </div>
                          <div className="flex flex-wrap gap-2 mt-4">
                            <p className="text-xs px-2 py-1 outline-1 outline-gray-200 rounded-md">
                              Size: {order.size}
                            </p>
                            <p className="text-xs px-2 py-1 outline-1 outline-gray-200 rounded-md">
                              Quantity: {order.qty}
                            </p>
                          </div>
                        </div>
                      </Card>
                    ))
                  )}
                </>
              )}

              {activeTab === "wishlist" && (
                <>
                  <h2 className="text-xl font-bold mb-2">My Wishlist</h2>
                  <p className="text-gray-600 mb-4">
                    Here you can find all the products you have saved.
                  </p>
                  {wishlist.length === 0 ? (
                    <p className="text-gray-500">No items in wishlist.</p>
                  ) : (
                    wishlist.map((item) => (
                      <Card
                        key={item.id}
                        className="p-4 flex gap-4 mb-4 items-center border flex-row relative"
                      >
                        <img
                          src={item.products?.image}
                          alt={item.products?.name}
                          className="w-20 h-20 object-cover"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 justify-between">
                            <h3 className="font-bold">{item.products?.name}</h3>
                            <Button className="bg-cyan-600 text-white">
                              Add to Cart
                            </Button>
                          </div>
                          <div className="flex items-center gap-2">
                            <p className="text-lg font-semibold">
                              ₹ {item.products?.price.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </Card>
                    ))
                  )}
                </>
              )}
            </>
          )}
        </div>

        <div className="w-80">
          <Card className="p-6">
            <h2 className="text-2xl font-bold">My Profile</h2>
            <p className="text-gray-500">Here you can find your profile data.</p>

            <div className="mt-6 flex flex-col items-center">
              {imagePreview || formData.custom_img || user?.photoURL ? (
                <div className="relative">
                  <img
                    src={imagePreview || formData.custom_img || user?.photoURL}
                    alt="Profile"
                    className="w-20 h-20 rounded-full border border-gray-300 object-cover"
                  />
                  <label 
                    htmlFor="profile-image" 
                    className="absolute bottom-0 right-0 bg-blue-500 text-white rounded-full p-1 cursor-pointer hover:bg-blue-600 transition-colors"
                    title="Update profile image"
                  >
                    <Upload size={16} />
                  </label>
                  <input
                    id="profile-image"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                    ref={fileInputRef}
                    disabled={isUploading}
                  />
                </div>
              ) : (
                <div className="relative">
                  <div className="w-20 h-20 flex items-center justify-center bg-gray-300 rounded-full text-2xl font-bold">
                    {getInitials(user?.displayName).toUpperCase()}
                  </div>
                  <label 
                    htmlFor="profile-image" 
                    className="absolute bottom-0 right-0 bg-blue-500 text-white rounded-full p-1 cursor-pointer hover:bg-blue-600 transition-colors"
                    title="Update profile image"
                  >
                    <Upload size={16} />
                  </label>
                  <input
                    id="profile-image"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                    ref={fileInputRef}
                    disabled={isUploading}
                  />
                </div>
              )}
              {isUploading && (
                <div className="mt-2 text-sm text-gray-500">Uploading...</div>
              )}
              <Button
                variant="ghost"
                className="mt-2 flex items-center gap-2"
                onClick={() => {
                  if (isEditing) {
                    handleSave();
                  } else {
                    setIsEditing(true);
                  }
                }}
              >
                <Pencil size={16} /> {isEditing ? "Save" : "Update"}
              </Button>
            </div>

            <div className="mt-6 space-y-4">
              <div>
                <p className="text-sm text-gray-500">Number</p>
                <Input
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </div>
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <Input name="email" value={formData.email}  onChange={handleChange}
                  disabled={!isEditing} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Address</p>
                <Input
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
