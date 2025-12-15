/**
 * Grant Credits to All Users Script
 *
 * This script grants initial credits to all existing users in the database.
 * Useful for updating existing users when implementing a new credits system.
 *
 * Usage:
 *   npx tsx scripts/grant-credits-to-all.ts
 *
 * With custom amount:
 *   npx tsx scripts/grant-credits-to-all.ts --credits=50
 */

import { eq } from 'drizzle-orm';

import { envConfigs } from '@/config';
import { db } from '@/core/db';
import { credit, user } from '@/config/db/schema';
import { getSnowId, getUuid } from '@/shared/lib/hash';
import {
  CreditStatus,
  CreditTransactionScene,
  CreditTransactionType,
} from '@/shared/models/credit';

async function grantCreditsToAllUsers() {
  try {
    console.log('🚀 Starting to grant credits to all users...\n');

    // Parse command line arguments
    const args = process.argv.slice(2);
    const creditsArg = args.find((arg) => arg.startsWith('--credits='));
    const creditsAmount = creditsArg
      ? parseInt(creditsArg.split('=')[1], 10)
      : parseInt(envConfigs.initial_credits, 10);

    console.log(`💰 Credits amount: ${creditsAmount}\n`);

    // Get all users
    const allUsers = await db().select().from(user);

    if (allUsers.length === 0) {
      console.log('❌ No users found in the database.');
      return;
    }

    console.log(`👥 Found ${allUsers.length} user(s)\n`);

    let successCount = 0;
    let skipCount = 0;
    let errorCount = 0;

    // Process each user
    for (const userData of allUsers) {
      try {
        // Check if user already has credits
        const existingCredits = await db()
          .select()
          .from(credit)
          .where(eq(credit.userId, userData.id));

        if (existingCredits.length > 0) {
          console.log(
            `⏭️  Skipping ${userData.email} - already has ${existingCredits.length} credit record(s)`
          );
          skipCount++;
          continue;
        }

        // Calculate expiration (365 days from now)
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 365);

        // Create credit record
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

        console.log(
          `✅ Granted ${creditsAmount} credits to ${userData.email} (expires: ${expiresAt.toLocaleDateString()})`
        );
        successCount++;
      } catch (error) {
        console.error(`❌ Error granting credits to ${userData.email}:`, error);
        errorCount++;
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 Summary:');
    console.log(`   ✅ Success: ${successCount}`);
    console.log(`   ⏭️  Skipped: ${skipCount}`);
    console.log(`   ❌ Errors: ${errorCount}`);
    console.log(`   👥 Total: ${allUsers.length}`);
    console.log('='.repeat(60) + '\n');

    if (successCount > 0) {
      console.log(
        '🎉 Credits successfully granted to all eligible users!\n'
      );
    }
  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

// Run the script
grantCreditsToAllUsers()
  .then(() => {
    console.log('✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
