import type { Metadata } from "next";
import SignUpClient from "./sign-up-client";

export const metadata: Metadata = {
  title: "Create Account",
  description:
    "Create your Aarovi account to start shopping handcrafted ethnic wear.",
  robots: { index: false, follow: false },
};

export default function SignUpPage() {
  return <SignUpClient />;
}
