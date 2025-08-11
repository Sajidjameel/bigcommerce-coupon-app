// middleware.js (or middleware.ts)
import { NextRequest, NextResponse } from 'next/server';

// Paths that require authentication
const protectedPaths = ['/']; // add more like '/dashboard', '/profile', etc.

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Check if path requires authentication
  if (protectedPaths.includes(path)) {
    // Get cookies (can't use await cookies() here, must use request.cookies)
    const token = request.cookies.get('bigcommerce_access_token');

    if (!token) {
        console.log(token, 'token')
      const url = request.nextUrl.clone();
      url.pathname = '/auth';
      return NextResponse.redirect(url);
    }
  }

  // Continue to the requested page
  return NextResponse.next();
}

// Configure matcher for which routes should trigger the middleware
export const config = {
  matcher: ['/', '/dashboard', '/profile'], // protected routes
};
