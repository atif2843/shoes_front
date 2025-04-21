import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Create a Supabase client with service role key for admin access
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request) {
  try {
    const { userId, imageData, fileName } = await request.json();
    
    if (!userId || !imageData || !fileName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // First, get the user's current profile to find the existing image
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('custom_img')
      .eq('id', userId)
      .single();

    if (userError) {
      console.error('Error fetching user data:', userError);
      return NextResponse.json(
        { error: 'Failed to fetch user data' },
        { status: 500 }
      );
    }

    // If there's an existing image, delete it from storage
    if (userData.custom_img) {
      try {
        // Extract the file path from the URL
        const urlParts = userData.custom_img.split('/');
        const filePath = urlParts.slice(urlParts.indexOf('user') + 1).join('/');
        
        if (filePath) {
          // Delete the existing file
          const { error: deleteError } = await supabase.storage
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

    // Convert base64 to blob
    const base64Data = imageData.split(',')[1];
    const binaryData = Buffer.from(base64Data, 'base64');
    
    // Create a unique file path
    const fileExt = fileName.split('.').pop();
    const filePath = `${userId}/profile.${fileExt}`;

    // Upload to Supabase storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('user')
      .upload(filePath, binaryData, {
        upsert: true,
        contentType: `image/${fileExt}`,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return NextResponse.json(
        { error: 'Failed to upload image' },
        { status: 500 }
      );
    }

    // Get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from('user')
      .getPublicUrl(filePath);

    // Update the user's profile with the new image URL
    const { error: updateError } = await supabase
      .from('users')
      .update({ custom_img: publicUrl })
      .eq('id', userId);

    if (updateError) {
      console.error('Update error:', updateError);
      return NextResponse.json(
        { error: 'Failed to update user profile' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      imageUrl: publicUrl 
    });
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 