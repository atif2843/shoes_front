import { initializeApp } from "firebase/app";
import { getAuth, signInWithPopup, signOut, signInWithPhoneNumber, RecaptchaVerifier, GoogleAuthProvider } from "firebase/auth";
import supabase from "@/app/api/auth/supabaseClient";

// Your Firebase configuration (Replace with your credentials)
const firebaseConfig = {
  apiKey: "AIzaSyAvxLquXzHF_o1IgYGFMJFm3LrXrYJ5u48",
  authDomain: "shoe-369b4.firebaseapp.com",
  projectId: "shoe-369b4",
  storageBucket: "shoe-369b4.firebasestorage.app",
  messagingSenderId: "673024204488",
  appId: "1:673024204488:web:12210ff0d886e3854bcffd",
  measurementId: "G-F5WW59LD5P",
};

const app = initializeApp( firebaseConfig );
const auth = getAuth( app );
const provider = new GoogleAuthProvider();

const signInWithGoogle = async () =>
{
  try
  {
    const result = await signInWithPopup( auth, provider );
    const user = result.user;

    if ( !user ) return null;

    // Prepare user data for Supabase
    const userData = {
      uid: user.uid,
      name: user.displayName,
      email: user.email,
      avatar: user.photoURL,
    };

    // Check if user already exists in Supabase
    const { data: existingUser, error: fetchError } = await supabase
      .from( "users" )
      .select( "id" )
      .eq( "email", userData.email );


    if ( fetchError )
    {
      console.error( "Error checking user:", fetchError );
      return user;
    }

    // If user does not exist, insert into Supabase
    if ( existingUser.length === 0 )
    {
      console.log( "User not found in Supabase, inserting...", userData );
      const { error: insertError } = await supabase.from( "users" ).insert( [ userData ] );
      if ( insertError )
      {
        console.error( "Error saving user:", insertError );
      }
    }

    return user;

  } catch ( error )
  {
    console.error( "Google Sign-in Error:", error );
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
