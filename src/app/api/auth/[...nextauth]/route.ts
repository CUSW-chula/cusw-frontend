import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';

// Lightweight diagnostics: log when the auth route is initialized and whether
// required environment variables are present (do NOT log their values).
console.log('NextAuth route initializing');
console.log('ENV: GOOGLE_CLIENT_ID set=', !!process.env.GOOGLE_CLIENT_ID);
console.log('ENV: GOOGLE_CLIENT_SECRET set=', !!process.env.GOOGLE_CLIENT_SECRET);
console.log('ENV: NEXTAUTH_SECRET set=', !!process.env.NEXTAUTH_SECRET);
console.log('ENV: NEXTAUTH_URL set=', !!process.env.NEXTAUTH_URL);

// ⚠️ Warning: Check for invalid NEXTAUTH_URL values
const nextAuthUrl = process.env.NEXTAUTH_URL;
if (nextAuthUrl?.includes('0.0.0.0')) {
  console.warn('⚠️ WARNING: NEXTAUTH_URL contains 0.0.0.0 which is invalid for browser redirects!');
  console.warn('   Please change NEXTAUTH_URL to http://localhost:3000 or your actual domain.');
}

const isProduction = process.env.NODE_ENV === 'production';

const handler = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
      authorization: {
        params: {
          prompt: 'select_account',
          access_type: 'offline',
          response_type: 'code',
        },
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  debug: !isProduction,
  // ใช้ชื่อ cookie ปกติโดยไม่มี __Secure- prefix เพื่อให้ทำงานกับ reverse proxy ได้ดีขึ้น
  cookies: {
    sessionToken: {
      name: 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: isProduction,
      },
    },
    csrfToken: {
      name: 'next-auth.csrf-token',
      options: {
        httpOnly: false, // CSRF token ต้องอ่านได้จาก JavaScript
        sameSite: 'lax',
        path: '/',
        secure: isProduction,
      },
    },
    callbackUrl: {
      name: 'next-auth.callback-url',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: isProduction,
      },
    },
  },
  callbacks: {
    async redirect({ url, baseUrl }) {
      return `${baseUrl}/callback`;
    },
  },
});

// Exported handlers. Add small wrappers to log request method when executed.
// NextAuth expects route handlers to accept both request and context (with params).
export async function GET(request: Request, context: { params: { nextauth: string[] } }) {
  try {
    console.log('NextAuth GET', request.method, request.url);
    console.log('  -> NEXTAUTH_URL:', process.env.NEXTAUTH_URL);
    console.log('  -> x-forwarded-host:', request.headers.get('x-forwarded-host'));
    console.log('  -> x-forwarded-proto:', request.headers.get('x-forwarded-proto'));
    console.log('  -> host:', request.headers.get('host'));
  } catch (_) {
    /* ignore */
  }
  return handler(request, context);
}

export async function POST(request: Request, context: { params: { nextauth: string[] } }) {
  try {
    console.log('NextAuth POST', request.method, request.url);
    console.log('  -> NEXTAUTH_URL:', process.env.NEXTAUTH_URL);
    
    // Debug CSRF
    const cookieHeader = request.headers.get('cookie') || '';
    const csrfCookie = cookieHeader.split(';').find(c => c.trim().startsWith('next-auth.csrf-token='));
    // biome-ignore lint/style/useTemplate: <explanation>
    console.log('  -> csrf cookie:', csrfCookie?.substring(0, 80) + '...');
    
    // Clone request to read body for debugging
    const clonedRequest = request.clone();
    const formData = await clonedRequest.formData().catch(() => null);
    if (formData) {
      // biome-ignore lint/style/useTemplate: <explanation>
      console.log('  -> csrf form:', formData.get('csrfToken')?.toString().substring(0, 40) + '...');
    }
  } catch (e) {
    console.log('  -> debug error:', e);
  }
  return handler(request, context);
}
