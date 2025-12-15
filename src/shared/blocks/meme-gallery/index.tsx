'use client';

import { useSession } from '@/core/auth/client';
import { MemeGallery } from '@/shared/components/meme-gallery';

export function MemeGalleryBlock() {
  const { data: session } = useSession();

  return <MemeGallery userId={session?.user?.id} limit={20} />;
}
