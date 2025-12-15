// Load .env files for scripts (tsx/ts-node) - but NOT in Edge Runtime or browser
// This ensures scripts can read DATABASE_URL and other env vars
// Check for real Node.js environment by looking at global 'process' properties
if (
  typeof process !== 'undefined' &&
  typeof process.cwd === 'function' &&
  !process.env.NEXT_RUNTIME // Skip if in Next.js runtime (already loaded)
) {
  try {
    const dotenv = require('dotenv');
    dotenv.config({ path: '.env.development' });
    dotenv.config({ path: '.env', override: false });
  } catch (e) {
    // Silently fail - dotenv might not be available in some environments
  }
}

export type ConfigMap = Record<string, string>;

export const envConfigs = {
  app_url: process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
  app_name: process.env.NEXT_PUBLIC_APP_NAME ?? 'ShipAny App',
  theme: process.env.NEXT_PUBLIC_THEME ?? 'default',
  appearance: process.env.NEXT_PUBLIC_APPEARANCE ?? 'system',
  locale: process.env.NEXT_PUBLIC_DEFAULT_LOCALE ?? 'en',
  database_url: process.env.DATABASE_URL ?? '',
  database_provider: process.env.DATABASE_PROVIDER ?? 'postgresql',
  db_singleton_enabled: process.env.DB_SINGLETON_ENABLED || 'false',
  db_max_connections: process.env.DB_MAX_CONNECTIONS || '1',
  auth_url: process.env.AUTH_URL || process.env.NEXT_PUBLIC_APP_URL || '',
  auth_secret: process.env.AUTH_SECRET ?? '', // openssl rand -base64 32
  initial_credits: process.env.INITIAL_CREDITS ?? '50',
  gemini_api_key: process.env.GEMINI_API_KEY ?? '',
  kie_api_key: process.env.KIE_API_KEY ?? '',
  replicate_api_token: process.env.REPLICATE_API_TOKEN ?? '',
  // Meme Generation
  meme_generation_prompt:
    process.env.MEME_GENERATION_PROMPT ??
    'A dense sticker collage featuring multiple different versions of the character shown in the reference image. The character should be depicted in a cute, chibi-style cartoon, including dozens of different emojis showcasing a variety of emotions: happiness, extreme sadness, shock, sleeping, eating, and giving a thumbs-up. Please maintain the main body features and colors of the character from the reference image. The overall image aspect ratio should be 16:9. I will be post-processing this image, so I would like the emoji pack to have 4 rows, with 4 emojis in each row, evenly distributed both horizontally and vertically, to facilitate easy cropping of each emoji later.',
  // Storage - R2
  r2_access_key: process.env.R2_ACCESS_KEY ?? '',
  r2_secret_key: process.env.R2_SECRET_KEY ?? '',
  r2_bucket_name: process.env.R2_BUCKET_NAME ?? '',
  r2_account_id: process.env.R2_ACCOUNT_ID ?? '',
  r2_domain: process.env.R2_DOMAIN ?? '',
  r2_endpoint: process.env.R2_ENDPOINT ?? '',
  // Storage - S3
  s3_access_key: process.env.S3_ACCESS_KEY ?? '',
  s3_secret_key: process.env.S3_SECRET_KEY ?? '',
  s3_bucket: process.env.S3_BUCKET ?? '',
  s3_region: process.env.S3_REGION ?? '',
  s3_endpoint: process.env.S3_ENDPOINT ?? '',
  s3_domain: process.env.S3_DOMAIN ?? '',
  // Proxy
  http_proxy: process.env.HTTP_PROXY ?? process.env.http_proxy ?? '',
  https_proxy: process.env.HTTPS_PROXY ?? process.env.https_proxy ?? '',
};
