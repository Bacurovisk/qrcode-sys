import Link from "next/link";

export type Crumb = { label: string; href?: string };

/** Trilha de navegação do dashboard. O último item é a página atual (sem link). */
export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Trilha de navegação" className="mb-4 text-sm">
      <ol className="flex min-w-0 items-center gap-1.5 text-neutral-600">
        {items.map((item, i) => {
          const isCurrent = i === items.length - 1;
          return (
            <li
              key={`${i}-${item.label}`}
              className={`flex items-center gap-1.5 ${isCurrent ? "min-w-0" : "shrink-0"}`}
            >
              {i > 0 && (
                <span aria-hidden="true" className="text-neutral-400">
                  ›
                </span>
              )}
              {item.href && !isCurrent ? (
                <Link href={item.href} className="hover:text-neutral-900 hover:underline">
                  {item.label}
                </Link>
              ) : (
                // Nome longo de QR code: corta com reticências em vez de quebrar a linha.
                <span aria-current="page" className="truncate font-medium text-neutral-900" title={item.label}>
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
