"use server";

import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { signIn } from "@/lib/auth";

const signupSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(8, "8 caractères minimum"),
  username: z
    .string()
    .min(3, "3 caractères minimum")
    .max(20, "20 caractères maximum")
    .regex(/^[a-zA-Z0-9_]+$/, "Lettres, chiffres et _ uniquement"),
  name: z.string().max(50).optional(),
});

export type SignupState = {
  error?: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

export async function signupAction(
  _prev: SignupState,
  formData: FormData,
): Promise<SignupState> {
  const parsed = signupSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    username: formData.get("username"),
    name: formData.get("name") || undefined,
  });

  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }

  const { email, password, username, name } = parsed.data;

  const existing = await prisma.user.findFirst({
    where: { OR: [{ email: email.toLowerCase() }, { username }] },
    select: { email: true, username: true },
  });
  if (existing) {
    if (existing.email === email.toLowerCase()) {
      return { error: "Cet email est déjà utilisé" };
    }
    return { error: "Ce nom d'utilisateur est déjà pris" };
  }

  const hashed = await bcrypt.hash(password, 10);
  await prisma.user.create({
    data: {
      email: email.toLowerCase(),
      username,
      name: name?.trim() || null,
      password: hashed,
    },
  });

  await signIn("credentials", {
    email,
    password,
    redirect: false,
  });

  redirect("/feed");
}

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export type LoginState = {
  error?: string;
};

export async function loginAction(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: "Email ou mot de passe invalide" };
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirect: false,
    });
  } catch {
    return { error: "Email ou mot de passe incorrect" };
  }

  const callbackUrl =
    (formData.get("callbackUrl") as string | null) || "/feed";
  redirect(callbackUrl);
}

export async function logoutAction() {
  const { signOut } = await import("@/lib/auth");
  await signOut({ redirect: false });
  redirect("/login");
}
