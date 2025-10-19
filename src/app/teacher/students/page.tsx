"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Student {
  id: string;
  name: string;
  password?: string;
  createdAt: string;
}

export default function StudentsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [visiblePasswords, setVisiblePasswords] = useState<
    Record<string, boolean>
  >({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (session?.user?.role !== "teacher") {
      router.push("/dashboard");
      return;
    }
    fetchStudents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, router]);

  const fetchStudents = async () => {
    try {
      const response = await fetch("/api/students");
      const data = await response.json();
      setStudents(data);
    } catch (error) {
      console.error("Error fetching students:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteStudent = async (studentId: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا الطالب؟")) return;

    try {
      const response = await fetch(`/api/students/${studentId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setStudents((prev) => prev.filter((s) => s.id !== studentId));
        // صغيرة: يمكن استبدال alert بToast لاحقاً
        alert("تم حذف الطالب بنجاح");
      } else {
        alert("فشل حذف الطالب");
      }
    } catch (error) {
      console.error("Error deleting student:", error);
      alert("حدث خطأ أثناء حذف الطالب");
    }
  };

  const togglePasswordVisibility = (id: string) => {
    setVisiblePasswords((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const copyPassword = async (id: string, password?: string) => {
    if (!password) return;
    try {
      await navigator.clipboard.writeText(password);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1400);
    } catch (err) {
      console.error("Copy failed", err);
    }
  };

  // Skeleton (تحسين التحميل)
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-3xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="p-4 bg-white rounded shadow">
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-3" />
                  <div className="h-3 bg-gray-200 rounded w-1/3 mb-2" />
                  <div className="h-8 bg-gray-200 rounded w-1/4 mt-2" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6 gap-4">
          <h1 className="text-2xl font-bold">إدارة الطلاب</h1>
          <Link
            href="/teacher/students/add"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
          >
            إضافة طالب جديد
          </Link>
        </div>

        {/* ===== جدول للـ md+ وواجهة بطاقات للـ mobile ===== */}
        {/* Desktop / Tablet table */}
        <div className="hidden md:block bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-right text-sm font-medium text-gray-600">
                  الاسم
                </th>
                <th className="px-6 py-3 text-right text-sm font-medium text-gray-600">
                  كلمة المرور
                </th>
                <th className="px-6 py-3 text-right text-sm font-medium text-gray-600">
                  تاريخ التسجيل
                </th>
                <th className="px-6 py-3 text-right text-sm font-medium text-gray-600">
                  الإجراءات
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y">
              {students.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                    {student.name}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    <div className="flex items-center gap-3">
                      <span className="font-mono">
                        {visiblePasswords[student.id]
                          ? student.password ?? "—"
                          : student.password
                          ? "••••••••"
                          : "—"}
                      </span>
                      <button
                        onClick={() => togglePasswordVisibility(student.id)}
                        className="text-xs px-2 py-1 border rounded text-gray-600 hover:bg-gray-100"
                        aria-label="تبديل رؤية كلمة المرور"
                      >
                        {visiblePasswords[student.id] ? "إخفاء" : "إظهار"}
                      </button>
                      <button
                        onClick={() =>
                          copyPassword(student.id, student.password)
                        }
                        className="text-xs px-2 py-1 border rounded text-gray-600 hover:bg-gray-100"
                        aria-label="نسخ كلمة المرور"
                      >
                        {copiedId === student.id ? "نسخ✓" : "نسخ"}
                      </button>
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {new Date(student.createdAt).toLocaleDateString()}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center gap-2 justify-end">
                      <Link
                        href={`/teacher/students/${student.id}`}
                        className="text-blue-600 hover:underline"
                      >
                        عرض
                      </Link>
                      <button
                        onClick={() => deleteStudent(student.id)}
                        className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600"
                        aria-label={`حذف ${student.name}`}
                      >
                        حذف
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {students.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    لا يوجد طلاب مسجلين بعد
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="md:hidden space-y-4">
          {students.map((student) => (
            <article
              key={student.id}
              className="bg-white rounded-lg shadow p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-gray-900 truncate">
                    {student.name}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    تاريخ التسجيل:{" "}
                    {new Date(student.createdAt).toLocaleDateString()}
                  </p>

                  <div className="mt-3 flex items-center gap-2">
                    <span className="inline-flex items-center px-3 py-1 rounded bg-gray-100 text-sm font-mono">
                      {visiblePasswords[student.id]
                        ? student.password ?? "—"
                        : student.password
                        ? "••••••••"
                        : "—"}
                    </span>

                    <button
                      onClick={() => togglePasswordVisibility(student.id)}
                      className="text-sm px-3 py-2 border rounded bg-white shadow-sm hover:bg-gray-50"
                      aria-label="تبديل رؤية كلمة المرور"
                    >
                      {visiblePasswords[student.id] ? "إخفاء" : "إظهار"}
                    </button>

                    <button
                      onClick={() => copyPassword(student.id, student.password)}
                      className="text-sm px-3 py-2 border rounded bg-white shadow-sm hover:bg-gray-50"
                      aria-label="نسخ كلمة المرور"
                    >
                      {copiedId === student.id ? "نسخ✓" : "نسخ"}
                    </button>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <button
                    onClick={() => deleteStudent(student.id)}
                    className="w-full md:w-auto bg-red-500 text-white px-3 py-2 rounded-md hover:bg-red-600"
                    aria-label={`حذف ${student.name}`}
                  >
                    حذف
                  </button>
                </div>
              </div>
            </article>
          ))}

          {students.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              لا يوجد طلاب مسجلين بعد
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
