import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';

const handler = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
    }),
  ],
  // secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async redirect({ url, baseUrl }) {
      const BASE_URL =
        process.env.NODE_ENV === 'production'
          ? 'https://cusw-workspace.sa.chula.ac.th'
          : 'http://localhost:3000';
      return `${BASE_URL}/callback`;
    },
  },
});

export { handler as GET, handler as POST };
