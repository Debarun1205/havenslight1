import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AuthLayout from "../components/layout/AuthLayout";
import { Field, Input, ErrorBanner } from "../components/ui/Primitives";
import Button from "../components/ui/Button";
import GoogleSignInButton from "../components/auth/GoogleSignInButton";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(form.email, form.password);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't log you in. Check your details and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout eyebrow="Welcome back" title="Log in to HavensLight" subtitle="Your safety network is one tap away.">
      <div className="mb-5 flex justify-center">
        <GoogleSignInButton onSuccess={() => navigate("/")} onError={setError} />
      </div>
      <div className="mb-5 flex items-center gap-3">
        <div className="h-px flex-1 bg-ink/10" />
        <span className="text-xs text-ink-soft">or</span>
        <div className="h-px flex-1 bg-ink/10" />
      </div>
      <form onSubmit={onSubmit} className="space-y-4">
        <ErrorBanner message={error} />
        <Field label="Email">
          <Input
            type="email"
            required
            autoFocus
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="you@example.com"
          />
        </Field>
        <Field label="Password">
          <Input
            type="password"
            required
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder="••••••••"
          />
        </Field>
        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? "Logging in..." : "Log in"}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-ink-soft">
        New to HavensLight?{" "}
        <Link to="/register" className="font-semibold text-teal-deep hover:underline">
          Create an account
        </Link>
      </p>
      <p className="mt-2 text-center text-xs text-ink-soft">
        Need a doctor right now?{" "}
        <Link to="/find-a-doctor" className="font-semibold text-teal-deep hover:underline">
          Search without logging in
        </Link>
      </p>
    </AuthLayout>
  );
}
