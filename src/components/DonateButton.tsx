const DONATE_URL =
  process.env.NEXT_PUBLIC_PAYPAL_DONATE_URL ?? "https://www.paypal.com/donate";

export function DonateButton() {
  return (
    <a
      href={DONATE_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 rounded-full border border-amber-300 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-800 hover:bg-amber-100 transition-colors"
    >
      ☕ Apoiar com doação
    </a>
  );
}
