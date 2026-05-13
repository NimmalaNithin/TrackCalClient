export function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export function formatNumber(value, fallback = "0") {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return fallback;
  }

  return new Intl.NumberFormat("en-US").format(Number(value));
}

export function clampPercent(value, total) {
  if (!total || total <= 0) {
    return 0;
  }

  return Math.min(100, Math.max(0, Math.round((value / total) * 100)));
}
