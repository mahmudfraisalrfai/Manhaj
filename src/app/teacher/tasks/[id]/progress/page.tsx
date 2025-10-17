// app/teacher/tasks/[id]/progress/page.tsx
"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useParams } from "next/navigation";

interface StudentProgress {
  id: string;
  name: string;
  status: string;
  submittedAt: string | null;
  createdAt: string;
}

interface TaskDetails {
  id: string;
  title: string;
  description: string;
  section: {
    name: string;
  };
  deadline: string | null;
  completed: boolean;
}

export default function TaskProgressPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const params = useParams();
  const taskId = params.id as string;

  const [task, setTask] = useState<TaskDetails | null>(null);
  const [students, setStudents] = useState<StudentProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user?.role !== "teacher") {
      router.push("/dashboard");
      return;
    }
    fetchTaskProgress();
  }, [session, router, taskId]);

  const fetchTaskProgress = async () => {
    try {
      const response = await fetch(`/api/tasks/${taskId}/progress`);
      const data = await response.json();
      setTask(data.task);
      setStudents(data.students);
    } catch (error) {
      console.error("Error fetching task progress:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateStudentStatus = async (
    studentTaskId: string,
    newStatus: string
  ) => {
    try {
      const response = await fetch(`/api/student-tasks/${studentTaskId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        fetchTaskProgress(); // تحديث البيانات
      }
    } catch (error) {
      console.error("Error updating student status:", error);
    }
  };

  const assignToAllStudents = async () => {
    try {
      const response = await fetch(`/api/tasks/${taskId}/assign`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const result = await response.json();
        alert(`تم تعيين المهمة لـ ${result.assignedCount} طالب`);
        fetchTaskProgress();
      }
    } catch (error) {
      alert("حدث خطأ أثناء تعيين المهمة");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">جاري التحميل...</div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">المهمة غير موجودة</div>
      </div>
    );
  }

  const completedCount = students.filter(
    (s) => s.status === "completed"
  ).length;
  const pendingCount = students.filter((s) => s.status === "pending").length;

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* رأس الصفحة */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-6 gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Link
                href="/teacher/sections"
                className="text-blue-500 hover:text-blue-700"
              >
                ← رجوع
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">
                متابعة المهمة
              </h1>
            </div>
            <h2 className="text-xl text-gray-700 mb-2">{task.title}</h2>
            <p className="text-gray-600">{task.section.name}</p>
          </div>

          <button
            onClick={assignToAllStudents}
            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors duration-200 font-medium"
          >
            تعيين لجميع الطلاب
          </button>
        </div>

        {/* إحصائيات سريعة */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {students.length}
            </div>
            <div className="text-sm text-gray-600">إجمالي الطلاب</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="text-2xl font-bold text-green-600 mb-1">
              {completedCount}
            </div>
            <div className="text-sm text-gray-600">مكتمل</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="text-2xl font-bold text-orange-600 mb-1">
              {pendingCount}
            </div>
            <div className="text-sm text-gray-600">قيد الانتظار</div>
          </div>
        </div>

        {/* تفاصيل المهمة */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            تفاصيل المهمة
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                الوصف:
              </label>
              <p className="text-gray-600">
                {task.description || "لا يوجد وصف"}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                موعد التسليم:
              </label>
              <p className="text-gray-600">
                {task.deadline
                  ? new Date(task.deadline).toLocaleDateString()
                  : "غير محدد"}
              </p>
            </div>
          </div>
        </div>

        {/* قائمة الطلاب */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            تقدم الطلاب
          </h3>

          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-3 px-4 text-right border-b font-medium text-gray-700">
                    اسم الطالب
                  </th>
                  <th className="py-3 px-4 text-right border-b font-medium text-gray-700">
                    الحالة
                  </th>
                  <th className="py-3 px-4 text-right border-b font-medium text-gray-700">
                    تاريخ التسليم
                  </th>
                  <th className="py-3 px-4 text-right border-b font-medium text-gray-700">
                    الإجراءات
                  </th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4 border-b">{student.name}</td>
                    <td className="py-3 px-4 border-b">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          student.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : "bg-orange-100 text-orange-800"
                        }`}
                      >
                        {student.status === "completed"
                          ? "مكتمل"
                          : "قيد الانتظار"}
                      </span>
                    </td>
                    <td className="py-3 px-4 border-b text-sm text-gray-500">
                      {student.submittedAt
                        ? new Date(student.submittedAt).toLocaleDateString()
                        : "-"}
                    </td>
                    <td className="py-3 px-4 border-b">
                      <div className="flex gap-2">
                        {student.status === "pending" ? (
                          <button
                            onClick={() =>
                              updateStudentStatus(student.id, "completed")
                            }
                            className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
                          >
                            تم التسليم
                          </button>
                        ) : (
                          <button
                            onClick={() =>
                              updateStudentStatus(student.id, "pending")
                            }
                            className="bg-orange-500 text-white px-3 py-1 rounded text-sm hover:bg-orange-600"
                          >
                            إلغاء التسليم
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {students.length === 0 && (
              <div className="text-center py-8">
                <div className="text-gray-400 text-4xl mb-3">👥</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  لا يوجد طلاب معينين
                </h3>
                <p className="text-gray-500 mb-4">
                  قم بتعيين المهمة للطلاب لمتابعة تقدمهم
                </p>
                <button
                  onClick={assignToAllStudents}
                  className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors duration-200"
                >
                  تعيين لجميع الطلاب
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
