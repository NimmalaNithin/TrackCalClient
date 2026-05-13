import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/AuthContext";
import { Spinner } from "@/components/ui/spinner";

const exchangingCodes = new Set();

export default function OAuthCallback() {
  const { exchangeOAuthCode } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState("Completing Google sign-in...");

  useEffect(() => {
    let active = true;

    async function completeSignIn() {
      const code = searchParams.get("code");
      const error = searchParams.get("error");

      if (error || !code) {
        setMessage("Google sign-in failed. Please try again.");
        return;
      }

      if (exchangingCodes.has(code)) {
        return;
      }

      exchangingCodes.add(code);

      try {
        await exchangeOAuthCode(code);
        navigate("/", { replace: true });
      } catch (err) {
        exchangingCodes.delete(code);
        if (active) {
          setMessage(err.message || "Google sign-in failed. Please try again.");
        }
      }
    }

    completeSignIn();

    return () => {
      active = false;
    };
  }, [exchangeOAuthCode, navigate, searchParams]);

  return (
    <div className="grid min-h-svh place-items-center p-6">
      <div className="w-full max-w-sm rounded-lg border bg-card p-5 text-center shadow-sm">
        <h1 className="text-xl font-semibold">Google sign-in</h1>
        <div className="mt-2 flex items-center justify-center gap-2 text-sm text-muted-foreground">
          {message === "Completing Google sign-in..." && <Spinner />}
          <span>{message}</span>
        </div>
      </div>
    </div>
  );
}
