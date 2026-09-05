import type { AppUser } from "@/types";

/** Mock users — replace with a `profiles` table query later. */
export const mockUsers: AppUser[] = [
  {
    id: "usr-1",
    displayName: "Adam Reyes",
    email: "adam.reyes@example.com",
    role: "admin",
    status: "active",
    avatarUrl: null,
    joinedAt: "2026-01-14T10:00:00.000Z",
  },
  {
    id: "usr-2",
    displayName: "Mina Osei",
    email: "mina.osei@example.com",
    role: "user",
    status: "active",
    avatarUrl: null,
    joinedAt: "2026-02-03T09:20:00.000Z",
  },
  {
    id: "usr-3",
    displayName: "Tobias Lang",
    email: "tobias.lang@example.com",
    role: "user",
    status: "active",
    avatarUrl: null,
    joinedAt: "2026-03-22T18:45:00.000Z",
  },
  {
    id: "usr-4",
    displayName: "Sara Vidal",
    email: "sara.vidal@example.com",
    role: "user",
    status: "suspended",
    avatarUrl: null,
    joinedAt: "2026-04-08T14:05:00.000Z",
  },
  {
    id: "usr-5",
    displayName: "Kenji Mori",
    email: "kenji.mori@example.com",
    role: "admin",
    status: "active",
    avatarUrl: null,
    joinedAt: "2026-05-19T07:35:00.000Z",
  },
  {
    id: "usr-6",
    displayName: "Ivana Petrova",
    email: "ivana.petrova@example.com",
    role: "user",
    status: "active",
    avatarUrl: null,
    joinedAt: "2026-06-30T21:10:00.000Z",
  },
  {
    id: "usr-7",
    displayName: "Marcus Bell",
    email: "marcus.bell@example.com",
    role: "user",
    status: "active",
    avatarUrl: null,
    joinedAt: "2026-07-11T11:55:00.000Z",
  },
  {
    id: "usr-8",
    displayName: "Leila Haddad",
    email: "leila.haddad@example.com",
    role: "user",
    status: "active",
    avatarUrl: null,
    joinedAt: "2026-08-02T16:25:00.000Z",
  },
];

/** Temporary front-end-only session preview (no auth yet). */
export const mockCurrentUser: AppUser = mockUsers[0]!;
