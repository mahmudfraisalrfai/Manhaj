// app/student/progress/page.tsx
"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface ProgressStats {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  completionRate: number;
  recentTasks: Array<{
    title: string;
    section: string;
    status: string;
    submittedAt: string | null;
  }>;
}

export default function StudentProgressPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<ProgressStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user?.role !== "student") {
      router.push("/dashboard");
      return;
    }
    fetchProgressStats();
  }, [session, router]);

  const fetchProgressStats = async () => {
    try {
      const response = await fetch("/api/student/progress");
      if (!response.ok) {
        throw new Error("فشل في جلب الإحصائيات");
      }
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error("Error fetching progress stats:", error);
      alert("حدث خطأ في جلب الإحصائيات");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">جاري التحميل...</div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">حدث خطأ في جلب البيانات</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              تقدمي الدراسي
            </h1>
            <p className="text-gray-600">
              نظرة عامة على أدائك وتقدمك في المهام
            </p>
          </div>

          {/* إحصائيات رئيسية */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {stats.totalTasks}
              </div>
              <div className="text-sm text-blue-800">إجمالي المهام</div>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <div className="text-2xl font-bold text-green-600 mb-1">
                {stats.completedTasks}
              </div>
              <div className="text-sm text-green-800">مهام مكتملة</div>
            </div>
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
              <div className="text-2xl font-bold text-orange-600 mb-1">
                {stats.pendingTasks}
              </div>
              <div className="text-sm text-orange-800">مهام قيد الانتظار</div>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
              <div className="text-2xl font-bold text-purple-600 mb-1">
                {stats.completionRate}%
              </div>
              <div className="text-sm text-purple-800">نسبة الإنجاز</div>
            </div>
          </div>

          {/* شريط التقدم */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              معدل الإنجاز
            </h3>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className="bg-green-500 h-4 rounded-full transition-all duration-500"
                style={{ width: `${stats.completionRate}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-sm text-gray-600 mt-2">
              <span>0%</span>
              <span>{stats.completionRate}%</span>
              <span>100%</span>
            </div>
          </div>

          {/* المهام الحديثة */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              آخر المهام
            </h3>
            <div className="space-y-3">
              {stats.recentTasks.map((task, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                >
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{task.title}</h4>
                    <p className="text-sm text-gray-600">{task.section}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        task.status === "completed"
                          ? "bg-green-100 text-green-800"
                          : "bg-orange-100 text-orange-800"
                      }`}
                    >
                      {task.status === "completed" ? "مكتمل" : "قيد الانتظار"}
                    </span>
                    {task.submittedAt && (
                      <span className="text-sm text-gray-500">
                        {new Date(task.submittedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {stats.recentTasks.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                لا توجد مهام حديثة
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
