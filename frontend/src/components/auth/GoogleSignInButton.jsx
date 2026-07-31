import React, { useEffect, useRef, useState } from "react";
import { useAuth } from "../../context/AuthContext";

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

/**
 * Renders Google's own sign-in button via Google Identity Services (loaded
 * in index.html). Deliberately not a custom-styled button — Google requires
 * using their rendered button or logo for branding compliance, and their
 * script needs a real DOM node to render into, not just an onClick handler.
 */
export default function GoogleSignInButton({ onSuccess, onError }) {
  const { loginWithGoogle } = useAuth();
  const buttonRef = useRef(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!CLIENT_ID) return;

    function init() {
      if (!window.google?.accounts?.id || !buttonRef.current) return;
      window.google.accounts.id.initialize({
        client_id: CLIENT_ID,
        callback: async (response) => {
          try {
            await loginWithGoogle(response.credential);
            onSuccess?.();
          } catch (err) {
            onError?.(err.response?.data?.message || "Google sign-in failed. Please try again.");
          }
        },
      });
      window.google.accounts.id.renderButton(buttonRef.current, {
        type: "standard",
        theme: "outline",
        size: "large",
        width: 320,
        text: "continue_with",
      });
      setReady(true);
    }

    // The GIS script loads async — poll briefly rather than assuming it's
    // ready by the time this component mounts.
    if (window.google?.accounts?.id) {
      init();
    } else {
      const interval = setInterval(() => {
        if (window.google?.accounts?.id) {
          clearInterval(interval);
          init();
        }
      }, 200);
      return () => clearInterval(interval);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!CLIENT_ID) return null; // Not configured — quietly omit rather than show a broken button.

  return (
    <div>
      <div ref={buttonRef} />
      {!ready && <p className="text-xs text-ink-soft">Loading Google sign-in...</p>}
    </div>
  );
}
