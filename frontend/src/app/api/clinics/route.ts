import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

type HospitalRow = {
  id: number;
  hospital_name: string;
  area: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  image_url: string;
  address: string;
};

/* ── Haversine distance (km) ── */
function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/* ── Parse CSV once and cache ── */
let cachedHospitals: HospitalRow[] | null = null;

function loadHospitals(): HospitalRow[] {
  if (cachedHospitals) return cachedHospitals;

  const csvPath = path.join(process.cwd(), "..", "data", "hospitals_bangladesh_seed.csv");
  const raw = fs.readFileSync(csvPath, "utf-8");
  const lines = raw
    .split(/\r?\n/)
    .filter((l) => l.trim().length > 0);

  // Parse header
  const header = lines[0].split(",").map((h) => h.trim());

  cachedHospitals = [];
  for (let i = 1; i < lines.length; i++) {
    // Handle quoted fields with commas inside them
    const fields: string[] = [];
    let current = "";
    let inQuote = false;
    for (const ch of lines[i]) {
      if (ch === '"') {
        inQuote = !inQuote;
      } else if (ch === "," && !inQuote) {
        fields.push(current.trim());
        current = "";
      } else {
        current += ch;
      }
    }
    fields.push(current.trim());

    if (fields.length < header.length) continue;

    cachedHospitals.push({
      id: parseInt(fields[0]) || i,
      hospital_name: fields[1] || "",
      area: fields[2] || "",
      city: fields[3] || "",
      country: fields[4] || "Bangladesh",
      latitude: parseFloat(fields[5]) || 0,
      longitude: parseFloat(fields[6]) || 0,
      image_url: fields[7] || "",
      address: fields[8] || "",
    });
  }

  return cachedHospitals;
}

/* ── Determine facility type from name ── */
function inferType(name: string): "Hospital" | "Clinic" | "Diagnostic" | "Pharmacy" {
  const lower = name.toLowerCase();
  if (lower.includes("diagnostic") || lower.includes("lab")) return "Diagnostic";
  if (lower.includes("clinic") || lower.includes("health centre") || lower.includes("medical centre")) return "Clinic";
  if (lower.includes("pharmacy") || lower.includes("pharma")) return "Pharmacy";
  return "Hospital";
}

export function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userLat = parseFloat(searchParams.get("lat") || "0");
  const userLng = parseFloat(searchParams.get("lng") || "0");
  const cityFilter = searchParams.get("city")?.toLowerCase() || "";
  const typeFilter = searchParams.get("type")?.toLowerCase() || "";
  const limit = parseInt(searchParams.get("limit") || "30");

  const hospitals = loadHospitals();

  let results = hospitals.map((h) => {
    const distance =
      userLat && userLng
        ? haversine(userLat, userLng, h.latitude, h.longitude)
        : null;
    return {
      id: h.id,
      name: h.hospital_name,
      type: inferType(h.hospital_name),
      lat: h.latitude,
      lng: h.longitude,
      distance: distance !== null ? parseFloat(distance.toFixed(2)) : null,
      distanceLabel: distance !== null
        ? distance < 1
          ? `${Math.round(distance * 1000)} m`
          : `${distance.toFixed(1)} km`
        : "—",
      address: h.address,
      area: h.area,
      city: h.city,
      image_url: h.image_url,
      open: true,
      hours: "8 AM – 10 PM",
    };
  });

  // Filter by city
  if (cityFilter && cityFilter !== "all") {
    results = results.filter(
      (r) => r.city.toLowerCase() === cityFilter || r.area.toLowerCase() === cityFilter,
    );
  }

  // Filter by type
  if (typeFilter && typeFilter !== "all") {
    results = results.filter((r) => r.type.toLowerCase() === typeFilter);
  }

  // Sort by distance if coordinates provided, otherwise by name
  if (userLat && userLng) {
    results.sort((a, b) => (a.distance ?? 999) - (b.distance ?? 999));
  } else {
    results.sort((a, b) => a.name.localeCompare(b.name));
  }

  // Limit results
  results = results.slice(0, limit);

  return NextResponse.json({
    count: results.length,
    clinics: results,
  });
}
