import type { Metadata } from "next";
import Accordion from "@/components/accordion";
import type { AccordionItem } from "@/components/accordion";

export const metadata: Metadata = {
  title: "FAQs — Aarovi",
  description: "Find answers to common questions about orders, shipping, returns, and products at Aarovi.",
};

const orders: AccordionItem[] = [
  {
    title: "How do I place an order?",
    content:
      "Browse our collection, select your preferred items and sizes, then click 'Add to Cart'. When you're ready, proceed to the cart page and click 'Checkout'. Fill in your shipping details, choose a payment method, and confirm your order. You'll receive an email confirmation once your order is placed.",
  },
  {
    title: "What payment methods do you accept?",
    content:
      "We accept major credit and debit cards (Visa, Mastercard, American Express), UPI, net banking, and digital wallets. All transactions are processed securely through our payment gateway.",
  },
];

const shipping: AccordionItem[] = [
  {
    title: "How long does shipping take?",
    content:
      "Domestic orders are delivered within 5–7 business days. Metro cities typically receive orders in 3–5 business days. International shipping takes 10–14 business days depending on the destination and customs clearance.",
  },
  {
    title: "How do I track my order?",
    content:
      "Once your order is dispatched, you'll receive a tracking link via email and SMS. You can also track your order by logging into your account and visiting the 'My Orders' section.",
  },
  {
    title: "Do you offer international shipping?",
    content:
      "Yes, we ship to over 20 countries including the USA, UK, Canada, Australia, UAE, and Singapore. International shipping charges are calculated at checkout based on your location and order weight.",
  },
];

const returns: AccordionItem[] = [
  {
    title: "What is your return policy?",
    content:
      "We offer a 15-day return window from the date of delivery. Items must be unworn, unwashed, and with all tags attached. To initiate a return, log into your account and submit a return request. Refunds are processed within 5–7 business days after we receive the returned item.",
  },
];

const products: AccordionItem[] = [
  {
    title: "Can I customize my outfit?",
    content:
      "Yes, we offer custom stitching for select outfits. You can specify your measurements during checkout or contact our support team after placing the order. Custom orders typically take 7–10 additional business days.",
  },
  {
    title: "How do I find my size?",
    content:
      "Refer to our detailed size chart available on every product page. For the best fit, measure your bust, waist, and hip using a measuring tape and compare with the chart. If you're between sizes, we recommend sizing up for a comfortable fit.",
  },
];

export default function FaqsPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6 sm:py-24">
      <h1 className="text-3xl font-bold tracking-tight text-brand-primary sm:text-4xl">
        Frequently Asked Questions
      </h1>
      <p className="mt-3 text-base leading-relaxed text-brand-text/70">
        Find quick answers to common questions about our products and services.
      </p>

      <section className="mt-12">
        <h2 className="mb-4 text-xl font-semibold text-brand-primary">Orders</h2>
        <Accordion items={orders} />
      </section>

      <section className="mt-10">
        <h2 className="mb-4 text-xl font-semibold text-brand-primary">Shipping</h2>
        <Accordion items={shipping} />
      </section>

      <section className="mt-10">
        <h2 className="mb-4 text-xl font-semibold text-brand-primary">Returns</h2>
        <Accordion items={returns} />
      </section>

      <section className="mt-10">
        <h2 className="mb-4 text-xl font-semibold text-brand-primary">Products</h2>
        <Accordion items={products} />
      </section>
    </div>
  );
}
