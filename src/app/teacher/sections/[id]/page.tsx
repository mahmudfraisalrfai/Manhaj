"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeftIcon,
  PlusIcon,
  TrashIcon,
  ClockIcon,
  UsersIcon,
  CheckIcon,
  EyeIcon,
  BookIcon,
  TargetIcon,
  XIcon,
  PencilIcon,
} from "@/components/ui/Icon";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  deadline: string | null;
  _count: {
    studentTasks: number;
  };
}

interface Section {
  id: string;
  name: string;
  description: string;
  icon?: string | null;
}

export default function SectionDetailsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const params = useParams();
  const sectionId = params.id as string;

  const [section, setSection] = useState<Section | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddTaskForm, setShowAddTaskForm] = useState(false);
  const [taskFormData, setTaskFormData] = useState({
    title: "",
    description: "",
    deadline: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [isLoading, setIsLoadind] = useState(false);
  const [isDeleling, setIsDeleling] = useState({ isD: false, indx: 0 });

  useEffect(() => {
    if (session?.user?.role !== "teacher") {
      router.push("/dashboard");
      return;
    }
    fetchSectionData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, router, sectionId]);

  const fetchSectionData = async () => {
    try {
      setLoading(true);
      const [sectionRes, tasksRes] = await Promise.all([
        fetch(`/api/sections/${sectionId}`, { credentials: "include" }),
        fetch(`/api/sections/${sectionId}/tasks`, { credentials: "include" }),
      ]);

      if (!sectionRes.ok) {
        throw new Error("فشل في جلب بيانات القسم");
      }
      if (!tasksRes.ok) {
        throw new Error("فشل في جلب مهام القسم");
      }

      const sectionData = await sectionRes.json();
      const tasksData = await tasksRes.json();

      setSection(sectionData);
      setTasks(tasksData);
    } catch (error) {
      console.error("Error fetching section data:", error);
      alert((error as Error).message || "حدث خطأ في جلب البيانات");
    } finally {
      setLoading(false);
    }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          ...taskFormData,
          sectionId,
          dueDate: taskFormData.deadline || null,
        }),
      });

      if (response.ok) {
        setTaskFormData({ title: "", description: "", deadline: "" });
        setShowAddTaskForm(false);
        await fetchSectionData();
        alert("تم إضافة المهمة بنجاح");
      } else {
        const error = await response.json().catch(() => ({}));
        alert(error.error || "حدث خطأ أثناء إضافة المهمة");
      }
    } catch (error) {
      console.error(error);
      alert("حدث خطأ أثناء إضافة المهمة");
    } finally {
      setSubmitting(false);
    }
  };

  const deleteTask = async (taskId: string, indx: number) => {
    setIsDeleling({ isD: true, indx });
    if (!confirm("هل أنت متأكد من حذف هذه المهمة؟")) {
      setIsDeleling({ isD: false, indx: 0 });
      return;
    }

    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (response.ok) {
        await fetchSectionData();
        alert("تم حذف المهمة بنجاح");
      } else {
        throw new Error("فشل في حذف المهمة");
      }
    } catch (error) {
      console.error("Error deleting task:", error);
      alert("حدث خطأ أثناء حذف المهمة");
    } finally {
      setIsDeleling({ isD: false, indx: 0 });
    }
  };

  const toggleTaskCompletion = async (
    taskId: string,
    currentStatus: boolean
  ) => {
    setIsLoadind(true);
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ completed: !currentStatus }),
      });

      if (response.ok) {
        await fetchSectionData();
      } else {
        throw new Error("فشل في تحديث حالة المهمة");
      }
    } catch (error) {
      console.error("Error updating task:", error);
      alert("حدث خطأ في تحديث حالة المهمة");
    } finally {
      setIsLoadind(false);
    }
  };

  // دالة مساعدة لتنسيق التاريخ
  const formatGregorianDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center p-4">
        <div className="text-center">
          <LoadingSpinner size="lg" text="جاري تحميل بيانات القسم..." />
          <p className="text-gray-500 mt-4 text-sm">
            نعد لك تفاصيل القسم بأفضل شكل
          </p>
        </div>
      </div>
    );
  }

  if (!section) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center p-4">
        <div className="text-center bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/60">
          <BookIcon className="w-24 h-24 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            القسم غير موجود
          </h2>
          <p className="text-gray-600 mb-6">
            قد يكون القسم محذوفاً أو غير متاح
          </p>
          <Link
            href="/teacher/sections"
            className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-3 rounded-2xl hover:shadow-lg transition-all duration-200 inline-flex items-center gap-2 font-medium"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            العودة للأقسام
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-purple-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* رأس الصفحة المحسن */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/60 p-6 sm:p-8 mb-6 sm:mb-8">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            {/* معلومات القسم */}
            <div className="flex items-start gap-4 flex-1">
              {/* أيقونة القسم - محسنة */}
              <div className="relative">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center border-4 border-white shadow-2xl">
                  {section.icon ? (
                    <img
                      src={section.icon}
                      alt={section.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
                      <BookIcon className="text-white text-2xl sm:text-3xl" />
                    </div>
                  )}
                </div>
              </div>

              {/* معلومات القسم */}
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                  {section.name}
                </h1>
                {section.description && (
                  <p className="text-gray-600 text-lg leading-relaxed">
                    {section.description}
                  </p>
                )}
              </div>
            </div>

            {/* أزرار التحكم */}
            <div className="flex flex-col gap-3 lg:items-end">
              {/* زر العودة */}
              <Link
                href="/teacher/sections"
                className="flex items-center gap-2 text-gray-600 hover:text-gray-800 font-medium bg-white/60 backdrop-blur-sm px-4 py-2 rounded-2xl border border-gray-200 hover:border-gray-300 transition-all duration-200"
              >
                <ArrowLeftIcon className="w-4 h-4" />
                رجوع للأقسام
              </Link>

              {/* زر تعديل القسم */}
              <Link
                href={`/teacher/sections/${sectionId}/edit`}
                className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-3 rounded-2xl font-medium hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
              >
                <PencilIcon className="w-4 h-4" />
                تعديل القسم
              </Link>
            </div>
          </div>
        </div>

        {/* قسم المهام */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/60 overflow-hidden">
          {/* رأس قسم المهام */}
          <div className="p-6 sm:p-8 border-b border-gray-200/60">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl shadow-lg">
                  <TargetIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                    مهام القسم
                  </h2>
                  <p className="text-gray-600 mt-1">
                    إدارة المهام المرتبطة بهذا القسم
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowAddTaskForm(true)}
                className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-2xl font-medium hover:shadow-lg transition-all duration-200 flex items-center gap-2"
              >
                <PlusIcon className="w-5 h-5" />
                إضافة مهمة جديدة
              </button>
            </div>
          </div>

          {/* نموذج إضافة مهمة */}
          {showAddTaskForm && (
            <div className="p-6 sm:p-8 border-b border-gray-200/60 bg-gradient-to-r from-blue-50 to-cyan-50 animate-fade-in">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <PlusIcon className="w-5 h-5 text-blue-500" />
                  إضافة مهمة جديدة
                </h3>
                <button
                  onClick={() => setShowAddTaskForm(false)}
                  className="text-gray-400 hover:text-gray-600 p-2 rounded-xl hover:bg-white/50 transition-all duration-200"
                  disabled={submitting}
                >
                  <XIcon className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddTask} className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      عنوان المهمة *
                    </label>
                    <input
                      type="text"
                      value={taskFormData.title}
                      onChange={(e) =>
                        setTaskFormData({
                          ...taskFormData,
                          title: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white/80"
                      placeholder="أدخل عنوان المهمة"
                      required
                      disabled={submitting}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      موعد التسليم
                    </label>
                    <input
                      type="datetime-local"
                      value={taskFormData.deadline}
                      onChange={(e) =>
                        setTaskFormData({
                          ...taskFormData,
                          deadline: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white/80"
                      disabled={submitting}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    وصف المهمة
                  </label>
                  <textarea
                    value={taskFormData.description}
                    onChange={(e) =>
                      setTaskFormData({
                        ...taskFormData,
                        description: e.target.value,
                      })
                    }
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white/80 resize-none"
                    placeholder="وصف المهمة (اختياري)"
                    disabled={submitting}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-4 px-6 rounded-2xl font-semibold hover:shadow-xl transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        جاري الإضافة...
                      </>
                    ) : (
                      <>
                        <PlusIcon className="w-5 h-5" />
                        إضافة المهمة
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddTaskForm(false)}
                    className="flex-1 bg-gradient-to-r from-gray-500 to-gray-600 text-white py-4 px-6 rounded-2xl font-semibold hover:shadow-xl transition-all duration-200"
                  >
                    إلغاء
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* قائمة المهام */}
          <div className="p-6 sm:p-8">
            {tasks.length > 0 ? (
              <div className="space-y-4">
                {tasks.map((task, indx) => (
                  <div
                    key={task.id}
                    className="bg-white rounded-2xl border-2 border-gray-100 hover:border-blue-200 transition-all duration-300 p-6 hover:shadow-lg"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1 min-w-0">
                        {/* زر حالة المهمة */}
                        {isLoading ? (
                          <div className="flex-shrink-0 mt-1">
                            <LoadingSpinner size="sm" />
                          </div>
                        ) : (
                          <button
                            disabled={isLoading}
                            onClick={() =>
                              toggleTaskCompletion(task.id, task.completed)
                            }
                            className={`w-8 h-8 rounded-2xl border-2 flex items-center justify-center flex-shrink-0 mt-1 transition-all duration-200 ${
                              task.completed
                                ? "bg-gradient-to-r from-green-500 to-emerald-600 border-green-500 text-white shadow-lg"
                                : "border-gray-300 hover:border-green-500 hover:shadow-md"
                            }`}
                          >
                            {task.completed && (
                              <CheckIcon className="w-4 h-4" />
                            )}
                          </button>
                        )}

                        {/* محتوى المهمة */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
                            <h3
                              className={`text-lg font-semibold ${
                                task.completed
                                  ? "text-gray-500 line-through"
                                  : "text-gray-900"
                              }`}
                            >
                              {task.title}
                            </h3>
                            <span
                              className={`px-3 py-1 rounded-full text-sm font-medium ${
                                task.completed
                                  ? "bg-green-100 text-green-800"
                                  : "bg-orange-100 text-orange-800"
                              }`}
                            >
                              {task.completed ? "مكتمل" : "قيد التنفيذ"}
                            </span>
                          </div>

                          {task.description && (
                            <p className="text-gray-600 mb-4 leading-relaxed">
                              {task.description}
                            </p>
                          )}

                          <div className="flex flex-wrap gap-2">
                            {task.deadline && (
                              <span
                                className={`flex items-center gap-1 px-3 py-2 rounded-xl text-sm ${
                                  new Date(task.deadline) < new Date() &&
                                  !task.completed
                                    ? "bg-red-100 text-red-800"
                                    : "bg-blue-100 text-blue-800"
                                }`}
                              >
                                <ClockIcon className="w-4 h-4" />
                                {formatGregorianDate(task.deadline)}
                              </span>
                            )}
                            <span className="flex items-center gap-1 bg-purple-100 text-purple-800 px-3 py-2 rounded-xl text-sm">
                              <UsersIcon className="w-4 h-4" />
                              {task._count.studentTasks} طالب
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* أزرار الإجراءات */}
                      <div className="flex flex-wrap gap-2 lg:flex-col lg:flex-nowrap">
                        <Link
                          href={`/teacher/tasks/${task.id}/assign`}
                          className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 flex-1"
                        >
                          <UsersIcon className="w-4 h-4" />
                          تعيين
                        </Link>
                        <Link
                          href={`/teacher/tasks/${task.id}/progress`}
                          className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-4 py-2 rounded-xl text-sm font-medium hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 flex-1"
                        >
                          <EyeIcon className="w-4 h-4" />
                          متابعة
                        </Link>
                        <button
                          onClick={() => deleteTask(task.id, indx)}
                          disabled={isDeleling.isD && isDeleling.indx === indx}
                          className="bg-gradient-to-r from-red-500 to-pink-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:shadow-lg transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2 flex-1"
                        >
                          {isDeleling.isD && isDeleling.indx === indx ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <TrashIcon className="w-4 h-4" />
                          )}
                          حذف
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 sm:py-16">
                <TargetIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  لا توجد مهام في هذا القسم
                </h3>
                <p className="text-gray-600 mb-6">
                  ابدأ بإضافة أول مهمة لتنظيم العمل
                </p>
                <button
                  onClick={() => setShowAddTaskForm(true)}
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-8 py-4 rounded-2xl font-semibold hover:shadow-lg transition-all duration-200 inline-flex items-center gap-2"
                >
                  <PlusIcon className="w-5 h-5" />
                  إضافة أول مهمة
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
