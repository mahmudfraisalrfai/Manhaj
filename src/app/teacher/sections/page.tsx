// app/teacher/sections/page.tsx
"use client";
import { useState, useEffect } from "react";
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

  useEffect(() => {
    if (session?.user?.role !== "teacher") {
      router.push("/dashboard");
      return;
    }
    fetchSections();
  }, [session, router]);

  const fetchSections = async () => {
    try {
      const response = await fetch("/api/sections");
      const data = await response.json();
      setSections(data);
    } catch (error) {
      console.error("Error fetching sections:", error);
      alert("حدث خطأ في جلب البيانات");
    } finally {
      setLoading(false);
    }
  };

  const deleteSection = async (sectionId: string) => {
    if (
      !confirm(
        "هل أنت متأكد من حذف هذا القسم؟ سيتم حذف جميع المهام المرتبطة به."
      )
    )
      return;

    try {
      const response = await fetch(`/api/sections/${sectionId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setSections(sections.filter((section) => section.id !== sectionId));
        alert("تم حذف القسم بنجاح");
      }
    } catch (error) {
      console.error("Error deleting section:", error);
      alert("حدث خطأ أثناء حذف القسم");
    }
  };

  // تصفية الأقسام حسب البحث
  const filteredSections = sections.filter(
    (section) =>
      section.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      section.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
          <div className="text-xl text-gray-600">
            <LoadingSpinner text="...جاري التحميل" />
          </div>
        </div>
      </div>
    );
  }

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
          >
            <PlusIcon className="ml-2 w-4 h-4" />
            إضافة قسم جديد
          </Link>
        </div>

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
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                <ChartIcon className="w-5 h-5 text-gray-400" />
              </div>
            </div>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSections.map((section) => (
            <div
              key={section.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 overflow-hidden group"
            >
              <Link href={`/teacher/sections/${section.id}`} className="block">
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
                    >
                      <TrashIcon className="w-4 h-4" />
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
                      {new Date(section.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>

        {sections.length === 0 && (
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
        )}

        {sections.length > 0 && filteredSections.length === 0 && (
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
