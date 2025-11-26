import { Redis } from '@upstash/redis';
// Assuming StoreData and BigCommerceUser types are defined in '@/types/bigcommerce'
import { StoreData, BigCommerceUser } from '@/types/bigcommerce'; 

// Initialize Redis client. 
// IMPORTANT: These environment variables (UPSTASH_REDIS_REST_URL/TOKEN) must be set.
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});


/**
 * Get store data from Upstash Redis.
 */
export async function getStoreData(storeHash: string): Promise<StoreData | null> {
  try {
    const data = await redis.get(`store:${storeHash}`);
    // Check if data is null before parsing
    return data ? JSON.parse(data as string) as StoreData : null;
  } catch (error) {
    console.error('❌ Error getting store data from Upstash:', error);
    return null;
  }
}
