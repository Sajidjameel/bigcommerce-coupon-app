// const BigCommerce = require('node-bigcommerce');


// const bigCommerce = new BigCommerce({
//   logLevel: 'info',
//   clientId: process.env.BIGCOMMERCE_CLIENT_ID,
//   secret: process.env.BIGCOMMERCE_CLIENT_SECRET,
//   callback: process.env.AUTH_CALLBACK_URL,
//   responseType: 'json',
//   headers: { 'Accept-Encoding': '*' }, // Override headers (Overriding the default encoding of GZipped is useful in development)
//   apiVersion: 'v3' // Default is v2
// });

// const bigcommerceSigned = new BigCommerce({
//     secret: process.env.BIGCOMMERCE_CLIENT_SECRET,
//     responseType: 'json'
// });
 
// export interface QueryParams {
//     [key: string]: string;
// }

// export function getBCAuth(query: QueryParams) {
//     return bigCommerce.authorize(query);
// }

// export function getBCVerify({ signed_payload_jwt }: QueryParams) {
//     return bigcommerceSigned.verifyJWT(signed_payload_jwt);
// }