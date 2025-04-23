import { create } from "zustand";
import { auth, signInWithGoogle, logOut } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { getUserData } from "@/app/api/supabaseQueries";
import supabase from "@/app/api/auth/supabaseClient";

const useAuthStore = create((set) => ({
  user: null,
  isLoginModalOpen: false,
  isLoggedIn: false,
  userData: null,
  user_id: null, // Store the database user ID

  openLoginModal: () => set({ isLoginModalOpen: true }),
  closeLoginModal: () => set({ isLoginModalOpen: false }),

  loginSuccess: () => set({ isLoggedIn: true, isLoginModalOpen: false }),

  loginWithGoogle: async () => {
    try {
      const user = await signInWithGoogle();
      if (user) {
        console.log("Google sign-in successful:", user.email);
        
        // Fetch user data from Supabase using email
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('email', user.email)
          .single();

        // Log the full error object for debugging
        if (error) {
          console.error("Error fetching user data by email:", JSON.stringify(error));
          
          // Check if user doesn't exist and create one if needed
          if (error.code === 'PGRST116' || Object.keys(error).length === 0) { 
            console.log("User not found in database, creating new user...");
            
            try {
              // Create a new user in Supabase - removed avatar_url field
              const { data: newUser, error: createError } = await supabase
                .from('users')
                .insert([
                  {
                    email: user.email,
                    name: user.displayName || 'User',
                    uid: user.uid
                  }
                ])
                .select()
                .single();
                
              if (createError) {
                console.error("Error creating new user:", JSON.stringify(createError));
                set({ user, isLoggedIn: true, isLoginModalOpen: false });
              } else {
                console.log("New user created successfully:", newUser);
                set({ 
                  user, 
                  userData: newUser, 
                  user_id: newUser.id,
                  isLoggedIn: true, 
                  isLoginModalOpen: false 
                });
              }
            } catch (createErr) {
              console.error("Exception during user creation:", createErr);
              set({ user, isLoggedIn: true, isLoginModalOpen: false });
            }
          } else {
            // For other errors, just set the user without userData
            set({ user, isLoggedIn: true, isLoginModalOpen: false });
          }
        } else {
          console.log("User data fetched by email:", data);
          set({ 
            user, 
            userData: data, 
            user_id: data.id, // Store the database user ID
            isLoggedIn: true, 
            isLoginModalOpen: false 
          });
        }
      }
    } catch (error) {
      console.error("Error in loginWithGoogle:", error);
      // Set a basic user state even if there's an error
      set({ isLoggedIn: false, isLoginModalOpen: false });
    }
  },

  loginWithPhone: async (phoneNumber) => {
    // This function will be called after phone verification
    try {
      // Fetch user data from Supabase using phone number
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('phone', phoneNumber)
        .single();

      if (error) {
        console.error("Error fetching user data by phone:", JSON.stringify(error));
        
        // Check if user doesn't exist and create one if needed
        if (error.code === 'PGRST116' || Object.keys(error).length === 0) { 
          console.log("User not found in database, creating new user...");
          
          try {
            // Create a new user in Supabase
            const { data: newUser, error: createError } = await supabase
              .from('users')
              .insert([
                {
                  phone: phoneNumber,
                  name: 'User',
                }
              ])
              .select()
              .single();
              
            if (createError) {
              console.error("Error creating new user:", JSON.stringify(createError));
              return null;
            } else {
              console.log("New user created successfully:", newUser);
              return newUser;
            }
          } catch (createErr) {
            console.error("Exception during user creation:", createErr);
            return null;
          }
        }
        
        return null;
      } else {
        console.log("User data fetched by phone:", data);
        return data;
      }
    } catch (error) {
      console.error("Error in loginWithPhone:", error);
      return null;
    }
  },

  logout: async () => {
    await logOut();
    set({ user: null, userData: null, user_id: null, isLoggedIn: false });
  },
}));

// Automatically check authentication state on app load
onAuthStateChanged(auth, async (user) => {
  if (user) {
    try {
      // Determine login method and fetch user data accordingly
      if (user.email) {
        // User logged in with Google
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('email', user.email)
          .single();

        if (error) {
          console.error("Error fetching user data by email:", JSON.stringify(error));
          
          // Check if user doesn't exist and create one if needed
          if (error.code === 'PGRST116' || Object.keys(error).length === 0) { 
            console.log("User not found in database, creating new user...");
            
            try {
              // Create a new user in Supabase - removed avatar_url field
              const { data: newUser, error: createError } = await supabase
                .from('users')
                .insert([
                  {
                    email: user.email,
                    name: user.displayName || 'User',
                    uid: user.uid
                  }
                ])
                .select()
                .single();
                
              if (createError) {
                console.error("Error creating new user:", JSON.stringify(createError));
                useAuthStore.setState({ user, isLoggedIn: true });
              } else {
                console.log("New user created successfully:", newUser);
                useAuthStore.setState({ 
                  user,
                  userData: newUser, 
                  user_id: newUser.id,
                  isLoggedIn: true 
                });
              }
            } catch (createErr) {
              console.error("Exception during user creation:", createErr);
              useAuthStore.setState({ user, isLoggedIn: true });
            }
          } else {
            useAuthStore.setState({ user, isLoggedIn: true });
          }
        } else {
          console.log("User data fetched by email:", data);
          useAuthStore.setState({ 
            user,
            userData: data, 
            user_id: data.id, // Store the database user ID
            isLoggedIn: true 
          });
        }
      } else if (user.phoneNumber) {
        // User logged in with phone
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('phone', user.phoneNumber)
          .single();

        if (error) {
          console.error("Error fetching user data by phone:", JSON.stringify(error));
          
          // Check if user doesn't exist and create one if needed
          if (error.code === 'PGRST116' || Object.keys(error).length === 0) { 
            console.log("User not found in database, creating new user...");
            
            try {
              // Create a new user in Supabase
              const { data: newUser, error: createError } = await supabase
                .from('users')
                .insert([
                  {
                    phone: user.phoneNumber,
                    name: 'User',
                    uid: user.uid
                  }
                ])
                .select()
                .single();
                
              if (createError) {
                console.error("Error creating new user:", JSON.stringify(createError));
                useAuthStore.setState({ user, isLoggedIn: true });
              } else {
                console.log("New user created successfully:", newUser);
                useAuthStore.setState({ 
                  user,
                  userData: newUser, 
                  user_id: newUser.id,
                  isLoggedIn: true 
                });
              }
            } catch (createErr) {
              console.error("Exception during user creation:", createErr);
              useAuthStore.setState({ user, isLoggedIn: true });
            }
          } else {
            useAuthStore.setState({ user, isLoggedIn: true });
          }
        } else {
          console.log("User data fetched by phone:", data);
          useAuthStore.setState({ 
            user, 
            userData: data, 
            user_id: data.id, // Store the database user ID
            isLoggedIn: true 
          });
        }
      } else {
        // Fallback to using user ID
        const userId = user.uid || user.id;
        if (userId) {
          try {
            const userData = await getUserData(userId);
            useAuthStore.setState({ 
              user, 
              userData, 
              user_id: userData.id, // Store the database user ID
              isLoggedIn: true 
            });
          } catch (error) {
            console.error("Error fetching user data by ID:", error);
            useAuthStore.setState({ user, isLoggedIn: true });
          }
        } else {
          useAuthStore.setState({ user, isLoggedIn: true });
        }
      }
    } catch (error) {
      console.error("Error in onAuthStateChanged:", error);
      useAuthStore.setState({ user, isLoggedIn: true });
    }
  } else {
    useAuthStore.setState({ user: null, userData: null, user_id: null, isLoggedIn: false });
  }
});

export default useAuthStore;
