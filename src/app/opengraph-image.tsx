import { ImageResponse } from "next/og";
import qrcode from "qrcode-generator";
import { SITE_NAME, SITE_URL } from "@/lib/site";

export const alt = "qrcode-sys — Gerador de QR Code grátis";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** QR real (aponta pro site) como SVG em data URI — ImageResponse aceita <img>. */
function qrSvgDataUri(data: string): string {
  const qr = qrcode(0, "M");
  qr.addData(data);
  qr.make();
  const count = qr.getModuleCount();
  const quiet = 2;
  const total = count + quiet * 2;
  let path = "";
  for (let r = 0; r < count; r++) {
    for (let c = 0; c < count; c++) {
      if (qr.isDark(r, c)) path += `M${c + quiet} ${r + quiet}h1v1h-1z`;
    }
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${total} ${total}" shape-rendering="crispEdges"><rect width="${total}" height="${total}" fill="#fff"/><path d="${path}" fill="#171717"/></svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}

export default function Image() {
  const features = ["Link", "Pix", "Wi-Fi", "WhatsApp", "Contato"];
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "72px 80px",
          background: "#fafafa",
          color: "#171717",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", maxWidth: 640 }}>
          <div style={{ fontSize: 32, fontWeight: 700, color: "#525252" }}>{SITE_NAME}</div>
          <div style={{ marginTop: 20, fontSize: 68, fontWeight: 800, lineHeight: 1.05 }}>
            Gerador de QR Code grátis
          </div>
          <div style={{ marginTop: 24, fontSize: 30, color: "#404040", lineHeight: 1.3 }}>
            Com logo, cores e moldura. QR code dinâmico com estatísticas de scan.
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", marginTop: 36 }}>
            {features.map((f) => (
              <div
                key={f}
                style={{
                  marginRight: 12,
                  marginBottom: 12,
                  padding: "8px 20px",
                  borderRadius: 999,
                  border: "2px solid #d4d4d4",
                  background: "#ffffff",
                  fontSize: 24,
                  fontWeight: 600,
                }}
              >
                {f}
              </div>
            ))}
          </div>
        </div>
        <div
          style={{
            display: "flex",
            padding: 20,
            borderRadius: 32,
            background: "#ffffff",
            border: "2px solid #e5e5e5",
          }}
        >
          <img src={qrSvgDataUri(SITE_URL)} width={360} height={360} alt="" />
        </div>
      </div>
    ),
    size,
  );
}
