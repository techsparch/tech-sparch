"use client";

import UnderConstruction from "@/component/support/UnderConstruction";
import { signOut } from "next-auth/react";

export default function Home() {
  return (
    <>
      <UnderConstruction />

      <button
        onClick={() => signOut({ callbackUrl: "/login" })}
        className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition"
      >
        Logout
      </button>
    </>
  );
}