import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldSeparator,
} from "@/components/ui/field";
import { NavLink } from "react-router-dom";
import FormField from "@/components/auth/FormField";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/AuthContext";
import GoogleAuthButton from "@/components/auth/GoogleAuthButton";
import { Spinner } from "@/components/ui/spinner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const nameRegex = /^[A-Za-z]+(?:\s[A-Za-z]+)*$/;

const formSchema = z
  .object({
    firstName: z
      .string()
      .min(1, "First name is required")
      .min(2, "First name must be at least 2 characters")
      .max(30, "First name must not exceed 30 characters")
      .regex(nameRegex, "Only alphabets and single spaces allowed"),

    lastName: z
      .string()
      .min(1, "Last name is required")
      .min(2, "Last name must be at least 2 characters")
      .max(30, "Last name must not exceed 30 characters")
      .regex(nameRegex, "Only alphabets and single spaces allowed"),

    email: z
      .string()
      .min(1, "Email is required")
      .pipe(z.email("Invalid email")),

    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain at least one uppercase letter")
      .regex(/[a-z]/, "Must contain at least one lowercase letter")
      .regex(/[0-9]/, "Must contain at least one number")
      .regex(
        /[@$!%*?&]/,
        "Must contain at least one allowed (@,$,!,%,*,?,&) special character"
      ),

    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"], // error shows under confirmPassword field
  });

export function RegisterForm({ className, ...props }) {
  const { requestRegistrationOtp, resendRegistrationOtp, verifyRegistrationOtp } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOtpStep, setIsOtpStep] = useState(false);
  const [pendingEmail, setPendingEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [resendSeconds, setResendSeconds] = useState(0);
  const [expiresSeconds, setExpiresSeconds] = useState(0);
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    mode: "onSubmit", // change to "onChange" for real-time validation
  });

  useEffect(() => {
    if (!isOtpStep || (resendSeconds <= 0 && expiresSeconds <= 0)) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setResendSeconds((current) => Math.max(0, current - 1));
      setExpiresSeconds((current) => Math.max(0, current - 1));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [expiresSeconds, isOtpStep, resendSeconds]);

  async function onSubmit(values) {
    setError("");
    setIsSubmitting(true);
    try {
      const { confirmPassword, ...payload } = values;
      void confirmPassword;
      const response = await requestRegistrationOtp(payload);
      setPendingEmail(response.email);
      setResendSeconds(response.resendAvailableInSeconds || 0);
      setExpiresSeconds(response.expiresInSeconds || 0);
      setOtp("");
      setIsOtpStep(true);
    } catch (err) {
      setError(err.message || "Unable to send OTP. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function onVerifyOtp(event) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      await verifyRegistrationOtp({ email: pendingEmail, otp });
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.message || "Invalid OTP. Please re-enter the code.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function onResendOtp() {
    setError("");
    setIsSubmitting(true);
    try {
      const response = await resendRegistrationOtp(pendingEmail);
      setResendSeconds(response.resendAvailableInSeconds || 0);
      setExpiresSeconds(response.expiresInSeconds || 0);
      setOtp("");
    } catch (err) {
      setError(err.message || "Unable to resend OTP. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isOtpStep) {
    return (
      <form
        className={cn("flex flex-col gap-6", className)}
        {...props}
        onSubmit={onVerifyOtp}
      >
        <FieldGroup>
          <div className="flex flex-col items-center gap-1 text-center">
            <h1 className="text-2xl font-bold">Verify your email</h1>
            <p className="text-sm text-balance text-muted-foreground">
              Enter the 6 digit code sent to {pendingEmail}
            </p>
          </div>

          <Field>
            <Label htmlFor="registration-otp">OTP</Label>
            <Input
              id="registration-otp"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={otp}
              onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="123456"
              className="text-center text-lg tracking-[0.35em]"
              required
            />
            <FieldDescription>
              {expiresSeconds > 0
                ? `This code expires in ${Math.ceil(expiresSeconds / 60)} minute${Math.ceil(expiresSeconds / 60) === 1 ? "" : "s"}.`
                : "This code has expired. Please submit the form again."}
            </FieldDescription>
          </Field>

          {error && (
            <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          )}

          <Button type="submit" disabled={isSubmitting || otp.length !== 6 || expiresSeconds <= 0}>
            {isSubmitting && <Spinner />}
            {isSubmitting ? "Verifying..." : "Verify and continue"}
          </Button>

          <div className="grid gap-2 sm:grid-cols-2">
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting || resendSeconds > 0 || expiresSeconds <= 0}
              onClick={onResendOtp}
            >
              {resendSeconds > 0 ? `Resend in ${resendSeconds}s` : "Resend OTP"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              disabled={isSubmitting}
              onClick={() => {
                setIsOtpStep(false);
                setError("");
              }}
            >
              Edit details
            </Button>
          </div>
        </FieldGroup>
      </form>
    );
  }

  return (
    <form
      className={cn("flex flex-col gap-6", className)}
      {...props}
      onSubmit={form.handleSubmit(onSubmit)}
    >
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Create your account</h1>
          <p className="text-sm text-balance text-muted-foreground">
            Fill in the form below to create your account
          </p>
        </div>

        <FormField
          control={form.control}
          name="firstName"
          label="First Name"
          type="text"
          placeholder="First Name"
        />

        <FormField
          control={form.control}
          name="lastName"
          label="Last Name"
          type="text"
          placeholder="Last Name"
        />

        <FormField
          control={form.control}
          name="email"
          label="Email"
          type="email"
          placeholder="gmail@example.com"
          // description="We'll use this to contact you. We will not share your email with anyone else."
        />

        <FormField
          control={form.control}
          name="password"
          label="Password"
          type="password"
          description="Must be at least 8 characters long."
        />

        <FormField
          control={form.control}
          name="confirmPassword"
          label="Confirm Password"
          type="password"
          // description="Please confirm your password."
        />

        {error && (
          <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Spinner />}
          {isSubmitting ? "Creating account..." : "Create Account"}
        </Button>

        <FieldSeparator>Or continue with</FieldSeparator>
        <GoogleAuthButton label="Sign up with Google" />
        <FieldDescription className="px-6 text-center">
          Already have an account? <NavLink to="/login">Login</NavLink>
        </FieldDescription>
      </FieldGroup>
    </form>
  );
}
