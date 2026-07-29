import * as React from "react";
import { Section, Text } from "@react-email/components";
import {
  EmailLayout,
  Heading,
  Hr,
  BRAND_PRIMARY,
} from "./components/email-layout";

interface CustomizationAdminNotifyEmailProps {
  requestId: string;
  garment: string;
  occasion: string | null;
  budgetTier: string | null;
  userEmail: string;
}

export function CustomizationAdminNotifyEmail({
  requestId,
  garment,
  occasion,
  budgetTier,
  userEmail,
}: CustomizationAdminNotifyEmailProps) {
  return (
    <EmailLayout
      preview={`New bespoke brief: ${garment} from ${userEmail}`}
    >
      <Heading style={{ margin: 0, fontSize: "22px", color: BRAND_PRIMARY }}>
        New bespoke brief received
      </Heading>
      <Text
        style={{
          margin: "8px 0 0",
          fontSize: "14px",
          lineHeight: "22px",
          color: `${BRAND_PRIMARY}cc`,
        }}
      >
        A customer has submitted a new customization request. Log in to the
        admin panel to review the full specification, reference images, and
        quote a price.
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
          Garment
        </Text>
        <Text style={{ margin: "2px 0 0", fontSize: "14px", fontWeight: 600 }}>
          {garment}
        </Text>
      </Section>

      {occasion && (
        <Section style={{ marginTop: "12px" }}>
          <Text
            style={{
              margin: 0,
              fontSize: "12px",
              color: `${BRAND_PRIMARY}99`,
            }}
          >
            Occasion
          </Text>
          <Text
            style={{ margin: "2px 0 0", fontSize: "14px", fontWeight: 600 }}
          >
            {occasion}
          </Text>
        </Section>
      )}

      {budgetTier && (
        <Section style={{ marginTop: "12px" }}>
          <Text
            style={{
              margin: 0,
              fontSize: "12px",
              color: `${BRAND_PRIMARY}99`,
            }}
          >
            Budget
          </Text>
          <Text
            style={{ margin: "2px 0 0", fontSize: "14px", fontWeight: 600 }}
          >
            {budgetTier}
          </Text>
        </Section>
      )}

      <Section style={{ marginTop: "12px" }}>
        <Text
          style={{ margin: 0, fontSize: "12px", color: `${BRAND_PRIMARY}99` }}
        >
          Customer
        </Text>
        <Text style={{ margin: "2px 0 0", fontSize: "14px", fontWeight: 600 }}>
          {userEmail}
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
        Review this brief in the admin panel under <strong>Bespoke</strong>.
        The customer is expecting a response within 48 hours.
      </Text>
    </EmailLayout>
  );
}

export default CustomizationAdminNotifyEmail;
