"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth";

export default function RegisterPage() {
  const router = useRouter();
  const { register, loading, error, clearError } = useAuthStore();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await register({
        first_name: firstName,
        last_name: lastName,
        email,
        password,
      });
      router.push("/account");
    } catch {
      /* error is set in store */
    }
  }

  function clearOnChange(setter: (v: string) => void) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      setter(e.target.value);
      clearError();
    };
  }

  return (
    <section className="relative overflow-hidden py-24 px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="panel-editorial mx-auto max-w-sm rounded-sm px-8 py-10 md:px-10 md:py-12"
      >
        <h1 className="text-2xl font-serif font-normal tracking-tight text-charcoal text-center mb-2">
          Create Account
        </h1>
        <p className="text-sm text-muted text-center mb-10 font-sans">
          Join Desire for a personalized experience
        </p>

        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-600 text-xs text-center font-sans">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] tracking-[0.15em] uppercase text-muted mb-1.5 font-sans">
                First Name
              </label>
              <input
                type="text"
                required
                value={firstName}
                onChange={clearOnChange(setFirstName)}
                className="input-editorial"
              />
            </div>
            <div>
              <label className="block text-[10px] tracking-[0.15em] uppercase text-muted mb-1.5 font-sans">
                Last Name
              </label>
              <input
                type="text"
                required
                value={lastName}
                onChange={clearOnChange(setLastName)}
                className="input-editorial"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] tracking-[0.15em] uppercase text-muted mb-1.5 font-sans">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={clearOnChange(setEmail)}
              className="input-editorial"
            />
          </div>

          <div>
            <label className="block text-[10px] tracking-[0.15em] uppercase text-muted mb-1.5 font-sans">
              Password
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={clearOnChange(setPassword)}
              className="input-editorial"
            />
          </div>

          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="btn-editorial-primary mt-2 disabled:pointer-events-none disabled:opacity-50"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </motion.button>
        </form>

        <p className="mt-8 text-xs text-muted text-center font-sans">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-charcoal underline underline-offset-4"
          >
            Sign in
          </Link>
        </p>
      </motion.div>
    </section>
  );
}
