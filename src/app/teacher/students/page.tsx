// app/teacher/students/page.tsx
"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Student {
  id: string;
  name: string;
  createdAt: string;
}

export default function StudentsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user?.role !== "teacher") {
      router.push("/dashboard");
      return;
    }
    fetchStudents();
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
        setStudents(students.filter((student) => student.id !== studentId));
        alert("تم حذف الطالب بنجاح");
      }
    } catch (error) {
      console.error("Error deleting student:", error);
      alert("حدث خطأ أثناء حذف الطالب");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">جاري التحميل...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">إدارة الطلاب</h1>
            <Link
              href="/teacher/students/add"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              إضافة طالب جديد
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-3 px-4 text-right border-b">اسم الطالب</th>
                  <th className="py-3 px-4 text-right border-b">
                    تاريخ التسجيل
                  </th>
                  <th className="py-3 px-4 text-right border-b">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4 border-b">{student.name}</td>
                    <td className="py-3 px-4 border-b">
                      {new Date(student.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 border-b">
                      <button
                        onClick={() => deleteStudent(student.id)}
                        className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 text-sm"
                      >
                        حذف
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {students.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                لا يوجد طلاب مسجلين بعد
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
