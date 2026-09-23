import type { CornerDotType, CornerSquareType, DotType, Options } from "qr-code-styling";
import { FRAME_TEXT_MAX, FRAME_TYPE_VALUES } from "@/lib/qrStyleSchema";

export { FRAME_TEXT_MAX };

export type FrameType = (typeof FRAME_TYPE_VALUES)[number];

export type QrFrame = { type: FrameType; text?: string; color?: string };

export type QrStyle = {
  dotsOptions?: { type?: DotType; color?: string };
  backgroundOptions?: { color?: string };
  cornersSquareOptions?: { type?: CornerSquareType; color?: string };
  cornersDotOptions?: { type?: CornerDotType; color?: string };
  image?: string;
  frame?: QrFrame;
};

export const DEFAULT_DOT_COLOR = "#111827";
export const DEFAULT_BG_COLOR = "#ffffff";
export const DEFAULT_FRAME_TEXT = "Escaneie";

/** Largura de referência: todas as medidas das molduras são escaladas a partir dela. */
const BASE_SIZE = 260;

export function dotColor(style: QrStyle): string {
  return style.dotsOptions?.color ?? DEFAULT_DOT_COLOR;
}

/** Cor dos "olhos" do QR — cai pra cor dos pontos em QRs salvos antes da separação. */
export function cornerColor(style: QrStyle): string {
  return style.cornersSquareOptions?.color ?? dotColor(style);
}

export function backgroundColor(style: QrStyle): string {
  return style.backgroundOptions?.color ?? DEFAULT_BG_COLOR;
}

// ---------------------------------------------------------------------------
// Molduras
// ---------------------------------------------------------------------------

type FrameDef = {
  label: string;
  defaultColor: string;
  /** Espaço extra acima/abaixo do QR e margem interna, em px na BASE_SIZE. */
  top: number;
  bottom: number;
  margin: number;
  hasText: boolean;
};

export const FRAMES: Record<FrameType, FrameDef> = {
  none: { label: "Sem moldura", defaultColor: DEFAULT_DOT_COLOR, top: 0, bottom: 0, margin: 8, hasText: false },
  circle: { label: "Círculo", defaultColor: DEFAULT_DOT_COLOR, top: 0, bottom: 0, margin: 46, hasText: false },
  "text-bottom": { label: "Texto abaixo", defaultColor: "#be185d", top: 0, bottom: 40, margin: 8, hasText: true },
  "box-bottom": { label: "Borda com faixa inferior", defaultColor: "#f59e0b", top: 0, bottom: 52, margin: 18, hasText: true },
  "box-top": { label: "Borda com faixa superior", defaultColor: "#9333ea", top: 52, bottom: 0, margin: 18, hasText: true },
  "button-bottom": { label: "Botão abaixo", defaultColor: "#2563eb", top: 0, bottom: 64, margin: 8, hasText: true },
  "bubble-top": { label: "Balão acima", defaultColor: "#0f766e", top: 64, bottom: 0, margin: 8, hasText: true },
};

export const FRAME_TYPES = Object.keys(FRAMES) as FrameType[];

const SVG_NS = "http://www.w3.org/2000/svg";
const FONT = "Arial, Helvetica, sans-serif";

function el(svg: SVGElement, tag: string, attrs: Record<string, string | number>): SVGElement {
  const node = svg.ownerDocument.createElementNS(SVG_NS, tag);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, String(v));
  return node;
}

function text(
  svg: SVGElement,
  content: string,
  attrs: { x: number; y: number; maxWidth: number; size: number; fill: string },
): SVGElement {
  // Encolhe a fonte pra caber na largura disponível (~0.6em por caractere em negrito).
  const size = Math.min(attrs.size, attrs.maxWidth / Math.max(content.length * 0.6, 1));
  const node = el(svg, "text", {
    x: attrs.x,
    y: attrs.y,
    fill: attrs.fill,
    "font-family": FONT,
    "font-weight": "bold",
    "font-size": size,
    "text-anchor": "middle",
    "dominant-baseline": "central",
  });
  // textContent (não innerHTML): o texto vem do usuário.
  node.textContent = content;
  return node;
}

/**
 * Extensão do qr-code-styling: roda sobre o SVG final (preview e downloads PNG/SVG),
 * reposiciona o QR dentro do canvas maior e desenha a moldura em volta.
 */
function drawFrame(svg: SVGElement, options: Options, style: QrStyle) {
  const frame = style.frame;
  if (!frame || frame.type === "none") return;
  const def = FRAMES[frame.type];
  const width = options.width ?? BASE_SIZE;
  const height = options.height ?? BASE_SIZE;
  const k = width / BASE_SIZE;
  const color = frame.color ?? def.defaultColor;
  const label = (frame.text ?? DEFAULT_FRAME_TEXT).slice(0, FRAME_TEXT_MAX);

  // O qr-code-styling centraliza o QR no canvas; move ele pro lugar certo
  // e cobre com o fundo a faixa que ficou descoberta.
  const group = el(svg, "g", { transform: `translate(0, ${((def.top - def.bottom) / 2) * k})` });
  while (svg.firstChild) group.appendChild(svg.firstChild);
  svg.appendChild(el(svg, "rect", { x: 0, y: 0, width, height, fill: backgroundColor(style) }));
  svg.appendChild(group);

  const stroke = 6 * k;
  switch (frame.type) {
    case "circle":
      svg.appendChild(
        el(svg, "circle", {
          cx: width / 2,
          cy: height / 2,
          r: width / 2 - stroke,
          fill: "none",
          stroke: color,
          "stroke-width": stroke,
        }),
      );
      break;
    case "text-bottom":
      svg.appendChild(
        text(svg, label, { x: width / 2, y: height - 20 * k, maxWidth: width - 24 * k, size: 24 * k, fill: color }),
      );
      break;
    case "box-bottom":
    case "box-top": {
      const bar = 52 * k;
      const barY = frame.type === "box-bottom" ? height - bar : 0;
      svg.appendChild(
        el(svg, "rect", {
          x: stroke / 2,
          y: stroke / 2,
          width: width - stroke,
          height: height - stroke,
          rx: 10 * k,
          fill: "none",
          stroke: color,
          "stroke-width": stroke,
        }),
      );
      svg.appendChild(el(svg, "rect", { x: 0, y: barY, width, height: bar, rx: 10 * k, fill: color }));
      // Cantos arredondados só do lado de fora; o lado que encosta no QR é reto.
      svg.appendChild(
        el(svg, "rect", {
          x: 0,
          y: frame.type === "box-bottom" ? barY : bar / 2,
          width,
          height: bar / 2,
          fill: color,
        }),
      );
      svg.appendChild(
        text(svg, label, { x: width / 2, y: barY + bar / 2, maxWidth: width - 24 * k, size: 22 * k, fill: "#ffffff" }),
      );
      break;
    }
    case "button-bottom": {
      const h = 40 * k;
      const y = height - 52 * k;
      svg.appendChild(el(svg, "rect", { x: width * 0.15, y, width: width * 0.7, height: h, rx: h / 2, fill: color }));
      svg.appendChild(
        text(svg, label, { x: width / 2, y: y + h / 2, maxWidth: width * 0.62, size: 18 * k, fill: "#ffffff" }),
      );
      break;
    }
    case "bubble-top": {
      const h = 42 * k;
      const y = 6 * k;
      const tip = 10 * k;
      svg.appendChild(el(svg, "rect", { x: width * 0.15, y, width: width * 0.7, height: h, rx: 8 * k, fill: color }));
      svg.appendChild(
        el(svg, "polygon", {
          points: `${width / 2 - tip},${y + h} ${width / 2 + tip},${y + h} ${width / 2},${y + h + tip}`,
          fill: color,
        }),
      );
      svg.appendChild(
        text(svg, label, { x: width / 2, y: y + h / 2, maxWidth: width * 0.62, size: 20 * k, fill: "#ffffff" }),
      );
      break;
    }
  }
}

export function frameExtension(getStyle: () => QrStyle) {
  return (svg: SVGElement, options: Options) => drawFrame(svg, options, getStyle());
}

/** Opções do qr-code-styling para um estilo, numa largura qualquer (preview, miniatura). */
export function buildQrOptions(data: string, style: QrStyle, width = BASE_SIZE): Partial<Options> {
  const frame = FRAMES[style.frame?.type ?? "none"];
  const k = width / BASE_SIZE;
  const corner = cornerColor(style);
  return {
    type: "canvas",
    width,
    height: Math.round(width + (frame.top + frame.bottom) * k),
    data,
    margin: Math.round(frame.margin * k),
    image: style.image,
    // saveAsBlob: false — os logos já são data URIs; com true a lib refaz o
    // download via XHR, que a CSP (connect-src 'self') bloqueia pra data:.
    imageOptions: { hideBackgroundDots: true, imageSize: 0.35, margin: 4 * k, saveAsBlob: false },
    dotsOptions: { type: style.dotsOptions?.type ?? "square", color: dotColor(style) },
    cornersSquareOptions: { type: style.cornersSquareOptions?.type, color: corner },
    cornersDotOptions: { type: style.cornersDotOptions?.type, color: style.cornersDotOptions?.color ?? corner },
    backgroundOptions: { color: backgroundColor(style) },
  };
}

// ---------------------------------------------------------------------------
// Padrões (formato dos pontos + olhos) e modelos prontos
// ---------------------------------------------------------------------------

type Pattern = {
  label: string;
  dots: DotType;
  cornersSquare: CornerSquareType;
  cornersDot: CornerDotType;
};

export const PATTERNS: Pattern[] = [
  { label: "Clássico", dots: "square", cornersSquare: "square", cornersDot: "square" },
  { label: "Arredondado", dots: "rounded", cornersSquare: "extra-rounded", cornersDot: "square" },
  { label: "Fino", dots: "classy", cornersSquare: "square", cornersDot: "square" },
  { label: "Suave", dots: "extra-rounded", cornersSquare: "extra-rounded", cornersDot: "dot" },
  { label: "Círculos", dots: "dots", cornersSquare: "dot", cornersDot: "dot" },
];

export function applyPattern(style: QrStyle, p: Pattern): QrStyle {
  return {
    ...style,
    dotsOptions: { ...style.dotsOptions, type: p.dots },
    cornersSquareOptions: { ...style.cornersSquareOptions, type: p.cornersSquare },
    cornersDotOptions: { ...style.cornersDotOptions, type: p.cornersDot },
  };
}

export function isPatternActive(style: QrStyle, p: Pattern): boolean {
  return (
    (style.dotsOptions?.type ?? "square") === p.dots &&
    (style.cornersSquareOptions?.type ?? "square") === p.cornersSquare &&
    (style.cornersDotOptions?.type ?? "square") === p.cornersDot
  );
}

type Template = { label: string; style: QrStyle };

export const TEMPLATES: Template[] = [
  {
    label: "Preto clássico",
    style: {
      dotsOptions: { type: "square", color: "#000000" },
      cornersSquareOptions: { type: "square", color: "#000000" },
      cornersDotOptions: { type: "square", color: "#000000" },
      backgroundOptions: { color: "#ffffff" },
    },
  },
  {
    label: "Laranja no preto",
    style: {
      dotsOptions: { type: "square", color: "#f59e0b" },
      cornersSquareOptions: { type: "extra-rounded", color: "#facc15" },
      cornersDotOptions: { type: "square", color: "#facc15" },
      backgroundOptions: { color: "#000000" },
    },
  },
  {
    label: "Pontilhado",
    style: {
      dotsOptions: { type: "dots", color: "#000000" },
      cornersSquareOptions: { type: "extra-rounded", color: "#000000" },
      cornersDotOptions: { type: "square", color: "#000000" },
      backgroundOptions: { color: "#ffffff" },
    },
  },
  {
    label: "Roxo",
    style: {
      dotsOptions: { type: "rounded", color: "#7e22ce" },
      cornersSquareOptions: { type: "extra-rounded", color: "#7e22ce" },
      cornersDotOptions: { type: "square", color: "#7e22ce" },
      backgroundOptions: { color: "#ffffff" },
    },
  },
  {
    label: "Verde",
    style: {
      dotsOptions: { type: "classy-rounded", color: "#0f766e" },
      cornersSquareOptions: { type: "square", color: "#16a34a" },
      cornersDotOptions: { type: "square", color: "#16a34a" },
      backgroundOptions: { color: "#ffffff" },
    },
  },
];

/** Aplica um modelo mantendo o que não é "visual base" (logo e moldura). */
export function applyTemplate(style: QrStyle, t: Template): QrStyle {
  return { ...t.style, image: style.image, frame: style.frame };
}

// ---------------------------------------------------------------------------
// Logos prontos (SVGs inline → data URI, igual a um logo enviado)
// ---------------------------------------------------------------------------

function svgDataUri(svg: string): string {
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

// Ícones de marca: simple-icons v16.32.0 (CC0). width/height explícitos porque
// o Firefox não carrega SVG sem tamanho intrínseco num <img>.
function brandIcon(path: string, color: string): string {
  return svgDataUri(
    `<svg xmlns="${SVG_NS}" viewBox="-2 -2 28 28" width="96" height="96"><rect x="-2" y="-2" width="28" height="28" rx="6" fill="#ffffff"/><path fill="${color}" d="${path}"/></svg>`,
  );
}

const WHATSAPP_PATH =
  "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z";
const INSTAGRAM_PATH =
  "M7.0301.084c-1.2768.0602-2.1487.264-2.911.5634-.7888.3075-1.4575.72-2.1228 1.3877-.6652.6677-1.075 1.3368-1.3802 2.127-.2954.7638-.4956 1.6365-.552 2.914-.0564 1.2775-.0689 1.6882-.0626 4.947.0062 3.2586.0206 3.6671.0825 4.9473.061 1.2765.264 2.1482.5635 2.9107.308.7889.72 1.4573 1.388 2.1228.6679.6655 1.3365 1.0743 2.1285 1.38.7632.295 1.6361.4961 2.9134.552 1.2773.056 1.6884.069 4.9462.0627 3.2578-.0062 3.668-.0207 4.9478-.0814 1.28-.0607 2.147-.2652 2.9098-.5633.7889-.3086 1.4578-.72 2.1228-1.3881.665-.6682 1.0745-1.3378 1.3795-2.1284.2957-.7632.4966-1.636.552-2.9124.056-1.2809.0692-1.6898.063-4.948-.0063-3.2583-.021-3.6668-.0817-4.9465-.0607-1.2797-.264-2.1487-.5633-2.9117-.3084-.7889-.72-1.4568-1.3876-2.1228C21.2982 1.33 20.628.9208 19.8378.6165 19.074.321 18.2017.1197 16.9244.0645 15.6471.0093 15.236-.005 11.977.0014 8.718.0076 8.31.0215 7.0301.0839m.1402 21.6932c-1.17-.0509-1.8053-.2453-2.2287-.408-.5606-.216-.96-.4771-1.3819-.895-.422-.4178-.6811-.8186-.9-1.378-.1644-.4234-.3624-1.058-.4171-2.228-.0595-1.2645-.072-1.6442-.079-4.848-.007-3.2037.0053-3.583.0607-4.848.05-1.169.2456-1.805.408-2.2282.216-.5613.4762-.96.895-1.3816.4188-.4217.8184-.6814 1.3783-.9003.423-.1651 1.0575-.3614 2.227-.4171 1.2655-.06 1.6447-.072 4.848-.079 3.2033-.007 3.5835.005 4.8495.0608 1.169.0508 1.8053.2445 2.228.408.5608.216.96.4754 1.3816.895.4217.4194.6816.8176.9005 1.3787.1653.4217.3617 1.056.4169 2.2263.0602 1.2655.0739 1.645.0796 4.848.0058 3.203-.0055 3.5834-.061 4.848-.051 1.17-.245 1.8055-.408 2.2294-.216.5604-.4763.96-.8954 1.3814-.419.4215-.8181.6811-1.3783.9-.4224.1649-1.0577.3617-2.2262.4174-1.2656.0595-1.6448.072-4.8493.079-3.2045.007-3.5825-.006-4.848-.0608M16.953 5.5864A1.44 1.44 0 1 0 18.39 4.144a1.44 1.44 0 0 0-1.437 1.4424M5.8385 12.012c.0067 3.4032 2.7706 6.1557 6.173 6.1493 3.4026-.0065 6.157-2.7701 6.1506-6.1733-.0065-3.4032-2.771-6.1565-6.174-6.1498-3.403.0067-6.156 2.771-6.1496 6.1738M8 12.0077a4 4 0 1 1 4.008 3.9921A3.9996 3.9996 0 0 1 8 12.0077";
const PIX_PATH =
  "M5.283 18.36a3.505 3.505 0 0 0 2.493-1.032l3.6-3.6a.684.684 0 0 1 .946 0l3.613 3.613a3.504 3.504 0 0 0 2.493 1.032h.71l-4.56 4.56a3.647 3.647 0 0 1-5.156 0L4.85 18.36ZM18.428 5.627a3.505 3.505 0 0 0-2.493 1.032l-3.613 3.614a.67.67 0 0 1-.946 0l-3.6-3.6A3.505 3.505 0 0 0 5.283 5.64h-.434l4.573-4.572a3.646 3.646 0 0 1 5.156 0l4.559 4.559ZM1.068 9.422 3.79 6.699h1.492a2.483 2.483 0 0 1 1.744.722l3.6 3.6a1.73 1.73 0 0 0 2.443 0l3.614-3.613a2.482 2.482 0 0 1 1.744-.723h1.767l2.737 2.737a3.646 3.646 0 0 1 0 5.156l-2.736 2.736h-1.768a2.482 2.482 0 0 1-1.744-.722l-3.613-3.613a1.77 1.77 0 0 0-2.444 0l-3.6 3.6a2.483 2.483 0 0 1-1.744.722H3.791l-2.723-2.723a3.646 3.646 0 0 1 0-5.156";

const GRAY = "#4b5563";
const scanMeText = `<text x="48" y="38" text-anchor="middle" font-family="${FONT}" font-weight="bold" font-size="24" fill="${GRAY}">SCAN</text><text x="48" y="70" text-anchor="middle" font-family="${FONT}" font-weight="bold" font-size="34" fill="${GRAY}">ME</text>`;
const scanCorners = `<path d="M6 26V6h20M70 6h20v20M90 70v20H70M26 90H6V70" fill="none" stroke="${GRAY}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>`;

export const LOGO_PRESETS: { id: string; label: string; uri: string }[] = [
  {
    id: "camera",
    label: "Câmera",
    uri: svgDataUri(
      `<svg xmlns="${SVG_NS}" viewBox="0 0 96 96" width="96" height="96"><rect width="96" height="96" rx="12" fill="#ffffff"/>${scanCorners}<path d="M30 38a4 4 0 0 1 4-4h6l4-6h8l4 6h6a4 4 0 0 1 4 4v24a4 4 0 0 1-4 4H34a4 4 0 0 1-4-4Z" fill="${GRAY}"/><circle cx="48" cy="50" r="9" fill="#ffffff"/><circle cx="48" cy="50" r="5" fill="${GRAY}"/></svg>`,
    ),
  },
  {
    id: "scan-me",
    label: "Scan me",
    uri: svgDataUri(
      `<svg xmlns="${SVG_NS}" viewBox="0 0 96 96" width="96" height="96"><rect width="96" height="96" rx="12" fill="#ffffff"/>${scanMeText}</svg>`,
    ),
  },
  {
    id: "scan-me-corners",
    label: "Scan me com cantos",
    uri: svgDataUri(
      `<svg xmlns="${SVG_NS}" viewBox="0 0 96 96" width="96" height="96"><rect width="96" height="96" rx="12" fill="#ffffff"/>${scanCorners}<g transform="translate(48 50) scale(0.72) translate(-48 -50)">${scanMeText}</g></svg>`,
    ),
  },
  {
    id: "wifi",
    label: "Wi-Fi",
    uri: svgDataUri(
      `<svg xmlns="${SVG_NS}" viewBox="0 0 96 96" width="96" height="96"><rect width="96" height="96" rx="12" fill="#ffffff"/><g fill="none" stroke="${GRAY}" stroke-width="8" stroke-linecap="round"><path d="M16 40a46 46 0 0 1 64 0"/><path d="M28 52a29 29 0 0 1 40 0"/><path d="M40 64a12 12 0 0 1 16 0"/></g><circle cx="48" cy="76" r="5" fill="${GRAY}"/></svg>`,
    ),
  },
  { id: "whatsapp", label: "WhatsApp", uri: brandIcon(WHATSAPP_PATH, "#25D366") },
  { id: "instagram", label: "Instagram", uri: brandIcon(INSTAGRAM_PATH, "#E4405F") },
  { id: "pix", label: "Pix", uri: brandIcon(PIX_PATH, "#32BCAD") },
];
