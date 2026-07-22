import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/dbconnection/db";
import UserModel from "@/model/user/user.model";
import SubscriptionModel from "@/model/payment/subscription.model";

export const authOptions = {
  secret: process.env.NEXTAUTH_SECRET,

  providers: [
    // 1. Password Login
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        mobile: { label: "Mobile", type: "text" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        if (!credentials?.mobile || !credentials?.password) {
          throw new Error("Mobile and password are required");
        }

        await connectDB();

        const user = await UserModel.findOne({
          mobile: credentials.mobile,
        }).select("+password");

        if (!user) throw new Error("User not found");
        if (!user.isActive) throw new Error("Account is disabled");

        const isValidPassword = await bcrypt.compare(
          credentials.password,
          user.password,
        );

        if (!isValidPassword) throw new Error("Invalid password");

        // ✅ Fetch subscription status for clients
        let serviceEnabled = true;
        if (user.role === "client") {
          const subscription = await SubscriptionModel.findOne({
            userId: user._id,
          })
            .select("+serviceEnabled")
            .lean();

          console.log(subscription);

          serviceEnabled = subscription ? subscription.serviceEnabled : false;
        }

        return {
          id: user._id.toString(),
          name: user.name,
          mobile: user.mobile,
          role: user.role,
          serviceEnabled, 
        };
      },
    }),

    // 2. Access Code Login
    CredentialsProvider({
      id: "access-code",
      name: "Access Code",
      credentials: {
        accessCode: { label: "Access Code", type: "text" },
      },

      async authorize(credentials) {
        if (!credentials?.accessCode) {
          throw new Error("Access code is required");
        }

        await connectDB();

        const cleanCode = credentials.accessCode.trim().toUpperCase();

        const user = await UserModel.findOne({
          accessCode: cleanCode,
          role: "client",
        });

        if (!user) {
          throw new Error("Invalid access code");
        }

        if (!user.isActive) {
          throw new Error("Account is disabled");
        }

        // ✅ Fetch subscription status for clients
        const subscription = await SubscriptionModel.findOne({
          userId: user._id,
        })
          .select("+serviceEnabled")
          .lean();
        const serviceEnabled = subscription
          ? subscription.serviceEnabled
          : false;

        return {
          id: user._id.toString(),
          name: user.name,
          mobile: user.mobile,
          role: user.role,
          serviceEnabled, // ✅ Attach to user object
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // 1. Initial login: attach user properties to token
      if (user) {
        token.id = user.id;
        token.mobile = user.mobile;
        token.role = user.role;
        token.serviceEnabled = user.serviceEnabled; // ✅ Store in token
      }

      // 2. Client-side update: Allows us to update the session immediately after payment
      if (trigger === "update" && session?.serviceEnabled !== undefined) {
        token.serviceEnabled = session.serviceEnabled;
      }

      return token;
    },

    async session({ session, token }) {
      // 3. Pass token properties to the client-side session object
      if (token) {
        session.user.id = token.id;
        session.user.mobile = token.mobile;
        session.user.role = token.role;
        session.user.serviceEnabled = token.serviceEnabled; // ✅ Available on frontend!
      }
      return session;
    },
  },

  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
  },

  pages: {
    signIn: "/login",
    error: "/login",
  },
};
