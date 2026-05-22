import { passwordMatches, setSessionCookie } from '../../../../lib/auth';

export async function POST(request) {
  const body = await request.json();

  if (!passwordMatches(body.password)) {
    return Response.json({ error: 'Invalid password' }, { status: 401 });
  }

  setSessionCookie();
  return Response.json({ ok: true });
}
