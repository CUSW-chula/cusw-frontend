import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';

console.log('NextAuth route initializing');
console.log('ENV: GOOGLE_CLIENT_ID set=', !!process.env.GOOGLE_CLIENT_ID);
console.log('ENV: GOOGLE_CLIENT_SECRET set=', !!process.env.GOOGLE_CLIENT_SECRET);
console.log('ENV: NEXTAUTH_SECRET set=', !!process.env.NEXTAUTH_SECRET);
console.log('ENV: NEXTAUTH_URL set=', !!process.env.NEXTAUTH_URL);

const isProduction = process.env.NODE_ENV === 'production';

const authOptions = {
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
  callbacks: {
    async redirect({ baseUrl }: { url: string; baseUrl: string }) {
      return `${baseUrl}/callback`;
    },
  },
};

const handler = NextAuth(authOptions);

export async function GET(request: Request, context: { params: { nextauth: string[] } }) {
  return handler(request, context);
}

// Custom POST handler ที่ bypass CSRF check สำหรับ signin
export async function POST(request: Request, context: { params: { nextauth: string[] } }) {
  const { nextauth } = context.params;
  
  // ถ้าเป็น signin/google request - bypass CSRF โดยเรียก GET handler แทน
  // NextAuth GET /signin/google?callbackUrl=xxx จะ redirect ไป Google โดยตรง
  if (nextauth?.[0] === 'signin' && nextauth?.[1] === 'google') {
    // สร้าง GET request ใหม่ไปที่ /api/auth/authorize/google
    const url = new URL(request.url);
    const callbackUrl = url.searchParams.get('callbackUrl') || '/callback';
    
    // เรียก internal authorize endpoint
    const baseUrl = process.env.NEXTAUTH_URL || url.origin;
    const authorizeUrl = `${baseUrl}/api/auth/signin/google?callbackUrl=${encodeURIComponent(callbackUrl)}`;
    
    // Return redirect response
    return new Response(null, {
      status: 302,
      headers: {
        Location: authorizeUrl,
      },
    });
  }
  
  // สำหรับ request อื่นๆ ใช้ handler ปกติ
  return handler(request, context);
}
