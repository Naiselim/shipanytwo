import { R2Provider, S3Provider, StorageManager } from '@/extensions/storage';
import { Configs, getAllConfigs } from '@/shared/models/config';

/**
 * get storage service with configs
 */
export function getStorageServiceWithConfigs(configs: Configs) {
  const storageManager = new StorageManager();

  console.log('[Storage Service] Initializing storage providers...');
  console.log('[Storage Service] R2 config:', {
    hasAccessKey: !!configs.r2_access_key,
    hasSecretKey: !!configs.r2_secret_key,
    hasBucketName: !!configs.r2_bucket_name,
    accountId: configs.r2_account_id || 'not set',
  });
  console.log('[Storage Service] S3 config:', {
    hasAccessKey: !!configs.s3_access_key,
    hasSecretKey: !!configs.s3_secret_key,
    hasBucket: !!configs.s3_bucket,
  });

  // Add R2 provider if configured
  if (
    configs.r2_access_key &&
    configs.r2_secret_key &&
    configs.r2_bucket_name
  ) {
    console.log('[Storage Service] Adding R2 provider as default');
    // r2_region in settings stores the Cloudflare Account ID
    // For R2, region is typically "auto" but can be customized
    const accountId = configs.r2_account_id || '';

    storageManager.addProvider(
      new R2Provider({
        accountId: accountId,
        accessKeyId: configs.r2_access_key,
        secretAccessKey: configs.r2_secret_key,
        bucket: configs.r2_bucket_name,
        region: 'auto', // R2 uses "auto" as region
        endpoint: configs.r2_endpoint, // Optional custom endpoint
        publicDomain: configs.r2_domain,
      }),
      true // Set R2 as default
    );
  } else {
    console.log('[Storage Service] R2 provider not configured - missing required keys');
  }

  // Add S3 provider if configured (future support)
  if (configs.s3_access_key && configs.s3_secret_key && configs.s3_bucket) {
    console.log('[Storage Service] Adding S3 provider');
    storageManager.addProvider(
      new S3Provider({
        endpoint: configs.s3_endpoint,
        region: configs.s3_region,
        accessKeyId: configs.s3_access_key,
        secretAccessKey: configs.s3_secret_key,
        bucket: configs.s3_bucket,
        publicDomain: configs.s3_domain,
      })
    );
  } else {
    console.log('[Storage Service] S3 provider not configured');
  }

  const providerCount = storageManager.getProviderNames().length;
  console.log('[Storage Service] Total providers configured:', providerCount);
  console.log('[Storage Service] Available providers:', storageManager.getProviderNames());

  return storageManager;
}

/**
 * global storage service
 */
let storageService: StorageManager | null = null;

/**
 * get storage service instance
 */
export async function getStorageService(): Promise<StorageManager> {
  if (true) {
    const configs = await getAllConfigs();
    storageService = getStorageServiceWithConfigs(configs);
  }
  return storageService;
}
