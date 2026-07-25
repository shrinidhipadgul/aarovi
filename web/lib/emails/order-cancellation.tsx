import * as React from "react";
import { Link, Section, Text } from "@react-email/components";
import { EmailLayout, Heading, Hr, BRAND_PRIMARY, BRAND_GOLD } from "./components/email-layout";
import { OrderItemsTable, type EmailOrderItem } from "./components/order-items-table";
import { AddressBlock, type EmailAddress } from "./components/address-block";
import { trackingUrl } from "@/lib/urls";

interface OrderCancellationEmailProps {
  orderId: string;
  total: number;
  paymentMethod: string;
  items: EmailOrderItem[];
  address: EmailAddress;
}

export function OrderCancellationEmail({
  orderId,
  total,
  paymentMethod,
  items,
  address,
}: OrderCancellationEmailProps) {
  const isOnlinePayment = paymentMethod !== "COD";

  return (
    <EmailLayout preview={`Your Aarovi order ${orderId.slice(-8)} has been cancelled`}>
      <Heading style={{ margin: 0, fontSize: "22px", color: BRAND_PRIMARY }}>
        Your order has been cancelled
      </Heading>
      <Text
        style={{
          margin: "8px 0 0",
          fontSize: "14px",
          lineHeight: "22px",
          color: `${BRAND_PRIMARY}cc`,
        }}
      >
        We’re sorry — order #{orderId.slice(-8)} has been cancelled. If you
        didn’t expect this, please reply to this email and we’ll look into it
        right away.
      </Text>

      <Section
        style={{
          marginTop: "20px",
          padding: "14px 18px",
          backgroundColor: `${BRAND_PRIMARY}08`,
          borderRadius: "10px",
        }}
      >
        <Text
          style={{
            margin: 0,
            fontSize: "13px",
            lineHeight: "20px",
            color: BRAND_PRIMARY,
          }}
        >
          <strong>Order ID:</strong> #{orderId}
        </Text>
        {isOnlinePayment ? (
          <Text
            style={{
              margin: "6px 0 0",
              fontSize: "13px",
              lineHeight: "20px",
              color: `${BRAND_PRIMARY}cc`,
            }}
          >
            Since you paid online, a refund of the full order amount will be
            issued to your original payment method within 5–7 business days. If
            it doesn’t appear within that window, reply to this email and we’ll
            chase it down.
          </Text>
        ) : (
          <Text
            style={{
              margin: "6px 0 0",
              fontSize: "13px",
              lineHeight: "20px",
              color: `${BRAND_PRIMARY}cc`,
            }}
          >
            Because you chose Cash on Delivery, no payment was charged — there’s
            nothing further you need to do.
          </Text>
        )}
      </Section>

      <OrderItemsTable items={items} total={total} />
      <AddressBlock address={address} label="Shipping address" />

      <Hr style={{ margin: "28px 0", borderColor: `${BRAND_PRIMARY}14` }} />

      <Text
        style={{
          margin: 0,
          fontSize: "13px",
          lineHeight: "20px",
          color: `${BRAND_PRIMARY}cc`,
        }}
      >
        Questions? Reply to this email or write to{" "}
        <Link
          href="mailto:aaroviofficial@gmail.com"
          style={{ color: BRAND_GOLD, textDecoration: "none" }}
        >
          aaroviofficial@gmail.com
        </Link>
        . You can also see your order history at{" "}
        <Link
          href={trackingUrl(orderId)}
          style={{ color: BRAND_GOLD, textDecoration: "none" }}
        >
          track your order
        </Link>
        .
      </Text>
    </EmailLayout>
  );
}

export default OrderCancellationEmail;