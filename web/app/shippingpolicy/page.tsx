import type { Metadata } from "next";
import { PolicyLayout, PolicySection } from "@/components/policy-layout";

export const metadata: Metadata = {
  title: "Shipping Policy",
  description: "Aarovi's shipping policy for domestic orders across India.",
  openGraph: { title: "Shipping Policy | Aarovi" },
};

const sections = [
  {
    title: "Processing Time",
    content:
      "All orders are processed within 1–2 business days after order confirmation. Orders placed on weekends or public holidays will begin processing on the next business day. You will receive a confirmation email once your order has been shipped along with tracking information.",
  },
  {
    title: "Delivery Estimates",
    content: (
      <ul>
        <li>Metro cities: 3–5 business days</li>
        <li>Tier-2 cities and towns: 5–7 business days</li>
        <li>Remote areas: 7–10 business days</li>
      </ul>
    ),
  },
  {
    title: "Shipping Charges",
    content: (
      <p>
        A standard shipping fee of ₹50 is applied to all orders across India at checkout.
      </p>
    ),
  },
  {
    title: "Order Tracking",
    content:
      "Once your order is dispatched, you will receive a tracking link via email and SMS. You can also track your order by logging into your account and visiting the 'My Orders' section. If you have any questions about your shipment, please contact us at aaroviofficial@gmail.com.",
  },
  {
    title: "Areas Served",
    content:
      "We ship to all serviceable pin codes across India.",
  },
  {
    title: "Shipping Delays",
    content:
      "While we strive to meet all delivery estimates, unforeseen circumstances such as severe weather events or courier disruptions may occasionally cause delays. We appreciate your patience and will keep you updated on any significant changes to your delivery timeline.",
  },
];

export default function ShippingPolicyPage() {
  return (
    <PolicyLayout title="Shipping Policy" lastUpdated="1 July 2026">
      {sections.map((s) => (
        <PolicySection key={s.title} title={s.title}>
          {s.content}
        </PolicySection>
      ))}
    </PolicyLayout>
  );
}