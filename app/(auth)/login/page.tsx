import Link from "next/link";
import { Suspense } from "react";

import { LoginForm } from "./LoginForm";

export const metadata = { title: "Connexion · Resound" };

export default function LoginPage() {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Bon retour</h1>
        <p className="text-sm text-neutral-500">
          Connecte-toi pour partager tes musiques.
        </p>
      </div>
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
      <p className="text-center text-sm text-neutral-500">
        Pas encore de compte ?{" "}
        <Link
          href="/signup"
          className="font-medium text-rose-600 hover:underline"
        >
          Inscris-toi
        </Link>
      </p>
    </div>
  );
}
