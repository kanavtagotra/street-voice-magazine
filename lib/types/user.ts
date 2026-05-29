export type UserRole = "user" | "admin";

export type ReadingPreferences = {
  readerZoom?: number;
  readerVariant?: "thumb" | "mobile" | "tablet" | "desktop";
  autoFullscreen?: boolean;
};

export type UserRecord = {
  id: string;
  email: string;
  name: string;
  passwordHash?: string;
  image?: string;
  role: UserRole;
  preferences: ReadingPreferences;
  createdAt: string;
  updatedAt: string;
};

export type PublicUser = Pick<UserRecord, "id" | "email" | "name" | "image" | "role" | "preferences">;
