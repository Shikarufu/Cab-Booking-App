"use client";

import { useEffect, useState } from "react";
import { useUser, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import type { Metadata } from "next";

interface UserProfile {
  id: string;
  clerk_id: string;
  name: string;
  email: string;
  phone: string | null;
  role: "rider" | "driver";
  profile_img: string | null;
}

interface Ride {
  id: string;
  pickup_address: string;
  dropoff_address: string;
  ride_type: string;
  fare: number;
  status: string;
  created_at: string;
}

export default function DashBoardPage() {
  const { isLoaded, isSignedIn, user } = useUser();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [rides, setRides] = useState<Ride[]>([]);
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const fetchRides = async () => {
    try {
      const res = await fetch("/api/rides");
      const data = await res.json();
      if (data.rides) setRides(data.rides);
    } catch (error) {
      console.error("Failed to fetch rides:", error);
    }
  };
  // Inside DashBoardPage in app/dashboard/page.tsx:
  useEffect(() => {
    document.title = "CabGo | Dashboard";
  }, []);

  // Sync Clerk user & load rides
  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    const syncProfile = async () => {
      try {
        const res = await fetch("/api/users", { method: "POST" });
        const data = await res.json();
        if (data.user) {
          setProfile(data.user);
          setPhone(data.user.phone || "");
        }
        await fetchRides();
      } catch (error) {
        console.error("Failed to sync user profile:", error);
      } finally {
        setLoading(false);
      }
    };
    syncProfile();
  }, [isLoaded, isSignedIn]);

  // Switch between rider and driver
  const handleRoleChange = async (newRole: "rider" | "driver") => {
    if (!profile || profile.role === newRole) return;
    setSaving(true);
    setMessage("");

    try {
      const res = await fetch("/api/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      const data = await res.json();
      if (data.user) {
        setProfile(data.user);
        setMessage(`Switched mode to ${newRole.toUpperCase()}`);
      }
    } catch {
      setMessage("Error updating role.");
    } finally {
      setSaving(false);
    }
  };

  // Save phone number
  const handleSavePhone = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const res = await fetch("/api/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (data.user) {
        setProfile(data.user);
        setMessage("Phone number updated!");
      }
    } catch {
      setMessage("Error updating phone number.");
    } finally {
      setSaving(false);
    }
  };

  // Cancel a requested ride
  const handleCancelRide = async (rideId: string) => {
    try {
      const res = await fetch("/api/rides", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rideId, status: "cancelled" }),
      });
      if (res.ok) {
        await fetchRides();
      }
    } catch (error) {
      console.error("Failed to cancel ride:", error);
    }
  };

  if (!isLoaded || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 dark:bg-zinc-950">
        <p className="text-zinc-600 dark:text-zinc-400">
          Loading your dashboard.....
        </p>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-zinc-50 px-4 text-center dark:bg-zinc-950">
        <p className="text-lg font-medium">
          Please sign in to access dashboard
        </p>
        <Link
          href="/"
          className="rounded-lg bg-black px-5 py-2.5 text-white hover:bg-zinc-800 dark:bg-white dark:text-black"
        >
          Go Home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-zinc-50 px-4 py-6 text-zinc-900 sm:px-6 dark:bg-zinc-950 dark:text-zinc-100">
      <div className="mx-auto max-w-3xl space-y-6">
        {/* Navbar */}
        <header className="flex items-center justify-between gap-3 rounded-xl border border-zinc-200 bg-white px-4 py-3.5 shadow-sm sm:px-6 dark:border-zinc-800 dark:bg-zinc-900">
          <Link href="/" className="shrink-0 text-xl font-bold tracking-tight">
            CabGo
          </Link>

          <div className="flex shrink-0 items-center gap-3">
            <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold uppercase tracking-wider dark:bg-zinc-800">
              {profile?.role || "rider"}
            </span>
            <UserButton />
          </div>
        </header>

        {/* Profile and Role Card */}
        <section className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-6 dark:border-zinc-800 dark:bg-zinc-900">
          {/* Avatar + Name Row (properly closed here!) */}
          <div className="flex items-center gap-4">
            {user.imageUrl && (
              <img
                src={user.imageUrl}
                alt={profile?.name || "Profile"}
                className="h-14 w-14 shrink-0 rounded-full border border-zinc-200 object-cover sm:h-16 sm:w-16 dark:border-zinc-700"
              />
            )}
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-xl font-bold sm:text-2xl">
                {profile?.name || user.fullName}
              </h1>
              <p className="truncate text-sm text-zinc-500 dark:text-zinc-400">
                {profile?.email}
              </p>
            </div>
          </div>

          <hr className="my-6 border-zinc-200 dark:border-zinc-800" />

          {/* Responsive Grid for Account Mode & Phone Number */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Role Toggle */}
            <div className="space-y-2">
              <label className="block text-sm font-medium">Account Mode</label>
              <div className="flex flex-col gap-2.5 sm:flex-row">
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => handleRoleChange("rider")}
                  className={`flex-1 cursor-pointer rounded-lg border px-3 py-2.5 text-sm font-medium transition ${
                    profile?.role === "rider"
                      ? "border-black bg-black text-white dark:border-white dark:bg-white dark:text-black"
                      : "border-zinc-300 hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
                  }`}
                >
                  Rider (Book Rides)
                </button>
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => handleRoleChange("driver")}
                  className={`flex-1 cursor-pointer rounded-lg border px-3 py-2.5 text-sm font-medium transition ${
                    profile?.role === "driver"
                      ? "border-black bg-black text-white dark:border-white dark:bg-white dark:text-black"
                      : "border-zinc-300 hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
                  }`}
                >
                  Driver (Accept Rides)
                </button>
              </div>
            </div>

            {/* Phone Number Form */}
            <form onSubmit={handleSavePhone} className="space-y-2">
              <label className="block text-sm font-medium">Phone Number</label>
              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 234 567 8900"
                  className="min-w-0 flex-1 rounded-lg border border-zinc-300 bg-transparent px-3 py-2 text-sm focus:border-black focus:outline-none dark:border-zinc-700 dark:focus:border-white"
                />
                <button
                  type="submit"
                  disabled={saving}
                  className="shrink-0 cursor-pointer rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
                >
                  Save
                </button>
              </div>
            </form>
          </div>

          {message && (
            <p className="mt-4 text-sm font-medium text-emerald-600 dark:text-emerald-400">
              {message}
            </p>
          )}
        </section>

        {/* Action Banner */}
        <section className="flex flex-col justify-between gap-4 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="min-w-0">
            <h2 className="text-lg font-semibold">
              {profile?.role === "driver" ? "Ready to earn?" : "Need a ride?"}
            </h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              {profile?.role === "driver"
                ? "Head to the driver portal to view incoming ride requests."
                : "Enter your pickup and drop-off locations to request a cab."}
            </p>
          </div>
          <Link
            href={profile?.role === "driver" ? "/driver" : "/book"}
            className="w-full shrink-0 rounded-lg bg-black px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-zinc-800 sm:w-auto dark:bg-white dark:text-black dark:hover:bg-zinc-200"
          >
            {profile?.role === "driver" ? "Open Driver Portal" : "Book a Ride"}
          </Link>
        </section>

        {/* Recent Rides List */}
        <section className="space-y-4 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="text-lg font-semibold">Your Recent Rides</h2>
          {rides.length === 0 ? (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              No rides booked yet. Click &ldquo;Book a Ride&rdquo; above to take
              your first trip!
            </p>
          ) : (
            <div className="space-y-3">
              {rides.map((ride) => (
                <div
                  key={ride.id}
                  className="flex flex-col justify-between gap-3 rounded-lg border border-zinc-200 p-4 sm:flex-row sm:items-center dark:border-zinc-800"
                >
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded bg-zinc-100 px-2 py-0.5 text-xs font-semibold uppercase dark:bg-zinc-800">
                        {ride.ride_type}
                      </span>
                      <span
                        className={`rounded px-2 py-0.5 text-xs font-semibold uppercase ${
                          ride.status === "requested"
                            ? "bg-amber-500/15 text-amber-500"
                            : ride.status === "cancelled"
                              ? "bg-red-500/15 text-red-500"
                              : "bg-emerald-500/15 text-emerald-500"
                        }`}
                      >
                        {ride.status}
                      </span>
                    </div>
                    <p className="break-words text-sm font-medium">
                      <span className="text-emerald-500">From:</span>{" "}
                      {ride.pickup_address}
                    </p>
                    <p className="break-words text-sm font-medium">
                      <span className="text-red-500">To:</span>{" "}
                      {ride.dropoff_address}
                    </p>
                  </div>

                  <div className="flex items-center justify-between gap-3 border-t border-zinc-200 pt-3 sm:flex-col sm:items-end sm:justify-center sm:border-t-0 sm:pt-0 dark:border-zinc-800">
                    <span className="text-lg font-bold">
                      ${Number(ride.fare).toFixed(2)}
                    </span>
                    {ride.status === "requested" && (
                      <button
                        type="button"
                        onClick={() => handleCancelRide(ride.id)}
                        className="cursor-pointer rounded border border-red-500/40 px-2.5 py-1 text-xs font-medium text-red-500 hover:bg-red-500/10"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
