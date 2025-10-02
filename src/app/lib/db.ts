// app/lib/db.ts
import { Redis } from '@upstash/redis';
import { StoreData, BigCommerceUser } from '@/types/bigcommerce';

// Initialize Redis client
// Note: This needs to be configured once outside the handler for Vercel/Next.js environment
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

/**
 * Save store data to Upstash Redis upon installation.
 */
export async function saveStoreData(
  storeHash: string, 
  accessToken: string, 
  user: BigCommerceUser, 
  scopes: string[] = []
): Promise<StoreData> {
  // ... (Your implementation is largely correct and complete here)
  try {
    const storeData: StoreData = {
      accessToken,
      storeHash,
      user,
      scopes,
      installedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    // Save with a long expiration (e.g., 90 days, or indefinitely if you handle uninstalls)
    await redis.set(`store:${storeHash}`, JSON.stringify(storeData), { ex: 60 * 60 * 24 * 90 });
    
    console.log(`✅ Store data saved to Upstash for: ${storeHash}`);
    return storeData;
  } catch (error) {
    console.error('❌ Error saving store data to Upstash:', error);
    throw new Error('Failed to save store data');
  }
}

/**
 * Get store data from Upstash Redis.
 */
export async function getStoreData(storeHash: string): Promise<StoreData | null> {
  // ... (Your implementation is correct and complete here)
  try {
    const data = await redis.get(`store:${storeHash}`);
    return data ? JSON.parse(data as string) as StoreData : null;
  } catch (error) {
    console.error('❌ Error getting store data from Upstash:', error);
    return null;
  }
}

// NOTE: I've removed the state functions as BigCommerce typically does not require state for the install flow.
// You should only use state if you are initiating the install from your own site.