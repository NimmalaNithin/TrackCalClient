import { useCallback, useEffect, useState } from "react";
import { Calculator, Save, Trash2, UserRound, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { Field, Select, numberOrNull } from "@/components/forms/FormControls";
import { apiRequest } from "@/lib/api";
import { formatNumber } from "@/lib/format";
import { useAuth } from "@/hooks/AuthContext";
import { useBreadCrumb } from "@/hooks/BreadCrumbContext";

const profileDefaults = {
  age: "",
  sex: "male",
  heightCm: "",
  weightKg: "",
  targetWeightKg: "",
  activityLevel: "moderate",
  goal: "maintain",
  targetStrategy: "timeline",
  targetDate: "",
  dailyDeficit: "400",
};

function tomorrowIso() {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  return date.toISOString().slice(0, 10);
}

export default function Profile() {
  const { token, user, logout } = useAuth();
  const navigate = useNavigate();
  const { setBreadCrumbTitle } = useBreadCrumb();
  const [form, setForm] = useState(profileDefaults);
  const [profile, setProfile] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteAcknowledged, setDeleteAcknowledged] = useState(false);
  const [deletePhrase, setDeletePhrase] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    setBreadCrumbTitle("Profile");
  }, [setBreadCrumbTitle]);

  const loadProfile = useCallback(async () => {
    setError("");
    setIsLoadingProfile(true);
    try {
      const response = await apiRequest("/api/profile", { token });
      setProfile(response);
      if (response) {
        setForm({
          age: String(response.age || ""),
          sex: response.sex || "male",
          heightCm: String(response.heightCm || ""),
          weightKg: String(response.weightKg || ""),
          targetWeightKg: String(response.targetWeightKg || ""),
          activityLevel: response.activityLevel || "moderate",
          goal: response.goal || "maintain",
          targetStrategy: response.targetStrategy || "timeline",
          targetDate: response.targetDate || "",
          dailyDeficit: String(response.dailyDeficit ?? 400),
        });
      }
    } catch (err) {
      setError(err.message || "Unable to load profile.");
    } finally {
      setIsLoadingProfile(false);
    }
  }, [token]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadProfile();
  }, [loadProfile]);

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function closeDeleteDialog() {
    setIsDeleteOpen(false);
    setDeleteAcknowledged(false);
    setDeletePhrase("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");
    setError("");
    setIsSaving(true);

    try {
      const response = await apiRequest("/api/profile", {
        method: "PUT",
        token,
        body: {
          ...form,
          age: Number(form.age),
          heightCm: Number(form.heightCm),
          weightKg: Number(form.weightKg),
          targetWeightKg: numberOrNull(form.targetWeightKg),
          targetDate: form.targetStrategy === "timeline" ? form.targetDate || tomorrowIso() : null,
          dailyDeficit: form.targetStrategy === "manual" ? Number(form.dailyDeficit) : null,
        },
      });
      setProfile(response);
      setMessage("Profile and calorie targets saved.");
    } catch (err) {
      setError(err.message || "Unable to save profile.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDeleteProfile() {
    setMessage("");
    setError("");
    setIsDeleting(true);

    try {
      await apiRequest("/api/profile", {
        method: "DELETE",
        token,
      });
      logout();
      closeDeleteDialog();
      navigate("/login", { replace: true });
    } catch (err) {
      setError(err.message || "Unable to delete account.");
    } finally {
      setIsDeleting(false);
    }
  }

  const canDeleteProfile = deleteAcknowledged && deletePhrase.trim() === "DELETE ACCOUNT" && !isDeleting;

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
      <section className="order-2 rounded-lg border bg-card p-4 sm:p-5 xl:order-1">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold">Profile</h1>
          </div>
          <div className="grid size-10 place-items-center rounded-lg bg-primary/10 text-primary">
            <UserRound className="size-5" />
          </div>
        </div>

        <form className="grid gap-4 sm:grid-cols-2" onSubmit={handleSubmit}>
          <Field label="First name">
            <Input value={user?.firstName || ""} readOnly disabled />
          </Field>
          <Field label="Last name">
            <Input value={user?.lastName || ""} readOnly disabled />
          </Field>
          <Field label="Email">
            <Input className="sm:col-span-2" value={user?.email || ""} readOnly disabled />
          </Field>
          <Field label="Age">
            <Input min="13" max="120" step="1" required type="number" value={form.age} onChange={(event) => updateField("age", event.target.value)} />
          </Field>
          <Field label="Sex">
            <Select value={form.sex} onChange={(event) => updateField("sex", event.target.value)}>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </Select>
          </Field>
          <Field label="Height (cm)">
            <Input min="90" max="250" step="0.01" required type="number" value={form.heightCm} onChange={(event) => updateField("heightCm", event.target.value)} />
          </Field>
          <Field label="Current weight (kg)">
            <Input min="25" max="350" step="0.01" required type="number" value={form.weightKg} onChange={(event) => updateField("weightKg", event.target.value)} />
          </Field>
          <Field label="Target weight (kg)">
            <Input min="25" max="350" step="0.01" type="number" value={form.targetWeightKg} onChange={(event) => updateField("targetWeightKg", event.target.value)} />
          </Field>
          <Field label="Activity level">
            <Select value={form.activityLevel} onChange={(event) => updateField("activityLevel", event.target.value)}>
              <option value="sedentary">Sedentary</option>
              <option value="light">Light</option>
              <option value="moderate">Moderate</option>
              <option value="active">Active</option>
              <option value="athlete">Athlete</option>
            </Select>
          </Field>
          <Field label="Goal">
            <Select value={form.goal} onChange={(event) => updateField("goal", event.target.value)}>
              <option value="lose">Lose weight</option>
              <option value="maintain">Maintain weight</option>
              <option value="gain">Gain weight</option>
            </Select>
          </Field>
          <Field label="Target method">
            <Select value={form.targetStrategy} onChange={(event) => updateField("targetStrategy", event.target.value)}>
              <option value="timeline">Reach target by date range</option>
              <option value="manual">Set daily deficit manually</option>
            </Select>
          </Field>

          {form.targetStrategy === "timeline" ? (
            <Field label="Target date">
              <Input
                min={tomorrowIso()}
                required
                type="date"
                value={form.targetDate || tomorrowIso()}
                onChange={(event) => updateField("targetDate", event.target.value)}
              />
            </Field>
          ) : (
            <Field label="Daily deficit">
              <Input min="-1000" max="1000" required type="number" value={form.dailyDeficit} onChange={(event) => updateField("dailyDeficit", event.target.value)} />
            </Field>
          )}

          <div className="flex flex-col gap-2 sm:col-span-2 sm:flex-row sm:items-end sm:justify-between">
            <Button type="submit" disabled={isSaving}>
              {isSaving ? <Spinner /> : <Save className="size-4" />}
              {isSaving ? "Saving..." : "Save profile"}
            </Button>
            <Button type="button" variant="destructive" onClick={() => setIsDeleteOpen(true)}>
              <Trash2 className="size-4" />
              Delete account
            </Button>
          </div>
        </form>
      </section>

      <aside className="order-1 grid content-start gap-4 xl:order-2">
        {(message || error) && (
          <p className={`rounded-lg border p-3 text-sm ${error ? "border-destructive/30 bg-destructive/10 text-destructive" : "border-primary/30 bg-primary/10 text-primary"}`}>
            {error || message}
          </p>
        )}

        <section className="rounded-lg border bg-card p-4">
          <div className="mb-4 flex items-center gap-2">
            <Calculator className="size-5 text-primary" />
            <h2 className="text-xl font-semibold">Calorie target</h2>
          </div>
          {isLoadingProfile ? (
            <div className="grid grid-cols-2 gap-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="rounded-lg bg-muted p-3">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="mt-3 h-7 w-16" />
                </div>
              ))}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-muted p-3">
                  <p className="text-sm text-muted-foreground">Maintenance</p>
                  <p className="text-xl font-semibold">{formatNumber(profile?.maintenanceCalories, "--")}</p>
                </div>
                <div className="rounded-lg bg-muted p-3">
                  <p className="text-sm text-muted-foreground">Target</p>
                  <p className="text-xl font-semibold">{formatNumber(profile?.calorieTarget, "--")}</p>
                </div>
                <div className="rounded-lg bg-muted p-3">
                  <p className="text-sm text-muted-foreground">Daily deficit</p>
                  <p className="text-xl font-semibold">{formatNumber(profile?.dailyDeficit, "--")}</p>
                </div>
                <div className="rounded-lg bg-muted p-3">
                  <p className="text-sm text-muted-foreground">Protein</p>
                  <p className="text-xl font-semibold">{formatNumber(profile?.proteinTarget, "--")}g</p>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-muted p-3">
                  <p className="text-sm text-muted-foreground">Carbs</p>
                  <p className="text-xl font-semibold">{formatNumber(profile?.carbTarget, "--")}g</p>
                </div>
                <div className="rounded-lg bg-muted p-3">
                  <p className="text-sm text-muted-foreground">Fat</p>
                  <p className="text-xl font-semibold">{formatNumber(profile?.fatTarget, "--")}g</p>
                </div>
              </div>
            </>
          )}
        </section>

      </aside>

      {isDeleteOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-background/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-lg border bg-card p-4 shadow-lg sm:p-5">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold">Delete account?</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  This removes your login account, profile, meals, analytics, and calorie targets.
                </p>
              </div>
              <Button type="button" variant="ghost" size="icon" onClick={closeDeleteDialog} aria-label="Close delete account dialog">
                <X className="size-4" />
              </Button>
            </div>

            <label className="mb-4 flex gap-3 rounded-lg border p-3 text-sm">
              <input
                className="mt-1 size-4 accent-destructive"
                type="checkbox"
                checked={deleteAcknowledged}
                onChange={(event) => setDeleteAcknowledged(event.target.checked)}
              />
              <span>I understand this will permanently delete my account and all related records.</span>
            </label>

            <Field label='Type "DELETE ACCOUNT" to confirm'>
              <Input value={deletePhrase} onChange={(event) => setDeletePhrase(event.target.value)} autoComplete="off" />
            </Field>

            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button type="button" variant="outline" onClick={closeDeleteDialog} disabled={isDeleting}>
                Cancel
              </Button>
              <Button type="button" variant="destructive" onClick={handleDeleteProfile} disabled={!canDeleteProfile}>
                {isDeleting ? <Spinner /> : <Trash2 className="size-4" />}
                {isDeleting ? "Deleting..." : "Delete account"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
