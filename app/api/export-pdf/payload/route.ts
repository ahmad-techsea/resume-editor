import { NextResponse } from 'next/server';
import { takeExportPayload } from '@/lib/resume-export/export-token-store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get('token');
  if (!token) {
    return NextResponse.json({ error: 'Missing token.' }, { status: 400 });
  }
  const payload = takeExportPayload(token);
  if (!payload) {
    return NextResponse.json({ error: 'Export payload not found or already used.' }, { status: 404 });
  }
  return NextResponse.json(payload);
}
