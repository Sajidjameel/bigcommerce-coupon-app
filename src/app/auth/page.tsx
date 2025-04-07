import { cookies } from 'next/headers';

export default async function AuthPage() {
    const token = (await cookies()).get('bigcommerce_access_token');

    if (!token) {
        return <a href="https://login.bigcommerce.com/oauth2/authorize?client_id=YOUR_CLIENT_ID&redirect_uri=YOUR_REDIRECT_URI&scope=STORE_INFORMATION%20CHECKOUT_CONTENT&response_type=code">Login with BigCommerce</a>;
    }

    return <div>Welcome! Your token is: {token.value}</div>;
}
