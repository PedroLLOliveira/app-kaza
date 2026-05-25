"use server";

import { cookies } from "next/headers";
import { SignJWT } from "jose";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

const secretKey = new TextEncoder().encode(
  process.env.JWT_SECRET || "fallback-secret-key-for-dev"
);

export async function loginAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    redirect("/login?error=missing_fields");
  }

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    redirect("/login?error=invalid_credentials");
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    redirect("/login?error=invalid_credentials");
  }

  const token = await new SignJWT({ 
    email: user.email, 
    userId: user.id, 
    householdId: user.householdId, 
    role: "user" 
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secretKey);

  const cookieStore = await cookies();
  cookieStore.set("auth_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });

  redirect("/dashboard/house");
}

export async function registerAction(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!name || !email || !password) {
    redirect("/register?error=missing_fields");
  }

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    redirect("/register?error=email_in_use");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  // Cria a Casa "My House" e o Usuário de uma vez só usando o Prisma
  const house = await prisma.household.create({
    data: {
      name: "My House",
      users: {
        create: {
          name,
          email,
          password: hashedPassword,
          contributionPercentage: 50, // Padrão
        }
      }
    },
    include: {
      users: true
    }
  });

  const newUser = house.users[0];

  const token = await new SignJWT({ 
    email: newUser.email, 
    userId: newUser.id, 
    householdId: newUser.householdId, 
    role: "user" 
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secretKey);

  const cookieStore = await cookies();
  cookieStore.set("auth_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
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
