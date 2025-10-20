//app/teacher/sections/page.tsx
"use client";
import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  BookIcon,
  PlusIcon,
  TrashIcon,
  ChartIcon,
  TargetIcon,
} from "@/components/ui/Icon";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

interface Section {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  _count: {
    tasks: number;
  };
}

export default function SectionsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedTerm, setDebouncedTerm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (session?.user?.role !== "teacher") {
      router.push("/dashboard");
      return;
    }
    const controller = new AbortController();
    fetchSections(controller.signal);
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, router]);

  // Debounce search input for better UX
  useEffect(() => {
    const t = setTimeout(() => setDebouncedTerm(searchTerm.trim()), 250);
    return () => clearTimeout(t);
  }, [searchTerm]);

  const fetchSections = useCallback(async (signal?: AbortSignal) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/sections", { signal });
      if (!response.ok) throw new Error("فشلت عملية جلب الأقسام");
      const data: Section[] = await response.json();
      setSections(data);
    } catch (err) {
      if ((err as any)?.name === "AbortError") return; // cancelled
      console.error("Error fetching sections:", err);
      setError("حدث خطأ أثناء تحميل الأقسام. حاول لاحقًا.");
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteSection = async (sectionId: string) => {
    // small optimistic UI with undo possibility could be added later — for now straightforward
    const ok = window.confirm(
      "هل أنت متأكد من حذف هذا القسم؟ سيتم حذف جميع المهام المرتبطة به."
    );
    if (!ok) return;

    try {
      setDeletingId(sectionId);
      setError(null);
      const response = await fetch(`/api/sections/${sectionId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload?.error || "فشل حذف القسم");
      }

      // remove from list
      setSections((s) => s.filter((section) => section.id !== sectionId));
    } catch (err) {
      console.error("Error deleting section:", err);
      setError(
        (err as Error)?.message || "حدث خطأ أثناء حذف القسم. حاول مرة أخرى."
      );
    } finally {
      setDeletingId(null);
    }
  };

  // تصفية الأقسام حسب البحث (على المصطلح المؤخر - debounced)
  const filteredSections = sections.filter((section) => {
    if (!debouncedTerm) return true;
    const t = debouncedTerm.toLowerCase();
    return (
      section.name.toLowerCase().includes(t) ||
      section.description.toLowerCase().includes(t)
    );
  });

  const renderSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse"
          aria-hidden
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gray-200 rounded-lg" />
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded mb-2" />
                <div className="h-3 bg-gray-200 rounded w-3/4" />
              </div>
            </div>
            <div className="w-8 h-8 bg-gray-200 rounded" />
          </div>
          <div className="h-3 bg-gray-200 rounded w-1/3" />
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* الرأس */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
              <BookIcon className="ml-2 w-8 h-8 text-blue-500" />
              الأقسام الدراسية
            </h1>
            <p className="text-gray-600">
              إدارة الأقسام والمهام الدراسية للطلاب
            </p>
          </div>
          <Link
            href="/teacher/sections/add"
            className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors duration-200 font-medium text-center flex items-center justify-center"
            aria-label="إضافة قسم جديد"
          >
            <PlusIcon className="ml-2 w-4 h-4" />
            إضافة قسم جديد
          </Link>
        </div>

        {/* إشعار الأخطاء */}
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700">
            {error}
            <button
              onClick={() => setError(null)}
              className="mr-4 text-sm underline"
              aria-label="إغلاق الإشعار"
            >
              إغلاق
            </button>
          </div>
        )}

        {/* شريط البحث والإحصائيات */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          <div className="lg:col-span-1">
            <div className="relative">
              <input
                type="text"
                placeholder="ابحث في الأقسام..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                aria-label="بحث في الأقسام"
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                <ChartIcon className="w-5 h-5 text-gray-400" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              نتائج البحث ستظهر بعد لحظة صغيرة بينما تكتب.
            </p>
          </div>

          {/* إحصائيات سريعة */}
          <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-blue-600 mb-1">
                    {sections.length}
                  </div>
                  <div className="text-sm text-gray-600">عدد الأقسام</div>
                </div>
                <BookIcon className="w-8 h-8 text-blue-500" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-green-600 mb-1">
                    {sections.reduce(
                      (acc, section) => acc + section._count.tasks,
                      0
                    )}
                  </div>
                  <div className="text-sm text-gray-600">إجمالي المهام</div>
                </div>
                <TargetIcon className="w-8 h-8 text-green-500" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-purple-600 mb-1">
                    {filteredSections.length}
                  </div>
                  <div className="text-sm text-gray-600">النتائج</div>
                </div>
                <ChartIcon className="w-8 h-8 text-purple-500" />
              </div>
            </div>
          </div>
        </div>

        {/* قائمة الأقسام */}
        {loading ? (
          renderSkeleton()
        ) : filteredSections.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSections.map((section) => (
              <article
                key={section.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 overflow-hidden group"
              >
                <Link
                  href={`/teacher/sections/${section.id}`}
                  className="block"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                          <BookIcon className="text-white text-lg" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-200">
                            {section.name}
                          </h3>
                          <p className="text-gray-600 text-sm line-clamp-2">
                            {section.description || "لا يوجد وصف"}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          deleteSection(section.id);
                        }}
                        className=" p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200"
                        aria-label={`حذف ${section.name}`}
                        disabled={deletingId === section.id}
                      >
                        {deletingId === section.id ? (
                          <span className="inline-flex items-center gap-2">
                            <LoadingSpinner size="sm" />
                            جارٍ الحذف...
                          </span>
                        ) : (
                          <TrashIcon className="w-4 h-4" />
                        )}
                      </button>
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center bg-blue-50 text-blue-700 px-2 py-1 rounded-full">
                          <TargetIcon className="ml-1 w-3 h-3" />
                          {section._count.tasks} مهمة
                        </span>
                      </div>
                      <span className="text-xs">
                        {new Date(section.createdAt).toLocaleDateString(
                          undefined,
                          {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          }
                        )}
                      </span>
                    </div>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        ) : sections.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <BookIcon className="w-24 h-24 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              لا توجد أقسام
            </h3>
            <p className="text-gray-500 mb-4">
              ابدأ بإضافة قسم جديد لتنظيم المهام
            </p>
            <Link
              href="/teacher/sections/add"
              className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors duration-200 font-medium inline-flex items-center"
            >
              <PlusIcon className="ml-2 w-4 h-4" />
              إضافة أول قسم
            </Link>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <ChartIcon className="w-24 h-24 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              لا توجد نتائج
            </h3>
            <p className="text-gray-500 mb-4">لم نعثر على أقسام تطابق بحثك</p>
            <button
              onClick={() => setSearchTerm("")}
              className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors duration-200 font-medium"
            >
              مسح البحث
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
