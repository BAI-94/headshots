import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { Database } from "../../types/supabase";
import { Login } from "./components/Login";

export const dynamic = "force-dynamic"; // 强制动态渲染

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const supabase = createServerComponentClient<Database>({ cookies });

  // 检查用户是否已登录
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 如果用户已登录，重定向到首页
  if (user) {
    redirect("/");
  }

  // 获取主机信息，用于构建重定向URL
  const headersList = headers();
  const host = headersList.get("host");

  return (
    <div className="flex flex-col flex-1 w-full h-[calc(100vh-73px)]">
      <Login host={host} searchParams={searchParams} />
    </div>
  );
}