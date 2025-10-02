// types/bigcommerce.ts

/**
 * Interface for the response when exchanging the code for an access token.
 */
export interface BigCommerceTokenResponse {
  access_token: string;
  scope: string;
  user: BigCommerceUser;
  context: string; // e.g., 'stores/STORE_HASH'
}

/**
 * Interface for the user object returned in the token response.
 */
export interface BigCommerceUser {
  id: number;
  email: string;
  username?: string;
}

/**
 * Interface for the data stored in your database (Upstash Redis).
 */
export interface StoreData {
  accessToken: string;
  storeHash: string;
  user: BigCommerceUser;
  scopes: string[];
  installedAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

/**
 * Interface for the response from your /api/auth/verify route.
 */
export interface AuthLoadResponse {
  storeHash: string;
  user: {
    id: number;
    email: string;
  };
  installedAt: string;
  scopes: string[];
  hasAccessToken?: boolean;
}