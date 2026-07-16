"use client";

import { useState } from "react";
import Link from "next/link";
import { signUp } from "@/actions/auth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function SignupPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    setLoading(true);
    setError("");
    const result = await signUp(formData);
    setLoading(false);
    if (result?.error) {
      setError(result.error);
      return;
    }
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <main className="min-h-screen flex items-center justify-center p-5">
        <div className="w-full max-w-sm text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Check Your Email 📧</h1>
          <p className="text-muted-foreground text-sm mb-6">
            We sent a confirmation link to your email. Please open it and confirm your account before logging in.
          </p>
          <Link href="/login" className="text-red-500 font-medium text-sm">
            Back to Login
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-5">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold text-foreground mb-1">Create Account</h1>
        <p className="text-muted-foreground text-sm mb-6">Start tracking your GPA today</p>

        <form action={handleSubmit} className="space-y-4">
          <Input name="email" type="email" label="Email" required />
          <Input name="password" type="password" label="Password" required minLength={6} />

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Creating account..." : "Sign Up"}
          </Button>
        </form>

    

        <p className="text-center text-sm text-muted-foreground mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-red-500 font-medium">
            Log In
          </Link>
        </p>
      </div>
    </main>
  );
}