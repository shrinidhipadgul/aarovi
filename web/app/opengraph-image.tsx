import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #4F200D 0%, #7A3B1E 50%, #4F200D 100%)",
        fontFamily: "serif",
      }}
    >
      <div
        style={{
          fontSize: 80,
          fontWeight: 700,
          letterSpacing: "0.2em",
          color: "#D4A853",
          textTransform: "uppercase",
          marginBottom: 8,
        }}
      >
        Aarovi
      </div>
      <div
        style={{
          fontSize: 24,
          color: "#F5E6D3",
          letterSpacing: "0.05em",
          opacity: 0.9,
        }}
      >
        Where style meets your soul
      </div>
      <div
        style={{
          marginTop: 40,
          width: 80,
          height: 2,
          background: "#D4A853",
          opacity: 0.5,
        }}
      />
    </div>,
    { ...size },
  );
}
