import { getTranslations, setRequestLocale } from 'next-intl/server';

import { PageHeader } from '@/shared/blocks/common';
import { getMetadata } from '@/shared/lib/seo';
import { CTA, FAQ } from '@/themes/default/blocks';
import { MemeGeneratorBlock } from '@/shared/blocks/meme-generator';

export const generateMetadata = getMetadata({
  title: 'Meme Sticker Pack Generator | AI-Powered Emoji Creator',
  description:
    'Generate custom emoji and sticker packs from your images. Create 16 unique emoji variations with different emotions in cute chibi style.',
  canonicalUrl: '/meme-generator',
});

export default async function MemeGeneratorPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('landing');

  return (
    <>
      <PageHeader
        title="Meme Sticker Pack Generator"
        description="Upload your image and generate a custom 4x4 emoji sticker pack with various emotions and expressions"
        className="mt-16 -mb-32"
      />
      <MemeGeneratorBlock />
      <FAQ faq={t.raw('faq')} />
      <CTA cta={t.raw('cta')} className="bg-muted" />
    </>
  );
}
