"use client";

import {
  PIX_KEY_TYPES,
  SOCIAL_PLATFORMS,
  type QrKind,
  type QrPayloadMap,
} from "@/lib/qrContent";

const inputClass = "mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm";
const labelClass = "block text-sm font-medium text-neutral-700";

export function defaultPayloadFor(kind: QrKind): Record<string, unknown> {
  switch (kind) {
    case "URL":
      return { url: "" };
    case "TEXT":
      return { text: "" };
    case "CONTACT":
      return { firstName: "" };
    case "SOCIAL":
      return { platform: "instagram", url: "" };
    case "APP":
      return { androidUrl: "", iosUrl: "", fallbackUrl: "" };
    case "LOCATION":
      return { lat: "", lng: "", label: "" };
    case "SMS":
      return { phone: "", message: "" };
    case "EMAIL":
      return { to: "", subject: "", body: "" };
    case "PHONE":
      return { phone: "" };
    case "WIFI":
      return { ssid: "", password: "", encryption: "WPA", hidden: false };
    case "PIX":
      return { keyType: "CPF", key: "", name: "", city: "", amount: "", description: "" };
  }
}

type Payload = Record<string, unknown>;

export function QrPayloadFields({
  kind,
  payload,
  onChange,
}: {
  kind: QrKind;
  payload: Payload;
  onChange: (payload: Payload) => void;
}) {
  function set(key: string, value: unknown) {
    onChange({ ...payload, [key]: value });
  }
  const str = (key: string) => (typeof payload[key] === "string" ? (payload[key] as string) : "");

  switch (kind) {
    case "URL":
      return (
        <Field label="URL de destino">
          <input
            type="text"
            required
            placeholder="https://..."
            value={str("url")}
            onChange={(e) => set("url", e.target.value)}
            className={inputClass}
          />
        </Field>
      );

    case "TEXT":
      return (
        <Field label="Texto">
          <textarea
            required
            rows={4}
            value={str("text")}
            onChange={(e) => set("text", e.target.value)}
            className={inputClass}
          />
        </Field>
      );

    case "CONTACT":
      return (
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nome">
            <input
              type="text"
              required
              value={str("firstName")}
              onChange={(e) => set("firstName", e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Sobrenome">
            <input
              type="text"
              value={str("lastName")}
              onChange={(e) => set("lastName", e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Telefone">
            <input
              type="text"
              value={str("phone")}
              onChange={(e) => set("phone", e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Celular">
            <input
              type="text"
              value={str("cellPhone")}
              onChange={(e) => set("cellPhone", e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Email">
            <input
              type="email"
              value={str("email")}
              onChange={(e) => set("email", e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Site">
            <input
              type="text"
              placeholder="https://..."
              value={str("website")}
              onChange={(e) => set("website", e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Empresa">
            <input
              type="text"
              value={str("org")}
              onChange={(e) => set("org", e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Cargo">
            <input
              type="text"
              value={str("title")}
              onChange={(e) => set("title", e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Rua">
            <input
              type="text"
              value={str("street")}
              onChange={(e) => set("street", e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Cidade">
            <input
              type="text"
              value={str("city")}
              onChange={(e) => set("city", e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Estado">
            <input
              type="text"
              value={str("state")}
              onChange={(e) => set("state", e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="CEP">
            <input
              type="text"
              value={str("zip")}
              onChange={(e) => set("zip", e.target.value)}
              className={inputClass}
            />
          </Field>
        </div>
      );

    case "SOCIAL":
      return (
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Rede">
            <select
              value={str("platform") || "instagram"}
              onChange={(e) => set("platform", e.target.value)}
              className={inputClass}
            >
              {SOCIAL_PLATFORMS.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Link do perfil">
            <input
              type="text"
              required
              placeholder="https://..."
              value={str("url")}
              onChange={(e) => set("url", e.target.value)}
              className={inputClass}
            />
          </Field>
        </div>
      );

    case "APP":
      return (
        <div className="space-y-4">
          <Field label="Link na Play Store (Android)">
            <input
              type="text"
              placeholder="https://play.google.com/store/apps/details?id=..."
              value={str("androidUrl")}
              onChange={(e) => set("androidUrl", e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Link na App Store (iOS)">
            <input
              type="text"
              placeholder="https://apps.apple.com/..."
              value={str("iosUrl")}
              onChange={(e) => set("iosUrl", e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Link de fallback (opcional)">
            <input
              type="text"
              placeholder="Página própria caso não reconheça o aparelho"
              value={str("fallbackUrl")}
              onChange={(e) => set("fallbackUrl", e.target.value)}
              className={inputClass}
            />
          </Field>
          <p className="text-sm text-neutral-600">
            Preencha ao menos um link. Quem escanear é levado direto pra loja certa (Android ou
            iOS); em outros casos, vai pro fallback — ou, se ele ficar em branco, pra uma página
            simples com os botões que você preencheu.
          </p>
        </div>
      );

    case "LOCATION":
      return (
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Latitude">
            <input
              type="text"
              required
              inputMode="decimal"
              placeholder="-23.5505"
              value={str("lat")}
              onChange={(e) => set("lat", e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Longitude">
            <input
              type="text"
              required
              inputMode="decimal"
              placeholder="-46.6333"
              value={str("lng")}
              onChange={(e) => set("lng", e.target.value)}
              className={inputClass}
            />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Nome do local (opcional)">
              <input
                type="text"
                value={str("label")}
                onChange={(e) => set("label", e.target.value)}
                className={inputClass}
              />
            </Field>
          </div>
        </div>
      );

    case "SMS":
      return (
        <div className="space-y-4">
          <Field label="Número de telefone">
            <input
              type="text"
              required
              placeholder="+5511999999999"
              value={str("phone")}
              onChange={(e) => set("phone", e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Mensagem (opcional)">
            <textarea
              rows={3}
              value={str("message")}
              onChange={(e) => set("message", e.target.value)}
              className={inputClass}
            />
          </Field>
        </div>
      );

    case "EMAIL":
      return (
        <div className="space-y-4">
          <Field label="Destinatário">
            <input
              type="email"
              required
              value={str("to")}
              onChange={(e) => set("to", e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Assunto (opcional)">
            <input
              type="text"
              value={str("subject")}
              onChange={(e) => set("subject", e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Corpo (opcional)">
            <textarea
              rows={3}
              value={str("body")}
              onChange={(e) => set("body", e.target.value)}
              className={inputClass}
            />
          </Field>
        </div>
      );

    case "PHONE":
      return (
        <Field label="Número de telefone">
          <input
            type="text"
            required
            placeholder="+5511999999999"
            value={str("phone")}
            onChange={(e) => set("phone", e.target.value)}
            className={inputClass}
          />
        </Field>
      );

    case "WIFI":
      return (
        <div className="space-y-4">
          <Field label="Nome da rede (SSID)">
            <input
              type="text"
              required
              value={str("ssid")}
              onChange={(e) => set("ssid", e.target.value)}
              className={inputClass}
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Criptografia">
              <select
                value={str("encryption") || "WPA"}
                onChange={(e) => set("encryption", e.target.value)}
                className={inputClass}
              >
                <option value="WPA">WPA/WPA2</option>
                <option value="WEP">WEP</option>
                <option value="nopass">Sem senha</option>
              </select>
            </Field>
            {payload.encryption !== "nopass" && (
              <Field label="Senha">
                <input
                  type="text"
                  value={str("password")}
                  onChange={(e) => set("password", e.target.value)}
                  className={inputClass}
                />
              </Field>
            )}
          </div>
          <label className="flex items-center gap-2 text-sm text-neutral-700">
            <input
              type="checkbox"
              checked={Boolean(payload.hidden)}
              onChange={(e) => set("hidden", e.target.checked)}
            />
            Rede oculta
          </label>
        </div>
      );

    case "PIX":
      return (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Tipo de chave">
              <select
                value={str("keyType") || "CPF"}
                onChange={(e) => set("keyType", e.target.value)}
                className={inputClass}
              >
                {PIX_KEY_TYPES.map((k) => (
                  <option key={k.value} value={k.value}>
                    {k.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Chave Pix">
              <input
                type="text"
                required
                value={str("key")}
                onChange={(e) => set("key", e.target.value)}
                className={inputClass}
              />
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Nome do recebedor">
              <input
                type="text"
                required
                maxLength={25}
                value={str("name")}
                onChange={(e) => set("name", e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="Cidade">
              <input
                type="text"
                required
                maxLength={15}
                value={str("city")}
                onChange={(e) => set("city", e.target.value)}
                className={inputClass}
              />
            </Field>
          </div>
          <Field label="Valor em R$ (opcional)">
            <input
              type="text"
              inputMode="decimal"
              placeholder="Deixe em branco para o pagador digitar o valor"
              value={str("amount")}
              onChange={(e) => set("amount", e.target.value)}
              className={inputClass}
            />
            <p className="mt-1 text-sm text-neutral-600">
              Se deixar em branco, quem pagar vai digitar o valor no próprio app do banco.
            </p>
          </Field>
          <Field label="Descrição (opcional)">
            <input
              type="text"
              maxLength={60}
              value={str("description")}
              onChange={(e) => set("description", e.target.value)}
              className={inputClass}
            />
          </Field>
        </div>
      );
  }
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className={labelClass}>{label}</label>
      {children}
    </div>
  );
}

export type { QrPayloadMap };
