import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  signInWithPopup, 
  signInWithRedirect, 
  getRedirectResult,
  signOut, 
  signInWithPhoneNumber, 
  RecaptchaVerifier, 
  GoogleAuthProvider 
} from "firebase/auth";
import supabase from "@/app/api/auth/supabaseClient";

// Your Firebase configuration (Replace with your credentials)
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIRE_BASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIRE_BASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIRE_BASE_AUTH_DOMAIN,
  storageBucket: process.env.NEXT_PUBLIC_FIRE_BASE_AUTH_DOMAIN_STORE,
  messagingSenderId: "673024204488",
  appId: process.env.NEXT_PUBLIC_FIRE_BASE_APP_ID,
  measurementId: "G-F5WW59LD5P",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// Function to check if device is mobile
const isMobileDevice = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

const signInWithGoogle = async () => {
  try {
    let result;
    
    // Use redirect for mobile devices and popup for desktop
    if (isMobileDevice()) {
      await signInWithRedirect(auth, provider);
      result = await getRedirectResult(auth);
    } else {
      result = await signInWithPopup(auth, provider);
    }

    const user = result?.user;
    if (!user) return null;

    // Prepare user data for Supabase
    const userData = {
      uid: user.uid,
      name: user.displayName,
      email: user.email,
      avatar: user.photoURL,
    };

    // Check if user already exists in Supabase
    const { data: existingUser, error: fetchError } = await supabase
      .from("users")
      .select("id")
      .eq("email", userData.email);

    if (fetchError) {
      console.error("Error checking user:", fetchError);
      return user;
    }

    // If user does not exist, insert into Supabase
    if (existingUser.length === 0) {
      console.log("User not found in Supabase, inserting...", userData);
      const { error: insertError } = await supabase.from("users").insert([userData]);
      if (insertError) {
        console.error("Error saving user:", insertError);
      }
    }

    return user;
  } catch (error) {
    console.error("Google Sign-in Error:", error);
    return null;
  }
};

const logOut = async () =>
{
  try
  {
    await signOut( auth );
  } catch ( error )
  {
    console.error( "Logout Error:", error );
  }
};

// Function to send OTP
const sendOtp = async ( phoneNumber ) =>
{
  try
  {
    if ( !window.recaptchaVerifier )
    {
      window.recaptchaVerifier = new RecaptchaVerifier( auth, "recaptcha-container", {
        size: "invisible",
      } );
    }

    const appVerifier = window.recaptchaVerifier;
    const confirmationResult = await signInWithPhoneNumber( auth, `+91${ phoneNumber }`, appVerifier );
    return confirmationResult;
  } catch ( error )
  {
    console.error( "Error sending OTP:", error.message );
    throw error;
  }
};

export { auth, signInWithGoogle, logOut, provider, sendOtp };
