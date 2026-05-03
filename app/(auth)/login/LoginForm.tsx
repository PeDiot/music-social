"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { useSearchParams } from "next/navigation";

import { loginAction, type LoginState } from "@/features/auth/actions";

const initial: LoginState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full h-11 rounded-2xl bg-rose-500 text-white font-medium hover:bg-rose-600 active:scale-[0.99] transition disabled:opacity-50"
    >
      {pending ? "Connexion…" : "Se connecter"}
    </button>
  );
}

export function LoginForm() {
  const search = useSearchParams();
  const callbackUrl = search.get("callbackUrl") ?? "/feed";
  const [state, formAction] = useActionState(loginAction, initial);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="callbackUrl" value={callbackUrl} />
      <div className="space-y-1.5">
        <label htmlFor="email" className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="w-full h-11 px-4 rounded-2xl bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 outline-none focus:ring-2 focus:ring-rose-500/40"
        />
      </div>
      <div className="space-y-1.5">
        <label htmlFor="password" className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
          Mot de passe
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="w-full h-11 px-4 rounded-2xl bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 outline-none focus:ring-2 focus:ring-rose-500/40"
        />
      </div>
      {state.error && (
        <p className="text-sm text-rose-600">{state.error}</p>
      )}
      <SubmitButton />
    </form>
  );
}
