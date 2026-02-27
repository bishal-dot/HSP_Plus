import { userLoginUsingOrgIdandUserId } from '@/controllers/auth.controller';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    return await userLoginUsingOrgIdandUserId(request);
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Login failed' }, { status: 500 });
  }
}