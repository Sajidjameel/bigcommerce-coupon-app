import { cookies } from 'next/headers';

export default async function HomePage() {
  const token = (await cookies()).get('bigcommerce_access_token');


  return <div>Welcome! Your token is: {token?.value}</div>;
}
