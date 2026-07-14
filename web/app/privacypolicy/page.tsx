import type { Metadata } from "next";
import { PolicyLayout, PolicySection } from "@/components/policy-layout";

export const metadata: Metadata = {
  title: "Privacy Policy — Aarovi",
  description: "Aarovi's privacy policy explaining how we collect, use, and protect your data.",
};

const sections = [
  {
    title: "Information We Collect",
    content: (
      <ul>
        <li>
          <strong>Personal Information:</strong> When you create an account, place
          an order, or contact us, we collect your name, email address, phone
          number, shipping address, and payment details.
        </li>
        <li>
          <strong>Browsing Data:</strong> We automatically collect information
          such as your IP address, browser type, device information, and pages
          visited to improve your shopping experience.
        </li>
        <li>
          <strong>Cookies:</strong> We use cookies and similar tracking
          technologies to remember your preferences, analyze traffic, and
          personalise content.
        </li>
      </ul>
    ),
  },
  {
    title: "How We Use Your Information",
    content: (
      <ul>
        <li>Process and fulfil your orders, including sending order confirmations and updates.</li>
        <li>Communicate with you about your account, orders, and inquiries.</li>
        <li>Improve our website, products, and services based on your usage patterns.</li>
        <li>Send promotional emails and offers (only with your consent, which you can withdraw at any time).</li>
        <li>Prevent fraud and ensure the security of our platform.</li>
      </ul>
    ),
  },
  {
    title: "Payment Information",
    content:
      "We do not store your full payment card details on our servers. All payment transactions are processed securely through our third-party payment gateway partners (Razorpay). Your payment information is encrypted and handled in compliance with PCI DSS standards.",
  },
  {
    title: "Third-Party Sharing",
    content:
      "We do not sell, trade, or rent your personal information to third parties. We may share your data with trusted service providers who assist us in operating our website, processing payments, delivering orders, and analysing customer behaviour — all under strict confidentiality agreements.",
  },
  {
    title: "Data Security",
    content:
      "We implement industry-standard security measures including SSL encryption, secure server infrastructure, and regular security audits to protect your personal information. However, no method of electronic storage is 100% secure, and we cannot guarantee absolute security.",
  },
  {
    title: "Your Rights",
    content:
      "You have the right to access, update, or delete your personal information at any time. You can do this by logging into your account settings or contacting us at aaroviofficial@gmail.com. You may also request a copy of the data we hold about you.",
  },
  {
    title: "Contact Us",
    content:
      "If you have any questions about this Privacy Policy or how we handle your data, please contact us at aaroviofficial@gmail.com or write to us at our registered address in Hyderabad, Telangana, India.",
  },
];

export default function PrivacyPolicyPage() {
  return (
    <PolicyLayout title="Privacy Policy" lastUpdated="1 July 2026">
      {sections.map((s) => (
        <PolicySection key={s.title} title={s.title}>
          {s.content}
        </PolicySection>
      ))}
    </PolicyLayout>
  );
}