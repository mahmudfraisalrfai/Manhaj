// app/teacher/sections/add/page.tsx
"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeftIcon,
  FolderIcon,
  FolderOpenIcon,
  PlusIcon,
  UploadIcon,
  XIcon,
} from "@/components/ui/Icon";

interface ParentSection {
  id: string;
  name: string;
  parentSectionId: string | null;
}

export default function AddSectionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const parentId = searchParams.get("parent");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    parentSectionId: parentId || "",
  });
  const [loading, setLoading] = useState(false);
  const [parentSections, setParentSections] = useState<ParentSection[]>([]);
  const [fetchingParents, setFetchingParents] = useState(false);

  // حالات جديدة لإدارة الأيقونة
  const [selectedIcon, setSelectedIcon] = useState<File | null>(null);
  const [iconPreview, setIconPreview] = useState<string | null>(null);
  const [uploadingIcon, setUploadingIcon] = useState(false);

  useEffect(() => {
    fetchParentSections();
  }, []);

  const fetchParentSections = async () => {
    setFetchingParents(true);
    try {
      const res = await fetch("/api/sections?flat=true");
      const data = await res.json();
      setParentSections(data);
    } catch (error) {
      console.error("Error fetching parent sections:", error);
    } finally {
      setFetchingParents(false);
    }
  };

  // معالجة اختيار الأيقونة
  const handleIconSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // التحقق من نوع الملف
      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp",
        "image/svg+xml",
      ];
      if (!allowedTypes.includes(file.type)) {
        alert("نوع الملف غير مسموح. المسموح: JPEG, PNG, GIF, WebP, SVG");
        return;
      }

      // التحقق من حجم الملف (5MB كحد أقصى)
      if (file.size > 5 * 1024 * 1024) {
        alert("حجم الملف كبير جداً. الحد الأقصى 5MB");
        return;
      }

      setSelectedIcon(file);

      // إنشاء معاينة للصورة
      const reader = new FileReader();
      reader.onload = (e) => {
        setIconPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // إزالة الأيقونة المختارة
  const handleRemoveIcon = () => {
    setSelectedIcon(null);
    setIconPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // رفع الأيقونة بشكل منفصل
  const uploadIcon = async (sectionId: string): Promise<string | null> => {
    if (!selectedIcon) return null;

    setUploadingIcon(true);
    try {
      const formData = new FormData();
      formData.append("icon", selectedIcon);
      formData.append("sectionId", sectionId);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "فشل في رفع الأيقونة");
      }

      const result = await response.json();
      return result.iconUrl;
    } catch (error) {
      console.error("Error uploading icon:", error);
      throw error;
    } finally {
      setUploadingIcon(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert("الرجاء إدخال اسم القسم");
      return;
    }

    setLoading(true);

    try {
      // إرسال البيانات الأساسية للقسم أولاً
      const requestBody = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        parentSectionId: formData.parentSectionId || null,
      };

      const response = await fetch("/api/sections", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        const newSection = await response.json();

        // إذا كان هناك أيقونة مختارة، قم برفعها
        if (selectedIcon) {
          try {
            await uploadIcon(newSection.id);
          } catch (iconError) {
            console.error(
              "فشل في رفع الأيقونة، لكن القسم تم إنشاؤه:",
              iconError
            );
            // نستمر حتى لو فشل رفع الأيقونة
          }
        }

        const successMessage = requestBody.parentSectionId
          ? `تم إضافة الفرع "${formData.name}" بنجاح تحت القسم المحدد`
          : `تم إضافة القسم الرئيسي "${formData.name}" بنجاح`;

        alert(successMessage);
        router.push("/teacher/sections");
        router.refresh();
      } else {
        const error = await response.json();
        console.error("خطأ من السيرفر:", error);
        alert(error.error || "حدث خطأ أثناء إضافة القسم");
      }
    } catch (error) {
      console.error("خطأ في الشبكة:", error);
      alert("حدث خطأ في الاتصال أثناء إضافة القسم");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const getParentName = () => {
    if (!parentId) return null;
    const parent = parentSections.find((sec) => sec.id === parentId);
    return parent?.name || "قسم مجهول";
  };

  const getAvailableParents = () => {
    return parentSections.filter(
      (section) => section.id !== formData.parentSectionId
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/60 p-6 sm:p-8">
          {/* رأس الصفحة */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-green-500 to-blue-600 rounded-2xl shadow-lg">
                <PlusIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                  {parentId ? "إضافة فرع جديد" : "إضافة قسم جديد"}
                </h1>
                <p className="text-gray-600 mt-1">
                  {parentId
                    ? `إضافة فرع تحت قسم "${getParentName()}"`
                    : "أضف قسم جديد لتنظيم المهام الدراسية في شجرتك"}
                </p>
              </div>
            </div>
            <Link
              href="/teacher/sections"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 font-medium bg-white/60 backdrop-blur-sm px-4 py-2 rounded-2xl border border-gray-200 hover:border-gray-300 transition-all duration-200"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              رجوع للشجرة
            </Link>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* أيقونة القسم */}
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-6 border border-yellow-200">
              <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <UploadIcon className="w-4 h-4 text-yellow-600" />
                أيقونة القسم (اختياري)
              </label>

              <div className="space-y-4">
                {/* معاينة الأيقونة */}
                {iconPreview && (
                  <div className="flex items-center gap-4 p-4 bg-white/60 rounded-xl border border-yellow-200">
                    <div className="relative">
                      <img
                        src={iconPreview}
                        alt="معاينة الأيقونة"
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveIcon}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                      >
                        <XIcon className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-700">
                        {selectedIcon?.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {(selectedIcon?.size || 0) / 1024} كيلوبايت
                      </p>
                    </div>
                  </div>
                )}

                {/* زر اختيار الملف */}
                <div className="flex items-center gap-4">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleIconSelect}
                    accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml"
                    className="hidden"
                    id="icon-upload"
                  />
                  <label
                    htmlFor="icon-upload"
                    className="flex-1 cursor-pointer bg-gradient-to-r from-yellow-500 to-orange-500 text-white py-3 px-4 rounded-xl font-medium hover:shadow-lg transition-all duration-200 text-center"
                  >
                    <span className="flex items-center justify-center gap-2">
                      <UploadIcon className="w-4 h-4" />
                      {iconPreview ? "تغيير الأيقونة" : "اختر أيقونة"}
                    </span>
                  </label>

                  {iconPreview && (
                    <button
                      type="button"
                      onClick={handleRemoveIcon}
                      className="px-4 py-3 bg-gray-500 text-white rounded-xl font-medium hover:bg-gray-600 transition-colors"
                    >
                      <XIcon className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <p className="text-sm text-gray-500">
                  المسموح: JPEG, PNG, GIF, WebP, SVG - الحد الأقصى 5MB
                </p>
              </div>
            </div>

            {/* اسم القسم */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200">
              <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <FolderIcon className="w-4 h-4 text-green-600" />
                اسم القسم *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-green-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-white/80 backdrop-blur-sm"
                placeholder="أدخل اسم القسم..."
                required
              />
            </div>

            {/* وصف القسم */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-200">
              <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <span className="w-4 h-4">📝</span>
                وصف القسم
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-3 border border-purple-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 bg-white/80 backdrop-blur-sm resize-none"
                placeholder="أدخل وصفاً للقسم (اختياري)..."
              />
            </div>

            {/* أزرار الإجراء */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <button
                type="submit"
                disabled={loading || uploadingIcon}
                className="flex-1 bg-gradient-to-r from-green-500 to-blue-600 text-white py-4 px-6 rounded-2xl font-semibold hover:shadow-xl focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                {loading || uploadingIcon ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    {uploadingIcon
                      ? "جاري رفع الأيقونة..."
                      : formData.parentSectionId || parentId
                      ? "جاري إضافة الفرع..."
                      : "جاري إضافة القسم..."}
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <PlusIcon className="w-5 h-5" />
                    {formData.parentSectionId || parentId
                      ? "إضافة الفرع"
                      : "إضافة القسم"}
                  </span>
                )}
              </button>

              <Link
                href="/teacher/sections"
                className="flex-1 bg-gradient-to-r from-gray-500 to-gray-600 text-white py-4 px-6 rounded-2xl font-semibold hover:shadow-xl transition-all duration-200 text-center shadow-lg"
              >
                <span className="flex items-center justify-center gap-2">
                  <ArrowLeftIcon className="w-5 h-5" />
                  إلغاء والعودة
                </span>
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
