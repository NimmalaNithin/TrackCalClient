import { useEffect, useMemo, useRef, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDateLabel, parseIsoDate, todayIso, toIsoDate } from "@/lib/format";
import { cn } from "@/lib/utils";

const WEEK_DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function monthStart(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function monthKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function addMonths(date, amount) {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}

function buildMonthDays(viewDate) {
  const firstDay = monthStart(viewDate);
  const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
  const leadingBlanks = firstDay.getDay();

  return [
    ...Array.from({ length: leadingBlanks }, () => null),
    ...Array.from({ length: daysInMonth }, (_, index) => (
      new Date(viewDate.getFullYear(), viewDate.getMonth(), index + 1)
    )),
  ];
}

export default function DateSelector({ value, onChange, className }) {
  const containerRef = useRef(null);
  const today = todayIso();
  const currentMonth = monthStart(parseIsoDate(today));
  const selectedDate = value && value <= today ? value : today;
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(() => monthStart(parseIsoDate(selectedDate)));

  useEffect(() => {
    function handlePointerDown(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const monthDays = useMemo(() => buildMonthDays(viewDate), [viewDate]);
  const canGoNext = monthKey(viewDate) < monthKey(currentMonth);
  const monthLabel = new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(viewDate);

  function selectDate(date) {
    const dateIso = toIsoDate(date);
    if (dateIso > today) {
      return;
    }

    onChange(dateIso);
    setIsOpen(false);
  }

  return (
    <div ref={containerRef} className={cn("relative flex items-center justify-end gap-2", className)}>
      <span className="text-sm font-medium text-muted-foreground">
        {formatDateLabel(selectedDate)}
      </span>
      <Button
        variant="outline"
        size="icon"
        type="button"
        aria-expanded={isOpen}
        aria-label="Select date"
        onClick={() => {
          if (!isOpen) {
            setViewDate(monthStart(parseIsoDate(selectedDate)));
          }
          setIsOpen((current) => !current);
        }}
      >
        <CalendarDays className="size-4" />
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-10 z-50 w-[min(20rem,calc(100vw-2rem))] rounded-lg border bg-popover p-3 text-popover-foreground shadow-lg">
          <div className="mb-3 flex items-center justify-between gap-2">
            <Button
              variant="ghost"
              size="icon-sm"
              type="button"
              aria-label="Previous month"
              onClick={() => setViewDate((current) => addMonths(current, -1))}
            >
              <ChevronLeft className="size-4" />
            </Button>
            <p className="text-sm font-semibold">{monthLabel}</p>
            <Button
              variant="ghost"
              size="icon-sm"
              type="button"
              aria-label="Next month"
              disabled={!canGoNext}
              onClick={() => setViewDate((current) => addMonths(current, 1))}
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground">
            {WEEK_DAYS.map((day) => (
              <div key={day} className="py-1">{day}</div>
            ))}
          </div>
          <div className="mt-1 grid grid-cols-7 gap-1">
            {monthDays.map((date, index) => {
              if (!date) {
                return <div key={`blank-${index}`} className="size-8" />;
              }

              const dateIso = toIsoDate(date);
              const isFuture = dateIso > today;
              const isSelected = dateIso === selectedDate;

              return (
                <Button
                  key={dateIso}
                  variant={isSelected ? "default" : "ghost"}
                  size="icon"
                  type="button"
                  disabled={isFuture}
                  className="size-8"
                  onClick={() => selectDate(date)}
                >
                  {date.getDate()}
                </Button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
