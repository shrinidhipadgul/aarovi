import type { Metadata } from "next";
import AdminSignInClient from "./sign-in-client";

export const metadata: Metadata = {
  title: "Admin Sign In",
  description: "Sign in to the Aarovi admin portal.",
  robots: { index: false, follow: false },
};

export default function AdminSignInPage() {
  return <AdminSignInClient />;
}