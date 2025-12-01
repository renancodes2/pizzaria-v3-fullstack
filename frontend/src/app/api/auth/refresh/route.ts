import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333';

export async function POST() {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get('refresh_token')?.value;
    if (!refreshToken) return NextResponse.json({ error: 'No refresh token' }, { status: 401 });

    const res = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      const resp = NextResponse.json({ error: err }, { status: res.status });
      resp.cookies.delete('refresh_token');
      return resp;
    }

    const data = await res.json();
    const newRefresh = data.refresh_token;
    const access = data.access_token;

    const response = NextResponse.json({ access_token: access });
    if (newRefresh) {
      response.cookies.set({
        name: 'refresh_token',
        value: newRefresh,
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
