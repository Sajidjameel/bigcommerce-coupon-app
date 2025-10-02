import { Redis } from '@upstash/redis';
// Assuming StoreData and BigCommerceUser types are defined in '@/types/bigcommerce'
import { StoreData, BigCommerceUser } from '@/types/bigcommerce'; 

// Initialize Redis client. 
// IMPORTANT: These environment variables (UPSTASH_REDIS_REST_URL/TOKEN) must be set.
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

// --- State Management for OAuth Security (CSRF Protection) ---

/**
 * Saves the temporary OAuth state token and related data (like storeHash).
 * Used by /api/auth/install. The state should be short-lived (e.g., 5 minutes).
 * This is crucial for verifying the callback request originated from us.
 */
export async function saveState(state: string, data: any): Promise<void> {
    try {
        // State tokens are short-lived (5 minutes or 300 seconds)
        await redis.set(`state:${state}`, JSON.stringify(data), { ex: 300 }); 
        console.log(`✅ OAuth state saved to Upstash: ${state}`);
    } catch (error) {
        console.error(`❌ Error saving OAuth state (${state}) to Upstash:`, error);
        throw new Error('Failed to save state token');
    }
}

/**
 * Retrieves and deletes the temporary OAuth state token data.
 * Used by /api/auth/callback to verify the incoming request.
 * Deleting immediately after retrieval ensures it is single-use.
 */
export async function getState(state: string): Promise<any | null> {
    try {
        // Use a pipeline transaction to get and delete in one step (for single-use security)
        // [data] will be the result of the `get` command.
        const [data] = await redis.pipeline().get(`state:${state}`).del(`state:${state}`).exec();
        
        if (data) {
            console.log(`✅ OAuth state retrieved and deleted for: ${state}`);
            // Redis returns null if key did not exist, or string if it did.
            return JSON.parse(data as string); 
        }
        return null;
    } catch (error) {
        console.error(`❌ Error getting/deleting OAuth state (${state}) from Upstash:`, error);
        return null;
    }
}

// --- Permanent Store Data Management ---

/**
 * Save store data to Upstash Redis upon installation.
 */
export async function saveStoreData(
  storeHash: string, 
  accessToken: string, 
  user: BigCommerceUser, 
  scopes: string[] = []
): Promise<StoreData> {
  try {
    const storeData: StoreData = {
      accessToken,
      storeHash,
      user,
      scopes,
      installedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    // Save indefinitely (no expiration, token refresh needs to be handled separately)
    await redis.set(`store:${storeHash}`, JSON.stringify(storeData)); 
    
    console.log(`✅ Store data saved permanently to Upstash for: ${storeHash}`);
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
  try {
    const data = await redis.get(`store:${storeHash}`);
    // Check if data is null before parsing
    return data ? JSON.parse(data as string) as StoreData : null;
  } catch (error) {
    console.error('❌ Error getting store data from Upstash:', error);
    return null;
  }
}
