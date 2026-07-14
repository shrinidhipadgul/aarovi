import type { Metadata } from "next";
import { PolicyLayout, PolicySection } from "@/components/policy-layout";

export const metadata: Metadata = {
  title: "Refund Policy — Aarovi",
  description: "Aarovi's refund and return policy for ethnic wear.",
};

const sections = [
  {
    title: "Return Window",
    content:
      "We accept returns within 7 days of delivery. Items must be unworn, unwashed, and in their original condition with all tags attached. Any item returned beyond this window may not be eligible for a refund.",
  },
  {
    title: "Condition Requirements",
    content:
      "To be eligible for a return, the item must be in the same condition that you received it — unworn or unused, with tags, and in its original packaging. You'll also need the receipt or proof of purchase. Items that are damaged, stained, or altered will not be accepted.",
  },
  {
    title: "Return Process",
    content:
      "To initiate a return, please email us at aaroviofficial@gmail.com with your order number and reason for return. We will provide a return authorization and instructions. You will be responsible for return shipping costs unless the item is defective or incorrect.",
  },
  {
    title: "Refund Timeline",
    content:
      "Once we receive and inspect your return, we will notify you of the approval or rejection of your refund. If approved, your refund will be processed within 5–7 business days and a credit will automatically be applied to your original method of payment.",
  },
  {
    title: "Exchanges",
    content:
      "We recommend placing a new order for the desired item rather than exchanging, as this ensures faster fulfilment. If you need a different size, please start a return and place a new order.",
  },
  {
    title: "Non-Returnable Items",
    content:
      "Certain items such as customized or personalized products are non-returnable. Sale items and gift cards are also final sale. Please contact us before purchasing such items if you have any questions.",
  },
  {
    title: "Damaged or Incorrect Items",
    content:
      "If you receive a damaged or incorrect item, please contact us immediately at aaroviofficial@gmail.com with your order number and photos of the issue. We will arrange a full refund or replacement at no additional cost.",
  },
];

export default function RefundPolicyPage() {
  return (
    <PolicyLayout title="Refund Policy" lastUpdated="1 July 2026">
      {sections.map((s) => (
        <PolicySection key={s.title} title={s.title}>
          <p>{s.content}</p>
        </PolicySection>
      ))}
    </PolicyLayout>
  );
}