import { NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333';

export async function POST(request: Request) {
  const body = await request.json();

  try {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return NextResponse.json({ error: err }, { status: res.status });
    }

    const data = await res.json();

    const refreshToken = data.refresh_token;
    const accessToken = data.access_token;

    const response = NextResponse.json({ access_token: accessToken });

    if (refreshToken) {
      response.cookies.set({
        name: 'refresh_token',
        value: refreshToken,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60,
      });
    }

    return response;
  } catch (e) {
    return NextResponse.json({ error: 'Unable to contact auth server' }, { status: 502 });
  }
}
