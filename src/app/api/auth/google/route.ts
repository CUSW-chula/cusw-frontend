import { redirect } from 'next/navigation';

// Custom endpoint ที่ redirect ไป Google OAuth โดยตรง
// Bypass NextAuth's CSRF check ที่มีปัญหากับ reverse proxy
export async function GET() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = `${process.env.NEXTAUTH_URL}/api/auth/callback/google`;
  
  // สร้าง state สำหรับ security (ใช้ random string)
  const state = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  
  const params = new URLSearchParams({
    client_id: clientId || '',
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'offline',
    prompt: 'select_account',
    state: state,
  });

  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  
  console.log('Redirecting to Google OAuth:', googleAuthUrl);
  
  redirect(googleAuthUrl);
}
