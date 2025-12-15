import { and, count, desc, eq, isNull } from 'drizzle-orm';

import { db } from '@/core/db';
import { meme } from '@/config/db/schema';
import { appendUserToResult, User } from '@/shared/models/user';

export type Meme = typeof meme.$inferSelect & {
  user?: User;
};
export type NewMeme = typeof meme.$inferInsert;
export type UpdateMeme = Partial<Omit<NewMeme, 'id' | 'createdAt'>>;

export async function createMeme(newMeme: NewMeme) {
  const [result] = await db().insert(meme).values(newMeme).returning();
  return result;
}

export async function findMemeById(id: string) {
  const [result] = await db()
    .select()
    .from(meme)
    .where(and(eq(meme.id, id), isNull(meme.deletedAt)));
  return result;
}

export async function updateMemeById(id: string, updateMeme: UpdateMeme) {
  const [result] = await db()
    .update(meme)
    .set(updateMeme)
    .where(eq(meme.id, id))
    .returning();
  return result;
}

export async function deleteMemeById(id: string) {
  const [result] = await db()
    .update(meme)
    .set({ deletedAt: new Date() })
    .where(eq(meme.id, id))
    .returning();
  return result;
}

export async function getMemesCount({
  userId,
  status,
}: {
  userId?: string;
  status?: string;
}): Promise<number> {
  const [result] = await db()
    .select({ count: count() })
    .from(meme)
    .where(
      and(
        userId ? eq(meme.userId, userId) : undefined,
        status ? eq(meme.status, status) : undefined,
        isNull(meme.deletedAt)
      )
    );

  return result?.count || 0;
}

export async function getMemes({
  userId,
  status,
  page = 1,
  limit = 50,
  getUser = false,
}: {
  userId?: string;
  status?: string;
  page?: number;
  limit?: number;
  getUser?: boolean;
}): Promise<Meme[]> {
  const result = await db()
    .select()
    .from(meme)
    .where(
      and(
        userId ? eq(meme.userId, userId) : undefined,
        status ? eq(meme.status, status) : undefined,
        isNull(meme.deletedAt)
      )
    )
    .orderBy(desc(meme.createdAt))
    .limit(limit)
    .offset((page - 1) * limit);

  if (getUser) {
    return appendUserToResult(result);
  }

  return result;
}
