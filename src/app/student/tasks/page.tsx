// app/student/tasks/page.tsx
"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface StudentTask {
  id: string;
  task: {
    id: string;
    title: string;
    description: string;
    deadline: string | null;
    section: {
      name: string;
    };
  };
  status: string;
  submittedAt: string | null;
  createdAt: string;
}

export default function StudentTasksPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [tasks, setTasks] = useState<StudentTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "completed">("all");

  useEffect(() => {
    if (session?.user?.role !== "student") {
      router.push("/dashboard");
      return;
    }
    fetchStudentTasks();
  }, [session, router]);

  const fetchStudentTasks = async () => {
    try {
      const response = await fetch("/api/student/tasks");
      if (!response.ok) {
        throw new Error("فشل في جلب المهام");
      }
      const data = await response.json();
      setTasks(data);
    } catch (error) {
      console.error("Error fetching student tasks:", error);
      alert("حدث خطأ في جلب المهام");
    } finally {
      setLoading(false);
    }
  };

  const submitTask = async (taskId: string) => {
    try {
      const response = await fetch(`/api/student/tasks/${taskId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "completed" }),
      });

      if (response.ok) {
        alert("تم تسليم المهمة بنجاح");
        fetchStudentTasks();
      } else {
        throw new Error("فشل في تسليم المهمة");
      }
    } catch (error) {
      console.error("Error submitting task:", error);
      alert("حدث خطأ في تسليم المهمة");
    }
  };

  const filteredTasks = tasks.filter((task) => {
    if (filter === "all") return true;
    return task.status === filter;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">...جاري التحميل</div>
      </div>
    );
  }

  const pendingCount = tasks.filter((t) => t.status === "pending").length;
  const completedCount = tasks.filter((t) => t.status === "completed").length;

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">مهامي</h1>
              <p className="text-gray-600">عرض ومتابعة المهام المطلوبة منك</p>
            </div>

            {/* إحصائيات سريعة */}
            <div className="flex gap-4 text-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {tasks.length}
                </div>
                <div className="text-gray-600">إجمالي المهام</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {pendingCount}
                </div>
                <div className="text-gray-600">قيد الانتظار</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {completedCount}
                </div>
                <div className="text-gray-600">مكتمل</div>
              </div>
            </div>
          </div>

          {/* فلتر المهام */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 rounded-lg font-medium ${
                filter === "all"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              الكل
            </button>
            <button
              onClick={() => setFilter("pending")}
              className={`px-4 py-2 rounded-lg font-medium ${
                filter === "pending"
                  ? "bg-orange-500 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              قيد الانتظار
            </button>
            <button
              onClick={() => setFilter("completed")}
              className={`px-4 py-2 rounded-lg font-medium ${
                filter === "completed"
                  ? "bg-green-500 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              مكتمل
            </button>
          </div>

          {/* قائمة المهام */}
          <div className="space-y-4">
            {filteredTasks.map((studentTask) => (
              <div
                key={studentTask.id}
                className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow duration-200"
              >
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            studentTask.status === "completed"
                              ? "bg-green-500"
                              : "bg-orange-500"
                          }`}
                        ></div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {studentTask.task.title}
                        </h3>
                      </div>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          studentTask.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : "bg-orange-100 text-orange-800"
                        }`}
                      >
                        {studentTask.status === "completed"
                          ? "مكتمل"
                          : "قيد الانتظار"}
                      </span>
                    </div>

                    <p className="text-gray-600 mb-3 leading-relaxed">
                      {studentTask.task.description || "لا يوجد وصف"}
                    </p>

                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                        {studentTask.task.section.name}
                      </span>
                      {studentTask.task.deadline && (
                        <span
                          className={`px-2 py-1 rounded-full ${
                            new Date(studentTask.task.deadline) < new Date() &&
                            studentTask.status !== "completed"
                              ? "bg-red-100 text-red-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          ⏰{" "}
                          {new Date(
                            studentTask.task.deadline
                          ).toLocaleDateString()}
                        </span>
                      )}
                      {studentTask.submittedAt && (
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full">
                          تم التسليم:{" "}
                          {new Date(
                            studentTask.submittedAt
                          ).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {studentTask.status === "pending" ? (
                      <button
                        onClick={() => submitTask(studentTask.id)}
                        className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors duration-200 font-medium"
                      >
                        تسليم المهمة
                      </button>
                    ) : (
                      <button
                        disabled
                        className="bg-gray-300 text-gray-500 px-4 py-2 rounded-lg font-medium cursor-not-allowed"
                      >
                        تم التسليم
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredTasks.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">
                {filter === "completed"
                  ? "🎉"
                  : filter === "pending"
                  ? "📝"
                  : "📚"}
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {filter === "completed"
                  ? "لا توجد مهام مكتملة"
                  : filter === "pending"
                  ? "لا توجد مهام قيد الانتظار"
                  : "لا توجد مهام"}
              </h3>
              <p className="text-gray-500">
                {filter === "all" && "سيظهر هنا المهام التي يعينها الشيخ"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
