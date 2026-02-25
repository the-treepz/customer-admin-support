import { LoginResponse, Payment } from '@/types';
import { Booking } from '@/types/booking';
import {
  ApiBookingDetailResponse,
  FetchFlightPaymentParams,
  FetchFlightsBookingParams,
} from '@/types/api_booking';
import { API_BASE_URL } from '@/constant';


export async function login(
  email: string,
  password: string,
): Promise<LoginResponse> {
  try {
    const res = await fetch(`${API_BASE_URL}auth/sign-in`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const json = await res.json();

    if (!json.status || !json.data?.token) {
      return {
        status: false,
        message: json.message || 'Login failed',
      };
    }

    return {
      status: true,
      access_token: json.data.token,
    };
  } catch (error) {
    console.error('Login error:', error);
    return {
      status: false,
      message: 'Network or server error',
    };
  }
}

export async function fetchFlights(
  params: FetchFlightsBookingParams = {},
): Promise<{ data: Booking[]; total: number }> {
  const query = new URLSearchParams({
    page: String(params?.page ?? 1),
    limit: String(params?.limit ?? 100),
    ...(params.type ? { type: params.type } : {}),
    ...(params.status ? { status: params.status } : {}),
    ...(params.date ? { date: params.date } : {}),
    ...(params.search ? { search: params.search } : {}),
  });

  const res = await fetch(`/api/bookings?${query.toString()}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    if (res.status === 401) throw new Error('Unauthorized');
    throw new Error('Failed to fetch bookings');
  }

  const json = await res.json();

  return {
    data: json.data?.bookings ?? [],
    total: json.data?.pagination?.total ?? 0,
  };
}

export async function fetchAllPayment(
  params: FetchFlightPaymentParams = {},
): Promise<{ data: Payment[]; total: number }> {
  const query = new URLSearchParams({
    page: String(params.page ?? 1),
    limit: String(params.limit ?? 100),
    ...(params.status ? { status: params.status } : {}),
    ...(params.date ? { date: params.date } : {}),
    ...(params.search ? { search: params.search } : {}),
  });

  const res = await fetch(`/api/payments?${query.toString()}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    cache: 'no-store',
  });

  if (!res.ok) {
    if (res.status === 401) throw new Error('Unauthorized');
    throw new Error('Failed to fetch payments');
  }

  const json = await res.json();

  return {
    data: json.data?.payments ?? [],
    total: json.data?.pagination?.total ?? 0,
  };
}

export async function fetchFlightById(
  bookingId: string,
): Promise<ApiBookingDetailResponse> {
  const res = await fetch(`/api/bookings/${bookingId}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    cache: 'no-store',
  });


  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.message ?? 'Failed to fetch booking by ID');
  }

  const json: ApiBookingDetailResponse = await res.json();
  return json;
}
