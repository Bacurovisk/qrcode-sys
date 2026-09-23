"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import QRCodeStyling from "qr-code-styling";
import { QrThumb } from "@/components/QrThumb";
import {
  applyPattern,
  applyTemplate,
  backgroundColor,
  buildQrOptions,
  cornerColor,
  DEFAULT_FRAME_TEXT,
  dotColor,
  FRAME_TEXT_MAX,
  FRAME_TYPES,
  FRAMES,
  frameExtension,
  isPatternActive,
  LOGO_PRESETS,
  PATTERNS,
  TEMPLATES,
  type FrameType,
  type QrStyle,
} from "@/lib/qrStyle";

export type { QrStyle } from "@/lib/qrStyle";

/** Largura do arquivo baixado (a moldura escala junto). */
const DOWNLOAD_SIZE = 1024;
const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;

/** Estilo neutro usado nas miniaturas de padrão e de moldura. */
const THUMB_BASE: QrStyle = { dotsOptions: { color: "#374151" } };
const FRAME_THUMB_BASE: QrStyle = { dotsOptions: { color: "#9ca3af" } };

/** Nome do QR → nome de arquivo válido em qualquer SO. */
function safeFileName(name: string): string {
  const cleaned = name
    .replace(/[\\/:*?"<>|]/g, "")
    .replace(/\p{Cc}/gu, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 100);
  return cleaned || "qrcode";
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h3 className="mb-2 text-sm font-medium text-neutral-700">{title}</h3>
      {children}
    </section>
  );
}

function Tile({
  selected,
  label,
  onClick,
  children,
}: {
  selected: boolean;
  label: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={selected}
      onClick={onClick}
      className={`flex h-20 w-20 shrink-0 items-center justify-center rounded-lg border-2 bg-white p-1.5 transition-colors ${
        selected ? "border-neutral-900" : "border-neutral-200 hover:border-neutral-400"
      }`}
    >
      {children}
    </button>
  );
}

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (color: string) => void;
}) {
  // Rascunho do texto enquanto a pessoa digita um hex incompleto.
  const [draft, setDraft] = useState<string | null>(null);

  return (
    <label className="block">
      <span className="flex items-center gap-2 rounded-md border border-neutral-300 bg-white px-2 py-1.5 focus-within:border-neutral-500">
        <input
          type="text"
          value={draft ?? value}
          maxLength={7}
          spellCheck={false}
          onChange={(e) => {
            const next = e.target.value.trim();
            setDraft(next);
            if (HEX_COLOR.test(next)) onChange(next.toLowerCase());
          }}
          onBlur={() => setDraft(null)}
          className="w-full min-w-0 font-mono text-sm outline-none"
        />
        <input
          type="color"
          value={value}
          aria-label={`${label} (seletor)`}
          onChange={(e) => onChange(e.target.value)}
          className="h-7 w-7 shrink-0 cursor-pointer rounded border border-neutral-300 p-0"
        />
      </span>
      <span className="mt-1 block text-xs text-neutral-600">{label}</span>
    </label>
  );
}

export function QrEditor({
  data,
  value,
  onChange,
  fileName = "qrcode",
  downloadBlockedReason = null,
}: {
  data: string;
  value: QrStyle;
  onChange: (style: QrStyle) => void;
  /** Nome do arquivo baixado, sem extensão (normalmente o nome do QR). */
  fileName?: string;
  /** Enquanto houver motivo, os botões de download ficam desabilitados e o motivo aparece. */
  downloadBlockedReason?: string | null;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const qrRef = useRef<QRCodeStyling | null>(null);
  const styleRef = useRef(value);
  const [logoError, setLogoError] = useState<string | null>(null);

  useEffect(() => {
    const qr = new QRCodeStyling(buildQrOptions(data, styleRef.current));
    qr.applyExtension(frameExtension(() => styleRef.current));
    qrRef.current = qr;
    const container = containerRef.current;
    if (container) qr.append(container);
    return () => container?.replaceChildren();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    styleRef.current = value;
    qrRef.current?.update(buildQrOptions(data, value));
  }, [data, value]);

  function download(extension: "png" | "svg") {
    if (downloadBlockedReason) return;
    // Instância separada em alta resolução, pra o PNG não sair com 260px.
    const qr = new QRCodeStyling(buildQrOptions(data, value, DOWNLOAD_SIZE));
    qr.applyExtension(frameExtension(() => value));
    qr.download({ extension, name: safeFileName(fileName) });
  }

  function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (file.size > 500_000) {
      setLogoError("Imagem muito grande (máx. 500KB)");
      return;
    }
    setLogoError(null);
    const reader = new FileReader();
    reader.onload = () => {
      onChange({ ...value, image: reader.result as string });
    };
    reader.readAsDataURL(file);
  }

  const frameType = value.frame?.type ?? "none";
  const frameDef = FRAMES[frameType];
  const customLogo = value.image && !LOGO_PRESETS.some((l) => l.uri === value.image) ? value.image : null;

  function setFrame(type: FrameType) {
    onChange({
      ...value,
      frame:
        type === "none"
          ? undefined
          : {
              type,
              text: value.frame?.text ?? DEFAULT_FRAME_TEXT,
              // O círculo não tem texto nem faixa: acompanha a cor dos cantos do QR.
              color: type === "circle" ? cornerColor(value) : FRAMES[type].defaultColor,
            },
    });
  }

  return (
    <div className="flex flex-col gap-6 md:flex-row md:items-start">
      {/* No mobile vem depois das opções: primeiro edita, por último baixa. */}
      <div className="order-last flex flex-col items-center gap-3 md:sticky md:top-4 md:order-first">
        <div
          ref={containerRef}
          className="rounded-lg border border-neutral-200 bg-white p-3 [&>canvas]:h-auto [&>canvas]:max-w-full"
        />
        <div className="flex gap-2">
          {(["png", "svg"] as const).map((ext) => (
            <button
              key={ext}
              type="button"
              onClick={() => download(ext)}
              disabled={Boolean(downloadBlockedReason)}
              aria-describedby={downloadBlockedReason ? "qr-download-blocked" : undefined}
              className="rounded-md border border-neutral-300 px-3 py-2 text-sm hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent"
            >
              Baixar {ext.toUpperCase()}
            </button>
          ))}
        </div>
        {downloadBlockedReason && (
          <p id="qr-download-blocked" className="max-w-[260px] text-center text-xs text-neutral-600">
            {downloadBlockedReason}
          </p>
        )}
      </div>

      <div className="min-w-0 flex-1 space-y-6">
        <Section title="Modelos prontos">
          <div className="flex flex-wrap gap-2">
            {TEMPLATES.map((t) => (
              <Tile key={t.label} label={t.label} selected={false} onClick={() => onChange(applyTemplate(value, t))}>
                <QrThumb style={t.style} />
              </Tile>
            ))}
          </div>
        </Section>

        <Section title="Padrão e estilo">
          <div className="flex flex-wrap gap-2">
            {PATTERNS.map((p) => (
              <div key={p.label} className="flex flex-col items-center gap-1">
                <Tile label={p.label} selected={isPatternActive(value, p)} onClick={() => onChange(applyPattern(value, p))}>
                  <QrThumb style={applyPattern(THUMB_BASE, p)} />
                </Tile>
                <span className="text-xs text-neutral-600">{p.label}</span>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Cores">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <ColorField
              label="Fundo"
              value={backgroundColor(value)}
              onChange={(color) => onChange({ ...value, backgroundOptions: { color } })}
            />
            <ColorField
              label="Quadrados (cantos)"
              value={cornerColor(value)}
              onChange={(color) =>
                onChange({
                  ...value,
                  cornersSquareOptions: { ...value.cornersSquareOptions, color },
                  cornersDotOptions: { ...value.cornersDotOptions, color },
                })
              }
            />
            <ColorField
              label="Pixels"
              value={dotColor(value)}
              onChange={(color) => onChange({ ...value, dotsOptions: { ...value.dotsOptions, color } })}
            />
          </div>
        </Section>

        <Section title="Logo">
          <div className="flex flex-wrap gap-2">
            <label
              title="Enviar imagem"
              className="flex h-20 w-20 shrink-0 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-neutral-300 bg-white text-xs text-neutral-600 hover:border-neutral-500 focus-within:border-neutral-900"
            >
              <span aria-hidden="true" className="text-xl leading-none">
                ⬆
              </span>
              Enviar
              <input
                type="file"
                accept="image/png,image/jpeg,image/svg+xml,image/webp"
                onChange={handleLogoUpload}
                className="sr-only"
              />
            </label>
            <Tile label="Sem logo" selected={!value.image} onClick={() => onChange({ ...value, image: undefined })}>
              <span aria-hidden="true" className="text-3xl text-neutral-400">
                ⊘
              </span>
            </Tile>
            {customLogo && (
              <Tile label="Logo enviado" selected onClick={() => {}}>
                {/* eslint-disable-next-line @next/next/no-img-element -- data URI do upload */}
                <img src={customLogo} alt="" className="max-h-full max-w-full object-contain" />
              </Tile>
            )}
            {LOGO_PRESETS.map((logo) => (
              <Tile
                key={logo.id}
                label={logo.label}
                selected={value.image === logo.uri}
                onClick={() => onChange({ ...value, image: logo.uri })}
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- SVG inline em data URI */}
                <img src={logo.uri} alt="" className="max-h-full max-w-full" />
              </Tile>
            ))}
          </div>
          {logoError && <p className="mt-1 text-sm text-red-600">{logoError}</p>}
        </Section>

        <Section title="Moldura">
          <div className="flex flex-wrap gap-2">
            {FRAME_TYPES.map((type) => (
              <Tile key={type} label={FRAMES[type].label} selected={frameType === type} onClick={() => setFrame(type)}>
                {type === "none" ? (
                  <span aria-hidden="true" className="text-3xl text-neutral-400">
                    ⊘
                  </span>
                ) : (
                  <QrThumb size={52} style={{ ...FRAME_THUMB_BASE, frame: { type, text: DEFAULT_FRAME_TEXT } }} />
                )}
              </Tile>
            ))}
          </div>

          {value.frame && (
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {frameDef.hasText && (
                <label className="block sm:col-span-2">
                  <input
                    type="text"
                    value={value.frame.text ?? ""}
                    maxLength={FRAME_TEXT_MAX}
                    onChange={(e) =>
                      value.frame && onChange({ ...value, frame: { ...value.frame, text: e.target.value } })
                    }
                    className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
                  />
                  <span className="mt-1 block text-xs text-neutral-600">Texto da moldura</span>
                </label>
              )}
              <ColorField
                label="Cor da moldura"
                value={value.frame.color ?? frameDef.defaultColor}
                onChange={(color) => value.frame && onChange({ ...value, frame: { ...value.frame, color } })}
              />
            </div>
          )}
        </Section>
      </div>
    </div>
  );
}
