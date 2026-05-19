"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  HeartPulse,
  Calendar,
  Droplets,
  Activity,
  X,
  User,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { useAuth } from "@/providers/AuthProvider";
import { getHealthProfile } from "@/services/health.service";
import type { HealthProfile } from "@/types/user";

type FamilyMember = {
  id: number;
  name: string;
  relation: string;
  age: number | string;
  gender: string;
  bloodGroup: string;
  riskLevel: "low" | "medium" | "high";
  lastCheckup: string;
  conditions: string[];
  avatarColor: string;
};

const riskConfig = {
  low: { badge: "green" as const, label: "Low" },
  medium: { badge: "yellow" as const, label: "Medium" },
  high: { badge: "red" as const, label: "High" },
};

function computeRiskLevel(profile: HealthProfile | null): "low" | "medium" | "high" {
  if (!profile) return "low";
  let score = 0;
  if (profile.bp_systolic && profile.bp_systolic >= 140) score += 30;
  if (profile.temperature_f && profile.temperature_f >= 100.4) score += 20;
  if (profile.bmi && profile.bmi >= 30) score += 15;
  if (profile.blood_sugar && profile.blood_sugar > 140) score += 15;
  if (profile.conditions && profile.conditions.length > 0) score += profile.conditions.length * 10;
  
  if (score > 65) return "high";
  if (score > 30) return "medium";
  return "low";
}

export default function FamilyPage() {
  const { user } = useAuth();
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);

  // New member form state
  const [newName, setNewName] = useState("");
  const [newRelation, setNewRelation] = useState("");
  const [newAge, setNewAge] = useState("");
  const [newGender, setNewGender] = useState("");
  const [newBlood, setNewBlood] = useState("");

  useEffect(() => {
    // Fetch the primary user's health profile to populate the "Self" card
    getHealthProfile().then((profile) => {
      const selfMember: FamilyMember = {
        id: 1,
        name: user?.full_name || user?.email?.split("@")[0] || "User",
        relation: "Self",
        age: profile?.age || "—",
        gender: profile?.gender ? profile.gender.charAt(0).toUpperCase() + profile.gender.slice(1) : "—",
        bloodGroup: user?.blood_group || "—",
        riskLevel: computeRiskLevel(profile),
        lastCheckup: profile ? new Date(profile.created_at).toLocaleDateString() : "Never",
        conditions: profile?.conditions || [],
        avatarColor: "#087f5b",
      };
      
      // We start with "Self" and some dummy family members for demonstration
      setMembers([
        selfMember,
        {
          id: 2,
          name: "Fatima Begum",
          relation: "Mother",
          age: 58,
          gender: "Female",
          bloodGroup: "O+",
          riskLevel: "high",
          lastCheckup: "May 1, 2026",
          conditions: ["Diabetes", "Hypertension"],
          avatarColor: "#ef4444",
        },
      ]);
    }).catch(() => {});
  }, [user]);

  function handleAddMember() {
    if (!newName) return;
    const colors = ["#6366f1", "#f59e0b", "#ec4899", "#8b5cf6", "#14b8a6"];
    const newMember: FamilyMember = {
      id: Date.now(),
      name: newName,
      relation: newRelation || "Other",
      age: newAge || "—",
      gender: newGender || "—",
      bloodGroup: newBlood || "—",
      riskLevel: "low",
      lastCheckup: "Never",
      conditions: [],
      avatarColor: colors[members.length % colors.length],
    };
    setMembers([...members, newMember]);
    setShowModal(false);
    setNewName("");
    setNewRelation("");
    setNewAge("");
    setNewGender("");
    setNewBlood("");
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-[color:var(--foreground)]">Family Profiles</h2>
          <p className="text-sm text-[color:var(--muted)]">
            Manage health profiles for your family members
          </p>
        </div>
        <Button icon={<Plus size={16} />} onClick={() => setShowModal(true)}>
          Add Member
        </Button>
      </div>

      {/* Family grid */}
      <div className="grid gap-4 sm:grid-cols-2">
        {members.map((m) => {
          const risk = riskConfig[m.riskLevel];
          const initials = m.name
            .split(" ")
            .map((w) => w[0])
            .join("")
            .slice(0, 2)
            .toUpperCase() || "U";

          return (
            <Card
              key={m.id}
              className="group cursor-pointer hover:shadow-md transition-all hover:border-[color:var(--primary)]/30"
              onClick={() => setSelectedMember(m)}
            >
              <div className="flex gap-4">
                {/* Avatar */}
                <div
                  className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl text-lg font-black text-white"
                  style={{ backgroundColor: m.avatarColor }}
                >
                  {initials}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-sm font-bold text-[color:var(--foreground)] truncate">
                      {m.name}
                    </h3>
                    <Badge variant={risk.badge} dot>{risk.label} Risk</Badge>
                  </div>

                  <p className="mt-0.5 text-xs text-[color:var(--muted)]">
                    {m.relation} · {m.age} years · {m.gender}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-[color:var(--muted)]">
                    <span className="flex items-center gap-1">
                      <Droplets size={10} strokeWidth={2} /> {m.bloodGroup}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar size={10} strokeWidth={2} /> {m.lastCheckup}
                    </span>
                  </div>

                  {m.conditions.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {m.conditions.map((c) => (
                        <Badge key={c} variant="red">{c}</Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Member detail modal */}
      {selectedMember && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            onClick={() => setSelectedMember(null)}
          />
          <div className="fixed inset-x-4 top-[10%] z-50 mx-auto max-w-lg rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-6 shadow-2xl sm:inset-x-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-[color:var(--foreground)]">
                {selectedMember.name}
              </h3>
              <button
                type="button"
                onClick={() => setSelectedMember(null)}
                className="grid h-8 w-8 place-items-center rounded-lg text-[color:var(--muted)] hover:text-[color:var(--foreground)]"
              >
                <X size={18} strokeWidth={2} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                ["Relation", selectedMember.relation],
                ["Age", `${selectedMember.age} years`],
                ["Gender", selectedMember.gender],
                ["Blood Group", selectedMember.bloodGroup],
                ["Risk Level", riskConfig[selectedMember.riskLevel].label],
                ["Last Checkup", selectedMember.lastCheckup],
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl bg-[color:var(--surface-soft)] p-3">
                  <p className="text-[11px] font-medium text-[color:var(--muted)]">{label}</p>
                  <p className="font-semibold text-[color:var(--foreground)]">{value}</p>
                </div>
              ))}
            </div>

            {selectedMember.conditions.length > 0 && (
              <div className="mt-4">
                <p className="text-xs font-semibold text-[color:var(--muted)] mb-2">Conditions</p>
                <div className="flex gap-2">
                  {selectedMember.conditions.map((c) => (
                    <Badge key={c} variant="red">{c}</Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-5 flex gap-2">
              <Button size="md" className="flex-1" icon={<HeartPulse size={14} />}>
                Log Vitals
              </Button>
              <Button variant="secondary" size="md" className="flex-1" icon={<Activity size={14} />}>
                View History
              </Button>
            </div>
          </div>
        </>
      )}

      {/* Add member modal */}
      {showModal && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          />
          <div className="fixed inset-x-4 top-[10%] z-50 mx-auto max-w-lg rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-6 shadow-2xl sm:inset-x-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-[color:var(--foreground)]">Add Family Member</h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="grid h-8 w-8 place-items-center rounded-lg text-[color:var(--muted)] hover:text-[color:var(--foreground)]"
              >
                <X size={18} strokeWidth={2} />
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                id="memberName"
                label="Full Name"
                placeholder="Enter name"
                icon={<User size={16} />}
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
              <Select
                id="memberRelation"
                label="Relation"
                options={[
                  { value: "", label: "Select" },
                  { value: "Father", label: "Father" },
                  { value: "Mother", label: "Mother" },
                  { value: "Wife", label: "Wife" },
                  { value: "Husband", label: "Husband" },
                  { value: "Son", label: "Son" },
                  { value: "Daughter", label: "Daughter" },
                  { value: "Other", label: "Other" },
                ]}
                value={newRelation}
                onChange={(e) => setNewRelation(e.target.value)}
              />
              <Input
                id="memberAge"
                label="Age"
                type="number"
                placeholder="e.g. 28"
                value={newAge}
                onChange={(e) => setNewAge(e.target.value)}
              />
              <Select
                id="memberGender"
                label="Gender"
                options={[
                  { value: "", label: "Select" },
                  { value: "Male", label: "Male" },
                  { value: "Female", label: "Female" },
                  { value: "Other", label: "Other" },
                ]}
                value={newGender}
                onChange={(e) => setNewGender(e.target.value)}
              />
              <Select
                id="memberBlood"
                label="Blood Group"
                icon={<Droplets size={16} />}
                options={[
                  { value: "", label: "Select" },
                  ...["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((b) => ({
                    value: b,
                    label: b,
                  }))
                ]}
                value={newBlood}
                onChange={(e) => setNewBlood(e.target.value)}
              />
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button icon={<Plus size={14} />} onClick={handleAddMember}>
                Add Member
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
