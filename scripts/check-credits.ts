/**
 * Check Credits Script
 *
 * This script checks the current credits for all users.
 *
 * Usage:
 *   npx tsx scripts/check-credits.ts
 */

import { db } from '@/core/db';
import { credit, user } from '@/config/db/schema';
import { eq } from 'drizzle-orm';

async function checkCredits() {
  try {
    console.log('🔍 Checking credits for all users...\n');

    const allUsers = await db().select().from(user);

    for (const userData of allUsers) {
      const userCredits = await db()
        .select()
        .from(credit)
        .where(eq(credit.userId, userData.id));

      console.log(`\n👤 User: ${userData.email}`);
      console.log(`   User ID: ${userData.id}`);

      if (userCredits.length === 0) {
        console.log('   ❌ No credit records found');
      } else {
        console.log(`   📊 Total credit records: ${userCredits.length}`);

        let totalRemaining = 0;
        userCredits.forEach((c, idx) => {
          console.log(`\n   Record ${idx + 1}:`);
          console.log(`      ID: ${c.id}`);
          console.log(`      Credits: ${c.credits}`);
          console.log(`      Remaining: ${c.remainingCredits}`);
          console.log(`      Status: ${c.status}`);
          console.log(`      Type: ${c.transactionType}`);
          console.log(`      Scene: ${c.transactionScene}`);
          console.log(`      Description: ${c.description}`);
          console.log(`      Expires: ${c.expiresAt?.toISOString() || 'N/A'}`);
          console.log(`      Created: ${c.createdAt?.toISOString()}`);

          if (c.status === 'active') {
            totalRemaining += c.remainingCredits;
          }
        });

        console.log(`\n   💰 Total active remaining credits: ${totalRemaining}`);
      }
    }

    console.log('\n' + '='.repeat(60));
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkCredits()
  .then(() => {
    console.log('\n✅ Check completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Failed:', error);
    process.exit(1);
  });
