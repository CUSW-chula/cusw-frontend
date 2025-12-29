'use server';

import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';

// Lightweight diagnostics: log when the auth route is initialized and whether
// required environment variables are present (do NOT log their values).
console.log('NextAuth route initializing');
console.log('ENV: GOOGLE_CLIENT_ID set=', !!process.env.GOOGLE_CLIENT_ID);
console.log('ENV: GOOGLE_CLIENT_SECRET set=', !!process.env.GOOGLE_CLIENT_SECRET);
console.log('ENV: NEXTAUTH_SECRET set=', !!process.env.NEXTAUTH_SECRET);

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
  callbacks: {
    async redirect({ url, baseUrl }) {
      return `${baseUrl}/callback`;
    },
  },
});

// Exported handlers. Add small wrappers to log request method when executed
// — this helps identify which request is returning 403.
export async function GET(request: Request) {
  try {
    console.log('NextAuth GET', request.method, request.url);
  } catch (_) {
    /* ignore */
  }
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  return handler(request as any);
}

export async function POST(request: Request) {
  try {
    console.log('NextAuth POST', request.method, request.url);
  } catch (_) {
    /* ignore */
  }
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  return handler(request as any);
}
