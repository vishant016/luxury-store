"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth";

export default function LoginPage() {
  const router = useRouter();
  const { login, loading, error, clearError } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await login(email, password);
      router.push("/account");
    } catch {
      /* error is set in store */
    }
  }

  return (
    <section className="py-24 px-6 bg-cream">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="max-w-sm mx-auto"
      >
        <h1 className="text-2xl font-serif font-normal tracking-tight text-charcoal text-center mb-2">
          Sign In
        </h1>
        <p className="text-sm text-muted text-center mb-10 font-sans">
          Welcome back to Desire
        </p>

        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-600 text-xs text-center font-sans">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-[10px] tracking-[0.15em] uppercase text-muted mb-1.5 font-sans">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                clearError();
              }}
              className="w-full px-4 py-3 text-sm bg-transparent border border-stone outline-none focus:border-gold transition-colors duration-300 font-sans"
            />
          </div>

          <div>
            <label className="block text-[10px] tracking-[0.15em] uppercase text-muted mb-1.5 font-sans">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                clearError();
              }}
              className="w-full px-4 py-3 text-sm bg-transparent border border-stone outline-none focus:border-gold transition-colors duration-300 font-sans"
            />
          </div>

          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="w-full py-4 mt-2 bg-charcoal text-cream text-[10px] tracking-[0.35em] uppercase font-sans hover:bg-gold transition-colors duration-500 disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign In"}
          </motion.button>
        </form>

        <p className="mt-8 text-xs text-muted text-center font-sans">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="text-charcoal underline underline-offset-4"
          >
            Create one
          </Link>
        </p>
      </motion.div>
    </section>
  );
}
