import type { Metadata } from "next";
import WishlistClient from "./wishlist-client";

export const metadata: Metadata = {
  title: "Wishlist",
  description: "Your saved items at Aarovi. Move items to cart or remove from your wishlist.",
  robots: { index: false, follow: false },
};

export default function WishlistPage() {
  return <WishlistClient />;
}
