import type { Metadata } from "next";
import BriefBuilder from "@/components/customize/brief-builder";
import { bespokeServiceJsonLd } from "@/lib/json-ld";

export const metadata: Metadata = {
  title: "Customize — Aarovi",
  description:
    "Commission bespoke handcrafted ethnic wear. Choose your garment, neckline, sleeves, fabric, embroidery and more. Every piece cut, dyed and embroidered by hand.",
  openGraph: {
    title: "Bespoke Customization — Aarovi",
    description:
      "Design something entirely yours. Handcrafted ethnic wear, made to order.",
    type: "website",
  },
};

export default function CustomizePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(bespokeServiceJsonLd()) }}
      />
      <BriefBuilder />
    </>
  );
}
