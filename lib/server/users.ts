import { randomUUID } from "crypto";
import { promises as fs } from "fs";
import path from "path";
import { hash, compare } from "bcryptjs";
import type { PublicUser, ReadingPreferences, UserRecord, UserRole } from "@/lib/types/user";
import { STORAGE_ROOT } from "@/lib/server/paths";

const USERS_PATH = path.join(STORAGE_ROOT, "users.json");

type UsersFile = {
  users: UserRecord[];
};

function isAdminEmail(email: string): boolean {
  const list =
    process.env.ADMIN_EMAILS?.split(",").map((e) => e.trim().toLowerCase()) ?? [];
  const single = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const emails = single ? [...list, single] : list;
  return emails.includes(email.toLowerCase());
}

function resolveRole(email: string, requested?: UserRole): UserRole {
  if (isAdminEmail(email)) return "admin";
  return requested === "admin" ? "user" : "user";
}

async function ensureUsersFile() {
  await fs.mkdir(STORAGE_ROOT, { recursive: true });
  try {
    await fs.access(USERS_PATH);
  } catch {
    await fs.writeFile(USERS_PATH, JSON.stringify({ users: [] }, null, 2), "utf-8");
  }
}

async function readUsersFile(): Promise<UsersFile> {
  await ensureUsersFile();
  const raw = await fs.readFile(USERS_PATH, "utf-8");
  return JSON.parse(raw) as UsersFile;
}

async function writeUsersFile(data: UsersFile) {
  await ensureUsersFile();
  await fs.writeFile(USERS_PATH, JSON.stringify(data, null, 2), "utf-8");
}

export function toPublicUser(user: UserRecord): PublicUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    image: user.image,
    role: user.role,
    preferences: user.preferences,
  };
}

export async function findUserByEmail(email: string): Promise<UserRecord | null> {
  const { users } = await readUsersFile();
  return users.find((u) => u.email.toLowerCase() === email.toLowerCase()) ?? null;
}

export async function findUserById(id: string): Promise<UserRecord | null> {
  const { users } = await readUsersFile();
  return users.find((u) => u.id === id) ?? null;
}

export async function createUser(input: {
  email: string;
  name: string;
  password?: string;
  image?: string;
}): Promise<UserRecord> {
  const email = input.email.trim().toLowerCase();
  const existing = await findUserByEmail(email);
  if (existing) {
    throw new Error("An account with this email already exists");
  }

  if (!input.password || input.password.length < 8) {
    throw new Error("Password must be at least 8 characters");
  }

  const now = new Date().toISOString();
  const user: UserRecord = {
    id: randomUUID(),
    email,
    name: input.name.trim() || email.split("@")[0],
    passwordHash: await hash(input.password, 12),
    image: input.image,
    role: resolveRole(email),
    preferences: {},
    createdAt: now,
    updatedAt: now,
  };

  const data = await readUsersFile();
  data.users.push(user);
  await writeUsersFile(data);
  return user;
}

export async function upsertOAuthUser(input: {
  email: string;
  name?: string | null;
  image?: string | null;
}): Promise<UserRecord> {
  const email = input.email.trim().toLowerCase();
  const existing = await findUserByEmail(email);
  if (existing) {
    const data = await readUsersFile();
    const idx = data.users.findIndex((u) => u.id === existing.id);
    const role = resolveRole(email, existing.role);
    data.users[idx] = {
      ...existing,
      name: input.name?.trim() || existing.name,
      image: input.image ?? existing.image,
      role,
      updatedAt: new Date().toISOString(),
    };
    await writeUsersFile(data);
    return data.users[idx];
  }

  const now = new Date().toISOString();
  const user: UserRecord = {
    id: randomUUID(),
    email,
    name: input.name?.trim() || email.split("@")[0],
    image: input.image ?? undefined,
    role: resolveRole(email),
    preferences: {},
    createdAt: now,
    updatedAt: now,
  };

  const data = await readUsersFile();
  data.users.push(user);
  await writeUsersFile(data);
  return user;
}

export async function verifyUserCredentials(
  email: string,
  password: string,
): Promise<UserRecord | null> {
  const user = await findUserByEmail(email);
  if (!user?.passwordHash) return null;
  const valid = await compare(password, user.passwordHash);
  return valid ? user : null;
}

export async function updateUserProfile(
  userId: string,
  patch: { name?: string; image?: string },
): Promise<PublicUser | null> {
  const data = await readUsersFile();
  const idx = data.users.findIndex((u) => u.id === userId);
  if (idx < 0) return null;

  const user = data.users[idx];
  data.users[idx] = {
    ...user,
    name: patch.name?.trim() ?? user.name,
    image: patch.image ?? user.image,
    updatedAt: new Date().toISOString(),
  };
  await writeUsersFile(data);
  return toPublicUser(data.users[idx]);
}

export async function updateUserPreferences(
  userId: string,
  preferences: ReadingPreferences,
): Promise<PublicUser | null> {
  const data = await readUsersFile();
  const idx = data.users.findIndex((u) => u.id === userId);
  if (idx < 0) return null;

  const user = data.users[idx];
  data.users[idx] = {
    ...user,
    preferences: { ...user.preferences, ...preferences },
    updatedAt: new Date().toISOString(),
  };
  await writeUsersFile(data);
  return toPublicUser(data.users[idx]);
}
