/**
 * Enable Initial Credits Script
 *
 * This script enables automatic initial credits for new user registrations.
 * It sets the required configuration values in the database.
 *
 * Usage:
 *   npx tsx scripts/enable-initial-credits.ts
 */

import { db } from '@/core/db';
import { config } from '@/config/db/schema';
import { eq } from 'drizzle-orm';
import { envConfigs } from '@/config';

async function enableInitialCredits() {
  try {
    console.log('🔧 Enabling initial credits configuration...\n');

    const configValues = [
      {
        name: 'initial_credits_enabled',
        value: 'true',
        description: 'Enable automatic initial credits for new users',
      },
      {
        name: 'initial_credits_amount',
        value: envConfigs.initial_credits,
        description: 'Amount of initial credits to grant to new users',
      },
      {
        name: 'initial_credits_valid_days',
        value: '365',
        description: 'Number of days until initial credits expire',
      },
      {
        name: 'initial_credits_description',
        value: 'Initial credits for meme generation',
        description: 'Description shown for initial credits transaction',
      },
    ];

    for (const configItem of configValues) {
      // Check if config already exists
      const existing = await db()
        .select()
        .from(config)
        .where(eq(config.name, configItem.name));

      if (existing.length > 0) {
        // Update existing config
        await db()
          .update(config)
          .set({ value: configItem.value })
          .where(eq(config.name, configItem.name));

        console.log(`✅ Updated: ${configItem.name} = ${configItem.value}`);
      } else {
        // Insert new config
        await db()
          .insert(config)
          .values({
            name: configItem.name,
            value: configItem.value,
          });

        console.log(`✅ Created: ${configItem.name} = ${configItem.value}`);
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 Configuration Summary:');
    console.log(`   ✅ Initial credits enabled: true`);
    console.log(`   💰 Credits amount: ${envConfigs.initial_credits}`);
    console.log(`   📅 Valid days: 365`);
    console.log(`   📝 Description: Initial credits for meme generation`);
    console.log('='.repeat(60));

    console.log('\n🎉 Initial credits configuration enabled successfully!');
    console.log('\n📌 Next Steps:');
    console.log('   1. Register a new user to test automatic credit grant');
    console.log('   2. Check the credits display shows 50 credits');
    console.log('   3. Verify in database with: pnpm check:credits\n');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

enableInitialCredits()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Failed:', error);
    process.exit(1);
  });
