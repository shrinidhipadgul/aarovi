import * as React from "react";
import { Section, Text } from "@react-email/components";
import {
  EmailLayout,
  Heading,
  Hr,
  BRAND_PRIMARY,
} from "./components/email-layout";

interface CustomizationConfirmationEmailProps {
  requestId: string;
  garment: string;
}

export function CustomizationConfirmationEmail({
  requestId,
  garment,
}: CustomizationConfirmationEmailProps) {
  return (
    <EmailLayout
      preview={`Your bespoke ${garment} brief (${requestId.slice(-8)}) is submitted`}
    >
      <Heading style={{ margin: 0, fontSize: "22px", color: BRAND_PRIMARY }}>
        Your brief has been received.
      </Heading>
      <Text
        style={{
          margin: "8px 0 0",
          fontSize: "14px",
          lineHeight: "22px",
          color: `${BRAND_PRIMARY}cc`,
        }}
      >
        Thank you for commissioning a bespoke {garment} with us. Our atelier
        will review your selections and reference images, then get back to you
        within 48 hours with a quote and estimated lead time.
      </Text>

      <Section style={{ marginTop: "20px" }}>
        <Text
          style={{ margin: 0, fontSize: "12px", color: `${BRAND_PRIMARY}99` }}
        >
          Brief ID
        </Text>
        <Text style={{ margin: "2px 0 0", fontSize: "14px", fontWeight: 600 }}>
          #{requestId}
        </Text>
      </Section>

      <Hr style={{ margin: "28px 0", borderColor: `${BRAND_PRIMARY}14` }} />

      <Text
        style={{
          margin: "0 0 8px",
          fontSize: "12px",
          lineHeight: "18px",
          color: `${BRAND_PRIMARY}80`,
        }}
      >
        Have a question or want to add details? Reply to this email and our
        team will assist you. Save your Brief ID for reference.
      </Text>
    </EmailLayout>
  );
}

export default CustomizationConfirmationEmail;
