"use client"

import { SessionProvider } from "next-auth/react";

export default function ProviderAuth({ children }) {
  return <SessionProvider>{children}</SessionProvider>;
}
