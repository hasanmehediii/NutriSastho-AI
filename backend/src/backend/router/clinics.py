import csv
import math
import os
from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.orm import Session

from backend.database import get_session
from backend.model.Clinic import Clinic

router = APIRouter(prefix="/clinics", tags=["Clinics"])

def haversine(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    R = 6371  # Earth radius in km
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

def infer_type(name: str) -> str:
    name_lower = name.lower()
    if "diagnostic" in name_lower or "lab" in name_lower:
        return "Diagnostic"
    if "clinic" in name_lower or "health centre" in name_lower or "medical centre" in name_lower:
        return "Clinic"
    if "pharmacy" in name_lower or "pharma" in name_lower:
        return "Pharmacy"
    return "Hospital"

cached_hospitals = None


def hospital_from_clinic(clinic: Clinic) -> dict:
    return {
        "id": clinic.id,
        "hospital_name": clinic.hospital_name,
        "area": clinic.area,
        "city": clinic.city,
        "country": clinic.country,
        "latitude": clinic.latitude,
        "longitude": clinic.longitude,
        "image_url": clinic.image_url or "",
        "address": clinic.address or "",
        "type": clinic.facility_type,
    }


def load_hospitals():
    global cached_hospitals
    if cached_hospitals is not None:
        return cached_hospitals

    # Path from backend/src/backend/router/clinics.py to data/hospitals_bangladesh_seed.csv
    csv_path = os.path.join(
        os.path.dirname(__file__), "..", "..", "..", "..", "data", "hospitals_bangladesh_seed.csv"
    )
    csv_path = os.path.normpath(csv_path)
    
    hospitals = []
    if os.path.exists(csv_path):
        with open(csv_path, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                try:
                    hospitals.append({
                        "id": int(row.get("id", 0)),
                        "hospital_name": row.get("hospital_name", ""),
                        "area": row.get("area", ""),
                        "city": row.get("city", ""),
                        "country": row.get("country", "Bangladesh"),
                        "latitude": float(row.get("latitude", 0.0)),
                        "longitude": float(row.get("longitude", 0.0)),
                        "image_url": row.get("image_url", ""),
                        "address": row.get("address", ""),
                        "type": infer_type(row.get("hospital_name", ""))
                    })
                except ValueError:
                    continue
    cached_hospitals = hospitals
    return cached_hospitals

@router.get("")
def get_clinics(
    lat: Optional[float] = Query(0.0),
    lng: Optional[float] = Query(0.0),
    city: Optional[str] = Query(""),
    type: Optional[str] = Query(""),
    limit: Optional[int] = Query(30),
    session: Session = Depends(get_session),
):
    clinics = session.execute(select(Clinic)).scalars().all()
    hospitals = [hospital_from_clinic(clinic) for clinic in clinics] or load_hospitals()
    city_filter = city.lower() if city else ""
    type_filter = type.lower() if type else ""
    
    results = []
    for h in hospitals:
        distance = None
        distance_label = "—"
        if lat != 0.0 and lng != 0.0:
            distance = haversine(lat, lng, h["latitude"], h["longitude"])
            if distance < 1:
                distance_label = f"{round(distance * 1000)} m"
            else:
                distance_label = f"{distance:.1f} km"
                
        results.append({
            "id": h["id"],
            "name": h["hospital_name"],
            "type": h["type"],
            "lat": h["latitude"],
            "lng": h["longitude"],
            "distance": round(distance, 2) if distance is not None else None,
            "distanceLabel": distance_label,
            "address": h["address"],
            "area": h["area"],
            "city": h["city"],
            "image_url": h["image_url"],
            "open": True,
            "hours": "8 AM – 10 PM"
        })
        
    if city_filter and city_filter != "all":
        results = [r for r in results if r["city"].lower() == city_filter or r["area"].lower() == city_filter]
        
    if type_filter and type_filter != "all":
        results = [r for r in results if r["type"].lower() == type_filter]
        
    if lat != 0.0 and lng != 0.0:
        results.sort(key=lambda x: x["distance"] if x["distance"] is not None else float("inf"))
    else:
        results.sort(key=lambda x: x["name"])
        
    results = results[:limit]
    
    return {
        "count": len(results),
        "clinics": results
    }
