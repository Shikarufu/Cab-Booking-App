"use client";

import { useEffect } from "react";
import { useUser, UserButton, UserProfile } from "@clerk/nextjs";
import Link from "next/link";
import { useState } from "react";

interface UserProfile {
  id: string;
  clerk_id: string;
  name: string;
  email: string;
  phone: string | "";
  role: "rider" | "driver";
  profile_img: string | null;
}

export default function DashBoardPage() {
  // useState is use to store and update data dynamically
  // syntax onst [current value, setA a function to update ]=useSate(can be falsy value such as 0,'',false)
  const { isLoaded, isSignedIn, user } = useUser();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  // sync clerk user
  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    const syncProfile = async () => {
      try {
        // res=respone
        const res = await fetch("/api/users", { method: "POST" });
        const data = await res.json();
        if (data.user) {
          setProfile(data.user);
          setPhone(data.user.phone || "");
        }
      } catch (error) {
        console.error("Failed to sync user profile:", error);
      } finally {
        setLoading(false);
      }
    };
    syncProfile();
  }, [isLoaded, isSignedIn]);

  const handleRoleChange = async (newRole: "rider" | "driver") => {
    if (!profile || profile.role === newRole) {
      return;
    }
    setSaving(true);
    setMessage("");

    try {
      const res = await fetch("/api/users", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (data.user) {
        setProfile(data.user);
        setMessage("Phone number updated!");
      }
    } catch (error) {
      setMessage("Error updaing phone number.");
    } finally {
      setSaving(false);
    }
  };

  if (!isLoaded || loading) {
    // interface
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <p className="text-zinc-600 dark:text-zinc-400">
          Loading your dashboard.....
        </p>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-zinc dark:bg-zinc-950">
        <p className="text-lg font-medium">
          Please sign in to access dashboard
        </p>
        <Link
          href="/sign-in"
          className="rounded-lg bg-black px-5 py-2.5 text-white hover:bg-zinc-800 dark:bg-white dark:text-black"
        >
          Sign In
        </Link>
      </div>
    );
  }

  // main
  return (
    <div className="min-h-screen bg-zinc-50 p-6 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <div className="mx-autp max-w-3xl space-y-6">
        {/* navbar */}
        <header className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <Link href="/" className="text-xl font-bold tracking-tight">
            CabGo
          </Link>

          <div className="flex items-center gap-4">
            <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold   uppercase tracking-wider dark:bg-zinc-800">
              {profile?.role || "rider"}
            </span>
            <UserButton />
          </div>
        </header>

        {/* profile and role */}
        <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center gap-4">
            {user.imageUrl && (
              <img
                src={user.imageUrl}
                alt={profile?.name || "Profile"}
                className="h-16 w-16 rounded-full border border-zinc-200 object-cover dark:border-zinc-700"
              />
            )}
            <div>
              {/* using profile?.name means it wait for data instead of null */}
              <h1 className="text-2xl font-bold">
                {profile?.name || user.fullName}
              </h1>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                {profile?.email}
              </p>
            </div>
            <hr className="my-6 border-zinc-200 dark:border-zinc-800" />
            {/* role toggle */}
            <div className="space-y-2">
              <label className="block text-sm font-medium">Account Mode</label>
              <div className="flex gap-3">
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => handleRoleChange("rider")}
                  className={`flex-1 rounded-lg border py-2.5 text-sm font-medium transition${
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
                  className={`flex-1 rounded-lg border py-2.5 text-sm font-medium transition${
                    profile?.role === "driver"
                      ? "border-black bg-black text-white dark:border-white dark:bg-white dark:text-black"
                      : "border-zinc-300 hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
                  }`}
                >
                  Driver (Accept Rides)
                </button>
                {/* phone number */}
                <form  className="mt-6 space-y-2">
                  <label className="block text-sm font-medium">
                    Phone Number
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 234 567 8900"
                      className="flex-1 rounded-lg border border-zinc-300 bg-transparent px-3 py-2 text-sm focus:border-black focus:outline-none dark:border-zinc-700 dark:focus:border-white"
                    />
                    <button
                      type="submit"
                      disabled={saving}
                      className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
                    >
                      Save
                    </button>
                  </div>
                </form>

                {message && (
                  <p className="mt-3 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                    {message}
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Action Banner */}
        <section className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div>
            <h2 className="text-lg font-semibold">
              {profile?.role === 'driver' ? 'Ready to earn?' : 'Need a ride?'}
            </h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              {profile?.role === 'driver'
                ? 'Head to the driver portal to view incoming ride requests.'
                : 'Enter your pickup and drop-off locations to request a cab.'}
            </p>
          </div>
          <Link
            href={profile?.role === 'driver' ? '/driver' : '/book'}
            className="rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
          >
            {profile?.role === 'driver' ? 'Open Driver Portal' : 'Book a Ride'}
          </Link>
        </section>
      </div>
    </div>
  );
}
