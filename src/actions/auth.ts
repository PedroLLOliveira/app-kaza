"use server";

import { cookies } from "next/headers";
import { SignJWT } from "jose";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

const secretKey = new TextEncoder().encode(
  process.env.JWT_SECRET || "fallback-secret-key-for-dev"
);

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  inviteCode: z.string().optional()
});

export async function loginAction(formData: FormData) {
  const parsed = loginSchema.safeParse(Object.fromEntries(formData));
  
  if (!parsed.success) {
    redirect("/login?error=missing_fields");
  }

  const { email, password } = parsed.data;

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
  const parsed = registerSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    redirect("/register?error=missing_fields");
  }

  const { name, email, password, inviteCode } = parsed.data;

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    redirect("/register?error=email_in_use");
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  let targetHouseholdId: string;

  if (inviteCode && inviteCode.trim() !== "") {
    const household = await prisma.household.findUnique({
      where: { inviteCode }
    });

    if (!household) {
      redirect("/register?error=invalid_invite_code");
    }

    const { checkHouseholdUserLimit } = await import("@/lib/limits");
    try {
      await checkHouseholdUserLimit(household.id);
    } catch (e: any) {
      redirect(`/register?error=${encodeURIComponent(e.message)}`);
    }

    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        householdId: household.id,
        contributionPercentage: 50,
      }
    });
    
    targetHouseholdId = household.id;
  } else {
    // Cria a Casa "My House" e o Usuário de uma vez só usando o Prisma
    const house = await prisma.household.create({
      data: {
        name: "My House",
        users: {
          create: {
            name,
            email,
            password: hashedPassword,
            contributionPercentage: 50,
          }
        }
      }
    });
    targetHouseholdId = house.id;
  }

  const newUser = await prisma.user.findUniqueOrThrow({ where: { email } });

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
