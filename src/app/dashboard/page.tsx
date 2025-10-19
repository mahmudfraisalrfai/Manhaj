// app/dashboard/page.tsx
"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import StudentDashboard from "@/components/StudentDashboard";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push("/auth/signin");
      return;
    }

    // إذا كان شيخاً، حوله إلى الأقسام
    if (session.user.role === "teacher") {
      router.push("/teacher/sections");
    }
  }, [session, status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">جاري التحميل...</div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">جاري التوجيه...</div>
      </div>
    );
  }

  // إذا كان طالباً، اعرض لوحة الطالب
  if (session.user.role === "student") {
    return <StudentDashboard />;
  }

  // إذا كان شيخاً، اعرض رسالة تحميل (سيتم التحويل تلقائياً)
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-xl">...جاري التوجيه إلى الأقسام</div>
    </div>
  );
}
