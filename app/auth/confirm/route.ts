import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  // 身份验证已经由middleware.ts自动处理
  // 只需要重定向到首页
  return NextResponse.redirect(new URL("/", req.url));
} 