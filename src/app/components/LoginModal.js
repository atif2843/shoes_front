"use client";
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader } from "lucide-react";
import useAuthStore from "@/store/useAuthModal";
import { signInWithGoogle } from "@/lib/firebase";
import supabase from "../api/auth/supabaseClient";
import { sendOtp } from "@/lib/firebase";
import { toast } from "sonner";

export default function LoginModal() {
  const { isLoginModalOpen, closeLoginModal, loginSuccess, loginWithGoogle, loginWithPhone } = useAuthStore();
  const [step, setStep] = useState(1);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState(Array(6).fill(""));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [confirmationResult, setConfirmationResult] = useState(null);

  // Reset modal state when it closes
  useEffect(() => {
    if (!isLoginModalOpen) {
      setStep(1);
      setPhoneNumber("");
      setOtp(Array(6).fill(""));
      setError("");
    }
  }, [isLoginModalOpen]);

  const handlePhoneSubmit = async () => {
    if (!/^\d{10}$/.test(phoneNumber)) {
      setError("Please enter a valid 10-digit phone number");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const confirmation = await sendOtp(phoneNumber);
      setConfirmationResult(confirmation);
      setStep(2); // Move to OTP verification step
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async () => {
    if (!confirmationResult) {
      setError("Verification code expired. Please try again.");
      return;
    }

    const otpString = otp.join("");
    if (otpString.length !== 6) {
      setError("Please enter a valid 6-digit code");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const result = await confirmationResult.confirm(otpString);
      const user = result.user;
      
      if (user) {
        // Format phone number to match the format in the database
        const formattedPhone = `+91${phoneNumber}`;
        
        // Check if user exists in Supabase
        const { data: existingUser, error: fetchError } = await supabase
          .from("users")
          .select("*")
          .eq("phone", formattedPhone)
          .single();

        if (fetchError && fetchError.code !== 'PGRST116') {
          console.error("Error checking user:", fetchError);
        }

        // If user does not exist, create a new user
        if (!existingUser) {
          const { error: insertError } = await supabase
            .from("users")
            .insert([
              {
                phone: formattedPhone,
                name: "User",
                created_at: new Date().toISOString(),
              },
            ]);

          if (insertError) {
            console.error("Error creating user:", insertError);
          }
        }

        // Fetch user data from Supabase
        const userData = await loginWithPhone(formattedPhone);
        
        if (userData) {
          loginSuccess();
          toast.success("Login successful!");
        } else {
          toast.error("Failed to fetch user data. Please try again.");
        }
      }
    } catch (error) {
      console.error("OTP verification error:", error);
      setError("Invalid verification code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await loginWithGoogle();
      toast.success("Login successful!");
    } catch (error) {
      console.error("Google login error:", error);
      setError("Failed to login with Google. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (!/^[0-9]?$/.test(value)) return;

    setOtp((prev) => {
      const newOtp = [...prev];
      newOtp[index] = value;
      return newOtp;
    });

    // Move to next input if value is entered
    if (value && index < 5) {
      const nextInput = document.querySelector(`input[name="otp-${index + 1}"]`);
      if (nextInput) {
        nextInput.focus();
      }
    }
  };

  const handleOtpKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.querySelector(`input[name="otp-${index - 1}"]`);
      if (prevInput) {
        prevInput.focus();
      }
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (/^\d+$/.test(pastedData)) {
      const newOtp = [...otp];
      for (let i = 0; i < pastedData.length; i++) {
        if (i < 6) {
          newOtp[i] = pastedData[i];
        }
      }
      setOtp(newOtp);
      
      // Focus the next empty input or the last input
      const nextEmptyIndex = newOtp.findIndex(val => !val);
      const focusIndex = nextEmptyIndex === -1 ? 5 : nextEmptyIndex;
      const nextInput = document.querySelector(`input[name="otp-${focusIndex}"]`);
      if (nextInput) {
        nextInput.focus();
      }
    }
  };

  return (
    <Dialog open={isLoginModalOpen} onOpenChange={closeLoginModal}>
      <DialogContent className="w-[350px] p-6 rounded-lg shadow-lg">
        <DialogTitle className="sr-only">Login or Create Account</DialogTitle>
        {step === 1 && (
          <div>
            <h2 className="text-xl font-semibold mb-2">
              Welcome! Create an account
            </h2>
            <Input
              type="tel"
              placeholder="Enter 10-digit phone number"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full mb-2"
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <Button
              onClick={handlePhoneSubmit}
              className="w-full"
              disabled={loading}
            >
              {loading ? <Loader className="animate-spin" /> : "Register"}
            </Button>
            <div id="recaptcha-container"></div>
            <div className="text-center my-2">OR</div>
            <Button
              onClick={handleGoogleLogin}
              className="w-full bg-red-500 text-white hover:bg-red-600"
            >
              Sign up with Google
            </Button>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 className="text-xl font-semibold mb-2">Enter OTP</h2>
            <div className="flex justify-center gap-2">
              {otp.map((char, i) => (
                <Input
                  key={i}
                  name={`otp-${i}`}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={1}
                  className="w-10 h-10 text-center text-lg"
                  value={char}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(i, e)}
                  onPaste={handleOtpPaste}
                  autoComplete="one-time-code"
                />
              ))}
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <Button
              onClick={handleOtpSubmit}
              className="w-full mt-3"
              disabled={loading}
            >
              {loading ? <Loader className="animate-spin" /> : "Submit"}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
