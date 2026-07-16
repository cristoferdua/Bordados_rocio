import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

// Admin credentials (in production, use a database)
// You can change these after first login
const ADMIN_USER = {
  name: "Administrador",
  email: "admin@bordadosrocio.com",
  // Default password: admin123
  passwordHash: bcrypt.hashSync("admin123", 10),
};

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const { email, password } = credentials as {
          email: string;
          password: string;
        };

        if (
          email === ADMIN_USER.email &&
          bcrypt.compareSync(password, ADMIN_USER.passwordHash)
        ) {
          return {
            id: "1",
            name: ADMIN_USER.name,
            email: ADMIN_USER.email,
          };
        }

        return null;
      },
    }),
  ],
  pages: {
    signIn: "/admin/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
});
