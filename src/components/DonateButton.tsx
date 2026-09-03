const DONATE_URL =
  process.env.NEXT_PUBLIC_PAYPAL_DONATE_URL ?? "https://www.paypal.com/donate";

export function DonateButton() {
  return (
    <a
      href={DONATE_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 whitespace-nowrap rounded-full border border-amber-300 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-900 transition-colors hover:bg-amber-100 sm:px-4"
    >
      <span aria-hidden="true">☕</span>
      <span className="hidden sm:inline">Apoiar com doação</span>
      <span className="sm:hidden">Doar</span>
    </a>
  );
}
