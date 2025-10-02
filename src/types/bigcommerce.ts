export interface BigCommerceUser {
  id: number;
  email: string;
}

export interface BigCommerceTokenResponse {
  access_token: string;
  scope: string;
  user: {
    id: number;
    email: string;
  };
  context: string;
}

export interface StoreData {
  accessToken: string;
  storeHash: string;
  user: BigCommerceUser;
  scopes: string[];
  installedAt: string;
  updatedAt: string;
}

export interface AuthLoadResponse {
  storeHash: string;
  user: BigCommerceUser;
  installedAt: string;
  scopes: string[];
}