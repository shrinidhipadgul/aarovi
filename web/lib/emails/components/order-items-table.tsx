import * as React from "react";
import { Section, Text } from "@react-email/components";
import { BRAND_PRIMARY, BRAND_GOLD } from "./email-layout";

export interface EmailOrderItem {
  id: string;
  size: string;
  quantity: number;
  price: number;
  product: {
    id: string;
    name: string;
    slug: string;
    images: string[];
  };
}

interface OrderItemsTableProps {
  items: EmailOrderItem[];
  total: number;
}

const formatMoney = (n: number) => `\u20B9${n.toLocaleString("en-IN")}`;

export function OrderItemsTable({ items, total }: OrderItemsTableProps) {
  return (
    <Section
      style={{
        marginTop: "20px",
        border: `1px solid ${BRAND_PRIMARY}1a`,
        borderRadius: "10px",
        overflow: "hidden",
      }}
    >
      {items.map((item, index) => (
        <Section
          key={item.id}
          style={{
            display: "flex",
            padding: "12px 16px",
            borderTop: index === 0 ? "none" : `1px solid ${BRAND_PRIMARY}0d`,
          }}
        >
          <Section style={{ flex: "1" }}>
            <Text style={{ margin: 0, fontSize: "14px", fontWeight: 600, color: BRAND_PRIMARY }}>
              {item.product.name}
            </Text>
            <Text
              style={{
                margin: "4px 0 0",
                fontSize: "12px",
                color: `${BRAND_PRIMARY}99`,
              }}
            >
              Size: {item.size} · Qty: {item.quantity}
            </Text>
          </Section>
          <Text
            style={{
              margin: 0,
              fontSize: "14px",
              fontWeight: 600,
              color: BRAND_PRIMARY,
              textAlign: "right" as const,
              whiteSpace: "nowrap" as const,
            }}
          >
            {formatMoney(item.price * item.quantity)}
          </Text>
        </Section>
      ))}
      <Section
        style={{
          display: "flex",
          padding: "14px 16px",
          borderTop: `2px solid ${BRAND_PRIMARY}1a`,
          backgroundColor: `${BRAND_GOLD}08`,
        }}
      >
        <Text
          style={{
            margin: 0,
            fontSize: "14px",
            fontWeight: 700,
            color: BRAND_PRIMARY,
          }}
        >
          Total
        </Text>
        <Text
          style={{
            margin: 0,
            fontSize: "16px",
            fontWeight: 700,
            color: BRAND_PRIMARY,
            textAlign: "right" as const,
          }}
        >
          {formatMoney(total)}
        </Text>
      </Section>
    </Section>
  );
}