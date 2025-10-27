// app/teacher/tasks/[id]/progress/page.tsx
"use client";
import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useParams } from "next/navigation";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import {
  SearchIcon,
  PencilIcon,
  SortIcon,
  WhatsAppIcon,
} from "@/components/ui/Icon";

interface StudentProgress {
  id: string;
  name: string;
  status: string;
  submittedAt: string | null;
  createdAt: string;
  note?: string | null;
  studentNote?: string | null;
  phone?: string | null;
}

interface TaskDetails {
  id: string;
  title: string;
  description: string | null;
  section: { name: string };
  deadline: string | null;
  completed: boolean;
}

// مكون النوتيفيكيشن المحسن
function EnhancedToast({
  message,
  show,
  type = "success",
}: {
  message: string;
  show: boolean;
  type?: "success" | "error" | "info";
}) {
  const bgColor = {
    success: "bg-green-500",
    error: "bg-red-500",
    info: "bg-blue-500",
  }[type];

  const icon = {
    success: "✓",
    error: "✕",
    info: "ℹ",
  }[type];

  if (!show) return null;

  return (
    <div className="fixed left-4 bottom-6 z-50 animate-fade-in-up">
      <div
        className={`${bgColor} text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 min-w-64`}
      >
        <span className="font-bold">{icon}</span>
        <span className="flex-1">{message}</span>
      </div>
    </div>
  );
}

function useDebounced<T>(value: T, delay = 300) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setV(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return v;
}

export default function EnhancedTaskProgressPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const params = useParams();
  const taskId = params.id as string;

  const [task, setTask] = useState<TaskDetails | null>(null);
  const [students, setStudents] = useState<StudentProgress[]>([]);
  const [loading, setLoading] = useState(true);

  // UI state
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounced(search, 300);
  const [statusFilter, setStatusFilter] = useState<
    "all" | "pending" | "completed"
  >("all");

  // Sorting state
  const [sortConfig, setSortConfig] = useState<{
    key: keyof StudentProgress;
    direction: "asc" | "desc";
  } | null>(null);

  // inline note editing
  const [editingId, setEditingId] = useState<string | null>(null);
  const [noteDrafts, setNoteDrafts] = useState<Record<string, string>>({});
  const [savingNoteId, setSavingNoteId] = useState<string | null>(null);

  // toast state
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success" as "success" | "error" | "info",
  });

  const showToast = useCallback(
    (msg: string, type: "success" | "error" | "info" = "success") => {
      setToast({ show: true, message: msg, type });
      setTimeout(
        () => setToast({ show: false, message: "", type: "success" }),
        4000
      );
    },
    []
  );

  useEffect(() => {
    if (session?.user?.role !== "teacher") {
      router.push("/dashboard");
      return;
    }
    fetchTaskProgress();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, router, taskId]);

  const fetchTaskProgress = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/tasks/${taskId}/progress`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();

      setTask(data.task);
      setStudents(data.students || []);

      const drafts: Record<string, string> = {};
      (data.students || []).forEach((s: StudentProgress) => {
        drafts[s.id] = s.note ?? "";
      });
      setNoteDrafts(drafts);
    } catch (err) {
      console.error("Error fetching progress:", err);
      showToast("حدث خطأ أثناء جلب بيانات المتابعة", "error");
    } finally {
      setLoading(false);
    }
  };

  const updateStudentStatus = async (
    studentTaskId: string,
    newStatus: string
  ) => {
    try {
      const res = await fetch(`/api/student-tasks/${studentTaskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        showToast("تم تحديث الحالة بنجاح");
        await fetchTaskProgress();
      } else {
        const err = await res.json().catch(() => ({}));
        showToast(err?.error || "فشل تحديث الحالة", "error");
      }
    } catch (err) {
      console.error("updateStudentStatus error:", err);
      showToast("فشل الاتصال عند تحديث الحالة", "error");
    }
  };

  const saveNote = async (studentTaskId: string) => {
    const draft = noteDrafts[studentTaskId] ?? "";
    if (draft === (students.find((s) => s.id === studentTaskId)?.note ?? "")) {
      setEditingId(null);
      return;
    }

    setSavingNoteId(studentTaskId);
    try {
      const res = await fetch(`/api/student-tasks/${studentTaskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note: draft }),
      });

      if (res.ok) {
        showToast("تم حفظ الملاحظة بنجاح");
        await fetchTaskProgress();
        setEditingId(null);
      } else {
        const err = await res.json().catch(() => ({}));
        showToast(err?.error || "فشل في حفظ الملاحظة", "error");
      }
    } catch (err) {
      console.error("saveNote error:", err);
      showToast("حدث خطأ أثناء حفظ الملاحظة", "error");
    } finally {
      setSavingNoteId(null);
    }
  };

  // تعريف نوع للمفاتيح القابلة للترتيب
  type SortableKey = "name" | "status" | "submittedAt";

  // دالة لفتح محادثة الواتساب
  const openWhatsAppChat = (student: StudentProgress) => {
    // إذا كان هناك رقم هاتف مخزن
    if (student.phone) {
      const phone = student.phone.replace(/\D/g, ""); // إزالة أي رموز غير رقمية
      const message = `مرحباً ${student.name}، أريد متابعة المهمة: ${task?.title}`;
      const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
      window.open(url, "_blank");
    } else {
      // إذا لم يكن هناك رقم هاتف، نفتح الواتساب بدون رقم
      const message = `أريد التواصل مع الطالب ${student.name} بخصوص المهمة: ${task?.title}`;
      const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
      window.open(url, "_blank");
    }
  };

  // تحديث الدالة handleSort
  const handleSort = (key: SortableKey) => {
    let direction: "asc" | "desc" = "asc";
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === "asc"
    ) {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  // Apply sorting and filtering
  const filteredAndSorted = useMemo(() => {
    let result = [...students];

    // Apply search filter
    const term = (debouncedSearch || "").trim().toLowerCase();
    if (term) {
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(term) ||
          (s.studentNote || "").toLowerCase().includes(term) ||
          (s.note || "").toLowerCase().includes(term)
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      result = result.filter((s) => s.status === statusFilter);
    }

    // الحل الصحيح للدالة
    if (sortConfig) {
      result.sort((a, b) => {
        let aValue: string | number | null | undefined = a[sortConfig.key];
        let bValue: string | number | null | undefined = b[sortConfig.key];

        // معالجة التواريخ بشكل صحيح
        if (sortConfig.key === "submittedAt") {
          aValue = aValue ? new Date(aValue as string).getTime() : 0;
          bValue = bValue ? new Date(bValue as string).getTime() : 0;
        }

        // تحويل القيم للنص للمقارنة إذا كانت غير رقمية
        if (typeof aValue !== "number")
          aValue = String(aValue || "").toLowerCase();
        if (typeof bValue !== "number")
          bValue = String(bValue || "").toLowerCase();

        if (aValue < bValue) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
    }

    return result;
  }, [students, debouncedSearch, statusFilter, sortConfig]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" text="جاري تحميل بيانات المتابعة..." />
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-700 mb-2">
            المهمة غير موجودة
          </div>
          <Link
            href="/teacher/sections"
            className="text-blue-600 hover:underline"
          >
            العودة إلى الأقسام
          </Link>
        </div>
      </div>
    );
  }

  const completedCount = students.filter(
    (s) => s.status === "completed"
  ).length;
  const pendingCount = students.filter((s) => s.status === "pending").length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Enhanced Header */}
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-6 mb-8">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <Link
                href="/teacher/sections"
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 hover:underline transition-colors font-medium"
              >
                <span>←</span>
                <span>رجوع</span>
              </Link>
              <div className="w-1 h-6 bg-blue-200 rounded-full"></div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                متابعة المهمة
              </h1>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                {task.title}
              </h2>
              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <span className="font-medium">القسم:</span>
                  <span>{task.section.name}</span>
                </div>
                {task.deadline && (
                  <div className="flex items-center gap-2">
                    <span className="font-medium">آخر موعد:</span>
                    <span
                      className={
                        new Date(task.deadline) < new Date()
                          ? "text-red-600 font-medium"
                          : ""
                      }
                    >
                      {new Date(task.deadline).toLocaleDateString("ar-SA")}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Enhanced Stats and Controls */}
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 text-center transition-all hover:shadow-md">
                <div className="text-2xl font-bold text-gray-800">
                  {students.length}
                </div>
                <div className="text-xs text-gray-500 mt-1">إجمالي الطلاب</div>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-sm border border-green-200 text-center transition-all hover:shadow-md">
                <div className="text-2xl font-bold text-green-600">
                  {completedCount}
                </div>
                <div className="text-xs text-gray-500 mt-1">مكتمل</div>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-sm border border-orange-200 text-center transition-all hover:shadow-md">
                <div className="text-2xl font-bold text-orange-600">
                  {pendingCount}
                </div>
                <div className="text-xs text-gray-500 mt-1">قيد الانتظار</div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="ابحث باسم الطالب أو ملاحظة..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm transition-all"
                  aria-label="بحث في تقدم الطلاب"
                />
                <SearchIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-4 py-3 rounded-xl border border-gray-300 bg-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all min-w-32"
                aria-label="فلترة بالحالة"
              >
                <option value="all">الكل</option>
                <option value="pending">قيد الانتظار</option>
                <option value="completed">مكتمل</option>
              </select>
            </div>
          </div>
        </div>

        {/* Enhanced Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                <tr>
                  <th
                    className="text-right px-6 py-4 text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-200 transition-colors"
                    onClick={() => handleSort("name")}
                  >
                    <div className="flex items-center justify-end gap-2">
                      اسم الطالب
                      <SortIcon
                        className={`w-4 h-4 transition-transform ${
                          sortConfig?.key === "name" &&
                          sortConfig.direction === "desc"
                            ? "rotate-180"
                            : ""
                        }`}
                      />
                    </div>
                  </th>
                  <th
                    className="text-right px-6 py-4 text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-200 transition-colors"
                    onClick={() => handleSort("status")}
                  >
                    <div className="flex items-center justify-end gap-2">
                      الحالة
                      <SortIcon
                        className={`w-4 h-4 transition-transform ${
                          sortConfig?.key === "status" &&
                          sortConfig.direction === "desc"
                            ? "rotate-180"
                            : ""
                        }`}
                      />
                    </div>
                  </th>
                  <th
                    className="text-right px-6 py-4 text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-200 transition-colors"
                    onClick={() => handleSort("submittedAt")}
                  >
                    <div className="flex items-center justify-end gap-2">
                      تاريخ التسليم
                      <SortIcon
                        className={`w-4 h-4 transition-transform ${
                          sortConfig?.key === "submittedAt" &&
                          sortConfig.direction === "desc"
                            ? "rotate-180"
                            : ""
                        }`}
                      />
                    </div>
                  </th>
                  <th className="text-right px-6 py-4 text-sm font-semibold text-gray-700">
                    ملاحظة الطالب
                  </th>
                  <th className="text-right px-6 py-4 text-sm font-semibold text-gray-700">
                    ملاحظة المدرّس
                  </th>
                  <th className="text-right px-6 py-4 text-sm font-semibold text-gray-700">
                    الإجراءات
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredAndSorted.map((s) => (
                  <tr
                    key={s.id}
                    className="hover:bg-gray-50 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {s.name}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-all ${
                          s.status === "completed"
                            ? "bg-green-100 text-green-800 group-hover:bg-green-200"
                            : "bg-orange-100 text-orange-800 group-hover:bg-orange-200"
                        }`}
                      >
                        {s.status === "completed" ? "مكتمل" : "قيد الانتظار"}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600">
                        {s.submittedAt ? (
                          new Date(s.submittedAt).toLocaleDateString("ar-SA")
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4 max-w-xs">
                      <div className="text-sm text-gray-700 break-words">
                        {s.studentNote ? (
                          <div className="whitespace-pre-wrap bg-blue-50 p-3 rounded-lg border border-blue-100">
                            {s.studentNote}
                          </div>
                        ) : (
                          <span className="text-gray-400 italic">
                            لا توجد ملاحظة
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4 max-w-xs">
                      {editingId === s.id ? (
                        <div className="flex flex-col gap-3">
                          <textarea
                            value={noteDrafts[s.id] ?? ""}
                            onChange={(e) =>
                              setNoteDrafts((p) => ({
                                ...p,
                                [s.id]: e.target.value,
                              }))
                            }
                            rows={3}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical transition-all"
                            placeholder="أدخل ملاحظتك هنا..."
                          />
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => saveNote(s.id)}
                              disabled={savingNoteId === s.id}
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                            >
                              {savingNoteId === s.id ? (
                                <>
                                  <LoadingSpinner size="sm" />
                                  جاري الحفظ...
                                </>
                              ) : (
                                "حفظ"
                              )}
                            </button>
                            <button
                              onClick={() => {
                                setEditingId(null);
                                setNoteDrafts((p) => ({
                                  ...p,
                                  [s.id]: s.note ?? "",
                                }));
                              }}
                              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                            >
                              إلغاء
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-start justify-between gap-4 group/note">
                          <div className="flex-1">
                            <div
                              className={`text-sm text-gray-700 break-words p-3 rounded-lg transition-all ${
                                s.note
                                  ? "bg-gray-50 border border-gray-200 group-hover/note:bg-gray-100"
                                  : ""
                              }`}
                            >
                              {s.note ?? (
                                <span className="text-gray-400 italic">
                                  لا توجد ملاحظة
                                </span>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() => setEditingId(s.id)}
                            className="opacity-0 group-hover/note:opacity-100 px-3 py-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all flex items-center gap-2 text-sm font-medium"
                          >
                            <PencilIcon className="w-4 h-4" />
                            تعديل
                          </button>
                        </div>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        {s.status === "pending" ? (
                          <button
                            onClick={() =>
                              updateStudentStatus(s.id, "completed")
                            }
                            className="px-3 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors shadow-sm flex items-center gap-2"
                          >
                            تم التسليم
                          </button>
                        ) : (
                          <button
                            onClick={() => updateStudentStatus(s.id, "pending")}
                            className="px-3 py-2 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700 transition-colors shadow-sm flex items-center gap-2"
                          >
                            إلغاء التسليم
                          </button>
                        )}

                        {/* زر الواتساب المضاف */}
                        <button
                          onClick={() => openWhatsAppChat(s)}
                          className="px-3 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-colors shadow-sm flex items-center gap-2"
                          title="فتح محادثة واتساب"
                        >
                          <WhatsAppIcon className="w-4 h-4" />
                          واتساب
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredAndSorted.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">📝</div>
                <div className="text-gray-500 font-medium mb-2">
                  لا توجد نتائج
                </div>
                <div className="text-gray-400 text-sm">
                  {debouncedSearch || statusFilter !== "all"
                    ? "جرب تغيير كلمات البحث أو عوامل التصفية"
                    : "لا توجد بيانات للعرض"}
                </div>
              </div>
            )}
          </div>

          {/* Mobile Cards - محسن */}
          <div className="md:hidden space-y-4 p-4">
            {filteredAndSorted.map((s) => (
              <div
                key={s.id}
                className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex justify-between items-start gap-4 mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          s.status === "completed"
                            ? "bg-green-500"
                            : "bg-orange-500"
                        }`}
                      />
                      <div className="font-semibold text-gray-900">
                        {s.name}
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">
                      {s.submittedAt
                        ? `تم التسليم: ${new Date(
                            s.submittedAt
                          ).toLocaleDateString("ar-SA")}`
                        : "لم يُسلّم بعد"}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        s.status === "completed"
                          ? "bg-green-100 text-green-800"
                          : "bg-orange-100 text-orange-800"
                      }`}
                    >
                      {s.status === "completed" ? "مكتمل" : "قيد الانتظار"}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="text-xs font-medium text-gray-700 mb-1">
                      ملاحظة الطالب:
                    </div>
                    <div className="text-sm text-gray-600 bg-blue-50 p-2 rounded-lg">
                      {s.studentNote ?? (
                        <span className="text-gray-400 italic">
                          لا توجد ملاحظة
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs font-medium text-gray-700 mb-1">
                      ملاحظة المدرّس:
                    </div>
                    {editingId === s.id ? (
                      <div className="space-y-2">
                        <textarea
                          rows={3}
                          value={noteDrafts[s.id] ?? ""}
                          onChange={(e) =>
                            setNoteDrafts((p) => ({
                              ...p,
                              [s.id]: e.target.value,
                            }))
                          }
                          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                          placeholder="أدخل ملاحظتك هنا..."
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => saveNote(s.id)}
                            disabled={savingNoteId === s.id}
                            className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium disabled:opacity-50"
                          >
                            {savingNoteId === s.id ? "جاري الحفظ..." : "حفظ"}
                          </button>
                          <button
                            onClick={() => {
                              setEditingId(null);
                              setNoteDrafts((p) => ({
                                ...p,
                                [s.id]: s.note ?? "",
                              }));
                            }}
                            className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium"
                          >
                            إلغاء
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 text-sm text-gray-600 bg-gray-50 p-2 rounded-lg">
                          {s.note ?? (
                            <span className="text-gray-400 italic">
                              لا توجد ملاحظة
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => setEditingId(s.id)}
                          className="px-3 py-1 text-blue-600 text-sm font-medium"
                        >
                          تعديل
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-200 flex gap-2">
                  {s.status === "pending" ? (
                    <button
                      onClick={() => updateStudentStatus(s.id, "completed")}
                      className="flex-1 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                    >
                      تم التسليم
                    </button>
                  ) : (
                    <button
                      onClick={() => updateStudentStatus(s.id, "pending")}
                      className="flex-1 py-2 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700 transition-colors"
                    >
                      إلغاء التسليم
                    </button>
                  )}

                  {/* زر الواتساب للجوال */}
                  <button
                    onClick={() => openWhatsAppChat(s)}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-colors flex items-center justify-center gap-1"
                    title="واتساب"
                  >
                    <WhatsAppIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}

            {filteredAndSorted.length === 0 && (
              <div className="text-center py-8">
                <div className="text-gray-400 text-4xl mb-3">📝</div>
                <div className="text-gray-500 font-medium mb-1">
                  لا توجد نتائج
                </div>
                <div className="text-gray-400 text-xs">
                  {debouncedSearch || statusFilter !== "all"
                    ? "جرب تغيير البحث أو التصفية"
                    : "لا توجد بيانات للعرض"}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <EnhancedToast
        message={toast.message}
        show={toast.show}
        type={toast.type}
      />
    </div>
  );
}
