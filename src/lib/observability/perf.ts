type PerfMeta = Record<string, string | number | boolean | null | undefined>;

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

export async function measurePerf<T>(
  label: string,
  operation: () => Promise<T>,
  meta?: PerfMeta
): Promise<T> {
  const start = performance.now();

  try {
    return await operation();
  } finally {
    logPerf(label, performance.now() - start, meta);
  }
}
