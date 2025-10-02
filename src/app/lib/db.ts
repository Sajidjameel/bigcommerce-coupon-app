import { Redis } from '@upstash/redis';
import { StoreData,BigCommerceUser} from '@/types/bigcommerce';

// Initialize Redis client with type safety
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

/**
 * Save store data to Upstash Redis
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
    
    // Save with expiration (90 days)
    await redis.set(`store:${storeHash}`, JSON.stringify(storeData), { ex: 60 * 60 * 24 * 90 });
    
    console.log(`✅ Store data saved to Upstash for: ${storeHash}`);
    return storeData;
  } catch (error) {
    console.error('❌ Error saving store data to Upstash:', error);
    throw new Error('Failed to save store data');
  }
}

/**
 * Get store data from Upstash Redis
 */
export async function getStoreData(storeHash: string): Promise<StoreData | null> {
  try {
    const data = await redis.get(`store:${storeHash}`);
    
    if (!data) {
      console.log(`📭 No store data found in Upstash for: ${storeHash}`);
      return null;
    }
    
    console.log(`✅ Store data retrieved from Upstash for: ${storeHash}`);
    return JSON.parse(data as string) as StoreData;
  } catch (error) {
    console.error('❌ Error getting store data from Upstash:', error);
    return null;
  }
}

/**
 * Delete store data from Upstash Redis (for uninstall)
 */
export async function deleteStoreData(storeHash: string): Promise<boolean> {
  try {
    await redis.del(`store:${storeHash}`);
    console.log(`🗑️ Store data deleted from Upstash for: ${storeHash}`);
    return true;
  } catch (error) {
    console.error('❌ Error deleting store data from Upstash:', error);
    return false;
  }
}

/**
 * Update store access token (for token refresh)
 */
export async function updateStoreToken(storeHash: string, newAccessToken: string): Promise<StoreData> {
  try {
    const existingData = await getStoreData(storeHash);
    
    if (!existingData) {
      throw new Error('Store data not found in Upstash');
    }
    
    const updatedData: StoreData = {
      ...existingData,
      accessToken: newAccessToken,
      updatedAt: new Date().toISOString(),
    };
    
    await redis.set(`store:${storeHash}`, JSON.stringify(updatedData), { ex: 60 * 60 * 24 * 90 });
    
    console.log(`🔄 Token updated in Upstash for: ${storeHash}`);
    return updatedData;
  } catch (error) {
    console.error('❌ Error updating store token in Upstash:', error);
    throw error;
  }
}

/**
 * Get all stores (for admin purposes)
 */
export async function getAllStores(): Promise<StoreData[]> {
  try {
    // Get all keys with pattern 'store:*'
    const keys = await redis.keys('store:*');
    const stores: StoreData[] = [];
    
    for (const key of keys) {
      const data = await redis.get(key as string);
      if (data) {
        stores.push(JSON.parse(data as string) as StoreData);
      }
    }
    
    console.log(`📊 Retrieved ${stores.length} stores from Upstash`);
    return stores;
  } catch (error) {
    console.error('❌ Error getting all stores from Upstash:', error);
    return [];
  }
}

/**
 * Test Upstash connection
 */
export async function testUpstashConnection(): Promise<boolean> {
  try {
    await redis.set('test', 'connection_works');
    const result = await redis.get('test');
    await redis.del('test');
    
    return result === 'connection_works';
  } catch (error) {
    console.error('❌ Upstash connection test failed:', error);
    return false;
  }
}

export async function saveState(state: string, data: any): Promise<void> {
  try {
    // Store state with 10 minute expiration
    await redis.set(`oauth_state:${state}`, JSON.stringify(data), { ex: 60 * 10 });
    console.log(`✅ State saved: ${state}`);
  } catch (error) {
    console.error('❌ Error saving state:', error);
    throw new Error('Failed to save state');
  }
}

/**
 * Get OAuth state from Upstash Redis
 */
export async function getState(state: string): Promise<any> {
  try {
    const data = await redis.get(`oauth_state:${state}`);
    return data ? JSON.parse(data as string) : null;
  } catch (error) {
    console.error('❌ Error getting state:', error);
    return null;
  }
}

/**
 * Delete used OAuth state
 */
export async function deleteState(state: string): Promise<void> {
  try {
    await redis.del(`oauth_state:${state}`);
    console.log(`✅ State deleted: ${state}`);
  } catch (error) {
    console.error('❌ Error deleting state:', error);
  }
}