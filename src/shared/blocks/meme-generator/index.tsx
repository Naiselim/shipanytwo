'use client';

import { useCallback, useEffect, useState } from 'react';

import { useSession } from '@/core/auth/client';
import { MemeGenerator } from '@/shared/components/meme-generator';
import { useAppContext } from '@/shared/contexts/app';

export function MemeGeneratorBlock() {
  const { data: session } = useSession();
  const { credits, refreshCredits } = useAppContext();
  const [remainingCredits, setRemainingCredits] = useState<number>(0);

  useEffect(() => {
    if (typeof credits === 'number') {
      setRemainingCredits(credits);
    }
  }, [credits]);

  const handleCreditsUpdate = useCallback(() => {
    refreshCredits?.();
  }, [refreshCredits]);

  return (
    <section className="container relative z-10 py-20">
      <div className="mx-auto max-w-4xl">
        <MemeGenerator
          userId={session?.user?.id}
          remainingCredits={remainingCredits}
          onCreditsUpdate={handleCreditsUpdate}
        />
      </div>
    </section>
  );
}
