import type { Metadata } from "next";
import ProfileClient from "./profile-client";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return {
    title: "My Profile",
    description: "Manage your Aarovi account, personal information, and saved addresses.",
    robots: { index: false, follow: false },
    alternates: {
      canonical: `/profile/${id}`,
    },
  };
}

export default function ProfilePage() {
  return <ProfileClient />;
}
