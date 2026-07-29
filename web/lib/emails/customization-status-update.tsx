import * as React from "react";
import { Section, Text } from "@react-email/components";
import {
  EmailLayout,
  Heading,
  Hr,
  BRAND_PRIMARY,
} from "./components/email-layout";

interface CustomizationStatusUpdateEmailProps {
  requestId: string;
  garment: string;
  statusLabel: string;
}

export function CustomizationStatusUpdateEmail({
  requestId,
  garment,
  statusLabel,
}: CustomizationStatusUpdateEmailProps) {
  return (
    <EmailLayout
      preview={`Your bespoke ${garment} brief is now: ${statusLabel}`}
    >
      <Heading style={{ margin: 0, fontSize: "22px", color: BRAND_PRIMARY }}>
        Brief status updated
      </Heading>
      <Text
        style={{
          margin: "8px 0 0",
          fontSize: "14px",
          lineHeight: "22px",
          color: `${BRAND_PRIMARY}cc`,
        }}
      >
        Your bespoke {garment} brief has been updated to{" "}
        <strong>{statusLabel}</strong>. Our atelier team may reach out if they
        need additional details.
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

      <Section style={{ marginTop: "12px" }}>
        <Text
          style={{ margin: 0, fontSize: "12px", color: `${BRAND_PRIMARY}99` }}
        >
          Status
        </Text>
        <Text style={{ margin: "2px 0 0", fontSize: "14px", fontWeight: 600 }}>
          {statusLabel}
        </Text>
      </Section>

      <Hr style={{ margin: "28px 0", borderColor: `${BRAND_PRIMARY}14` }} />

      <Text
        style={{
          margin: 0,
          fontSize: "12px",
          lineHeight: "18px",
          color: `${BRAND_PRIMARY}80`,
        }}
      >
        Have questions? Reply to this email and our team will assist you. Save
        your Brief ID for reference.
      </Text>
    </EmailLayout>
  );
}

export default CustomizationStatusUpdateEmail;
