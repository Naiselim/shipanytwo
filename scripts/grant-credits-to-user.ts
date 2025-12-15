/**
 * Grant Credits to Specific User Script
 *
 * This script grants credits to a specific user by email.
 *
 * Usage:
 *   npx tsx scripts/grant-credits-to-user.ts --email=test@qq.com --credits=50
 */

import { db } from '@/core/db';
import { credit, user } from '@/config/db/schema';
import { eq } from 'drizzle-orm';
import { getUuid, getSnowId } from '@/shared/lib/hash';
import {
  CreditStatus,
  CreditTransactionScene,
  CreditTransactionType,
} from '@/shared/models/credit';

async function grantCreditsToUser() {
  try {
    const args = process.argv.slice(2);
    const emailArg = args.find((arg) => arg.startsWith('--email='));
    const creditsArg = args.find((arg) => arg.startsWith('--credits='));

    if (!emailArg) {
      console.error('❌ Error: --email argument is required');
      console.log('Usage: npx tsx scripts/grant-credits-to-user.ts --email=test@qq.com --credits=50');
      process.exit(1);
    }

    const email = emailArg.split('=')[1];
    const creditsAmount = creditsArg ? parseInt(creditsArg.split('=')[1]) : 50;

    console.log(`🚀 Granting ${creditsAmount} credits to user: ${email}\n`);

    // Find user
    const [userData] = await db()
      .select()
      .from(user)
      .where(eq(user.email, email));

    if (!userData) {
      console.error(`❌ User not found: ${email}`);
      process.exit(1);
    }

    console.log(`👤 Found user: ${userData.email} (ID: ${userData.id})`);

    // Check if user already has credits
    const existingCredits = await db()
      .select()
      .from(credit)
      .where(eq(credit.userId, userData.id));

    if (existingCredits.length > 0) {
      console.log(`⚠️  User already has ${existingCredits.length} credit record(s)`);
      console.log(`   Do you want to add more credits? (This will create a new record)`);
    }

    // Create credit record
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 365);

    const newCredit = {
      id: getUuid(),
      userId: userData.id,
      userEmail: userData.email,
      orderNo: '',
      subscriptionNo: '',
      transactionNo: getSnowId(),
      transactionType: CreditTransactionType.GRANT,
      transactionScene: CreditTransactionScene.GIFT,
      credits: creditsAmount,
      remainingCredits: creditsAmount,
      description: 'Initial credits for meme generation',
      expiresAt: expiresAt,
      status: CreditStatus.ACTIVE,
    };

    await db().insert(credit).values(newCredit);

    console.log(`✅ Successfully granted ${creditsAmount} credits to ${email}`);
    console.log(`   Expires: ${expiresAt.toLocaleDateString()}`);
    console.log(`   Credit ID: ${newCredit.id}\n`);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

grantCreditsToUser()
  .then(() => {
    console.log('✅ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Failed:', error);
    process.exit(1);
  });
