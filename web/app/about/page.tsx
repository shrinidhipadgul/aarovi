import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Discover the story behind Aarovi — handcrafted ethnic fashion with a commitment to quality and authenticity.",
  openGraph: {
    title: "About Us | Aarovi",
    description:
      "Discover the story behind Aarovi — handcrafted ethnic fashion with a commitment to quality and authenticity.",
  },
};

const values = [
  {
    title: "Quality",
    description:
      "Every piece in our collection is thoughtfully selected to celebrate timeless elegance and modern style.",
  },
  {
    title: "Authenticity",
    description:
      "We work directly with artisans and trusted suppliers to bring you authentic handcrafted fashion.",
  },
  {
    title: "Craftsmanship",
    description:
      "Each garment reflects the skill and dedication of master craftspeople who take pride in their work.",
  },
  {
    title: "Sustainability",
    description:
      "We believe in slow fashion — creating pieces that last, reducing waste, and supporting ethical practices.",
  },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 sm:py-24">
      <h1 className="font-display text-4xl font-bold text-brand-primary sm:text-5xl">
        About Aarovi
      </h1>

      <section className="mt-10">
        <p className="text-lg leading-relaxed text-brand-text/80">
          Aarovi brings handcrafted ethnic fashion with a commitment to quality
          and authenticity. Our name embodies the spirit of timeless elegance —
          where tradition meets contemporary design.
        </p>
        <p className="mt-4 text-base leading-relaxed text-brand-text/70">
          Founded with a passion for Indian craftsmanship, Aarovi curates
          collections that celebrate the rich heritage of ethnic wear. From
          intricate kurtas to flowing lehengas, each piece tells a story of
          artistry and dedication. We partner with skilled artisans across India,
          ensuring that every garment meets the highest standards of quality
          while preserving traditional techniques.
        </p>
      </section>

      <section className="mt-16">
        <h2 className="font-display text-2xl font-bold text-brand-primary">
          Our Mission
        </h2>
        <p className="mt-4 text-base leading-relaxed text-brand-text/70">
          To make authentic, handcrafted ethnic wear accessible to everyone
          while preserving the legacy of Indian craftsmanship. We believe that
          what you wear should reflect your personality, celebrate your
          heritage, and make you feel extraordinary.
        </p>
      </section>

      <section className="mt-16">
        <h2 className="font-display text-2xl font-bold text-brand-primary">
          Our Values
        </h2>
        <div className="mt-8 grid gap-8 sm:grid-cols-2">
          {values.map((value) => (
            <div
              key={value.title}
              className="rounded-xl border border-brand-primary/10 bg-white p-6"
            >
              <h3 className="font-display text-lg font-bold text-brand-primary">
                {value.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-brand-text/70">
                {value.description}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
