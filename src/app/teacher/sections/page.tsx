// app/teacher/sections/page.tsx - النسخة المحسنة للهواتف
"use client";
import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  FolderIcon,
  FolderOpenIcon,
  PlusIcon,
  EditIcon,
  TrashIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  BookIcon,
  SearchIcon,
  TargetIcon,
  MenuIcon,
  XIcon,
} from "@/components/ui/Icon";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

interface Section {
  id: string;
  name: string;
  description: string;
  parentSectionId: string | null;
  icon?: string;
  _count: {
    tasks: number;
    children: number;
  };
  children?: Section[];
}

export default function SectionsTreePage() {
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "tasks" | "children">("name");
  const [viewMode, setViewMode] = useState<"tree" | "grid">("grid");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    fetchSections();
  }, []);

  const fetchSections = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/sections/tree");
      if (!res.ok) throw new Error("Failed to fetch sections");
      const tree = await res.json();
      setSections(tree);
      setExpanded(tree.map((sec: Section) => sec.id));
    } catch (error) {
      console.error("Error fetching sections:", error);
      alert("حدث خطأ أثناء تحميل الأقسام");
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (id: string) => {
    setExpanded((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const expandAll = () => {
    const allIds: string[] = [];
    const collectIds = (nodes: Section[]) => {
      nodes.forEach((node) => {
        allIds.push(node.id);
        if (node.children) collectIds(node.children);
      });
    };
    collectIds(sections);
    setExpanded(allIds);
  };

  const collapseAll = () => {
    setExpanded([]);
  };

  const deleteSection = async (id: string) => {
    if (
      !confirm(
        "هل أنت متأكد من حذف هذا القسم؟ سيتم حذف جميع الأقسام الفرعية والمهام التابعة له"
      )
    )
      return;

    try {
      const res = await fetch(`/api/sections/${id}`, { method: "DELETE" });
      if (res.ok) {
        alert("تم حذف القسم بنجاح");
        fetchSections();
      } else {
        const err = await res.json();
        alert(err.error || "فشل حذف القسم");
      }
    } catch (err) {
      console.error(err);
      alert("حدث خطأ أثناء حذف القسم");
    }
  };

  // تصفية وترتيب الأقسام
  const filteredAndSortedSections = useMemo(() => {
    const filterSections = (nodes: Section[], term: string): Section[] => {
      if (!term) return nodes;

      return nodes
        .map((node) => {
          const matches =
            node.name.toLowerCase().includes(term.toLowerCase()) ||
            node.description?.toLowerCase().includes(term.toLowerCase());

          const filteredChildren = node.children
            ? filterSections(node.children, term)
            : [];

          if (matches || filteredChildren.length > 0) {
            return { ...node, children: filteredChildren };
          }
          return null;
        })
        .filter(Boolean) as Section[];
    };

    const sortSections = (nodes: Section[]): Section[] => {
      return nodes
        .map((node) => ({
          ...node,
          children: node.children ? sortSections(node.children) : [],
        }))
        .sort((a, b) => {
          switch (sortBy) {
            case "tasks":
              return (b._count?.tasks || 0) - (a._count?.tasks || 0);
            case "children":
              return (b._count?.children || 0) - (a._count?.children || 0);
            case "name":
            default:
              return a.name.localeCompare(b.name, "ar");
          }
        });
    };

    const filtered = filterSections(sections, searchTerm);
    return sortSections(filtered);
  }, [sections, searchTerm, sortBy]);

  // مكون شجرة القسم للوضع الشجري - محسن للهواتف
  const SectionTree = ({
    section,
    level = 0,
  }: {
    section: Section;
    level?: number;
  }) => {
    const isExpanded = expanded.includes(section.id);
    const hasChildren = section.children && section.children.length > 0;
    const isRoot = level === 0;

    return (
      <div className="relative">
        {/* الخط العمودي - مخفي على الهواتف الصغيرة */}
        {level > 0 && (
          <div
            className="absolute left-4 sm:left-6 top-0 w-0.5 bg-gradient-to-b from-blue-200 to-transparent hidden sm:block"
            style={{ height: "100%" }}
          />
        )}

        <div className="flex items-start group">
          {/* المسافات والخطوط */}
          {Array.from({ length: level }).map((_, idx) => (
            <div key={idx} className="w-4 sm:w-8 flex-shrink-0 relative">
              {idx === level - 1 && (
                <div className="absolute left-2 sm:left-4 top-0 w-0.5 h-6 bg-blue-200 hidden sm:block" />
              )}
            </div>
          ))}

          {/* المحتوى */}
          <div className="flex-1 min-w-0">
            <div
              className={`flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 rounded-xl transition-all duration-300 ${
                isRoot
                  ? "bg-gradient-to-r from-blue-50 to-blue-25 border-2 border-blue-100"
                  : "bg-white border-2 border-gray-100 hover:border-blue-200"
              } group-hover:shadow-md mb-2`}
            >
              <div className="flex items-center gap-3 flex-1 min-w-0 mb-2 sm:mb-0">
                {/* زر التوسيع */}
                <button
                  onClick={() => toggleExpand(section.id)}
                  className={`p-1 sm:p-2 rounded-lg transition-all duration-200 flex-shrink-0 ${
                    !hasChildren ? "invisible" : "hover:bg-white"
                  } ${isExpanded ? "bg-white shadow-sm" : "bg-gray-50"}`}
                >
                  {hasChildren ? (
                    isExpanded ? (
                      <ChevronDownIcon className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                    ) : (
                      <ChevronRightIcon className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                    )
                  ) : (
                    <div className="w-4 h-4 sm:w-5 sm:h-5" />
                  )}
                </button>

                {/* الأيقونة - تم التعديل هنا */}
                <div className="flex-shrink-0 relative">
                  {section.icon ? (
                    // إذا كان هناك أيقونة مرفوعة - عرضها بشكل دائري
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden border-2 border-white shadow-lg">
                      <img
                        src={section.icon}
                        alt={section.name}
                        className="w-full h-full object-cover" // object-cover لجعل الصورة تملأ الإطار
                      />
                    </div>
                  ) : (
                    // إذا لم تكن هناك أيقونة - استخدام الأيقونة الافتراضية
                    <div
                      className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full shadow-sm flex items-center justify-center ${
                        isRoot
                          ? "bg-gradient-to-br from-blue-500 to-blue-600"
                          : hasChildren
                          ? "bg-gradient-to-br from-yellow-500 to-yellow-600"
                          : "bg-gradient-to-br from-green-500 to-green-600"
                      }`}
                    >
                      {hasChildren ? (
                        isExpanded ? (
                          <FolderOpenIcon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                        ) : (
                          <FolderIcon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                        )
                      ) : (
                        <BookIcon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                      )}
                    </div>
                  )}
                </div>

                {/* المعلومات */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:gap-3 mb-1 sm:mb-2">
                    <Link
                      href={`/teacher/sections/${section.id}`}
                      className={`font-bold hover:text-blue-600 transition-colors text-sm sm:text-base ${
                        isRoot ? "text-gray-900" : "text-gray-800"
                      }`}
                    >
                      {section.name}
                    </Link>
                    {isRoot && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium self-start sm:self-center mt-1 sm:mt-0">
                        جذر
                      </span>
                    )}
                  </div>

                  {section.description && (
                    <p className="text-gray-600 text-xs sm:text-sm mb-2 line-clamp-1 sm:line-clamp-2">
                      {section.description}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-2">
                    {section._count.children > 0 && (
                      <span className="flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                        <FolderIcon className="w-3 h-3 text-yellow-500" />
                        {section._count.children} فرع
                      </span>
                    )}
                    {section._count.tasks > 0 && (
                      <span className="flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                        <TargetIcon className="w-3 h-3 text-green-500" />
                        {section._count.tasks} مهمة
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* أزرار الإجراءات - مصممة للهواتف */}
              <div className="flex items-center gap-1 sm:gap-2 self-end sm:self-center">
                <Link
                  href={`/teacher/sections/add?parent=${section.id}`}
                  className="p-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
                  title="إضافة فرع جديد"
                >
                  <PlusIcon className="w-4 h-4" />
                </Link>

                <button
                  onClick={() => deleteSection(section.id)}
                  className="p-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors"
                  title="حذف القسم"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* الأطفال */}
            {isExpanded && hasChildren && (
              <div className="ml-2 sm:ml-12 border-l-2 border-dashed border-blue-200">
                {section.children!.map((child) => (
                  <SectionTree
                    key={child.id}
                    section={child}
                    level={level + 1}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-cyan-50 p-4">
        <div className="text-center">
          <LoadingSpinner size="lg" text="جاري تحميل الأقسام..." />
          <p className="text-gray-500 mt-4 text-sm">
            نعد لك شجرة الأقسام بأفضل شكل
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 p-3 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* رأس الصفحة - محسن للهواتف */}
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-blue-100 p-4 sm:p-6 mb-4 sm:mb-6">
          {/* زر القائمة للهواتف */}
          <div className="flex items-center justify-between mb-4 sm:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              {mobileMenuOpen ? (
                <XIcon className="w-5 h-5 text-gray-600" />
              ) : (
                <MenuIcon className="w-5 h-5 text-gray-600" />
              )}
            </button>
            <h1 className="text-xl font-bold text-gray-900">الأقسام</h1>
            <Link
              href="/teacher/sections/add"
              className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <PlusIcon className="w-5 h-5" />
            </Link>
          </div>

          <div className={`${mobileMenuOpen ? "block" : "hidden"} sm:block`}>
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4 sm:mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 sm:p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl sm:rounded-2xl shadow-lg">
                  <FolderOpenIcon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                    شجرة الأقسام
                  </h1>
                  <p className="text-gray-600 mt-1 text-sm sm:text-base">
                    نظم أقسامك ومهامك بشكل هرمي ومريح
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href="/teacher/sections/add"
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-xl flex items-center justify-center gap-2 hover:shadow-lg transition-all duration-200 font-medium shadow-md text-sm sm:text-base"
                >
                  <PlusIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                  إضافة قسم جديد
                </Link>
              </div>
            </div>

            {/* شريط التحكم - محسن للهواتف */}
            <div className="flex flex-col gap-3">
              {/* البحث */}
              <div className="flex-1 w-full">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="ابحث في الأقسام..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 sm:py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white text-sm sm:text-base"
                  />
                  <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                </div>
              </div>

              {/* عناصر التحكم */}
              <div className="flex flex-col sm:flex-row gap-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-xs sm:text-sm"
                >
                  <option value="name">ترتيب أبجدي</option>
                  <option value="tasks">الأكثر مهام</option>
                  <option value="children">الأكثر فروع</option>
                </select>

                {/* أزرار التحكم */}
                <div className="flex gap-2">
                  <button
                    onClick={expandAll}
                    className="flex-1 sm:flex-none px-3 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors flex items-center justify-center gap-1 text-xs sm:text-sm"
                  >
                    <ChevronDownIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden xs:inline">توسيع</span>
                  </button>
                  <button
                    onClick={collapseAll}
                    className="flex-1 sm:flex-none px-3 py-2 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-colors flex items-center justify-center gap-1 text-xs sm:text-sm"
                  >
                    <ChevronRightIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden xs:inline">طي</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* الإحصائيات - محسنة للهواتف */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-6">
          {[
            {
              label: "إجمالي الأقسام",
              value: sections.reduce(
                (count, sec) => count + 1 + countChildren(sec),
                0
              ),
              icon: FolderIcon,
              color: "blue",
            },

            {
              label: "إجمالي المهام",
              value: sections.reduce(
                (count, sec) => count + (sec._count?.tasks || 0),
                0
              ),
              icon: TargetIcon,
              color: "purple",
            },
          ].map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-xl sm:rounded-2xl p-3 border border-gray-100 shadow-sm"
            >
              <div className="flex items-center gap-2">
                <div className={`p-1 sm:p-2 bg-${stat.color}-100 rounded-lg`}>
                  <stat.icon
                    className={`w-4 h-4 sm:w-5 sm:h-5 text-${stat.color}-600`}
                  />
                </div>
                <div>
                  <p className="text-lg sm:text-2xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                  <p className="text-gray-600 text-xs sm:text-sm">
                    {stat.label}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* المحتوى الرئيسي */}
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-blue-100 p-3 sm:p-6">
          {filteredAndSortedSections.length > 0 ? (
            <div className="space-y-2 sm:space-y-3">
              {filteredAndSortedSections.map((section) => (
                <SectionTree key={section.id} section={section} />
              ))}
            </div>
          ) : searchTerm ? (
            <div className="text-center py-8 sm:py-16">
              <SearchIcon className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-3 sm:mb-4" />
              <h3 className="text-lg sm:text-xl font-medium text-gray-900 mb-2">
                لا توجد نتائج
              </h3>
              <p className="text-gray-500 mb-4 sm:mb-6 text-sm sm:text-base">
                لم نعثر على أقسام تطابق "{searchTerm}"
              </p>
              <button
                onClick={() => setSearchTerm("")}
                className="bg-blue-500 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-xl hover:bg-blue-600 transition-colors text-sm sm:text-base"
              >
                عرض كل الأقسام
              </button>
            </div>
          ) : (
            <div className="text-center py-8 sm:py-16">
              <FolderOpenIcon className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-3 sm:mb-4" />
              <h3 className="text-lg sm:text-xl font-medium text-gray-900 mb-2">
                لا توجد أقسام
              </h3>
              <p className="text-gray-500 mb-4 sm:mb-6 text-sm sm:text-base">
                ابدأ بإنشاء أول قسم في نظامك
              </p>
              <Link
                href="/teacher/sections/add"
                className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-3 sm:px-8 sm:py-4 rounded-xl hover:shadow-lg transition-all duration-200 inline-flex items-center gap-2 font-medium text-sm sm:text-base"
              >
                <PlusIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                إنشاء أول قسم
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// دوال مساعدة
function countChildren(section: Section): number {
  if (!section.children) return 0;
  return section.children.reduce(
    (count, child) => count + 1 + countChildren(child),
    0
  );
}

function countLeaves(nodes: Section[]): number {
  return nodes.reduce((count, node) => {
    if (!node.children || node.children.length === 0) {
      return count + 1;
    }
    return count + countLeaves(node.children);
  }, 0);
}
