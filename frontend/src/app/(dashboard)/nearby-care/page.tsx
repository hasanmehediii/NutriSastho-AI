"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
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
  Loader2,
  Search,
  ExternalLink,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Tabs } from "@/components/ui/Tabs";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { useAuth } from "@/providers/AuthProvider";

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

type Clinic = {
  id: number;
  name: string;
  type: "Hospital" | "Clinic" | "Diagnostic" | "Pharmacy";
  lat: number;
  lng: number;
  distance: number | null;
  distanceLabel: string;
  address: string;
  area: string;
  city: string;
  image_url: string;
  open: boolean;
  hours: string;
};

const filterTabs = [
  { key: "all", label: "All" },
  { key: "Hospital", label: "Hospitals" },
  { key: "Clinic", label: "Clinics" },
  { key: "Diagnostic", label: "Diagnostic" },
];

const cityOptions = [
  { value: "all", label: "All Cities" },
  { value: "dhaka", label: "Dhaka" },
  { value: "chattogram", label: "Chattogram" },
  { value: "sylhet", label: "Sylhet" },
  { value: "khulna", label: "Khulna" },
  { value: "rajshahi", label: "Rajshahi" },
  { value: "rangpur", label: "Rangpur" },
  { value: "barishal", label: "Barishal" },
  { value: "mymensingh", label: "Mymensingh" },
  { value: "bogura", label: "Bogura" },
  { value: "gazipur", label: "Gazipur" },
  { value: "narayanganj", label: "Narayanganj" },
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
  const { user } = useAuth();
  const [filter, setFilter] = useState("all");
  const [city, setCity] = useState("all");
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState(true);
  const [locating, setLocating] = useState(false);
  const [userPos, setUserPos] = useState<{ lat: number; lng: number } | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([23.78, 90.406]);
  const [error, setError] = useState<string | null>(null);

  /* ── Fetch clinics from API ── */
  const fetchClinics = useCallback(
    async (lat?: number, lng?: number, cityFilter?: string) => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        if (lat && lng) {
          params.set("lat", lat.toString());
          params.set("lng", lng.toString());
        }
        if (cityFilter && cityFilter !== "all") params.set("city", cityFilter);
        params.set("limit", "50");

        const res = await fetch(`/api/clinics?${params.toString()}`);
        if (!res.ok) throw new Error("Failed to load clinics");
        const data = await res.json();
        setClinics(data.clinics || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load clinics");
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  /* ── Initial load ── */
  useEffect(() => {
    fetchClinics();
  }, [fetchClinics]);

  /* ── Re-fetch when city changes ── */
  useEffect(() => {
    fetchClinics(userPos?.lat, userPos?.lng, city);
  }, [city, userPos, fetchClinics]);

  /* ── Get user location ── */
  const handleLocate = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const pos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setUserPos(pos);
        setMapCenter([pos.lat, pos.lng]);
        fetchClinics(pos.lat, pos.lng, city);
        setLocating(false);
      },
      () => {
        setError("Could not get your location. Please allow location access.");
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  /* ── Filter by type (client-side since API already filtered by city) ── */
  const filtered = useMemo(
    () => (filter === "all" ? clinics : clinics.filter((c) => c.type === filter)),
    [filter, clinics],
  );

  /* ── Update map center when clinics load ── */
  useEffect(() => {
    if (!userPos && filtered.length > 0) {
      const avgLat = filtered.reduce((s, c) => s + c.lat, 0) / filtered.length;
      const avgLng = filtered.reduce((s, c) => s + c.lng, 0) / filtered.length;
      setMapCenter([avgLat, avgLng]);
    }
  }, [filtered, userPos]);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[color:var(--foreground)]">
          Nearby Healthcare
        </h1>
        <p className="mt-1 text-sm text-[color:var(--muted)]">
          Find hospitals, clinics, and diagnostic centers near you across Bangladesh
        </p>
      </div>

      {/* Location + City filter bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1">
          <Select
            id="city-filter"
            label="Filter by City"
            options={cityOptions}
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
        </div>
        <Button
          variant="secondary"
          icon={
            locating ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <LocateFixed size={14} />
            )
          }
          className="shrink-0"
          onClick={handleLocate}
          disabled={locating}
        >
          {locating ? "Locating..." : "Use My Location"}
        </Button>
      </div>

      {/* Status messages */}
      {userPos && (
        <div className="flex items-center gap-2 rounded-xl bg-[color:var(--primary)]/10 px-4 py-2.5 text-sm text-[color:var(--primary)]">
          <Navigation size={14} />
          <span>
            Showing results sorted by distance from your location ({userPos.lat.toFixed(4)}, {userPos.lng.toFixed(4)})
          </span>
        </div>
      )}

      {error && (
        <div className="rounded-xl bg-[color:var(--danger)]/10 px-4 py-2.5 text-sm text-[color:var(--danger)]">
          {error}
        </div>
      )}

      {/* Filter tabs */}
      <Tabs tabs={filterTabs} active={filter} onChange={setFilter} />

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Map */}
        <div className="lg:col-span-3">
          <Card padding={false} className="overflow-hidden h-[480px]">
            <link
              rel="stylesheet"
              href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
            />
            <MapContainer
              center={mapCenter}
              zoom={userPos ? 14 : 12}
              scrollWheelZoom
              style={{ height: "100%", width: "100%", borderRadius: "1rem" }}
              key={`${mapCenter[0]}-${mapCenter[1]}`}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {filtered.map((c) => (
                <LeafletMarker key={c.id} position={[c.lat, c.lng]}>
                  <LeafletPopup>
                    <div className="text-xs space-y-1">
                      <p className="font-bold text-sm">{c.name}</p>
                      <p className="text-[color:var(--muted)]">
                        {c.type} · {c.distanceLabel}
                      </p>
                      <p>{c.address}</p>
                      <p className="text-[10px] text-[color:var(--muted)]">{c.area}, {c.city}</p>
                    </div>
                  </LeafletPopup>
                </LeafletMarker>
              ))}
            </MapContainer>
          </Card>
        </div>

        {/* Results list */}
        <div className="lg:col-span-2 space-y-3 max-h-[480px] overflow-y-auto pr-1">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-[color:var(--muted)]">
              <Loader2 size={28} className="animate-spin mb-3" />
              <p className="text-sm">Loading healthcare facilities...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-[color:var(--muted)]">
              <Search size={28} className="mb-3 opacity-50" />
              <p className="text-sm">No facilities found. Try a different city or filter.</p>
            </div>
          ) : (
            filtered.map((c) => {
              const Icon = typeIcons[c.type] || Hospital;
              const color = typeColors[c.type] || "#6366f1";
              return (
                <Card key={c.id} className="hover:shadow-md transition-shadow cursor-pointer">
                  <div className="flex gap-3">
                    <div
                      className="grid h-10 w-10 shrink-0 place-items-center rounded-xl"
                      style={{
                        backgroundColor: `color-mix(in srgb, ${color} 14%, transparent)`,
                      }}
                    >
                      <Icon size={18} strokeWidth={2} style={{ color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-sm font-bold text-[color:var(--foreground)] truncate">
                          {c.name}
                        </h3>
                        <Badge variant="blue">{c.type}</Badge>
                      </div>
                      <p className="mt-0.5 text-[11px] text-[color:var(--muted)] truncate">
                        {c.address}
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-[color:var(--muted)]">
                        {c.distanceLabel !== "—" && (
                          <span className="flex items-center gap-1 font-semibold text-[color:var(--primary)]">
                            <Navigation size={10} strokeWidth={2} /> {c.distanceLabel}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <MapPin size={10} strokeWidth={2} /> {c.area}, {c.city}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={10} strokeWidth={2} /> {c.hours}
                        </span>
                      </div>
                      {/* Google Maps link */}
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${c.lat},${c.lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-flex items-center gap-1 text-[11px] font-medium text-[color:var(--primary)] hover:underline"
                      >
                        <ExternalLink size={10} /> Open in Google Maps
                      </a>
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </div>

      {/* Stats bar */}
      {!loading && filtered.length > 0 && (
        <div className="flex items-center justify-center gap-6 text-xs text-[color:var(--muted)]">
          <span>{filtered.length} facilities found</span>
          <span>·</span>
          <span>{filtered.filter((c) => c.type === "Hospital").length} hospitals</span>
          <span>·</span>
          <span>{filtered.filter((c) => c.type === "Diagnostic").length} diagnostic centers</span>
          <span>·</span>
          <span>{filtered.filter((c) => c.type === "Clinic").length} clinics</span>
        </div>
      )}
    </div>
  );
}
