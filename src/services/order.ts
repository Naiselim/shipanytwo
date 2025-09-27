import { order, subscription } from "@/config/db/schema";
import { db } from "@/core/db";
import { and, count, desc, eq } from "drizzle-orm";
import { NewSubscription } from "./subscription";

export type Order = typeof order.$inferSelect;
export type NewOrder = typeof order.$inferInsert;
export type UpdateOrder = Partial<
  Omit<NewOrder, "id" | "orderNo" | "createdAt">
>;

export enum OrderStatus {
  // processing status
  PENDING = "pending", // order saved, waiting for checkout
  CREATED = "created", // checkout success
  // final status
  COMPLETED = "completed", // checkout completed, but failed
  PAID = "paid", // order paid success
  FAILED = "failed", // order paid, but failed
}

/**
 * create order
 */
export async function createOrder(newOrder: NewOrder) {
  const [result] = await db().insert(order).values(newOrder).returning();

  return result;
}

/**
 * get orders
 */
export async function getOrders({
  userId,
  status,
  page = 1,
  limit = 30,
}: {
  userId?: string;
  status?: string;
  page?: number;
  limit?: number;
} = {}): Promise<Order[]> {
  const result = await db()
    .select()
    .from(order)
    .where(
      and(
        userId ? eq(order.userId, userId) : undefined,
        status ? eq(order.status, status) : undefined
      )
    )
    .orderBy(desc(order.createdAt))
    .limit(limit)
    .offset((page - 1) * limit);

  return result;
}

/**
 * get orders count
 */
export async function getOrdersCount({
  userId,
  status,
}: {
  userId?: string;
  status?: string;
} = {}): Promise<number> {
  const [result] = await db()
    .select({ count: count() })
    .from(order)
    .where(
      and(
        userId ? eq(order.userId, userId) : undefined,
        status ? eq(order.status, status) : undefined
      )
    );

  return result?.count || 0;
}

/**
 * find order by id
 */
export async function findOrderById(id: string) {
  const [result] = await db().select().from(order).where(eq(order.id, id));

  return result;
}

/**
 * find order by order no
 */
export async function findOrderByOrderNo(orderNo: string) {
  const [result] = await db()
    .select()
    .from(order)
    .where(eq(order.orderNo, orderNo));

  return result;
}

/**
 * update order
 */
export async function updateOrderByOrderNo(
  orderNo: string,
  updateOrder: UpdateOrder
) {
  const [result] = await db()
    .update(order)
    .set(updateOrder)
    .where(eq(order.orderNo, orderNo))
    .returning();

  return result;
}

/**
 * update order with subscription data
 */
export async function updateOrderWithSubscription(
  orderNo: string,
  updateOrder: UpdateOrder,
  newSubscription: NewSubscription
) {
  const result = await db().transaction(async (tx) => {
    // query existing subscription
    let [existingSubscription] = await tx
      .select()
      .from(subscription)
      .where(
        and(
          eq(subscription.subscriptionId, newSubscription.subscriptionId),
          eq(subscription.paymentProvider, newSubscription.paymentProvider)
        )
      );

    if (!existingSubscription) {
      // create subscription
      const [subscriptionResult] = await tx
        .insert(subscription)
        .values(newSubscription)
        .returning();

      existingSubscription = subscriptionResult;
    }

    // update order
    const [orderResult] = await tx
      .update(order)
      .set(updateOrder)
      .where(eq(order.orderNo, orderNo))
      .returning();

    return {
      order: orderResult,
      subscription: existingSubscription,
    };
  });

  return result;
}
