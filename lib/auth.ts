import NextAuth from "next-auth"
import type { NextAuthOptions } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { connectDB } from "@/lib/db"
import { User } from "@/models/user"
import { compare } from "bcryptjs"

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (creds) => {
        if (!creds?.email || !creds?.password) return null
        await connectDB()
        const user = await User.findOne({ email: creds.email })
        if (!user) return null
        const ok = await compare(creds.password, user.passwordHash)
        if (!ok) return null
        return {
          id: String(user._id),
          email: user.email,
          name: user.name,
          role: user.role,
          emailVerified: user.emailVerified,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.uid = user.id
        token.role = (user as any).role
        token.emailVerified = (user as any).emailVerified
      }
      return token
    },
    async session({ session, token }) {
      if (session?.user) {
        ;(session.user as any).id = token.uid
        ;(session.user as any).role = token.role
        ;(session.user as any).emailVerified = token.emailVerified
      }
      return session
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
}

export default NextAuth(authOptions)
