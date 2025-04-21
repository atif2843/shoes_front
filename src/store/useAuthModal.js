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
    const user = await signInWithGoogle();
    if (user) {
      // Fetch user data from Supabase using email
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('email', user.email)
          .single();

        if (error) {
          console.error("Error fetching user data by email:", error);
          set({ user, isLoggedIn: true, isLoginModalOpen: false });
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
      } catch (error) {
        console.error("Error in loginWithGoogle:", error);
        set({ user, isLoggedIn: true, isLoginModalOpen: false });
      }
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
        console.error("Error fetching user data by phone:", error);
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
          console.error("Error fetching user data by email:", error);
          useAuthStore.setState({ user, isLoggedIn: true });
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
          console.error("Error fetching user data by phone:", error);
          useAuthStore.setState({ user, isLoggedIn: true });
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
