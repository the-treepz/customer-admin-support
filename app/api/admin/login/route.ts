import { API_BASE_URL } from '@/constant';
import { NextResponse } from 'next/server';


export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    const res = await fetch(
      `${API_BASE_URL}auth/sign-in`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      },
    );

    const json = await res.json();

    if (!json.status || !json.data?.token) {
      return NextResponse.json(
        { message: json.message || 'Invalid credentials' },
        { status: 401 },
      );
    }

    const response = NextResponse.json({ success: true });

    response.cookies.set('treepz_admin_token', json.data.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 },
    );
  }
}
