// Signup.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { app } from "./Firebase";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  onIdTokenChanged,
} from "firebase/auth";
import { FcGoogle } from "react-icons/fc";

const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export default function Signup() {
  const navigate = useNavigate();

  // form state
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // email link settings (ensure your domain is authorized in Firebase console)
  const actionCodeSettings = {
    url: window.location.origin + "/", // user will be redirected back to this origin
    handleCodeInApp: true,
  };

  // keep localStorage token current whenever Firebase refreshes tokens
  useEffect(() => {
    const unsubscribe = onIdTokenChanged(auth, async (user) => {
      if (user) {
        try {
          const idToken = await user.getIdToken(false);
          localStorage.setItem("token", idToken);
        } catch (e) {
          console.error("Failed to get id token on token change:", e);
        }
      } else {
        localStorage.removeItem("token");
      }
    });
    return () => unsubscribe();
  }, []);

  // If the user comes back using the magic link, complete sign-in here
  useEffect(() => {
    const finishEmailLinkSignIn = async () => {
      try {
        if (isSignInWithEmailLink(auth, window.location.href)) {
          setBusy(true);
          setMessage("Completing sign-in...");
          // Prefer stored email (we saved it when sending link), otherwise prompt
          const storedEmail = window.localStorage.getItem(
            "gemiseek_email_for_signin"
          );
          const emailToUse =
            storedEmail ||
            window.prompt("Please enter your email to complete sign-in:");

          if (!emailToUse) {
            throw new Error("Email required to complete sign-in.");
          }

          const result = await signInWithEmailLink(
            auth,
            emailToUse,
            window.location.href
          );

          // signInWithEmailLink either signs in existing user or creates a new user (passwordless)
          // store token in localStorage (onIdTokenChanged above will also update, but ensure fresh token now)
          const idToken = await result.user.getIdToken(true);
          localStorage.setItem("token", idToken);
          window.localStorage.removeItem("gemiseek_email_for_signin");

          setMessage("Signed in successfully. Redirecting...");
          setError("");
          navigate("/chat", { replace: true });
        }
      } catch (err) {
        console.error("Error completing email-link sign-in:", err);
        setError(err.message || "Failed to complete sign-in.");
      } finally {
        setBusy(false);
      }
    };

    finishEmailLinkSignIn();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Helper: send magic link to email
  const handleSendMagicLink = async (e) => {
    e?.preventDefault();
    setError("");
    setMessage("");
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setBusy(true);
    try {
      await sendSignInLinkToEmail(auth, email, actionCodeSettings);
      // store email locally to ease sign-in completion
      window.localStorage.setItem("gemiseek_email_for_signin", email);
      setMessage("Magic link sent — check your inbox (and spam).");
      setEmail("");
    } catch (err) {
      console.error("sendSignInLinkToEmail error:", err);
      // Commonly this will not error if user exists; it's safe.
      setError(
        err.code
          ? `${err.code}: ${err.message}`
          : err.message || "Failed to send magic link."
      );
    } finally {
      setBusy(false);
    }
  };

  // Helper: sign in (or create) with Google popup. Firebase handles create vs sign-in automatically.
  const handleGoogle = async () => {
    setError("");
    setMessage("");
    setBusy(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);

      // Firebase creates user automatically if doesn't exist; if exists it signs in.
      // Get a fresh ID token and store it
      const idToken = await result.user.getIdToken(true);
      localStorage.setItem("token", idToken);

      setMessage("Signed in with Google. Redirecting...");
      navigate("/chat", { replace: true });
    } catch (err) {
      console.error("Google sign-in error:", err);

      // If there's an account-exists-with-different-credential error, handle gracefully:
      if (err.code === "auth/account-exists-with-different-credential") {
        // This happens if the email is already used with a different sign-in method.
        // You may choose to prompt the user or try to link accounts. For now, show friendly message.
        setError(
          "An account already exists with the same email but different sign-in method. Try signing in using that method."
        );
      } else {
        setError(err.message || "Google sign-in failed.");
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleSendMagicLink} className="space-y-4">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          required
          className="w-full px-4 py-2 rounded-lg border border-white/10 bg-transparent text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="email"
        />

        <button
          type="submit"
          disabled={busy}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold"
        >
          {busy ? "Please wait..." : "Get magic link"}
        </button>
      </form>

      <div className="flex items-center my-3">
        <div className="flex-grow h-px bg-white/6"></div>
        <span className="px-2 text-gray-400 text-sm">OR</span>
        <div className="flex-grow h-px bg-white/6"></div>
      </div>

      <button
        onClick={handleGoogle}
        disabled={busy}
        className="w-full flex items-center justify-center gap-2 py-2 rounded-lg border border-white/10 bg-white/5 text-white font-medium hover:bg-white/6"
      >
        <FcGoogle size={18} />
        Continue with Google
      </button>

      {/* messages */}
      <div className="mt-3 min-h-[28px]">
        {message && (
          <p className="text-sm text-center text-green-400">{message}</p>
        )}
        {error && <p className="text-sm text-center text-red-400">{error}</p>}
      </div>
    </div>
  );
}
