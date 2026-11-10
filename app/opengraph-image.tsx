import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#0a0a0a", color: "#f1efe8", padding: "72px", fontFamily: "sans-serif" }}>
      <div style={{ color: "#b7ff3c", fontSize: 24 }}>Open to SDE internships</div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ fontSize: 112, letterSpacing: "-6px" }}>Lakshya Gupta</div>
        <div style={{ fontSize: 32, color: "#a6a6a0" }}>Backend-leaning full-stack developer</div>
      </div>
    </div>,
    size,
  );
}

