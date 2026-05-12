"use client";

import { useEffect, useState } from "react";
import {
  User,
  Thermometer,
  HeartPulse,
  Scale,
  Activity,
  Droplets,
  Baby,
  AlertCircle,
  CheckCircle2,
  X,
} from "lucide-react";
import { Card, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { useAuth } from "@/providers/AuthProvider";
import { submitHealthProfile, getHealthProfile } from "@/services/health.service";

const symptomsList = [
  "Fever",
  "Headache",
  "Cough",
  "Chest Pain",
  "Dizziness",
  "Vomiting",
  "Diarrhea",
  "Weakness",
  "High Blood Pressure",
  "Shortness of Breath",
  "Abdominal Pain",
  "Back Pain",
];

const conditionsList = [
  "Diabetes",
  "Hypertension",
  "Heart Disease",
  "Asthma",
  "Thyroid Disorder",
  "Kidney Disease",
  "None",
];

export default function HealthInputPage() {
  const { user, updateProfile } = useAuth();

  // Profile
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  const [activityLevel, setActivityLevel] = useState("moderate");
  const [pregnancy, setPregnancy] = useState("no");
  const [allergies, setAllergies] = useState("");

  // Vitals
  const [temperature, setTemperature] = useState("");
  const [bpSystolic, setBpSystolic] = useState("");
  const [bpDiastolic, setBpDiastolic] = useState("");
  const [bloodSugar, setBloodSugar] = useState("");

  // Symptoms
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);

  // UI
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [prefilling, setPrefilling] = useState(true);

  // Pre-fill from existing health profile and user data
  useEffect(() => {
    if (user?.blood_group) setBloodGroup(user.blood_group);

    getHealthProfile()
      .then((profile) => {
        if (profile) {
          if (profile.age) setAge(String(profile.age));
          if (profile.gender) setGender(profile.gender);
          if (profile.height_cm) setHeight(String(profile.height_cm));
          if (profile.weight_kg) setWeight(String(profile.weight_kg));
          if (profile.activity_level) setActivityLevel(profile.activity_level);
          if (profile.pregnancy_status) setPregnancy(profile.pregnancy_status);
          if (profile.allergies) setAllergies(profile.allergies);
          if (profile.temperature_f) setTemperature(String(profile.temperature_f));
          if (profile.bp_systolic) setBpSystolic(String(profile.bp_systolic));
          if (profile.bp_diastolic) setBpDiastolic(String(profile.bp_diastolic));
          if (profile.blood_sugar) setBloodSugar(String(profile.blood_sugar));
          if (profile.symptoms && profile.symptoms.length > 0) setSelectedSymptoms(profile.symptoms);
          if (profile.conditions && profile.conditions.length > 0) setSelectedConditions(profile.conditions);
        }
      })
      .catch(() => {})
      .finally(() => setPrefilling(false));
  }, [user]);

  const bmi =
    height && weight
      ? (parseFloat(weight) / (parseFloat(height) / 100) ** 2).toFixed(1)
      : "—";

  function toggleChip(list: string[], item: string, setter: (v: string[]) => void) {
    setter(list.includes(item) ? list.filter((s) => s !== item) : [...list, item]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await submitHealthProfile({
        age: age ? parseInt(age) : null,
        gender: gender || null,
        height_cm: height ? parseFloat(height) : null,
        weight_kg: weight ? parseFloat(weight) : null,
        activity_level: activityLevel || null,
        pregnancy_status: pregnancy || null,
        allergies: allergies || null,
        temperature_f: temperature ? parseFloat(temperature) : null,
        bp_systolic: bpSystolic ? parseInt(bpSystolic) : null,
        bp_diastolic: bpDiastolic ? parseInt(bpDiastolic) : null,
        blood_sugar: bloodSugar ? parseFloat(bloodSugar) : null,
        symptoms: selectedSymptoms,
        conditions: selectedConditions.filter((c) => c !== "None"),
      });

      const bg = bloodGroup.trim();
      if (bg && bg !== (user?.blood_group ?? "").trim()) {
        try {
          await updateProfile({ blood_group: bg });
        } catch {
          /* health log saved; account blood group can be updated from Settings */
        }
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 4000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save health data.");
    } finally {
      setLoading(false);
    }
  }

  if (prefilling) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex items-center gap-3 text-[color:var(--muted)]">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-[color:var(--muted)]/30 border-t-[color:var(--primary)]" />
          Loading your health profile...
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Success toast */}
      {saved && (
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-500/25 bg-emerald-500/8 px-5 py-3 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 size={18} strokeWidth={2} />
          Health data saved successfully!
        </div>
      )}

      {/* Error toast */}
      {error && (
        <div className="flex items-center gap-3 rounded-2xl border border-red-500/25 bg-red-500/8 px-5 py-3 text-sm font-semibold text-red-600 dark:text-red-400">
          <AlertCircle size={18} strokeWidth={2} />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Profile section */}
        <Card>
          <div className="flex items-center gap-3 mb-5">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-[color:var(--primary)]/12">
              <User size={20} strokeWidth={2} className="text-[color:var(--primary)]" />
            </div>
            <div>
              <CardTitle>Health Profile</CardTitle>
              <CardDescription>Basic information for personalized advice</CardDescription>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Input
              id="age"
              label="Age"
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="e.g. 32"
            />
            <Select
              id="gender"
              label="Gender"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              options={[
                { value: "", label: "Select gender" },
                { value: "male", label: "Male" },
                { value: "female", label: "Female" },
                { value: "other", label: "Other" },
              ]}
            />
            <Input
              id="height"
              label="Height (cm)"
              type="number"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              placeholder="e.g. 170"
            />
            <Input
              id="weight"
              label="Weight (kg)"
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="e.g. 72"
            />
            <div className="grid gap-1.5">
              <label className="text-sm font-semibold text-[color:var(--foreground)]">BMI</label>
              <div className="flex h-[46px] items-center rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-muted)] px-4">
                <span className="text-lg font-black text-[color:var(--foreground)]">{bmi}</span>
                <span className="ml-2 text-xs text-[color:var(--muted)]">kg/m²</span>
              </div>
            </div>
            <Select
              id="bloodGroup"
              label="Blood Group"
              icon={<Droplets size={16} strokeWidth={2} />}
              value={bloodGroup}
              onChange={(e) => setBloodGroup(e.target.value)}
              options={[
                { value: "", label: "Select" },
                ...["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((b) => ({
                  value: b,
                  label: b,
                })),
              ]}
            />
            <Select
              id="activity"
              label="Activity Level"
              icon={<Activity size={16} strokeWidth={2} />}
              value={activityLevel}
              onChange={(e) => setActivityLevel(e.target.value)}
              options={[
                { value: "sedentary", label: "Sedentary" },
                { value: "light", label: "Light" },
                { value: "moderate", label: "Moderate" },
                { value: "active", label: "Active" },
              ]}
            />
            <Select
              id="pregnancy"
              label="Pregnancy Status"
              icon={<Baby size={16} strokeWidth={2} />}
              value={pregnancy}
              onChange={(e) => setPregnancy(e.target.value)}
              options={[
                { value: "no", label: "Not applicable" },
                { value: "yes", label: "Currently pregnant" },
                { value: "postpartum", label: "Postpartum" },
              ]}
            />
            <Input
              id="allergies"
              label="Allergies"
              value={allergies}
              onChange={(e) => setAllergies(e.target.value)}
              placeholder="e.g. Peanuts, Shrimp"
            />
          </div>
        </Card>

        {/* Vital Signs */}
        <Card>
          <div className="flex items-center gap-3 mb-5">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-red-500/12">
              <HeartPulse size={20} strokeWidth={2} className="text-red-500" />
            </div>
            <div>
              <CardTitle>Vital Signs</CardTitle>
              <CardDescription>Current readings for health monitoring</CardDescription>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Input
              id="temperature"
              label="Temperature (°F)"
              icon={<Thermometer size={16} strokeWidth={2} />}
              type="number"
              step="0.1"
              value={temperature}
              onChange={(e) => setTemperature(e.target.value)}
              placeholder="98.6"
            />
            <Input
              id="bpSystolic"
              label="BP Systolic (mmHg)"
              icon={<HeartPulse size={16} strokeWidth={2} />}
              type="number"
              value={bpSystolic}
              onChange={(e) => setBpSystolic(e.target.value)}
              placeholder="120"
            />
            <Input
              id="bpDiastolic"
              label="BP Diastolic (mmHg)"
              icon={<HeartPulse size={16} strokeWidth={2} />}
              type="number"
              value={bpDiastolic}
              onChange={(e) => setBpDiastolic(e.target.value)}
              placeholder="80"
            />
            <Input
              id="bloodSugar"
              label="Blood Sugar (mg/dL)"
              icon={<Droplets size={16} strokeWidth={2} />}
              type="number"
              value={bloodSugar}
              onChange={(e) => setBloodSugar(e.target.value)}
              placeholder="Optional"
            />
          </div>

          {/* BP warning */}
          {parseInt(bpSystolic) >= 140 && (
            <div className="mt-4 flex items-center gap-2 rounded-xl border border-amber-500/25 bg-amber-500/8 px-4 py-3 text-sm font-semibold text-amber-600 dark:text-amber-400">
              <AlertCircle size={16} strokeWidth={2} />
              Blood pressure reading is above normal range. Consider consulting a doctor.
            </div>
          )}
        </Card>

        {/* Symptoms */}
        <Card>
          <div className="flex items-center gap-3 mb-5">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-amber-500/12">
              <AlertCircle size={20} strokeWidth={2} className="text-amber-500" />
            </div>
            <div>
              <CardTitle>Symptoms</CardTitle>
              <CardDescription>Select any current symptoms you're experiencing</CardDescription>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {symptomsList.map((s) => {
              const selected = selectedSymptoms.includes(s);
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggleChip(selectedSymptoms, s, setSelectedSymptoms)}
                  className={[
                    "inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-semibold transition-all duration-200",
                    selected
                      ? "bg-[color:var(--primary)] text-white shadow-sm"
                      : "border border-[color:var(--border)] bg-[color:var(--surface)] text-[color:var(--muted)] hover:border-[color:var(--primary)]/40 hover:text-[color:var(--foreground)]",
                  ].join(" ")}
                >
                  {selected && <X size={12} strokeWidth={2.5} />}
                  {s}
                </button>
              );
            })}
          </div>
        </Card>

        {/* Existing Conditions */}
        <Card>
          <div className="flex items-center gap-3 mb-5">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-sky-500/12">
              <Scale size={20} strokeWidth={2} className="text-sky-500" />
            </div>
            <div>
              <CardTitle>Existing Conditions</CardTitle>
              <CardDescription>Select any known health conditions</CardDescription>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {conditionsList.map((c) => {
              const selected = selectedConditions.includes(c);
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => toggleChip(selectedConditions, c, setSelectedConditions)}
                  className={[
                    "inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-semibold transition-all duration-200",
                    selected
                      ? "bg-sky-500 text-white shadow-sm"
                      : "border border-[color:var(--border)] bg-[color:var(--surface)] text-[color:var(--muted)] hover:border-sky-500/40 hover:text-[color:var(--foreground)]",
                  ].join(" ")}
                >
                  {selected && <X size={12} strokeWidth={2.5} />}
                  {c}
                </button>
              );
            })}
          </div>
        </Card>

        {/* Submit */}
        <div className="flex justify-end">
          <Button type="submit" size="lg" loading={loading}>
            Save Health Data
          </Button>
        </div>
      </form>
    </div>
  );
}
