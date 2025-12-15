import { setRequestLocale } from 'next-intl/server';

import { MemeGeneratorBlock } from '@/shared/blocks/meme-generator';
import { PageHeader } from '@/shared/blocks/common';

export default async function LandingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <PageHeader
        title="AI Meme Sticker Pack Generator"
        description="Upload your image and generate a custom 4x4 emoji sticker pack with various emotions and expressions powered by AI"
        className="mt-16 -mb-32"
      />
      <MemeGeneratorBlock />

      <section className="container py-20">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="mb-4 text-3xl font-bold">How It Works</h2>
          <div className="grid gap-8 md:grid-cols-3 mt-12">
            <div className="rounded-lg border bg-card p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground text-xl font-bold">
                1
              </div>
              <h3 className="mb-2 text-xl font-semibold">Upload Image</h3>
              <p className="text-muted-foreground">
                Choose any image you want to transform into emoji stickers
              </p>
            </div>
            <div className="rounded-lg border bg-card p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground text-xl font-bold">
                2
              </div>
              <h3 className="mb-2 text-xl font-semibold">AI Generation</h3>
              <p className="text-muted-foreground">
                Our AI creates 16 unique emoji variations with different emotions
              </p>
            </div>
            <div className="rounded-lg border bg-card p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground text-xl font-bold">
                3
              </div>
              <h3 className="mb-2 text-xl font-semibold">Download & Use</h3>
              <p className="text-muted-foreground">
                Download your custom sticker pack and use it anywhere
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="container py-20 bg-muted">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="mb-4 text-3xl font-bold">Pricing</h2>
          <p className="mb-8 text-muted-foreground">
            Simple, transparent pricing. Pay only for what you use.
          </p>
          <div className="rounded-lg border bg-card p-8">
            <div className="mb-4 text-4xl font-bold">2 Credits</div>
            <p className="text-muted-foreground mb-6">
              per meme sticker pack generation
            </p>
            <ul className="space-y-3 text-left mb-6">
              <li className="flex items-center">
                <svg className="mr-2 h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                4x4 grid (16 emojis)
              </li>
              <li className="flex items-center">
                <svg className="mr-2 h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                Multiple emotions & expressions
              </li>
              <li className="flex items-center">
                <svg className="mr-2 h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                High quality output
              </li>
              <li className="flex items-center">
                <svg className="mr-2 h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                Instant download
              </li>
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}
