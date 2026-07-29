import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AuthLayout from "../components/layout/AuthLayout";
import { Field, Input, Select, ErrorBanner } from "../components/ui/Primitives";
import Button from "../components/ui/Button";
import { SCHEDULED_LANGUAGES, INDIAN_STATES } from "../constants/india";

const initialForm = {
  name: "",
  email: "",
  password: "",
  phone: "",
  preferredLanguage: "English",
  homeState: "",
};

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setSubmitting(true);
    try {
      await register(form);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't create your account. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      eyebrow="Get started"
      title="Create your HavensLight account"
      subtitle="Set up your safety network before you need it."
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <ErrorBanner message={error} />
        <Field label="Full name">
          <Input required autoFocus value={form.name} onChange={set("name")} placeholder="Ananya Sharma" />
        </Field>
        <Field label="Email">
          <Input type="email" required value={form.email} onChange={set("email")} placeholder="you@example.com" />
        </Field>
        <Field label="Password" hint="At least 8 characters.">
          <Input type="password" required value={form.password} onChange={set("password")} placeholder="••••••••" />
        </Field>
        <Field label="Phone (optional)">
          <Input type="tel" value={form.phone} onChange={set("phone")} placeholder="+91 98765 43210" />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Preferred language">
            <Select value={form.preferredLanguage} onChange={set("preferredLanguage")}>
              {SCHEDULED_LANGUAGES.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Home state (optional)">
            <Select value={form.homeState} onChange={set("homeState")}>
              <option value="">Select</option>
              {INDIAN_STATES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Select>
          </Field>
        </div>
        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? "Creating account..." : "Create account"}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-ink-soft">
        Already have an account?{" "}
        <Link to="/login" className="font-semibold text-teal-deep hover:underline">
          Log in
        </Link>
      </p>
    </AuthLayout>
  );
}
