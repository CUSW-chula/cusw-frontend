import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtDecode, type JwtPayload } from 'jwt-decode';
import BASE_URL from '@/lib/shared';

interface CustomJwtPayload extends JwtPayload {
  id: string;
}

export async function middleware(request: NextRequest) {
  const cookie = request.cookies.get('auth')?.value;

  if (!cookie) {
    console.log('No cookie found');
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const decryptedCookie: CustomJwtPayload = jwtDecode(cookie);
  if (!decryptedCookie) {
    console.log('Decryption failed or invalid cookie');
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const response = await fetch(`${BASE_URL}/v2/users/${decryptedCookie.id}`, {
    headers: {
      Authorization: cookie,
    },
  });
  if (request.nextUrl.pathname.startsWith('/admin')) {
    try {
      if (!response.ok) {
        const errorMessage = await response.text();
        console.log(`🚨 Error ${response.status}: ${response.statusText}, ${errorMessage}`);
        return NextResponse.redirect(new URL('/login', request.url));
      }

      const data = await response.json();
      if (data.head === true) {
        console.log('You are a head');
        return NextResponse.redirect(new URL('/dashboard/project', request.url));
      }
      if (data.admin !== true) {
        console.log('You are not an admin');
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
  } else if (request.nextUrl.pathname.startsWith('/dashboards')) {
    try {
      if (!response.ok) {
        const errorMessage = await response.text();
        console.log(`🚨 Error ${response.status}: ${response.statusText}, ${errorMessage}`);
        return NextResponse.redirect(new URL('/login', request.url));
      }

      const data = await response.json();
      if (data.head !== true && data.admin !== true) {
        console.log('You are not a head or admin');
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
  } else if (request.nextUrl.pathname.startsWith('/workload')) {
    try {
      if (!response.ok) {
        const errorMessage = await response.text();
        console.log(`🚨 Error ${response.status}: ${response.statusText}, ${errorMessage}`);
        return NextResponse.redirect(new URL('/login', request.url));
      }
      const data = await response.json();
      if (data.head !== true && data.admin !== true) {
        console.log('You are not a head or admin');
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
  } else if (request.nextUrl.pathname.startsWith('/dashboard')) {
    try {
      if (!response.ok) {
        const errorMessage = await response.text();
        console.log(`🚨 Error ${response.status}: ${response.statusText}, ${errorMessage}`);
        return NextResponse.redirect(new URL('/login', request.url));
      }
      const data = await response.json();
      if (data.head !== true && data.admin !== true) {
        console.log('You are not a head or admin');
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
  } else if (request.nextUrl.pathname.startsWith('/')) {
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
}

export const config = {
  matcher: [
    '/projects/:path*',
    '/tasks/:path*',
    '/my-tasks',
    '/admin/:path*',
    '/admin',
    '/dashboards',
    '/workload/:path*',
    '/workload',
    '/dashboard/:path*',
  ],
};
