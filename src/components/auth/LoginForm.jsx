import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  FieldDescription,
  FieldGroup,
  FieldSeparator,
} from "@/components/ui/field";
import { NavLink } from "react-router-dom";
import FormField from "@/components/auth/FormField";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/AuthContext";
import GoogleAuthButton from "@/components/auth/GoogleAuthButton";
import { Spinner } from "@/components/ui/spinner";

const formSchema = z.object({
  email: z.string().min(1, "Email is required").pipe(z.email("Invalid email")),

  password: z.string().min(8, "Password must be at least 8 characters"),
});

export function LoginForm({ className, ...props }) {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onSubmit", // change to "onChange" for real-time validation
  });

  async function onSubmit(values) {
    setError("");
    setIsSubmitting(true);
    try {
      await login(values);
      navigate(location.state?.from?.pathname || "/", { replace: true });
    } catch (err) {
      setError(err.message || "Unable to log in. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      className={cn("flex flex-col gap-6", className)}
      {...props}
      onSubmit={form.handleSubmit(onSubmit)}
    >
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Login to your account</h1>
          <p className="text-sm text-balance text-muted-foreground">
            Enter your credentials below to login.
          </p>
        </div>

        <FormField
          control={form.control}
          name="email"
          label="Email"
          type="email"
          placeholder="gmail@example.com"
        />

        <FormField
          control={form.control}
          name="password"
          label="Password"
          type="password"
        />
        {error && (
          <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Spinner />}
          {isSubmitting ? "Logging in..." : "Login"}
        </Button>
        <FieldSeparator>Or continue with</FieldSeparator>
        <GoogleAuthButton label="Login with Google" />
        <FieldDescription className="text-center">
          Don&apos;t have an account?{" "}
          <NavLink to="/register" className="underline underline-offset-4">
            Register
          </NavLink>
        </FieldDescription>
      </FieldGroup>
    </form>
  );
}
