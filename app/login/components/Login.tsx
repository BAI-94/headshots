"use client";// 客户端组件标识

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Database } from "@/types/supabase";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import disposableDomains from "disposable-email-domains";
import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { AiOutlineGoogle } from "react-icons/ai";
import { WaitingForMagicLink } from "./WaitingForMagicLink";
// ... 导入语句

type Inputs = {
  email: string;
};

export const Login = ({
  host,
  searchParams,
}: {
  host: string | null;
  searchParams?: { [key: string]: string | string[] | undefined };
}) => {
  const supabase = createClientComponentClient<Database>(); // 创建Supabase客户端
  const [isSubmitting, setIsSubmitting] = useState(false); // 提交状态
  const [isMagicLinkSent, setIsMagicLinkSent] = useState(false); // 魔法链接发送状态
  const { toast } = useToast(); // 通知组件

    // 表单控制
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitted },
  } = useForm<Inputs>();

  // 表单提交处理函数
  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    setIsSubmitting(true);
    try {
      // 发送魔法链接邮件
      await signInWithMagicLink(data.email);
      setTimeout(() => {
        setIsSubmitting(false);
        // 显示成功通知
        toast({
          title: "Email sent",
          description: "Check your inbox for a magic link to sign in.",
          duration: 5000,
        });
        setIsMagicLinkSent(true); // 更新状态显示等待页面
      }, 1000);
    } catch (error) {
      setIsSubmitting(false);
      // 显示错误通知
      toast({
        title: "Something went wrong",
        variant: "destructive",
        description:
          "Please try again, if the problem persists, contact us at hello@tryleap.ai",
        duration: 5000,
      });
    }
  };


  let inviteToken = null;
  if (searchParams && "inviteToken" in searchParams) {
    inviteToken = searchParams["inviteToken"];
  }
  // 构建回调URL
  const protocol = host?.includes("localhost") ? "http" : "https";
  const redirectUrl = `${protocol}://${host}/auth/callback`;

  console.log({ redirectUrl });

  // Google登录方法（当前未启用）
  const signInWithGoogle = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: redirectUrl,
      },
    });

    console.log(data, error);
  };

  // 魔法链接登录方法
  const signInWithMagicLink = async (email: string) => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectUrl,// 登录成功后重定向URL
      },
    });

    if (error) {
      console.log(`Error: ${error.message}`);
    }
  };

   // 如果已发送魔法链接，显示等待页面
  if (isMagicLinkSent) {
    return (
      <WaitingForMagicLink toggleState={() => setIsMagicLinkSent(false)} />
    );
  }

   // 登录表单UI
  return (
    <>
      <div className="flex items-center justify-center p-8">
        <div className="flex flex-col gap-4 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 p-4 rounded-xl max-w-sm w-full">
          <h1 className="text-xl">Welcome</h1>
          <p className="text-xs opacity-60">
            Sign in or create an account to get started.
          </p>
          {/* <Button
            onClick={signInWithGoogle}
            variant={"outline"}
            className="font-semibold"
          >
            <AiOutlineGoogle size={20} />
            Continue with Google
          </Button>
          <OR /> */}
          {/* 邮箱登录表单 */}
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-2"
          >
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Input
                  type="email"
                  placeholder="Email"
                  {...register("email", {
                    required: true,
                    validate: {
                      // 邮箱格式验证
                      emailIsValid: (value: string) =>
                        /^[A-Z0-9._%-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(value) ||
                        "Please enter a valid email",
                      // 邮箱不能包含'+'
                      emailDoesntHavePlus: (value: string) =>
                        /^[A-Z0-9._%-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(value) ||
                        "Email addresses with a '+' are not allowed",
                      // 邮箱不能是临时邮箱
                      emailIsntDisposable: (value: string) =>
                        !disposableDomains.includes(value.split("@")[1]) ||
                        "Please use a permanent email address",
                    },
                  })}
                />
                {/* 显示错误信息 */}
                {isSubmitted && errors.email && (
                  <span className={"text-xs text-red-400"}>
                    {errors.email?.message || "Email is required to sign in"}
                  </span>
                )}
              </div>
            </div>

            {/* 提交按钮 */}
            <Button
              isLoading={isSubmitting}
              disabled={isSubmitting}
              variant="outline"
              className="w-full"
              type="submit"
            >
              Continue with Email
            </Button>
          </form>
        </div>
      </div>
    </>
  );
};

export const OR = () => {
  return (
    <div className="flex items-center my-1">
      <div className="border-b flex-grow mr-2 opacity-50" />
      <span className="text-sm opacity-50">OR</span>
      <div className="border-b flex-grow ml-2 opacity-50" />
    </div>
  );
};

