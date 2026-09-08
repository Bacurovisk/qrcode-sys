// Limitador em memória, single-process — adequado pro deploy atual (um único
// container `app`, sem múltiplas réplicas). Zera em cada restart/redeploy;
// se o app passar a escalar horizontalmente, isso precisa virar algo
// compartilhado (Postgres/Redis) para continuar valendo entre instâncias.

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

// Evita crescimento ilimitado do Map sob tráfego de IPs variados: quando
// passa do teto, varre e descarta janelas já expiradas.
const MAX_BUCKETS = 50_000;

function sweepExpired(now: number) {
  if (buckets.size < MAX_BUCKETS) return;
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

/** Janela fixa: `limit` requisições por `windowMs` para a mesma `key`. */
export function checkRateLimit(
  key: string,
  { limit, windowMs }: { limit: number; windowMs: number }
): boolean {
  const now = Date.now();
  sweepExpired(now);

  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (bucket.count >= limit) return false;

  bucket.count += 1;
  return true;
}
