import { subscription } from "@/config/db/schema";
import { db } from "@/core/db";
import { and, desc, eq } from "drizzle-orm";

export type Subscription = typeof subscription.$inferSelect;
export type NewSubscription = typeof subscription.$inferInsert;
export type UpdateSubscription = Partial<
  Omit<NewSubscription, "id" | "subscriptionNo" | "createdAt">
>;

export enum SubscriptionStatus {
  PENDING = "pending",
  ACTIVE = "active",
  CANCELLED = "cancelled",
}

/**
 * create subscription
 */
export async function createSubscription(newSubscription: NewSubscription) {
  const [result] = await db()
    .insert(subscription)
    .values(newSubscription)
    .returning();
  return result;
}

/**
 * find subscription by id
 */
export async function findSubscriptionById(id: string) {
  const [result] = await db()
    .select()
    .from(subscription)
    .where(eq(subscription.id, id));

  return result;
}

/**
 * find subscription by subscription no
 */
export async function findSubscriptionBySubscriptionNo(subscriptionNo: string) {
  const [result] = await db()
    .select()
    .from(subscription)
    .where(eq(subscription.subscriptionNo, subscriptionNo));

  return result;
}

/**
 * get subscriptions
 */
export async function getSubscriptions({
  userId,
  status,
  page = 1,
  limit = 30,
}: {
  userId?: string;
  status?: string;
  page?: number;
  limit?: number;
}): Promise<Subscription[]> {
  const result = await db()
    .select()
    .from(subscription)
    .where(
      and(
        userId ? eq(subscription.userId, userId) : undefined,
        status ? eq(subscription.status, status) : undefined
      )
    )
    .orderBy(desc(subscription.createdAt))
    .limit(limit)
    .offset((page - 1) * limit);

  return result;
}
