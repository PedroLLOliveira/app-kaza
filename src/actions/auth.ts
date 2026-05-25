"use server";

import { cookies } from "next/headers";
import { SignJWT } from "jose";
import { redirect } from "next/navigation";

const secretKey = new TextEncoder().encode(
  process.env.JWT_SECRET || "fallback-secret-key-for-dev"
);

export async function loginAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  // Mock validation for Phase 2
  if (!email || !password) {
    throw new Error("Email e senha são obrigatórios");
  }

  // Set the default user IDs from our seed for testing CRUD operations
  const userId = "11111111-1111-1111-1111-111111111111";
  const householdId = "22222222-2222-2222-2222-222222222222";

  // Generate a mock JWT token
  const token = await new SignJWT({ email, userId, householdId, role: "user" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secretKey);

  // Set the cookie
  const cookieStore = await cookies();
  cookieStore.set("auth_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 1 week
    path: "/",
  });

  redirect("/dashboard/house");
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete("auth_token");
  redirect("/login");
}

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  if (!token) return null;

  try {
    const { jwtVerify } = await import("jose");
    const { payload } = await jwtVerify(token, secretKey);
    return payload as { email: string, userId: string, householdId: string, role: string };
  } catch (err) {
    return null;
  }
}
