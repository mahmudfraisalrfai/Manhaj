"use client";
import React, { useEffect, useState, useMemo, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  FolderIcon,
  FolderOpenIcon,
  PlusIcon,
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
  description?: string | null;
  parentSectionId: string | null;
  icon?: string | null;
  _count: {
    tasks: number;
    children: number;
  };
  children?: Section[];
}

// --- Components مساعدة (Modal + Toast) ---
function ConfirmModal({ open, title, message, onCancel, onConfirm }: any) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl p-5 max-w-md w-full shadow-xl">
        <h3 className="font-semibold text-lg mb-2">{title}</h3>
        <p className="text-sm text-gray-600 mb-4">{message}</p>
        <div className="flex gap-2 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-xl bg-gray-100"
          >
            إلغاء
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-xl bg-red-600 text-white"
          >
            تأكيد الحذف
          </button>
        </div>
      </div>
    </div>
  );
}

function Toast({ message, show }: { message: string; show: boolean }) {
  if (!show) return null;
  return (
    <div className="fixed left-4 bottom-6 z-50">
      <div className="bg-black/80 text-white px-4 py-2 rounded-xl shadow">
        {message}
      </div>
    </div>
  );
}

// Debounce hook
function useDebouncedValue<T>(value: T, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

export default function SectionsTreePage() {
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebouncedValue(searchTerm, 300);
  const [sortBy, setSortBy] = useState<"name" | "tasks" | "children">("name");

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // modal / toast state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmPayload, setConfirmPayload] = useState<any>(null);
  const [toast, setToast] = useState({ show: false, message: "" });

  useEffect(() => {
    fetchSections();
  }, []);

  const showToast = useCallback((message: string) => {
    setToast({ show: true, message });
    setTimeout(() => setToast({ show: false, message: "" }), 3000);
  }, []);

  const fetchSections = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/sections/tree");
      if (!res.ok) throw new Error("Failed to fetch sections");
      const tree = await res.json();
      setSections(tree);
      // افتح فقط الجذور بالافتراض
      setExpanded(tree.map((sec: Section) => sec.id));
    } catch (error) {
      console.error("Error fetching sections:", error);
      showToast("حدث خطأ أثناء تحميل الأقسام");
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

  // حذف باستخدام مودال تأكيد
  const requestDeleteSection = (id: string) => {
    setConfirmPayload({ id });
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    const id = confirmPayload?.id;
    setConfirmOpen(false);
    if (!id) return;

    try {
      const res = await fetch(`/api/sections/${id}`, { method: "DELETE" });
      if (res.ok) {
        showToast("تم حذف القسم بنجاح");
        fetchSections();
      } else {
        const err = await res.json();
        showToast(err.error || "فشل حذف القسم");
      }
    } catch (err) {
      console.error(err);
      showToast("حدث خطأ أثناء حذف القسم");
    }
  };

  // === تصفية وترتيب الأقسام مع debounce ===
  const filteredAndSortedSections = useMemo(() => {
    const term = debouncedSearch?.trim() || "";

    const filterSections = (nodes: Section[], term: string): Section[] => {
      if (!term) return nodes;

      return nodes
        .map((node) => {
          const matches =
            node.name.toLowerCase().includes(term.toLowerCase()) ||
            (node.description || "").toLowerCase().includes(term.toLowerCase());

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
              // نحتاج مقارنة حسب مجموع المهام داخل الفرع (شاملة الأطفال)
              return sumTasks(b) - sumTasks(a);
            case "children":
              return (b._count?.children || 0) - (a._count?.children || 0);
            case "name":
            default:
              return a.name.localeCompare(b.name, "ar");
          }
        });
    };

    const filtered = filterSections(sections, term);
    return sortSections(filtered);
  }, [sections, debouncedSearch, sortBy]);

  // ----- مكوّن SectionTree منفصل ومحسّن بالـ memo -----
  const SectionTree = React.memo(function _SectionTree({
    section,
    level = 0,
  }: {
    section: Section;
    level?: number;
  }) {
    const isExpanded = expanded.includes(section.id);
    const hasChildren = section.children && section.children.length > 0;
    const isRoot = level === 0;

    return (
      <div className="relative">
        {level > 0 && (
          <div
            className="absolute left-4 sm:left-6 top-0 w-0.5 bg-gradient-to-b from-blue-200 to-transparent hidden sm:block"
            style={{ height: "100%" }}
          />
        )}

        <div className="flex items-start group">
          {Array.from({ length: level }).map((_, idx) => (
            <div key={idx} className="w-4 sm:w-8 flex-shrink-0 relative">
              {idx === level - 1 && (
                <div className="absolute left-2 sm:left-4 top-0 w-0.5 h-6 bg-blue-200 hidden sm:block" />
              )}
            </div>
          ))}

          <div className="flex-1 min-w-0">
            <div
              className={`flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 rounded-xl transition-all duration-300 ${
                isRoot
                  ? "bg-gradient-to-r from-blue-50 to-blue-25 border-2 border-blue-100"
                  : "bg-white border-2 border-gray-100 hover:border-blue-200"
              } group-hover:shadow-md mb-2`}
            >
              <div className="flex items-center gap-3 flex-1 min-w-0 mb-2 sm:mb-0">
                <button
                  onClick={() => toggleExpand(section.id)}
                  aria-expanded={isExpanded}
                  aria-controls={`sec-${section.id}`}
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

                <div className="flex-shrink-0 relative">
                  {section.icon ? (
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden border-2 border-white shadow-lg relative">
                      <img
                        src={section.icon}
                        alt={section.name}
                        className="w-full h-full object-cover" // object-cover لجعل الصورة تملأ الإطار
                      />
                    </div>
                  ) : (
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
                    {/* عرض عدد المهام داخل هذا الفرع فقط - لكن الإحصائيات العليا ستأخذ المجاميع */}
                    {section._count.tasks > 0 && (
                      <span className="flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                        <TargetIcon className="w-3 h-3 text-green-500" />
                        {section._count.tasks} مهمة
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 sm:gap-2 self-end sm:self-center">
                <Link
                  href={`/teacher/sections/add?parent=${section.id}`}
                  className="p-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
                  title="إضافة فرع جديد"
                >
                  <PlusIcon className="w-4 h-4" />
                </Link>

                <button
                  onClick={() => requestDeleteSection(section.id)}
                  className="p-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors"
                  title="حذف القسم"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            </div>

            {isExpanded && hasChildren && (
              <div
                id={`sec-${section.id}`}
                className="ml-2 sm:ml-12 border-l-2 border-dashed border-blue-200"
              >
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
  });

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

  // احصائيات محسّنة — نعدّ مجموع المهام عبر الشجرة
  const totalSections = sections.reduce(
    (count, sec) => count + 1 + countChildren(sec),
    0
  );
  const totalTasks = sections.reduce((count, sec) => count + sumTasks(sec), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 p-3 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-blue-100 p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex items-center justify-between mb-4 sm:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
              aria-label="قائمة التحكم"
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

            <div className="flex flex-col gap-3">
              <div className="flex-1 w-full">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="ابحث في الأقسام..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 sm:py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white text-sm sm:text-base"
                    aria-label="بحث في الأقسام"
                  />
                  <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-xs sm:text-sm"
                  aria-label="ترتيب الأقسام"
                >
                  <option value="name">ترتيب أبجدي</option>
                  <option value="tasks">الأكثر مهام</option>
                  <option value="children">الأكثر فروع</option>
                </select>

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

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-6">
          {[
            {
              label: "إجمالي الأقسام",
              value: totalSections,
              icon: FolderIcon,
              color: "blue",
            },
            {
              label: "إجمالي المهام",
              value: totalTasks,
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

        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-blue-100 p-3 sm:p-6">
          {filteredAndSortedSections.length > 0 ? (
            <div className="space-y-2 sm:space-y-3">
              {filteredAndSortedSections.map((section) => (
                <SectionTree key={section.id} section={section} />
              ))}
            </div>
          ) : debouncedSearch ? (
            <div className="text-center py-8 sm:py-16">
              <SearchIcon className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-3 sm:mb-4" />
              <h3 className="text-lg sm:text-xl font-medium text-gray-900 mb-2">
                لا توجد نتائج
              </h3>
              <p className="text-gray-500 mb-4 sm:mb-6 text-sm sm:text-base">
                لم نعثر على أقسام تطابق "{debouncedSearch}"
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

      <ConfirmModal
        open={confirmOpen}
        title="تأكيد حذف القسم"
        message="هل أنت متأكد من حذف هذا القسم؟ سيتم حذف جميع الأقسام الفرعية والمهام التابعة له"
        onCancel={() => setConfirmOpen(false)}
        onConfirm={confirmDelete}
      />

      <Toast message={toast.message} show={toast.show} />
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

function sumTasks(section: Section): number {
  // يجمع عدد المهام في هذا القسم + جميع المهام في الأبناء تكرارياً
  const me = section._count?.tasks || 0;
  if (!section.children || section.children.length === 0) return me;
  return me + section.children.reduce((acc, c) => acc + sumTasks(c), 0);
}

function countLeaves(nodes: Section[]): number {
  return nodes.reduce((count, node) => {
    if (!node.children || node.children.length === 0) {
      return count + 1;
    }
    return count + countLeaves(node.children);
  }, 0);
}
