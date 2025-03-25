import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtDecode } from 'jwt-decode';

export async function middleware(request: NextRequest) {
  try {
    const cookie = request.cookies.get('auth')?.value;

    if (!cookie) {
      console.log('No cookie found');
      return NextResponse.redirect(new URL('/login', request.url));
    }

    const decryptedCookie = jwtDecode(cookie);
    if (!decryptedCookie) {
      console.log('Decryption failed or invalid cookie');
      return NextResponse.redirect(new URL('/login', request.url));
    }

    return NextResponse.rewrite(request.url);
  } catch (error) {
    if (error instanceof Error) {
      console.log(`Middleware error: ${error.message}`);
    } else {
      console.log('Middleware error');
    }
    return NextResponse.redirect(new URL('/404', request.url));
  }
}

export const config = {
  matcher: ['/projects/:path*', '/tasks/:path*', '/my-tasks', '/user-management'],
};
