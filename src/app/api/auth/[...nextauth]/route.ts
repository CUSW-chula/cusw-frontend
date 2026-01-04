import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';

// Lightweight diagnostics: log when the auth route is initialized and whether
// required environment variables are present (do NOT log their values).
console.log('NextAuth route initializing');
console.log('ENV: GOOGLE_CLIENT_ID set=', !!process.env.GOOGLE_CLIENT_ID);
console.log('ENV: GOOGLE_CLIENT_SECRET set=', !!process.env.GOOGLE_CLIENT_SECRET);
console.log('ENV: NEXTAUTH_SECRET set=', !!process.env.NEXTAUTH_SECRET);

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
  cookies: {
    sessionToken: {
      name: `${isProduction ? '__Secure-' : ''}next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: isProduction,
      },
    },
    csrfToken: {
      name: `${isProduction ? '__Host-' : ''}next-auth.csrf-token`,
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
  } catch (_) {
    /* ignore */
  }
  return handler(request, context);
}

export async function POST(request: Request, context: { params: { nextauth: string[] } }) {
  try {
    console.log('NextAuth POST', request.method, request.url);
  } catch (_) {
    /* ignore */
  }
  return handler(request, context);
}
