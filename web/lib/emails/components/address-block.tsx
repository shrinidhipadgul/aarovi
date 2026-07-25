import * as React from "react";
import { Section, Text } from "@react-email/components";
import { BRAND_PRIMARY } from "./email-layout";

export interface EmailAddress {
  fullName?: string;
  phone?: string;
  line1?: string;
  city?: string;
  state?: string;
  pincode?: string;
}

interface AddressBlockProps {
  address: EmailAddress;
  label?: string;
}

export function AddressBlock({ address, label = "Delivery address" }: AddressBlockProps) {
  return (
    <Section style={{ marginTop: "20px" }}>
      <Text
        style={{
          margin: 0,
          marginBottom: "6px",
          fontSize: "12px",
          fontWeight: 600,
          color: `${BRAND_PRIMARY}99`,
          textTransform: "uppercase" as const,
          letterSpacing: "0.06em",
        }}
      >
        {label}
      </Text>
      <Text style={{ margin: 0, fontSize: "14px", lineHeight: "20px" }}>
        {address.fullName && <span style={{ fontWeight: 600 }}>{address.fullName}</span>}
        {address.fullName && <br />}
        {address.line1}
        {address.line1 && <br />}
        {address.city}
        {address.city && address.state ? ", " : ""}
        {address.state}
        {address.pincode ? ` — ${address.pincode}` : ""}
        {(address.city || address.state) && <br />}
        {address.phone && (
          <span style={{ color: `${BRAND_PRIMARY}99` }}>Phone: {address.phone}</span>
        )}
      </Text>
    </Section>
  );
}