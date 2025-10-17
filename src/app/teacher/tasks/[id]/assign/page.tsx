// app/teacher/tasks/[id]/assign/page.tsx
"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useParams } from "next/navigation";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

interface Student {
  id: string;
  name: string;
  assigned: boolean;
}

interface Task {
  id: string;
  title: string;
}

export default function AssignStudentsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const params = useParams();
  const taskId = params.id as string;

  const [task, setTask] = useState<Task | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingAssign, setLoadingAssign] = useState<boolean>(false);
  const [selectAll, setSelectAll] = useState(false);

  useEffect(() => {
    if (session?.user?.role !== "teacher") {
      router.push("/dashboard");
      return;
    }
    fetchData();
  }, [session, router, taskId]);

  const fetchData = async () => {
    try {
      const [taskRes, studentsRes] = await Promise.all([
        fetch(`/api/tasks/${taskId}`),
        fetch(`/api/tasks/${taskId}/students`),
      ]);

      const taskData = await taskRes.json();
      const studentsData = await studentsRes.json();

      setTask(taskData);
      setStudents(studentsData);

      // التحقق إذا كان جميع الطلاب معينين
      setSelectAll(studentsData.every((student: Student) => student.assigned));
    } catch (error) {
      console.error("Error fetching data:", error);
      alert("حدث خطأ في جلب البيانات");
    } finally {
      setLoading(false);
    }
  };

  const toggleStudent = (studentId: string) => {
    setStudents(
      students.map((student) =>
        student.id === studentId
          ? { ...student, assigned: !student.assigned }
          : student
      )
    );
  };

  const toggleSelectAll = () => {
    const newSelectAll = !selectAll;
    setSelectAll(newSelectAll);
    setStudents(
      students.map((student) => ({ ...student, assigned: newSelectAll }))
    );
  };

  const assignStudents = async () => {
    setLoadingAssign(true);
    const selectedStudents = students.filter((student) => student.assigned);

    if (selectedStudents.length === 0) {
      alert("يرجى اختيار طالب واحد على الأقل");
      return;
    }

    try {
      const response = await fetch(`/api/tasks/${taskId}/assign`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          studentIds: selectedStudents.map((student) => student.id),
        }),
      });

      if (response.ok) {
        const result = await response.json();
        alert(`تم تعيين المهمة لـ ${result.assignedCount} طالب`);
        router.push(`/teacher/tasks/${taskId}/progress`);
      } else {
        const error = await response.json();
        alert(error.error || "حدث خطأ أثناء تعيين المهمة");
      }
    } catch (error) {
      alert("حدث خطأ أثناء تعيين المهمة");
    } finally {
      setLoadingAssign(false);
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

  const selectedCount = students.filter((student) => student.assigned).length;

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* رأس الصفحة */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-6 gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Link
                href={`/teacher/sections/`}
                className="text-blue-500 hover:text-blue-700"
              >
                ← رجوع
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">تعيين الطلاب</h1>
            </div>
            <h2 className="text-xl text-gray-700">{task.title}</h2>
          </div>

          <div className="flex gap-3">
            {loadingAssign ? (
              <LoadingSpinner size="sm" />
            ) : (
              <button
                onClick={assignStudents}
                className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors duration-200 font-medium"
              >
                تعيين ({selectedCount})
              </button>
            )}
          </div>
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
              {selectedCount}
            </div>
            <div className="text-sm text-gray-600">محدد</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="text-2xl font-bold text-orange-600 mb-1">
              {students.length - selectedCount}
            </div>
            <div className="text-sm text-gray-600">غير محدد</div>
          </div>
        </div>

        {/* قائمة الطلاب */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              اختيار الطلاب
            </h3>
            <button
              onClick={toggleSelectAll}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
            >
              <div
                className={`w-5 h-5 border-2 rounded flex items-center justify-center ${
                  selectAll
                    ? "bg-blue-500 border-blue-500 text-white"
                    : "border-gray-300"
                }`}
              >
                {selectAll && "✓"}
              </div>
              {selectAll ? "إلغاء تحديد الكل" : "تحديد الكل"}
            </button>
          </div>

          <div className="space-y-3">
            {students.map((student) => (
              <div
                key={student.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => toggleStudent(student.id)}
                    className={`w-5 h-5 border-2 rounded flex items-center justify-center ${
                      student.assigned
                        ? "bg-blue-500 border-blue-500 text-white"
                        : "border-gray-300 hover:border-blue-500"
                    }`}
                  >
                    {student.assigned && "✓"}
                  </button>
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {student.name}
                    </h4>
                    <p
                      className={`text-sm ${
                        student.assigned ? "text-green-600" : "text-gray-500"
                      }`}
                    >
                      {student.assigned ? "معين" : "غير معين"}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {students.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-3">👥</div>
              <p>لا يوجد طلاب مسجلين</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
