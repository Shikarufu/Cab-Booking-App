import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase';

// POST: Create a new ride request
export async function POST(request: Request) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      pickup_address,
      pickup_lat,
      pickup_lng,
      dropoff_address,
      dropoff_lat,
      dropoff_lng,
      ride_type,
      fare,
    } = body;

    if (!pickup_address || !dropoff_address || !fare) {
      return NextResponse.json({ error: 'Missing required ride details' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('rides')
      .insert({
        rider_id: user.id,
        pickup_address,
        pickup_lat,
        pickup_lng,
        dropoff_address,
        dropoff_lat,
        dropoff_lng,
        ride_type: ride_type || 'standard',
        fare,
        status: 'requested',
      })
      .select()
      .single();

    if (error) {
      console.error('SUPABASE RIDE INSERT ERROR:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ride: data }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// GET: Fetch rides for the current user
export async function GET() {
  const user = await currentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('rides')
    .select('*')
    .eq('rider_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ rides: data }, { status: 200 });
}

// PATCH: Update ride status (e.g., cancel a requested ride)
export async function PATCH(request: Request) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { rideId, status } = await request.json();
    if (!rideId || !status) {
      return NextResponse.json({ error: 'Missing rideId or status' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('rides')
      .update({ status })
      .eq('id', rideId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ride: data }, { status: 200 });
  } catch {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}