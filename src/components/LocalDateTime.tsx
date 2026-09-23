"use client";

import { useSyncExternalStore } from "react";

const noopSubscribe = () => () => {};

/**
 * Data/hora no fuso de quem está vendo, sem erro de hidratação (React #418).
 * O servidor (container em UTC) e a primeira renderização no navegador usam o
 * mesmo fuso fixo; logo depois da hidratação troca pro fuso local do navegador.
 */
export function LocalDateTime({ value }: { value: string | Date }) {
  const hydrated = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false
  );
  const date = new Date(value);
  return (
    <time dateTime={date.toISOString()}>
      {date.toLocaleString("pt-BR", hydrated ? undefined : { timeZone: "America/Sao_Paulo" })}
    </time>
  );
}
