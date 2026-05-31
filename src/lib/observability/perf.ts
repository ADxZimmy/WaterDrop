type PerfMeta = Record<string, string | number | boolean | null | undefined>;
type PerfMetaInput<T> = PerfMeta | ((result: T | undefined) => PerfMeta | undefined);

function isPerfLoggingEnabled() {
  return process.env.WATERDROP_PERF_LOGS !== "0";
}

function formatMeta(meta: PerfMeta | undefined) {
  if (!meta) {
    return "";
  }

  const entries = Object.entries(meta).filter(([, value]) => value !== undefined);
  if (entries.length === 0) {
    return "";
  }

  return ` ${entries.map(([key, value]) => `${key}=${String(value)}`).join(" ")}`;
}

export function logPerf(label: string, durationMs: number, meta?: PerfMeta) {
  if (!isPerfLoggingEnabled()) {
    return;
  }

  console.info(`[perf] ${label} duration_ms=${Math.round(durationMs)}${formatMeta(meta)}`);
}

export function logBroadReadWarning(
  label: string,
  documentCount: number,
  threshold: number,
  meta?: PerfMeta
) {
  if (!isPerfLoggingEnabled() || documentCount <= threshold) {
    return;
  }

  console.warn(
    `[perf] ${label} broad_read_docs=${documentCount} threshold=${threshold}${formatMeta(meta)}`
  );
}

export async function measurePerf<T>(
  label: string,
  operation: () => Promise<T>,
  meta?: PerfMetaInput<T>
): Promise<T> {
  const start = performance.now();
  let result: T | undefined;

  try {
    result = await operation();
    return result;
  } finally {
    const resolvedMeta = typeof meta === "function" ? meta(result) : meta;
    logPerf(label, performance.now() - start, resolvedMeta);
  }
}
