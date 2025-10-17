// app/teacher/sections/[id]/page.tsx
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
  ShareIcon,
  BookIcon,
  TargetIcon,
  ChartIcon,
  XIcon,
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
  }, [session, router, sectionId]);

  const fetchSectionData = async () => {
    try {
      const [sectionRes, tasksRes] = await Promise.all([
        fetch(`/api/sections/${sectionId}`),
        fetch(`/api/sections/${sectionId}/tasks`),
      ]);

      if (!sectionRes.ok || !tasksRes.ok) {
        throw new Error("فشل في جلب البيانات");
      }

      const sectionData = await sectionRes.json();
      const tasksData = await tasksRes.json();

      setSection(sectionData);
      setTasks(tasksData);
    } catch (error) {
      console.error("Error fetching section data:", error);
      alert("حدث خطأ في جلب البيانات");
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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...taskFormData,
          sectionId,
          deadline: taskFormData.deadline || null,
        }),
      });

      if (response.ok) {
        setTaskFormData({ title: "", description: "", deadline: "" });
        setShowAddTaskForm(false);
        await fetchSectionData();
        alert("تم إضافة المهمة بنجاح");
      } else {
        const error = await response.json();
        alert(error.error || "حدث خطأ أثناء إضافة المهمة");
      }
    } catch (error) {
      alert("حدث خطأ أثناء إضافة المهمة");
    } finally {
      setSubmitting(false);
    }
  };

  const deleteTask = async (taskId: string, indx: number) => {
    setIsDeleling({ isD: true, indx });
    if (!confirm("هل أنت متأكد من حذف هذه المهمة؟")) return;

    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "DELETE",
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
      setIsDeleling({ isD: false, indx });
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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ completed: !currentStatus }),
      });

      if (response.ok) {
        await fetchSectionData();
      }
    } catch (error) {
      console.error("Error updating task:", error);
      alert("حدث خطأ في تحديث حالة المهمة");
    } finally {
      setIsLoadind(false);
    }
  };

  // دالة لتنسيق التاريخ الميلادي
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

  // دالة لتنسيق التاريخ الميلادي بدون وقت
  const formatGregorianDateShort = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="جاري تحميل بيانات القسم..." />
      </div>
    );
  }

  if (!section) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <BookIcon className="w-24 h-24 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            القسم غير موجود
          </h2>
          <p className="text-gray-600 mb-4">
            قد يكون القسم محذوفاً أو غير متاح
          </p>
          <Link
            href="/teacher/sections"
            className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors duration-200 font-medium inline-flex items-center"
          >
            <ArrowLeftIcon className="ml-2 w-4 h-4" />
            العودة للأقسام
          </Link>
        </div>
      </div>
    );
  }

  const completedTasks = tasks.filter((t) => t.completed).length;
  const pendingTasks = tasks.filter((t) => !t.completed).length;

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* رأس الصفحة */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8 gap-4">
          <div className="flex items-center gap-4">
            <Link
              href="/teacher/sections"
              className="text-blue-500 hover:text-blue-700 transition-colors duration-200 flex items-center group"
            >
              <ArrowLeftIcon className="ml-1 w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200" />
              رجوع للأقسام
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <BookIcon className="text-white text-lg" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {section.name}
                </h1>
                <p className="text-gray-600 mt-1">{section.description}</p>
              </div>
            </div>
          </div>
          <button
            onClick={() => setShowAddTaskForm(true)}
            className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-all duration-200 font-medium flex items-center shadow-sm hover:shadow-md"
            disabled={submitting}
          >
            <PlusIcon className="ml-2 w-4 h-4" />
            إضافة مهمة
          </button>
        </div>
        {/* إحصائيات سريعة */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 card-hover">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-blue-600 mb-1">
                  {tasks.length}
                </div>
                <div className="text-sm text-gray-600">إجمالي المهام</div>
              </div>
              <TargetIcon className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 card-hover">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-green-600 mb-1">
                  {completedTasks}
                </div>
                <div className="text-sm text-gray-600">مهام مكتملة</div>
              </div>
              <CheckIcon className="w-8 h-8 text-green-500" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 card-hover">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-orange-600 mb-1">
                  {pendingTasks}
                </div>
                <div className="text-sm text-gray-600">مهام نشطة</div>
              </div>
              <ClockIcon className="w-8 h-8 text-orange-500" />
            </div>
          </div>
        </div>
        {/* نموذج إضافة مهمة */}
        {showAddTaskForm && (
          <div className="bg-white rounded-xl shadow-lg border border-blue-200 p-6 mb-8 animate-fade-in">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                <PlusIcon className="ml-2 w-5 h-5 text-blue-500" />
                إضافة مهمة جديدة
              </h3>
              <button
                onClick={() => setShowAddTaskForm(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-1"
                disabled={submitting}
              >
                <XIcon className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddTask} className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                    placeholder="أدخل عنوان المهمة"
                    required
                    disabled={submitting}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                    disabled={submitting}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  placeholder="أدخل وصفاً تفصيلياً للمهمة (اختياري)"
                  disabled={submitting}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-blue-500 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      جاري الإضافة...
                    </>
                  ) : (
                    <>
                      <PlusIcon className="ml-2 w-4 h-4" />
                      إضافة المهمة
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddTaskForm(false)}
                  className="flex-1 bg-gray-500 text-white py-3 px-6 rounded-lg font-medium hover:bg-gray-600 transition-colors duration-200 flex items-center justify-center"
                  disabled={submitting}
                >
                  <XIcon className="ml-2 w-4 h-4" />
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        )}

        {/* قائمة المهام */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-4 sm:p-6 border-b border-gray-200">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 flex items-center justify-center sm:justify-start">
              <TargetIcon className="ml-2 w-5 h-5 text-blue-500" />
              مهام القسم ({tasks.length})
            </h3>
          </div>

          <div className="p-4 sm:p-6">
            {tasks.length > 0 ? (
              <div className="space-y-4">
                {tasks.map((task, indx) => (
                  <div
                    key={task.id}
                    className="flex flex-col sm:flex-row sm:items-start sm:justify-between p-4 sm:p-6 border border-gray-200 rounded-xl hover:shadow-md transition-all duration-200 bg-white group gap-4"
                  >
                    {/* الجزء الأيسر - معلومات المهمة */}
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      {isLoading ? (
                        <LoadingSpinner size="sm" />
                      ) : (
                        <button
                          disabled={isLoading}
                          onClick={() =>
                            toggleTaskCompletion(task.id, task.completed)
                          }
                          className={`flex-shrink-0 w-6 h-6 rounded border-2 flex items-center justify-center transition-all duration-200 mt-1 ${
                            task.completed
                              ? "bg-green-500 border-green-500 text-white shadow-sm"
                              : "border-gray-300 hover:border-green-500 hover:shadow-sm"
                          }`}
                          title={task.completed ? "تم الإكمال" : "标记为完成"}
                        >
                          {task.completed && <CheckIcon className="w-3 h-3" />}
                        </button>
                      )}
                      <div className="flex-1 min-w-0">
                        <h5
                          className={`font-semibold text-base sm:text-lg mb-2 break-words ${
                            task.completed
                              ? "text-gray-500 line-through"
                              : "text-gray-900"
                          }`}
                        >
                          {task.title}
                        </h5>

                        <p className="text-gray-600 mb-3 leading-relaxed text-sm sm:text-base break-words line-clamp-2">
                          {task.description || "لا يوجد وصف للمهمة"}
                        </p>

                        <div className="flex flex-wrap gap-2">
                          {task.deadline && (
                            <span
                              className={`text-xs px-2 py-1 rounded-full flex items-center max-w-full ${
                                new Date(task.deadline) < new Date() &&
                                !task.completed
                                  ? "bg-red-100 text-red-800"
                                  : "bg-orange-100 text-orange-800"
                              }`}
                            >
                              <ClockIcon className="ml-1 w-3 h-3 flex-shrink-0" />
                              <span className="truncate text-xs">
                                {formatGregorianDate(task.deadline)}
                              </span>
                            </span>
                          )}

                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full flex items-center">
                            <UsersIcon className="ml-1 w-3 h-3 flex-shrink-0" />
                            <span className="text-xs">
                              {task._count.studentTasks} طالب
                            </span>
                          </span>

                          <span
                            className={`text-xs px-2 py-1 rounded-full flex items-center ${
                              task.completed
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            <ChartIcon className="ml-1 w-3 h-3 flex-shrink-0" />
                            <span className="text-xs">
                              {task.completed ? "مكتمل" : "قيد التنفيذ"}
                            </span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* الجزء الأيمن - الأزرار */}
                    <div className="flex flex-wrap gap-2 sm:flex-nowrap sm:flex-col justify-start sm:justify-center">
                      <Link
                        href={`/teacher/tasks/${task.id}/assign`}
                        className="flex-1 sm:flex-none bg-green-500 text-white px-3 py-2 rounded-lg hover:bg-green-600 transition-all duration-200 font-medium flex items-center justify-center text-sm shadow-sm hover:shadow-md min-w-[100px]"
                        title="تعيين الطلاب لهذه المهمة"
                      >
                        <ShareIcon className="ml-1 w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="text-xs sm:text-sm">تعيين</span>
                      </Link>

                      <Link
                        href={`/teacher/tasks/${task.id}/progress`}
                        className="flex-1 sm:flex-none bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600 transition-all duration-200 font-medium flex items-center justify-center text-sm shadow-sm hover:shadow-md min-w-[100px]"
                        title="متابعة تقدم الطلاب"
                      >
                        <EyeIcon className="ml-1 w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="text-xs sm:text-sm">متابعة</span>
                      </Link>
                      {isDeleling.indx == indx && isDeleling.isD ? (
                        <LoadingSpinner size="sm" text="...جاري الحذف" />
                      ) : (
                        <button
                          onClick={() => deleteTask(task.id, indx)}
                          className="flex-1 sm:flex-none bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600 transition-all duration-200 font-medium flex items-center justify-center text-sm shadow-sm hover:shadow-md min-w-[100px]"
                          title="حذف المهمة"
                        >
                          <TrashIcon className="ml-1 w-3 h-3 sm:w-4 sm:h-4" />
                          <span className="text-xs sm:text-sm">حذف</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 sm:py-12">
                <TargetIcon className="w-16 h-16 sm:w-24 sm:h-24 text-gray-300 mx-auto mb-4" />
                <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
                  لا توجد مهام في هذا القسم
                </h3>
                <p className="text-gray-500 mb-4 sm:mb-6 text-sm sm:text-base">
                  ابدأ بإضافة أول مهمة لتنظيم العمل مع الطلاب
                </p>
                <button
                  onClick={() => setShowAddTaskForm(true)}
                  className="bg-blue-500 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-lg hover:bg-blue-600 transition-colors duration-200 font-medium inline-flex items-center text-sm sm:text-base"
                >
                  <PlusIcon className="ml-2 w-3 h-3 sm:w-4 sm:h-4" />
                  إضافة أول مهمة
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        .card-hover {
          transition: all 0.3s ease;
        }
        .card-hover:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1),
            0 10px 10px -5px rgba(0, 0, 0, 0.04);
        }
      `}</style>
    </div>
  );
}
