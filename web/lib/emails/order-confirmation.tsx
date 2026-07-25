import * as React from "react";
import { Button, Section, Text } from "@react-email/components";
import { EmailLayout, Heading, Hr, BRAND_PRIMARY } from "./components/email-layout";
import { OrderItemsTable, type EmailOrderItem } from "./components/order-items-table";
import { AddressBlock, type EmailAddress } from "./components/address-block";
import { trackingUrl } from "@/lib/urls";

interface OrderConfirmationEmailProps {
  orderId: string;
  placedAt: string;
  paymentMethod: string;
  total: number;
  items: EmailOrderItem[];
  address: EmailAddress;
}

const formatDate = (iso: string) =>
  new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));

export function OrderConfirmationEmail({
  orderId,
  placedAt,
  paymentMethod,
  total,
  items,
  address,
}: OrderConfirmationEmailProps) {
  return (
    <EmailLayout preview={`Your Aarovi order ${orderId.slice(-8)} is confirmed`}>
      <Heading style={{ margin: 0, fontSize: "22px", color: BRAND_PRIMARY }}>
        Thank you for your order!
      </Heading>
      <Text
        style={{
          margin: "8px 0 0",
          fontSize: "14px",
          lineHeight: "22px",
          color: `${BRAND_PRIMARY}cc`,
        }}
      >
        We’ve received your order and our team is getting it ready. Here’s a
        summary of what you ordered.
      </Text>

      <Section style={{ marginTop: "20px" }}>
        <Text style={{ margin: 0, fontSize: "12px", color: `${BRAND_PRIMARY}99` }}>
          Order ID
        </Text>
        <Text style={{ margin: "2px 0 0", fontSize: "14px", fontWeight: 600 }}>
          #{orderId}
        </Text>
      </Section>

      <Section style={{ marginTop: "12px" }}>
        <Text style={{ margin: 0, fontSize: "12px", color: `${BRAND_PRIMARY}99` }}>
          Placed on
        </Text>
        <Text style={{ margin: "2px 0 0", fontSize: "14px", fontWeight: 600 }}>
          {formatDate(placedAt)}
        </Text>
      </Section>

      <Section style={{ marginTop: "12px" }}>
        <Text style={{ margin: 0, fontSize: "12px", color: `${BRAND_PRIMARY}99` }}>
          Payment method
        </Text>
        <Text
          style={{
            margin: "2px 0 0",
            fontSize: "14px",
            fontWeight: 600,
            textTransform: "uppercase" as const,
          }}
        >
          {paymentMethod}
        </Text>
      </Section>

      <OrderItemsTable items={items} total={total} />

      <AddressBlock address={address} />

      <Hr style={{ margin: "28px 0", borderColor: `${BRAND_PRIMARY}14` }} />

      <Section style={{ textAlign: "center" as const }}>
        <Button
          href={trackingUrl(orderId)}
          style={{
            backgroundColor: BRAND_PRIMARY,
            borderRadius: "8px",
            color: "#ffffff",
            fontSize: "14px",
            fontWeight: 600,
            padding: "12px 24px",
            textDecoration: "none",
          }}
        >
          Track your order
        </Button>
      </Section>

      <Text
        style={{
          margin: "16px 0 0",
          fontSize: "12px",
          lineHeight: "18px",
          textAlign: "center" as const,
          color: `${BRAND_PRIMARY}80`,
        }}
      >
        Estimated delivery within 5–7 business days. You’ll receive another
        email when your order ships.
      </Text>
    </EmailLayout>
  );
}

export default OrderConfirmationEmail;