// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const response = NextResponse.next()

  // Only set CORS for specific API routes that need it
  if (request.nextUrl.pathname.startsWith('/api/')) {
    // For BigCommerce OAuth callbacks, we need specific CORS settings
    const origin = request.headers.get('origin')
    
    // Allow BigCommerce domains
    if (origin && (
      origin.includes('bigcommerce.com') || 
      origin.includes('localhost:3000') ||
      origin.includes('vercel.app')
    )) {
      response.headers.set('Access-Control-Allow-Origin', origin)
      response.headers.set('Access-Control-Allow-Credentials', 'true')
    } else {
      response.headers.set('Access-Control-Allow-Origin', '*')
    }
    
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  }

  return response
}

export const config = {
  matcher: '/api/:path*',
}