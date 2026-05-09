"use client";

import { useState } from "react";
import {
  Users,
  Plus,
  HeartPulse,
  Calendar,
  Droplets,
  Activity,
  X,
  User,
  Baby,
} from "lucide-react";
import { Card, CardTitle, CardDescription } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";

type FamilyMember = {
  id: number;
  name: string;
  relation: string;
  age: number;
  gender: string;
  bloodGroup: string;
  riskLevel: "low" | "medium" | "high";
  lastCheckup: string;
  conditions: string[];
  avatarColor: string;
};

const initialMembers: FamilyMember[] = [
  {
    id: 1,
    name: "Rahim Ahmed",
    relation: "Self",
    age: 32,
    gender: "Male",
    bloodGroup: "B+",
    riskLevel: "medium",
    lastCheckup: "May 9, 2026",
    conditions: ["Hypertension"],
    avatarColor: "#087f5b",
  },
  {
    id: 2,
    name: "Fatima Ahmed",
    relation: "Wife",
    age: 28,
    gender: "Female",
    bloodGroup: "A+",
    riskLevel: "low",
    lastCheckup: "April 20, 2026",
    conditions: [],
    avatarColor: "#6366f1",
  },
  {
    id: 3,
    name: "Yusuf Ahmed",
    relation: "Son",
    age: 5,
    gender: "Male",
    bloodGroup: "B+",
    riskLevel: "low",
    lastCheckup: "March 15, 2026",
    conditions: [],
    avatarColor: "#f59e0b",
  },
  {
    id: 4,
    name: "Amina Begum",
    relation: "Mother",
    age: 58,
    gender: "Female",
    bloodGroup: "O+",
    riskLevel: "high",
    lastCheckup: "May 1, 2026",
    conditions: ["Diabetes", "Hypertension"],
    avatarColor: "#ef4444",
  },
];

const riskConfig = {
  low: { badge: "green" as const, label: "Low" },
  medium: { badge: "yellow" as const, label: "Medium" },
  high: { badge: "red" as const, label: "High" },
};

export default function FamilyPage() {
  const [members] = useState<FamilyMember[]>(initialMembers);
  const [showModal, setShowModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);

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
            .slice(0, 2);

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
              <Input id="memberName" label="Full Name" placeholder="Enter name" icon={<User size={16} />} />
              <Select
                id="memberRelation"
                label="Relation"
                options={[
                  { value: "father", label: "Father" },
                  { value: "mother", label: "Mother" },
                  { value: "wife", label: "Wife" },
                  { value: "husband", label: "Husband" },
                  { value: "son", label: "Son" },
                  { value: "daughter", label: "Daughter" },
                  { value: "other", label: "Other" },
                ]}
                placeholder="Select"
              />
              <Input id="memberAge" label="Age" type="number" placeholder="e.g. 28" />
              <Select
                id="memberGender"
                label="Gender"
                options={[
                  { value: "male", label: "Male" },
                  { value: "female", label: "Female" },
                  { value: "other", label: "Other" },
                ]}
                placeholder="Select"
              />
              <Select
                id="memberBlood"
                label="Blood Group"
                icon={<Droplets size={16} />}
                options={["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((b) => ({
                  value: b,
                  label: b,
                }))}
                placeholder="Select"
              />
              <Select
                id="memberPregnancy"
                label="Pregnancy Status"
                icon={<Baby size={16} />}
                options={[
                  { value: "na", label: "Not applicable" },
                  { value: "yes", label: "Pregnant" },
                  { value: "postpartum", label: "Postpartum" },
                ]}
                placeholder="Select"
              />
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button icon={<Plus size={14} />} onClick={() => setShowModal(false)}>
                Add Member
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
