import * as React from "react";
import { Button, Section, Text } from "@react-email/components";
import { EmailLayout, Heading, Hr, BRAND_PRIMARY, BRAND_GOLD } from "./components/email-layout";
import { trackingUrl } from "@/lib/urls";

interface OrderStatusUpdateEmailProps {
  orderId: string;
  newStatus: string;
  statusLabel: string;
}

const HEADLINE: Record<string, string> = {
  confirmed: "Your order is confirmed",
  processing: "We’re working on your order",
  shipped: "Your order is on the way",
  out_for_delivery: "Out for delivery today",
  delivered: "Your order has been delivered",
};

const BODY: Record<string, string> = {
  confirmed:
    "We’ve started preparing your order. You’ll hear from us again once it ships.",
  processing:
    "Our team is carefully packing your order. It will be dispatched shortly.",
  shipped:
    "Your order is on its way to you. Estimated delivery in the next few business days.",
  out_for_delivery:
    "Your order is out for delivery today. Please keep your phone handy in case our delivery partner calls.",
  delivered:
    "Hope you love your order! If you have any feedback or questions, just reply to this email.",
};

const TIMELINE = [
  { key: "confirmed", label: "Order Confirmed" },
  { key: "processing", label: "Processing" },
  { key: "shipped", label: "Shipped" },
  { key: "out_for_delivery", label: "Out for Delivery" },
  { key: "delivered", label: "Delivered" },
];

export function OrderStatusUpdateEmail({
  orderId,
  newStatus,
  statusLabel,
}: OrderStatusUpdateEmailProps) {
  const currentIndex = TIMELINE.findIndex((s) => s.key === newStatus);

  return (
    <EmailLayout preview={`Your Aarovi order is now: ${statusLabel}`}>
      <Heading style={{ margin: 0, fontSize: "22px", color: BRAND_PRIMARY }}>
        {HEADLINE[newStatus] ?? `Your order is now ${statusLabel}`}
      </Heading>
      <Text
        style={{
          margin: "8px 0 0",
          fontSize: "14px",
          lineHeight: "22px",
          color: `${BRAND_PRIMARY}cc`,
        }}
      >
        {BODY[newStatus] ??
          `Your order status has been updated to ${statusLabel}.`}
      </Text>

      <Section
        style={{
          marginTop: "24px",
          padding: "16px 20px",
          backgroundColor: `${BRAND_GOLD}10`,
          borderRadius: "10px",
        }}
      >
        <Text
          style={{
            margin: 0,
            fontSize: "12px",
            fontWeight: 600,
            color: BRAND_GOLD,
            textTransform: "uppercase" as const,
            letterSpacing: "0.06em",
          }}
        >
          Order #{orderId.slice(-8)}
        </Text>
        <Text
          style={{
            margin: "4px 0 0",
            fontSize: "16px",
            fontWeight: 600,
            color: BRAND_PRIMARY,
          }}
        >
          {statusLabel}
        </Text>
      </Section>

      {currentIndex >= 0 && (
        <Section style={{ marginTop: "24px" }}>
          {TIMELINE.map((step, index) => {
            const isCompleted = index < currentIndex;
            const isCurrent = index === currentIndex;
            return (
              <Section
                key={step.key}
                style={{
                  display: "flex",
                  padding: "8px 0",
                }}
              >
                <Text
                  style={{
                    margin: 0,
                    marginRight: "10px",
                    fontSize: "12px",
                    fontWeight: 600,
                    color: isCompleted || isCurrent
                      ? "#ffffff"
                      : `${BRAND_PRIMARY}66`,
                    backgroundColor: isCompleted
                      ? BRAND_PRIMARY
                      : isCurrent
                        ? BRAND_GOLD
                        : `${BRAND_PRIMARY}1a`,
                    width: "22px",
                    height: "22px",
                    borderRadius: "50%",
                    textAlign: "center" as const,
                    lineHeight: "22px",
                  }}
                >
                  {isCompleted ? "✓" : index + 1}
                </Text>
                <Text
                  style={{
                    margin: 0,
                    fontSize: "13px",
                    lineHeight: "22px",
                    fontWeight: isCurrent ? 600 : 400,
                    color: isCurrent ? BRAND_PRIMARY : `${BRAND_PRIMARY}99`,
                  }}
                >
                  {step.label}
                </Text>
              </Section>
            );
          })}
        </Section>
      )}

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
    </EmailLayout>
  );
}

export default OrderStatusUpdateEmail;