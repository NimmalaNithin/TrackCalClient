import { createElement, useEffect, useMemo, useState } from "react";
import { Activity, Flame, Goal, Plus, Settings, Utensils } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { apiRequest } from "@/lib/api";
import { clampPercent, formatNumber, todayIso } from "@/lib/format";
import { useAuth } from "@/hooks/AuthContext";
import { useBreadCrumb } from "@/hooks/BreadCrumbContext";

function getCalorieColor(consumed, target) {
  if (!target) {
    return "hsl(142 55% 42%)";
  }

  const ratio = Math.min(1.25, Math.max(0, consumed / target));
  const hue = Math.max(0, 142 - ratio * 142);
  return `hsl(${hue} 70% 42%)`;
}

function StatCard({
  icon: Icon,
  label,
  value,
  detail,
  accentColor,
  valueColor,
}) {
  return (
    <div className="rounded-lg border bg-card p-4 text-card-foreground">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p
            className="mt-1 text-2xl font-semibold"
            style={{ color: valueColor || undefined }}
          >
            {value}
          </p>
        </div>
        <div
          className="grid size-9 place-items-center rounded-lg bg-primary/10 text-primary"
          style={{
            backgroundColor: accentColor ? `${accentColor}20` : undefined,
            color: accentColor || undefined,
          }}
        >
          {createElement(Icon, { className: "size-4" })}
        </div>
      </div>
      {detail && <p className="mt-3 text-sm text-muted-foreground">{detail}</p>}
    </div>
  );
}

function HomeSkeleton() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <section className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <Skeleton className="h-4 w-16" />
          <Skeleton className="mt-3 h-9 w-64" />
        </div>
        <Skeleton className="h-8 w-28" />
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="rounded-lg border bg-card p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex-1">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="mt-3 h-8 w-32" />
              </div>
              <Skeleton className="size-9 rounded-lg" />
            </div>
            <Skeleton className="mt-4 h-4 w-36" />
          </div>
        ))}
      </section>

      <section className="rounded-lg border bg-card p-4">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="mt-2 h-4 w-48" />
        <Skeleton className="mt-5 h-2 w-full rounded-full" />
        <div className="mt-4 grid gap-3">
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
        </div>
      </section>
    </div>
  );
}

export default function Home() {
  const { token, user } = useAuth();
  const { setBreadCrumbTitle } = useBreadCrumb();
  const [profile, setProfile] = useState(null);
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const date = todayIso();

  useEffect(() => {
    setBreadCrumbTitle("Overview");
  }, [setBreadCrumbTitle]);

  useEffect(() => {
    async function loadDashboard() {
      setError("");
      setIsLoading(true);
      try {
        const [profileResponse, summaryResponse] = await Promise.all([
          apiRequest("/api/profile", { token }),
          apiRequest(`/api/meals?date=${date}`, { token }),
        ]);
        setProfile(profileResponse);
        setSummary(summaryResponse);
      } catch (err) {
        setError(err.message || "Unable to load your dashboard.");
      } finally {
        setIsLoading(false);
      }
    }

    loadDashboard();
  }, [date, token]);

  const remainingCalories = useMemo(() => {
    if (!summary?.calorieTarget) {
      return null;
    }

    return summary.calorieTarget - summary.calories;
  }, [summary]);

  const progress = clampPercent(
    summary?.calories || 0,
    summary?.calorieTarget || 0
  );
  const caloriePercent = summary?.calorieTarget
    ? Math.round(((summary?.calories || 0) / summary.calorieTarget) * 100)
    : 0;
  const calorieColor = getCalorieColor(
    summary?.calories || 0,
    summary?.calorieTarget || 0
  );

  if (isLoading) {
    return <HomeSkeleton />;
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <section className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Today</p>
          <h1 className="text-3xl font-semibold tracking-normal">
            Welcome back, {user?.firstName}
          </h1>
        </div>
        {profile && (
          <Button asChild>
            <Link to="/log-meal">
              <Plus className="size-4" />
              Add meal
            </Link>
          </Button>
        )}
      </section>

      {error && (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </p>
      )}

      {!profile ? (
        <section className="rounded-lg border bg-card p-6">
          <div className="mx-auto flex max-w-2xl flex-col items-start gap-4">
            <div className="grid size-11 place-items-center rounded-lg bg-primary/10 text-primary">
              <Settings className="size-5" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold">
                Set up your profile first
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Add your body details, goal, target weight, and deficit strategy
                so Track Cals can calculate maintenance calories and daily
                target calories.
              </p>
            </div>
            <Button asChild>
              <Link to="/profile">
                <Goal className="size-4" />
                Open profile
              </Link>
            </Button>
          </div>
        </section>
      ) : (
        <>
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              icon={Flame}
              label="Calories"
              value={`${formatNumber(summary?.calories)} kcal`}
              detail={`${caloriePercent}% of ${formatNumber(
                summary?.calorieTarget
              )} kcal`}
              accentColor={calorieColor}
              valueColor={calorieColor}
            />
            <StatCard
              icon={Goal}
              label="Remaining"
              value={`${formatNumber(
                Math.max(remainingCalories || 0, 0)
              )} kcal`}
              detail={
                remainingCalories && remainingCalories < 0
                  ? `${formatNumber(
                      Math.abs(remainingCalories)
                    )} kcal over target`
                  : "Available today"
              }
            />
            <StatCard
              icon={Activity}
              label="Maintenance"
              value={`${formatNumber(profile.maintenanceCalories)} kcal`}
              detail="Estimated daily burn"
            />
            <StatCard
              icon={Utensils}
              label="Target calories"
              value={`${formatNumber(summary?.calorieTarget)} kcal`}
              detail={`${formatNumber(summary?.meals?.length)} meals logged`}
            />
          </section>

          <section className="rounded-lg border bg-card p-4">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold">Today's log</h2>
                <p className="text-sm text-muted-foreground">
                  Meals saved for {date}
                </p>
              </div>
              <div className="hidden text-sm text-muted-foreground sm:block">
                {formatNumber(summary?.protein)}g protein /{" "}
                {formatNumber(summary?.carbs)}g carbs /{" "}
                {formatNumber(summary?.fat)}g fat
              </div>
            </div>

            <div className="mb-5 h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full"
                style={{ width: `${progress}%`, backgroundColor: calorieColor }}
              />
            </div>

            {summary?.meals?.length ? (
              <div className="divide-y">
                {summary.meals.map((meal) => (
                  <div
                    key={meal.id}
                    className="grid gap-2 py-3 sm:grid-cols-[1fr_auto] sm:items-center"
                  >
                    <div>
                      <p className="font-medium">{meal.name}</p>
                      <p className="text-sm text-muted-foreground capitalize">
                        {meal.mealType} / {meal.protein}g protein / {meal.carbs}
                        g carbs / {meal.fat}g fat
                      </p>
                    </div>
                    <p className="font-semibold">
                      {formatNumber(meal.calories)} kcal
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed p-8 text-center">
                <p className="font-medium">No meals logged yet</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Start with breakfast, lunch, dinner, or a snack.
                </p>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
