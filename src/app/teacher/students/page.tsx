// app/teacher/students/page.tsx
"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  WhatsAppIcon,
  CopyIcon,
  EyeIcon,
  EyeOffIcon,
  TrashIcon,
  UserPlusIcon,
} from "@/components/ui/Icon";

interface Student {
  id: string;
  name: string;
  password?: string;
  phone?: string;
  createdAt: string;
}

// مكون Toast للإشعارات
function Toast({
  message,
  show,
  type = "success",
}: {
  message: string;
  show: boolean;
  type?: "success" | "error" | "info";
}) {
  if (!show) return null;

  const bgColor = {
    success: "bg-green-500",
    error: "bg-red-500",
    info: "bg-blue-500",
  }[type];

  return (
    <div className="fixed top-4 right-4 z-50 animate-fade-in-down">
      <div
        className={`${bgColor} text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 min-w-64`}
      >
        <span className="font-bold">
          {type === "success" ? "✓" : type === "error" ? "✕" : "ℹ"}
        </span>
        <span>{message}</span>
      </div>
    </div>
  );
}

export default function EnhancedStudentsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [visiblePasswords, setVisiblePasswords] = useState<
    Record<string, boolean>
  >({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success" as "success" | "error" | "info",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<{
    show: boolean;
    student: Student | null;
  }>({
    show: false,
    student: null,
  });

  useEffect(() => {
    if (session?.user?.role !== "teacher") {
      router.push("/dashboard");
      return;
    }
    fetchStudents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, router]);

  const showToast = (
    message: string,
    type: "success" | "error" | "info" = "success"
  ) => {
    setToast({ show: true, message, type });
    setTimeout(
      () => setToast({ show: false, message: "", type: "success" }),
      3000
    );
  };

  const fetchStudents = async () => {
    try {
      const response = await fetch("/api/students");
      if (!response.ok) throw new Error("Failed to fetch");
      const data = await response.json();
      setStudents(data);
    } catch (error) {
      console.error("Error fetching students:", error);
      showToast("فشل في تحميل بيانات الطلاب", "error");
    } finally {
      setLoading(false);
    }
  };

  const deleteStudent = async (studentId: string) => {
    try {
      const response = await fetch(`/api/students/${studentId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setStudents((prev) => prev.filter((s) => s.id !== studentId));
        showToast("تم حذف الطالب بنجاح");
        setDeleteConfirm({ show: false, student: null });
      } else {
        const error = await response.json();
        showToast(error.error || "فشل حذف الطالب", "error");
      }
    } catch (error) {
      console.error("Error deleting student:", error);
      showToast("حدث خطأ أثناء حذف الطالب", "error");
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
      showToast("تم نسخ كلمة المرور", "success");
      setTimeout(() => setCopiedId(null), 1400);
    } catch (err) {
      console.error("Copy failed", err);
      showToast("فشل في نسخ كلمة المرور", "error");
    }
  };

  const openWhatsApp = (student: Student) => {
    if (student.phone) {
      const phone = student.phone.replace(/\D/g, "");
      const message = `مرحباً ${student.name}، أود التواصل معك بخصوص المهام الدراسية`;
      const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
      window.open(url, "_blank");
    } else {
      showToast("رقم الهاتف غير متوفر للطالب", "info");
    }
  };

  const copyPhoneNumber = async (phone?: string) => {
    if (!phone) {
      showToast("رقم الهاتف غير متوفر", "info");
      return;
    }
    try {
      await navigator.clipboard.writeText(phone);
      showToast("تم نسخ رقم الهاتف", "success");
    } catch (err) {
      console.error("Copy failed", err);
      showToast("فشل في نسخ رقم الهاتف", "error");
    }
  };

  // تصفية الطلاب حسب البحث
  const filteredStudents = students.filter(
    (student) =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (student.phone && student.phone.includes(searchTerm))
  );

  // Skeleton Loading
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-6">
            {/* Header Skeleton */}
            <div className="flex justify-between items-center">
              <div className="h-8 bg-gray-200 rounded w-48"></div>
              <div className="h-10 bg-gray-200 rounded w-32"></div>
            </div>

            {/* Search Skeleton */}
            <div className="h-12 bg-gray-200 rounded w-full max-w-md"></div>

            {/* Cards Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl p-4 shadow-sm border border-gray-200"
                >
                  <div className="h-5 bg-gray-200 rounded w-3/4 mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="flex gap-2">
                    <div className="h-8 bg-gray-200 rounded flex-1"></div>
                    <div className="h-8 bg-gray-200 rounded w-20"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
              إدارة الطلاب
            </h1>
            <p className="text-gray-600">
              إجمالي الطلاب:{" "}
              <span className="font-semibold">{students.length}</span>
            </p>
          </div>

          <Link
            href="/teacher/students/add"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all shadow-sm hover:shadow-md"
          >
            <UserPlusIcon className="w-5 h-5" />
            إضافة طالب جديد
          </Link>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <input
              type="text"
              placeholder="ابحث عن طالب بالاسم أو رقم الهاتف..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm transition-all"
            />
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Students Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStudents.map((student) => (
            <div
              key={student.id}
              className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 hover:shadow-md transition-all"
            >
              {/* Student Info */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {student.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    مسجل منذ{" "}
                    {new Date(student.createdAt).toLocaleDateString("ar-SA")}
                  </p>
                </div>

                {/* WhatsApp Button */}
                <button
                  onClick={() => openWhatsApp(student)}
                  className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                  title="فتح محادثة واتساب"
                >
                  <WhatsAppIcon className="w-5 h-5" />
                </button>
              </div>

              {/* Phone Number */}
              <div className="mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">رقم الهاتف:</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      {student.phone || "غير متوفر"}
                    </span>
                    {student.phone && (
                      <button
                        onClick={() => copyPhoneNumber(student.phone)}
                        className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                        title="نسخ رقم الهاتف"
                      >
                        <CopyIcon className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Password Section */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">كلمة المرور:</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => togglePasswordVisibility(student.id)}
                      className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                      title={visiblePasswords[student.id] ? "إخفاء" : "إظهار"}
                    >
                      {visiblePasswords[student.id] ? (
                        <EyeOffIcon className="w-4 h-4" />
                      ) : (
                        <EyeIcon className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={() => copyPassword(student.id, student.password)}
                      className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                      title="نسخ كلمة المرور"
                    >
                      <CopyIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-3">
                  <code className="text-sm font-mono">
                    {visiblePasswords[student.id]
                      ? student.password || "—"
                      : student.password
                      ? "••••••••"
                      : "—"}
                  </code>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-3 border-t border-gray-200">
                <Link
                  href={`/teacher/students/${student.id}`}
                  className="flex-1 text-center py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-sm font-medium"
                >
                  عرض التفاصيل
                </Link>
                <button
                  onClick={() => setDeleteConfirm({ show: true, student })}
                  className="flex items-center gap-1 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium"
                >
                  <TrashIcon className="w-4 h-4" />
                  حذف
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredStudents.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">👨‍🎓</div>
            <div className="text-gray-500 font-medium mb-2">
              {searchTerm ? "لا توجد نتائج للبحث" : "لا يوجد طلاب مسجلين بعد"}
            </div>
            <div className="text-gray-400 text-sm">
              {searchTerm
                ? "جرب تغيير كلمات البحث"
                : "ابدأ بإضافة طالب جديد للنظام"}
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm.show && deleteConfirm.student && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <TrashIcon className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-gray-900">تأكيد الحذف</h3>
                <p className="text-gray-600 text-sm">
                  هل أنت متأكد من حذف الطالب؟
                </p>
              </div>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <p className="text-red-800 text-sm font-medium">
                {deleteConfirm.student.name}
              </p>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteConfirm({ show: false, student: null })}
                className="px-6 py-2.5 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors font-medium"
              >
                إلغاء
              </button>
              <button
                onClick={() => deleteStudent(deleteConfirm.student!.id)}
                className="px-6 py-2.5 rounded-xl bg-red-600 text-white hover:bg-red-700 transition-colors font-medium"
              >
                نعم، احذف
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      <Toast message={toast.message} show={toast.show} type={toast.type} />
    </div>
  );
}
