import { createElement, useCallback, useEffect, useMemo, useState } from "react";
import { Activity, Dumbbell, Plus, Save, Scale, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { Field, Select } from "@/components/forms/FormControls";
import { apiRequest } from "@/lib/api";
import { formatNumber, todayIso } from "@/lib/format";
import { useAuth } from "@/hooks/AuthContext";
import { useBreadCrumb } from "@/hooks/BreadCrumbContext";

const intervals = [
  { label: "7 days", value: 7 },
  { label: "30 days", value: 30 },
  { label: "3 months", value: 90 },
  { label: "6 months", value: 180 },
  { label: "1 year", value: 365 },
];

function parseEntryDate(date) {
  return new Date(`${date}T00:00:00`);
}

function intervalStartDate(days) {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - days + 1);
  return date;
}

function Stat({ icon: Icon, label, value, detail, onAdd }) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-1 text-2xl font-semibold">{value}</p>
          {detail && <p className="mt-3 text-sm text-muted-foreground">{detail}</p>}
        </div>
        <div className="flex items-center gap-2">
          {onAdd && (
            <Button variant="outline" size="icon" type="button" onClick={onAdd}>
              <Plus className="size-4" />
            </Button>
          )}
          <div className="hidden size-9 place-items-center rounded-lg bg-primary/10 text-primary sm:grid">
            {createElement(Icon, { className: "size-4" })}
          </div>
        </div>
      </div>
    </div>
  );
}

function AnalyticsSkeleton() {
  return (
    <>
      <section className="grid gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="rounded-lg border bg-card p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="mt-3 h-8 w-28" />
                <Skeleton className="mt-4 h-4 w-36" />
              </div>
              <Skeleton className="size-9 rounded-lg" />
            </div>
          </div>
        ))}
      </section>
      <section className="grid gap-6 xl:grid-cols-2">
        <Skeleton className="h-96 rounded-lg" />
        <Skeleton className="h-96 rounded-lg" />
      </section>
    </>
  );
}

function buildSmoothPath(points) {
  if (points.length === 1) {
    return `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
  }

  return points.reduce((path, point, index) => {
    if (index === 0) {
      return `M ${point.x.toFixed(1)} ${point.y.toFixed(1)}`;
    }

    const previous = points[index - 1];
    const controlDistance = (point.x - previous.x) / 2;
    return `${path} C ${(previous.x + controlDistance).toFixed(1)} ${previous.y.toFixed(1)}, ${(point.x - controlDistance).toFixed(1)} ${point.y.toFixed(1)}, ${point.x.toFixed(1)} ${point.y.toFixed(1)}`;
  }, "");
}

function LineGraph({ title, entries, valueKey, unit, color }) {
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const [interval, setInterval] = useState(30);
  const values = useMemo(() => {
    const startDate = intervalStartDate(interval);

    return entries
      .map((entry) => ({ date: entry.entryDate, value: entry[valueKey] == null ? null : Number(entry[valueKey]) }))
      .filter((entry) => parseEntryDate(entry.date) >= startDate)
      .filter((entry) => Number.isFinite(entry.value))
      .filter((entry) => valueKey !== "exerciseCalories" || entry.value > 0);
  }, [entries, interval, valueKey]);

  const width = 680;
  const height = 300;
  const padding = {
    top: 28,
    right: 26,
    bottom: 58,
    left: 58,
  };
  const plotBottom = height - padding.bottom;
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;

  const graphMeta = useMemo(() => {
    if (!values.length) {
      return {
        path: "",
        min: 0,
        max: 0,
        points: [],
      };
    }

    const min = Math.min(...values.map((entry) => entry.value));
    const max = Math.max(...values.map((entry) => entry.value));
    const range = max - min || 1;
    const step = values.length === 1 ? 0 : plotWidth / (values.length - 1);
    const points = values.map((entry, index) => {
      const x = padding.left + step * index;
      const y = plotBottom - ((entry.value - min) / range) * plotHeight;
      return { ...entry, x, y };
    });

    return {
      path: buildSmoothPath(points),
      min,
      max,
      points,
    };
  }, [padding.left, plotBottom, plotHeight, plotWidth, values]);

  const xTicks = graphMeta.points.length
    ? [graphMeta.points[0], graphMeta.points[Math.floor((graphMeta.points.length - 1) / 2)], graphMeta.points.at(-1)]
        .filter((point, index, list) => point && list.findIndex((item) => item.date === point.date) === index)
    : [];
  const tooltipMeta = hoveredPoint
    ? (() => {
        const text = `${hoveredPoint.date}: ${formatNumber(hoveredPoint.value)} ${unit}`;
        const tooltipWidth = Math.max(96, text.length * 7 + 16);
        const tooltipHeight = 28;
        const x = Math.min(width - tooltipWidth - 8, Math.max(8, hoveredPoint.x - tooltipWidth / 2));
        const y = hoveredPoint.y < padding.top + tooltipHeight + 12 ? hoveredPoint.y + 14 : hoveredPoint.y - tooltipHeight - 12;
        return { text, width: tooltipWidth, height: tooltipHeight, x, y };
      })()
    : null;

  return (
    <section className="rounded-lg border bg-card p-4">
      <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold">{title}</h2>
          <p className="text-sm text-muted-foreground">{values.length ? `${values.length} entries` : "No entries yet"}</p>
        </div>
        <div className="flex items-end justify-between gap-3 sm:justify-end">
          <label className="grid gap-1.5 text-sm font-medium">
            <span className="sr-only">Interval</span>
            <Select value={interval} onChange={(event) => setInterval(Number(event.target.value))}>
              {intervals.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </Select>
          </label>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-lg bg-muted/40">
        <svg viewBox={`0 0 ${width} ${height}`} className="h-72 w-full">
          <line x1={padding.left} y1={plotBottom} x2={width - padding.right} y2={plotBottom} stroke="currentColor" className="text-border" />
          <line x1={padding.left} y1={padding.top} x2={padding.left} y2={plotBottom} stroke="currentColor" className="text-border" />
          <text
            x={14}
            y={padding.top + plotHeight / 2}
            textAnchor="middle"
            transform={`rotate(-90 14 ${padding.top + plotHeight / 2})`}
            className="fill-muted-foreground text-xs"
          >
            {unit}
          </text>
          <text x={padding.left + plotWidth / 2} y={height - 10} textAnchor="middle" className="fill-muted-foreground text-xs">date</text>
          {graphMeta.path ? (
            <>
              <text x={padding.left - 8} y={padding.top + 4} textAnchor="end" className="fill-muted-foreground text-xs">{formatNumber(graphMeta.max)}</text>
              <text x={padding.left - 8} y={plotBottom + 4} textAnchor="end" className="fill-muted-foreground text-xs">{formatNumber(graphMeta.min)}</text>
              {xTicks.map((point) => (
                <text key={point.date} x={point.x} y={plotBottom + 20} textAnchor="middle" className="fill-muted-foreground text-xs">
                  {point.date.slice(5)}
                </text>
              ))}
              <path d={graphMeta.path} fill="none" stroke={color} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
              {graphMeta.points.map((point) => (
                <g key={point.date}>
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r="6"
                    fill={color}
                    onMouseEnter={() => setHoveredPoint(point)}
                    onMouseLeave={() => setHoveredPoint(null)}
                  >
                    <title>{`${point.date}: ${formatNumber(point.value)} ${unit}`}</title>
                  </circle>
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r="14"
                    fill="transparent"
                    onMouseEnter={() => setHoveredPoint(point)}
                    onMouseLeave={() => setHoveredPoint(null)}
                  />
                </g>
              ))}
              {tooltipMeta && (
                <g className="pointer-events-none">
                  <rect
                    x={tooltipMeta.x}
                    y={tooltipMeta.y}
                    width={tooltipMeta.width}
                    height={tooltipMeta.height}
                    rx="6"
                    fill="hsl(var(--popover))"
                    stroke="hsl(var(--border))"
                  />
                  <text
                    x={tooltipMeta.x + tooltipMeta.width / 2}
                    y={tooltipMeta.y + 18}
                    textAnchor="middle"
                    className="fill-popover-foreground text-xs"
                  >
                    {tooltipMeta.text}
                  </text>
                </g>
              )}
            </>
          ) : (
            <text x="50%" y="50%" textAnchor="middle" className="fill-muted-foreground text-sm">
              Add entries to see the trend
            </text>
          )}
        </svg>
      </div>
    </section>
  );
}

function EntryModal({ type, initialDate, onClose, onSave, isSaving }) {
  const [entryDate, setEntryDate] = useState(initialDate);
  const [value, setValue] = useState("");
  const isWeight = type === "weight";

  function handleSubmit(event) {
    event.preventDefault();
    onSave({
      entryDate,
      weightKg: isWeight ? Number(value) : null,
      exerciseCalories: isWeight ? null : Number(value),
    });
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-background/80 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-lg border bg-card p-4 shadow-lg">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold">{isWeight ? "Log weight" : "Log exercise burn"}</h2>
            <p className="text-sm text-muted-foreground">Save a daily analytics check-in.</p>
          </div>
          <Button variant="ghost" size="icon" type="button" onClick={onClose}>
            <X className="size-4" />
          </Button>
        </div>

        <form className="grid gap-4" onSubmit={handleSubmit}>
          <Field label="Date">
            <Input required type="date" value={entryDate} onChange={(event) => setEntryDate(event.target.value)} />
          </Field>
          <Field label={isWeight ? "Weight (kg)" : "Calories burned"}>
            <Input
              required
              type="number"
              min={isWeight ? "25" : "0"}
              max={isWeight ? "350" : "5000"}
              step={isWeight ? "0.1" : "1"}
              value={value}
              onChange={(event) => setValue(event.target.value)}
            />
          </Field>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? <Spinner /> : <Save className="size-4" />}
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </form>
      </div>
    </div>
  );
}

export default function Analytics() {
  const { token } = useAuth();
  const { setBreadCrumbTitle } = useBreadCrumb();
  const [summary, setSummary] = useState(null);
  const [modalType, setModalType] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setBreadCrumbTitle("Analytics");
  }, [setBreadCrumbTitle]);

  const loadAnalytics = useCallback(async () => {
    setError("");
    setIsLoadingAnalytics(true);
    try {
      setSummary(await apiRequest("/api/analytics", { token }));
    } catch (err) {
      setError(err.message || "Unable to load analytics.");
    } finally {
      setIsLoadingAnalytics(false);
    }
  }, [token]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadAnalytics();
  }, [loadAnalytics]);

  async function saveEntry(payload) {
    setMessage("");
    setError("");
    setIsSaving(true);

    try {
      await apiRequest("/api/analytics", {
        method: "POST",
        token,
        body: payload,
      });
      setModalType(null);
      await loadAnalytics();
      setMessage("Analytics entry saved.");
    } catch (err) {
      setError(err.message || "Unable to save analytics.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div>
        <div>
          <h1 className="text-2xl font-semibold">Analytics</h1>
          <p className="text-sm text-muted-foreground">Track weight trends and exercise burn over time.</p>
        </div>
      </div>

      {(message || error) && (
        <p className={`rounded-lg border p-3 text-sm ${error ? "border-destructive/30 bg-destructive/10 text-destructive" : "border-primary/30 bg-primary/10 text-primary"}`}>
          {error || message}
        </p>
      )}

      {isLoadingAnalytics ? (
        <AnalyticsSkeleton />
      ) : (
        <>
          <section className="grid gap-4 sm:grid-cols-3">
            <Stat icon={Scale} label="Latest weight" value={`${formatNumber(summary?.latestWeightKg, "--")} kg`} detail="Most recent entry" onAdd={() => setModalType("weight")} />
            <Stat icon={Activity} label="Weight change" value={`${formatNumber(summary?.weightChangeKg, "--")} kg`} detail="Between last two weight entries" />
            <Stat icon={Dumbbell} label="Exercise burn" value={`${formatNumber(summary?.totalExerciseCalories)} kcal`} detail="Logged exercise entries" onAdd={() => setModalType("exercise")} />
          </section>

          <section className="grid gap-6 xl:grid-cols-2">
            <LineGraph title="Weight trend" entries={summary?.entries || []} valueKey="weightKg" unit="kg" color="hsl(196 75% 42%)" />
            <LineGraph title="Exercise calories" entries={summary?.entries || []} valueKey="exerciseCalories" unit="kcal" color="hsl(142 55% 42%)" />
          </section>
        </>
      )}

      {modalType && (
        <EntryModal
          type={modalType}
          initialDate={todayIso()}
          isSaving={isSaving}
          onClose={() => setModalType(null)}
          onSave={saveEntry}
        />
      )}
    </div>
  );
}
