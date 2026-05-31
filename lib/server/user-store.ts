import { head, put } from "@vercel/blob";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
import { promises as fs } from "fs";
import path from "path";
import type { UserRecord } from "@/lib/types/user";
import { normalizeEmail } from "@/lib/auth/validation";

const BLOB_PATHNAME = "auth/users.json";
const LOCAL_USERS = path.join(process.cwd(), "storage", "auth", "users.json");

type UsersDatabase = {
  users: UserRecord[];
};

const emptyDb: UsersDatabase = { users: [] };

function blobToken() {
  return process.env.BLOB_READ_WRITE_TOKEN || undefined;
}

function isBlobEnabled() {
  return Boolean(blobToken());
}

async function blobRead(): Promise<Buffer | null> {
  const token = blobToken();
  if (!token) return null;

  try {
    const meta = await head(BLOB_PATHNAME, { token });
    const res = await fetch(meta.url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return null;
    return Buffer.from(await res.arrayBuffer());
  } catch {
    return null;
  }
}

async function ensureLocalStore() {
  const dir = path.dirname(LOCAL_USERS);
  await fs.mkdir(dir, { recursive: true });
  try {
    await fs.access(LOCAL_USERS);
  } catch {
    await fs.writeFile(LOCAL_USERS, JSON.stringify(emptyDb, null, 2), "utf-8");
  }
}

async function readDatabase(): Promise<UsersDatabase> {
  if (isBlobEnabled()) {
    const raw = await blobRead();
    if (!raw) return { ...emptyDb, users: [] };
    return JSON.parse(raw.toString("utf-8")) as UsersDatabase;
  }

  await ensureLocalStore();
  const raw = await fs.readFile(LOCAL_USERS, "utf-8");
  return JSON.parse(raw) as UsersDatabase;
}

async function writeDatabase(db: UsersDatabase) {
  const payload = JSON.stringify(db, null, 2);

  if (isBlobEnabled()) {
    const token = blobToken();
    if (!token) throw new Error("BLOB_READ_WRITE_TOKEN is not configured");

    await put(BLOB_PATHNAME, Buffer.from(payload, "utf-8"), {
      access: "private",
      addRandomSuffix: false,
      token,
    });
    return;
  }

  await ensureLocalStore();
  await fs.writeFile(LOCAL_USERS, payload, "utf-8");
}

export async function findUserByEmail(email: string): Promise<UserRecord | null> {
  const normalized = normalizeEmail(email);
  const db = await readDatabase();
  return db.users.find((u) => u.email === normalized) ?? null;
}

export async function findUserById(id: string): Promise<UserRecord | null> {
  const db = await readDatabase();
  return db.users.find((u) => u.id === id) ?? null;
}

export async function createUserWithPassword(input: {
  email: string;
  password: string;
  name: string;
}): Promise<UserRecord> {
  const email = normalizeEmail(input.email);
  const existing = await findUserByEmail(email);
  if (existing) {
    throw new Error("EMAIL_EXISTS");
  }

  const passwordHash = await bcrypt.hash(input.password, 12);
  const now = new Date().toISOString();
  const user: UserRecord = {
    id: randomUUID(),
    email,
    name: input.name.trim(),
    passwordHash,
    role: "user",
    preferences: {},
    createdAt: now,
    updatedAt: now,
  };

  const db = await readDatabase();
  db.users.push(user);
  await writeDatabase(db);
  return user;
}

export async function upsertGoogleUser(input: {
  email: string;
  name?: string | null;
  image?: string | null;
}): Promise<UserRecord> {
  const email = normalizeEmail(input.email);
  const db = await readDatabase();
  const index = db.users.findIndex((u) => u.email === email);
  const now = new Date().toISOString();

  if (index >= 0) {
    const existing = db.users[index];
    const updated: UserRecord = {
      ...existing,
      name: input.name?.trim() || existing.name,
      image: input.image ?? existing.image,
      updatedAt: now,
    };
    db.users[index] = updated;
    await writeDatabase(db);
    return updated;
  }

  const user: UserRecord = {
    id: randomUUID(),
    email,
    name: input.name?.trim() || email.split("@")[0],
    image: input.image ?? undefined,
    role: "user",
    preferences: {},
    createdAt: now,
    updatedAt: now,
  };

  db.users.push(user);
  await writeDatabase(db);
  return user;
}

export async function verifyUserPassword(
  email: string,
  password: string,
): Promise<UserRecord | null> {
  const user = await findUserByEmail(email);
  if (!user?.passwordHash) return null;

  const valid = await bcrypt.compare(password, user.passwordHash);
  return valid ? user : null;
}
