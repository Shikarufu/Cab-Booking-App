"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";

const RideMap = dynamic(() => import("@/components/rideMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full min-h-[420px] w-full items-center justify-center bg-zinc-900 text-sm text-zinc-400">
      Loading map...
    </div>
  ),
});

interface LocationPoint {
  lat: number;
  lng: number;
  label: string;
}

const RIDE_TIERS = [
  {
    id: "standard",
    name: "CabGo Standard",
    desc: "Affordable everyday rides",
    multiplier: 1.0,
  },
  {
    id: "xl",
    name: "CabGo XL",
    desc: "Spacious SUVs for up to 6",
    multiplier: 1.5,
  },
  {
    id: "premium",
    name: "CabGo Black",
    desc: "Luxury sedans & top drivers",
    multiplier: 2.2,
  },
];

function calculateDistanceKm(p1: LocationPoint, p2: LocationPoint) {
  const R = 6371;
  const dLat = ((p2.lat - p1.lat) * Math.PI) / 180;
  const dLng = ((p2.lng - p1.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((p1.lat * Math.PI) / 180) *
      Math.cos((p2.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function BookRidePage() {
  const router = useRouter();
  const [pickupQuery, setPickupQuery] = useState("");
  const [dropoffQuery, setDropoffQuery] = useState("");
  const [pickup, setPickup] = useState<LocationPoint | null>(null);
  const [dropoff, setDropoff] = useState<LocationPoint | null>(null);
  const [selectedTier, setSelectedTier] = useState("standard");
  const [searching, setSearching] = useState<"pickup" | "dropoff" | null>(null);
  const [booking, setBooking] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");

  const searchAddress = async (query: string, type: "pickup" | "dropoff") => {
    if (!query.trim()) return;
    setSearching(type);
    setStatusMsg("");

    try {
      const q = query.toLowerCase().includes("phnom penh")
        ? query
        : `${query}, Phnom Penh`;
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=1`
      );
      const results = await res.json();
      if (results && results.length > 0) {
        const place = results[0];
        const point: LocationPoint = {
          lat: parseFloat(place.lat),
          lng: parseFloat(place.lon),
          label: place.display_name.split(",").slice(0, 2).join(", "),
        };
        if (type === "pickup") {
          setPickup(point);
          setPickupQuery(point.label);
        } else {
          setDropoff(point);
          setDropoffQuery(point.label);
        }
      } else {
        setStatusMsg(
          `No location found for "${query}". Try adding a city name.`
        );
      }
    } catch {
      setStatusMsg("Failed to search location.");
    } finally {
      setSearching(null);
    }
  };

  const distanceKm =
    pickup && dropoff ? Math.max(1, calculateDistanceKm(pickup, dropoff)) : 0;
  const activeTier =
    RIDE_TIERS.find((t) => t.id === selectedTier) || RIDE_TIERS[0];
  const baseFare = 1.5;
  const perKmRate = 0.65;
  const estimatedFare =
    pickup && dropoff
      ? Number(
          ((baseFare + distanceKm * perKmRate) * activeTier.multiplier).toFixed(2)
        )
      : 0;

  const handleBookRide = async () => {
    if (!pickup || !dropoff) return;
    setBooking(true);
    setStatusMsg("");

    try {
      const res = await fetch("/api/rides", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pickup_address: pickup.label,
          pickup_lat: pickup.lat,
          pickup_lng: pickup.lng,
          dropoff_address: dropoff.label,
          dropoff_lat: dropoff.lat,
          dropoff_lng: dropoff.lng,
          ride_type: selectedTier,
          fare: estimatedFare,
        }),
      });
      const data = await res.json();
      if (res.ok && data.ride) {
        setStatusMsg("Ride requested! Redirecting to dashboard...");
        setTimeout(() => router.push("/dashboard"), 1200);
      } else {
        setStatusMsg(data.error || "Could not create ride.");
      }
    } catch {
      setStatusMsg("Network error booking ride.");
    } finally {
      setBooking(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      {/* Navbar */}
      <header className="flex items-center justify-between gap-3 border-b border-zinc-200 bg-white px-4 py-4 sm:px-6 dark:border-zinc-800 dark:bg-zinc-900">
        <Link href="/dashboard" className="shrink-0 text-xl font-bold tracking-tight">
          CabGo
        </Link>
        <Link
          href="/dashboard"
          className="shrink-0 whitespace-nowrap text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
        >
          &larr; Back to Dashboard
        </Link>
      </header>

      {/* Main Split View */}
      <main className="mx-auto grid w-full max-w-6xl flex-1 grid-cols-1 gap-6 p-4 sm:p-6 lg:grid-cols-12">
        {/* Left Control Panel */}
        <div className="space-y-5 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-6 dark:border-zinc-800 dark:bg-zinc-900 lg:col-span-5">
          <h1 className="text-2xl font-bold">Request a Ride</h1>

          {/* Pickup Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-emerald-500">
              Pickup Location
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={pickupQuery}
                onChange={(e) => setPickupQuery(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" && searchAddress(pickupQuery, "pickup")
                }
                placeholder="e.g. AEON Mall Phnom Penh"
                className="min-w-0 flex-1 rounded-lg border border-zinc-300 bg-transparent px-3 py-2 text-sm focus:border-black focus:outline-none dark:border-zinc-700 dark:focus:border-white"
              />
              <button
                type="button"
                onClick={() => searchAddress(pickupQuery, "pickup")}
                disabled={searching === "pickup"}
                className="shrink-0 cursor-pointer rounded-lg bg-zinc-900 px-3 py-2 text-xs font-medium text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-black"
              >
                {searching === "pickup" ? "..." : "Set"}
              </button>
            </div>
          </div>

          {/* Dropoff Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-red-500">
              Drop-off Location
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={dropoffQuery}
                onChange={(e) => setDropoffQuery(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" && searchAddress(dropoffQuery, "dropoff")
                }
                placeholder="e.g. Royal Palace Phnom Penh"
                className="min-w-0 flex-1 rounded-lg border border-zinc-300 bg-transparent px-3 py-2 text-sm focus:border-black focus:outline-none dark:border-zinc-700 dark:focus:border-white"
              />
              <button
                type="button"
                onClick={() => searchAddress(dropoffQuery, "dropoff")}
                disabled={searching === "dropoff"}
                className="shrink-0 cursor-pointer rounded-lg bg-zinc-900 px-3 py-2 text-xs font-medium text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-black"
              >
                {searching === "dropoff" ? "..." : "Set"}
              </button>
            </div>
          </div>

          {/* Ride Options */}
          {pickup && dropoff && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between text-xs text-zinc-500">
                <span>Estimated Distance</span>
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                  {distanceKm.toFixed(1)} km
                </span>
              </div>

              <div className="space-y-2">
                {RIDE_TIERS.map((tier) => {
                  const tierPrice = (
                    (baseFare + distanceKm * perKmRate) *
                    tier.multiplier
                  ).toFixed(2);
                  return (
                    <button
                      key={tier.id}
                      type="button"
                      onClick={() => setSelectedTier(tier.id)}
                      className={`flex w-full cursor-pointer items-center justify-between rounded-lg border p-3 text-left transition ${
                        selectedTier === tier.id
                          ? "border-black bg-zinc-100 dark:border-white dark:bg-zinc-800"
                          : "border-zinc-200 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800/50"
                      }`}
                    >
                      <div>
                        <p className="text-sm font-semibold">{tier.name}</p>
                        <p className="text-xs text-zinc-500">{tier.desc}</p>
                      </div>
                      <span className="text-base font-bold">${tierPrice}</span>
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={handleBookRide}
                disabled={booking}
                className="mt-2 w-full cursor-pointer rounded-lg bg-black py-3 text-sm font-semibold text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
              >
                {booking
                  ? "Requesting Cab..."
                  : `Confirm ${activeTier.name} ($${estimatedFare})`}
              </button>
            </div>
          )}

          {statusMsg && (
            <p className="text-sm font-medium text-emerald-500">{statusMsg}</p>
          )}
        </div>

        {/* Right Map Panel */}
        <div className="min-h-[420px] overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900 lg:col-span-7">
          <RideMap pickup={pickup} dropoff={dropoff} />
        </div>
      </main>
    </div>
  );
}