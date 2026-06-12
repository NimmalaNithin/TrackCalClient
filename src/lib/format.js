export function todayIso() {
  return toIsoDate(new Date());
}

export function addDaysIso(dateIso, days) {
  const date = parseIsoDate(dateIso);
  date.setDate(date.getDate() + days);
  return toIsoDate(date);
}

export function parseIsoDate(dateIso) {
  const [year, month, day] = dateIso.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function toIsoDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function formatDateLabel(dateIso) {
  const today = todayIso();
  const yesterday = addDaysIso(today, -1);

  if (dateIso === today) {
    return "Today";
  }

  if (dateIso === yesterday) {
    return "Yesterday";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(parseIsoDate(dateIso));
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
