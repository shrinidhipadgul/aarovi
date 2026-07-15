import type { Metadata } from "next";
import { PolicyLayout, PolicySection } from "@/components/policy-layout";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: "Aarovi's terms and conditions governing the use of our website and services.",
  openGraph: { title: "Terms & Conditions | Aarovi" },
};

const sections = [
  {
    title: "Use of Site",
    content:
      "By accessing or using this website, you agree to be bound by these Terms & Conditions. If you do not agree, please refrain from using our site. You must be at least 18 years old to make a purchase. You are responsible for maintaining the confidentiality of your account credentials.",
  },
  {
    title: "Pricing & Availability",
    content:
      "All prices are listed in Indian Rupees (INR) and are inclusive of applicable taxes unless stated otherwise. We reserve the right to modify prices at any time without prior notice. Product availability is subject to change, and we may discontinue items at our discretion. In the event of a pricing error, we reserve the right to cancel the order and issue a full refund.",
  },
  {
    title: "Orders & Acceptance",
    content:
      "Placing an item in your cart does not guarantee its availability. Your order constitutes an offer to purchase, which we may accept or decline at our discretion. We will confirm acceptance by sending an order confirmation email. We reserve the right to limit or cancel quantities purchased per person, per household, or per order.",
  },
  {
    title: "Intellectual Property",
    content:
      "All content on this website — including images, text, graphics, logos, product designs, and software — is the property of Aarovi Fashions or its licensors and is protected by applicable intellectual property laws. You may not reproduce, distribute, modify, or create derivative works without our express written consent.",
  },
  {
    title: "User Conduct",
    content:
      "You agree not to use this site for any unlawful purpose or in violation of these terms. Prohibited activities include, but are not limited to: attempting to gain unauthorized access to our systems, introducing malicious code, interfering with the site's functionality, or scraping data for commercial purposes.",
  },
  {
    title: "Limitation of Liability",
    content:
      "Aarovi Fashions shall not be liable for any indirect, incidental, special, or consequential damages arising from the use or inability to use our products or services. Our total liability for any claim shall not exceed the amount paid by you for the product in question.",
  },
  {
    title: "Changes to Terms",
    content:
      "We reserve the right to update or modify these Terms & Conditions at any time. Changes will be effective immediately upon posting on this page. It is your responsibility to review these terms periodically. Your continued use of the site after any changes constitutes acceptance of the new terms.",
  },
  {
    title: "Contact",
    content:
      "For questions about these Terms & Conditions, please contact us at aaroviofficial@gmail.com or write to us at our registered office in Hyderabad, Telangana, India.",
  },
];

export default function TermsConditionsPage() {
  return (
    <PolicyLayout title="Terms & Conditions" lastUpdated="1 July 2026">
      {sections.map((s) => (
        <PolicySection key={s.title} title={s.title}>
          {s.content}
        </PolicySection>
      ))}
    </PolicyLayout>
  );
}