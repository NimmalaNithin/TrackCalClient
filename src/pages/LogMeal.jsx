import { useCallback, useEffect, useState } from "react";
import { Flame, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { Field, Select, numberOrNull } from "@/components/forms/FormControls";
import { apiRequest } from "@/lib/api";
import { formatNumber, todayIso } from "@/lib/format";
import { useAuth } from "@/hooks/AuthContext";
import { useBreadCrumb } from "@/hooks/BreadCrumbContext";

const mealDefaults = {
  name: "",
  mealType: "breakfast",
  entryDate: todayIso(),
  calories: "",
  protein: "",
  carbs: "",
  fat: "",
};

export default function LogMeal() {
  const { token } = useAuth();
  const { setBreadCrumbTitle } = useBreadCrumb();
  const [mealForm, setMealForm] = useState(mealDefaults);
  const [summary, setSummary] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoadingMeals, setIsLoadingMeals] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingMealId, setDeletingMealId] = useState(null);

  useEffect(() => {
    setBreadCrumbTitle("Log Meal");
  }, [setBreadCrumbTitle]);

  const loadMeals = useCallback(async (date = mealForm.entryDate) => {
    setError("");
    setIsLoadingMeals(true);
    try {
      setSummary(await apiRequest(`/api/meals?date=${date}`, { token }));
    } catch (err) {
      setError(err.message || "Unable to load meals.");
    } finally {
      setIsLoadingMeals(false);
    }
  }, [mealForm.entryDate, token]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadMeals();
  }, [loadMeals]);

  function updateField(field, value) {
    setMealForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");
    setError("");
    setIsSaving(true);

    try {
      await apiRequest("/api/meals", {
        method: "POST",
        token,
        body: {
          ...mealForm,
          calories: Number(mealForm.calories),
          protein: numberOrNull(mealForm.protein),
          carbs: numberOrNull(mealForm.carbs),
          fat: numberOrNull(mealForm.fat),
        },
      });
      setMealForm((current) => ({ ...mealDefaults, entryDate: current.entryDate }));
      await loadMeals(mealForm.entryDate);
      setMessage("Meal logged.");
    } catch (err) {
      setError(err.message || "Unable to log meal.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDeleteMeal(id) {
    setMessage("");
    setError("");
    setDeletingMealId(id);
    try {
      await apiRequest(`/api/meals/${id}`, { method: "DELETE", token });
      await loadMeals(mealForm.entryDate);
      setMessage("Meal removed.");
    } catch (err) {
      setError(err.message || "Unable to remove meal.");
    } finally {
      setDeletingMealId(null);
    }
  }

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
      <section className="rounded-lg border bg-card p-4 sm:p-5">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold">Log meal</h1>
            <p className="text-sm text-muted-foreground">Track food against your daily target.</p>
          </div>
          <Flame className="size-5 text-primary" />
        </div>

        <form className="grid gap-4 sm:grid-cols-2" onSubmit={handleSubmit}>
          <Field label="Meal name">
            <Input required value={mealForm.name} onChange={(event) => updateField("name", event.target.value)} placeholder="Chicken rice bowl" />
          </Field>
          <Field label="Meal type">
            <Select value={mealForm.mealType} onChange={(event) => updateField("mealType", event.target.value)}>
              <option value="breakfast">Breakfast</option>
              <option value="lunch">Lunch</option>
              <option value="dinner">Dinner</option>
              <option value="snack">Snack</option>
            </Select>
          </Field>
          <Field label="Date">
            <Input required type="date" value={mealForm.entryDate} onChange={(event) => {
              updateField("entryDate", event.target.value);
              loadMeals(event.target.value);
            }} />
          </Field>
          <Field label="Calories">
            <Input min="0" max="10000" required type="number" value={mealForm.calories} onChange={(event) => updateField("calories", event.target.value)} />
          </Field>
          <Field label="Protein (g)">
            <Input min="0" type="number" value={mealForm.protein} onChange={(event) => updateField("protein", event.target.value)} />
          </Field>
          <Field label="Carbs (g)">
            <Input min="0" type="number" value={mealForm.carbs} onChange={(event) => updateField("carbs", event.target.value)} />
          </Field>
          <Field label="Fat (g)">
            <Input min="0" type="number" value={mealForm.fat} onChange={(event) => updateField("fat", event.target.value)} />
          </Field>
          <div className="flex items-end">
            <Button className="w-full sm:w-auto" type="submit" disabled={isSaving}>
              {isSaving ? <Spinner /> : <Save className="size-4" />}
              {isSaving ? "Logging..." : "Log meal"}
            </Button>
          </div>
        </form>
      </section>

      <aside className="grid content-start gap-4">
        {(message || error) && (
          <p className={`rounded-lg border p-3 text-sm ${error ? "border-destructive/30 bg-destructive/10 text-destructive" : "border-primary/30 bg-primary/10 text-primary"}`}>
            {error || message}
          </p>
        )}

        <section className="rounded-lg border bg-card p-4">
          <h2 className="text-xl font-semibold">Meals on {mealForm.entryDate}</h2>
          {isLoadingMeals ? (
            <Skeleton className="mt-2 h-4 w-28" />
          ) : (
            <p className="mt-1 text-sm text-muted-foreground">{formatNumber(summary?.calories)} kcal logged</p>
          )}
          <div className="mt-4 divide-y">
            {isLoadingMeals ? (
              <div className="grid gap-3 py-2">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : summary?.meals?.length ? (
              summary.meals.map((meal) => (
                <div key={meal.id} className="flex items-center gap-3 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{meal.name}</p>
                    <p className="text-sm text-muted-foreground capitalize">{meal.mealType} / {meal.calories} kcal</p>
                  </div>
                  <Button variant="ghost" size="icon" type="button" onClick={() => handleDeleteMeal(meal.id)} disabled={deletingMealId === meal.id}>
                    {deletingMealId === meal.id ? <Spinner /> : <Trash2 className="size-4" />}
                  </Button>
                </div>
              ))
            ) : (
              <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">No meals for this date.</p>
            )}
          </div>
        </section>
      </aside>
    </div>
  );
}
