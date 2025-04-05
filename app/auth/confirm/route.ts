import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "@/types/supabase";

export async function GET(req: NextRequest) {
  const requestUrl = new URL(req.url);
  const token_hash = requestUrl.searchParams.get("token_hash");
  const type = requestUrl.searchParams.get("type");

  // 如果有token_hash，尝试验证登录
  if (token_hash && type) {
    // 创建Supabase客户端
    const supabase = createRouteHandlerClient<Database>({ cookies });

    try {
      // 使用token_hash验证一次性密码
      await supabase.auth.verifyOtp({
        token_hash,
        type: type as any
      });

      // 验证用户是否已登录
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // 登录成功，重定向到overview页面
        return NextResponse.redirect(new URL("/overview", requestUrl.origin));
      }
    } catch (error) {
      console.error("验证登录失败:", error);
    }
  }

  // 如果验证失败或没有token_hash，重定向到登录页面
  return NextResponse.redirect(new URL("/login", requestUrl.origin));
} 