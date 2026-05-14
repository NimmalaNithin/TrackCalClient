import { Button } from "@/components/ui/button";
import { API_BASE_URL } from "@/lib/api";
import { Spinner } from "@/components/ui/spinner";
import { useState } from "react";

const HEALTH_TIMEOUT_MS = 90000;
const RETRY_DELAY_MS = 2000;

function delay(ms) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

export default function GoogleAuthButton({ label = "Continue with Google" }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function waitForBackend() {
    const deadline = Date.now() + HEALTH_TIMEOUT_MS;

    while (Date.now() < deadline) {
      try {
        const response = await fetch(`${API_BASE_URL}/api/health`, {
          cache: "no-store",
        });
        if (response.ok) {
          return true;
        }
      } catch {
        // Render may still be waking. Keep the user on our loading state.
      }
      await delay(RETRY_DELAY_MS);
    }

    return false;
  }

  async function startGoogleOAuth() {
    setError("");
    setIsLoading(true);

    const isReady = await waitForBackend();
    if (isReady) {
      window.location.assign(`${API_BASE_URL}/api/auth/google/authorize`);
      return;
    }

    setIsLoading(false);
    setError("Sign-in service is still waking up. Please try again.");
  }

  return (
    <div className="grid gap-2">
      <Button variant="outline" type="button" onClick={startGoogleOAuth} disabled={isLoading}>
        {isLoading ? (
          <Spinner />
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path
              d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
              fill="currentColor"
            />
          </svg>
        )}
        {isLoading ? "Connecting to Google..." : label}
      </Button>
      {error && <p className="text-center text-sm text-destructive">{error}</p>}
    </div>
  );
}
