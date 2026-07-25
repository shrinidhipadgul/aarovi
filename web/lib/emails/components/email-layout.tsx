import * as React from "react";
import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Section,
  Text,
  Heading,
  Hr,
  Link,
} from "@react-email/components";

interface EmailLayoutProps {
  preview: string;
  children: React.ReactNode;
}

const FONT_STACK =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
const BRAND_PRIMARY = "#4F200D";
const BRAND_GOLD = "#8B6B44";
const BRAND_BG = "#FBF7F3";
const BRAND_TEXT = "#2A1506";

export function EmailLayout({ preview, children }: EmailLayoutProps) {
  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body
        style={{
          margin: 0,
          padding: 0,
          backgroundColor: BRAND_BG,
          color: BRAND_TEXT,
          fontFamily: FONT_STACK,
        }}
      >
        <Container
          style={{
            maxWidth: "560px",
            margin: "0 auto",
            padding: "24px 24px 48px",
          }}
        >
          <Section style={{ paddingBottom: "16px" }}>
            <Text
              style={{
                margin: 0,
                fontSize: "22px",
                fontWeight: 700,
                color: BRAND_PRIMARY,
                letterSpacing: "0.04em",
              }}
            >
              AAROVI
            </Text>
          </Section>

          <Section
            style={{
              backgroundColor: "#ffffff",
              border: `1px solid ${BRAND_PRIMARY}22`,
              borderRadius: "12px",
              padding: "32px",
            }}
          >
            {children}
          </Section>

          <Hr
            style={{
              marginTop: "32px",
              borderColor: `${BRAND_PRIMARY}14`,
            }}
          />
          <Section style={{ paddingTop: "16px" }}>
            <Text
              style={{
                margin: 0,
                fontSize: "12px",
                lineHeight: "20px",
                color: `${BRAND_TEXT}80`,
              }}
            >
              Aarovi · Handcrafted essentials. You received this email because
              you placed an order with us. If you didn’t, please reply to this
              email so we can help. Visit us at{" "}
              <Link
                href="https://aarovi.in"
                style={{ color: BRAND_GOLD, textDecoration: "none" }}
              >
                aarovi.in
              </Link>
              .
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export { Heading, Text, Section, Hr, Link, BRAND_PRIMARY, BRAND_GOLD, BRAND_BG };