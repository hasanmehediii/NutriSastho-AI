"use client";

import { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import {
  MapPin,
  Phone,
  Clock,
  Navigation,
  Hospital,
  Stethoscope,
  TestTube,
  Pill,
  LocateFixed,
} from "lucide-react";
import { Card, CardTitle } from "@/components/ui/Card";
import { Tabs } from "@/components/ui/Tabs";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

/* Dynamically import Leaflet (no SSR) */
const MapContainer = dynamic(
  () => import("react-leaflet").then((m) => m.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((m) => m.TileLayer),
  { ssr: false }
);
const LeafletMarker = dynamic(
  () => import("react-leaflet").then((m) => m.Marker),
  { ssr: false }
);
const LeafletPopup = dynamic(
  () => import("react-leaflet").then((m) => m.Popup),
  { ssr: false }
);

/* ── Clinic data (near BRAC University & Dhaka University) ── */
type Clinic = {
  id: number;
  name: string;
  type: "Hospital" | "Clinic" | "Diagnostic" | "Pharmacy";
  lat: number;
  lng: number;
  distance: string;
  address: string;
  phone: string;
  open: boolean;
  hours: string;
};

const clinics: Clinic[] = [
  // Near BRAC University (Mohakhali area)
  {
    id: 1,
    name: "United Hospital",
    type: "Hospital",
    lat: 23.7782,
    lng: 90.4066,
    distance: "0.5 km",
    address: "Plot 15, Rd 71, Gulshan-2, Dhaka",
    phone: "+880 2-8836000",
    open: true,
    hours: "24 hours",
  },
  {
    id: 2,
    name: "BRAC Health Centre",
    type: "Clinic",
    lat: 23.7807,
    lng: 90.4072,
    distance: "0.3 km",
    address: "Mohakhali, Dhaka 1212",
    phone: "+880 2-9881265",
    open: true,
    hours: "8 AM – 8 PM",
  },
  {
    id: 3,
    name: "Popular Diagnostic Centre (Gulshan)",
    type: "Diagnostic",
    lat: 23.7805,
    lng: 90.4146,
    distance: "0.8 km",
    address: "House 16, Rd 2, Gulshan-1, Dhaka",
    phone: "+880 2-9852456",
    open: true,
    hours: "7 AM – 11 PM",
  },
  {
    id: 4,
    name: "Lazz Pharma (Mohakhali)",
    type: "Pharmacy",
    lat: 23.7788,
    lng: 90.4020,
    distance: "0.6 km",
    address: "Mohakhali Bus Stand, Dhaka",
    phone: "+880 1711-123456",
    open: true,
    hours: "24 hours",
  },
  // Near Dhaka University area
  {
    id: 5,
    name: "Dhaka Medical College Hospital",
    type: "Hospital",
    lat: 23.7260,
    lng: 90.3968,
    distance: "1.2 km",
    address: "Secretariat Rd, Dhaka 1000",
    phone: "+880 2-55165088",
    open: true,
    hours: "24 hours",
  },
  {
    id: 6,
    name: "Sir Salimullah Medical College",
    type: "Hospital",
    lat: 23.7173,
    lng: 90.3998,
    distance: "1.5 km",
    address: "Mitford Rd, Old Dhaka",
    phone: "+880 2-7319002",
    open: true,
    hours: "24 hours",
  },
  {
    id: 7,
    name: "DU Medical Centre",
    type: "Clinic",
    lat: 23.7310,
    lng: 90.3928,
    distance: "0.2 km",
    address: "University of Dhaka Campus",
    phone: "+880 2-9661900",
    open: true,
    hours: "8 AM – 5 PM",
  },
  {
    id: 8,
    name: "Ibn Sina Diagnostic (Dhanmondi)",
    type: "Diagnostic",
    lat: 23.7400,
    lng: 90.3750,
    distance: "1.8 km",
    address: "House 48, Rd 9/A, Dhanmondi, Dhaka",
    phone: "+880 2-9128485",
    open: true,
    hours: "7 AM – 10 PM",
  },
  {
    id: 9,
    name: "Lab Aid Hospital",
    type: "Hospital",
    lat: 23.7380,
    lng: 90.3778,
    distance: "1.6 km",
    address: "House 1, Rd 4, Dhanmondi, Dhaka",
    phone: "+880 2-9116551",
    open: true,
    hours: "24 hours",
  },
  {
    id: 10,
    name: "Square Pharma Outlet (Nilkhet)",
    type: "Pharmacy",
    lat: 23.7330,
    lng: 90.3880,
    distance: "0.5 km",
    address: "Nilkhet, Dhaka 1205",
    phone: "+880 1815-654321",
    open: false,
    hours: "8 AM – 10 PM",
  },
];

const filterTabs = [
  { key: "all", label: "All" },
  { key: "Hospital", label: "Hospitals" },
  { key: "Clinic", label: "Clinics" },
  { key: "Diagnostic", label: "Diagnostic" },
  { key: "Pharmacy", label: "Pharmacy" },
];

const typeIcons: Record<string, typeof Hospital> = {
  Hospital: Hospital,
  Clinic: Stethoscope,
  Diagnostic: TestTube,
  Pharmacy: Pill,
};

const typeColors: Record<string, string> = {
  Hospital: "#ef4444",
  Clinic: "#087f5b",
  Diagnostic: "#f59e0b",
  Pharmacy: "#6366f1",
};

export default function NearbyCarePage() {
  const [filter, setFilter] = useState("all");
  const [location, setLocation] = useState("BRAC University, Mohakhali");
  const [mounted, setMounted] = useState(false);

  const filtered = useMemo(
    () => (filter === "all" ? clinics : clinics.filter((c) => c.type === filter)),
    [filter]
  );

  // Default center: BRAC University
  const center: [number, number] = [23.7800, 90.4060];

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Location bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1">
          <Input
            id="location"
            label="Your Location"
            icon={<MapPin size={16} strokeWidth={2} />}
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Enter your location"
          />
        </div>
        <Button
          variant="secondary"
          icon={<LocateFixed size={14} />}
          className="shrink-0"
        >
          Use My Location
        </Button>
      </div>

      {/* Filter tabs */}
      <Tabs tabs={filterTabs} active={filter} onChange={setFilter} />

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Map */}
        <div className="lg:col-span-3">
          <Card padding={false} className="overflow-hidden h-[420px]">
            <link
              rel="stylesheet"
              href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
            />
            <MapContainer
              center={center}
              zoom={13}
              scrollWheelZoom
              style={{ height: "100%", width: "100%", borderRadius: "1rem" }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {filtered.map((c) => (
                <LeafletMarker key={c.id} position={[c.lat, c.lng]}>
                  <LeafletPopup>
                    <div className="text-xs">
                      <p className="font-bold">{c.name}</p>
                      <p>{c.type} · {c.distance}</p>
                      <p>{c.phone}</p>
                    </div>
                  </LeafletPopup>
                </LeafletMarker>
              ))}
            </MapContainer>
          </Card>
        </div>

        {/* Results list */}
        <div className="lg:col-span-2 space-y-3 max-h-[420px] overflow-y-auto pr-1">
          {filtered.map((c) => {
            const Icon = typeIcons[c.type];
            const color = typeColors[c.type];
            return (
              <Card key={c.id} className="hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex gap-3">
                  <div
                    className="grid h-10 w-10 shrink-0 place-items-center rounded-xl"
                    style={{ backgroundColor: `color-mix(in srgb, ${color} 14%, transparent)` }}
                  >
                    <Icon size={18} strokeWidth={2} style={{ color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-bold text-[color:var(--foreground)] truncate">
                        {c.name}
                      </h3>
                      <Badge variant={c.open ? "green" : "red"}>
                        {c.open ? "Open" : "Closed"}
                      </Badge>
                    </div>
                    <p className="mt-0.5 text-[11px] text-[color:var(--muted)] truncate">
                      {c.address}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-[color:var(--muted)]">
                      <span className="flex items-center gap-1">
                        <Navigation size={10} strokeWidth={2} /> {c.distance}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={10} strokeWidth={2} /> {c.hours}
                      </span>
                      <span className="flex items-center gap-1">
                        <Phone size={10} strokeWidth={2} /> {c.phone}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
