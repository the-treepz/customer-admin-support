import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { API_BASE_URL } from '@/constant';

export async function GET(
  _req: Request,
  context: { params: Promise<{ bookingId: string }> },
) {

  try {
    const { bookingId } = await context.params;
    if (!bookingId) {
      return NextResponse.json(
        { message: 'Invalid booking id format' },
        { status: 400 },
      );
    }

    const cookieStore = await cookies();
    const token = cookieStore.get('treepz_admin_token')?.value;

    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const res = await fetch(
      `${API_BASE_URL}bookings/${bookingId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      },
    );

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        { message: data.message ?? 'Failed to fetch booking' },
        { status: res.status },
      );
    }

    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error('💥 API crashed:', err);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 },
    );
  }
}
