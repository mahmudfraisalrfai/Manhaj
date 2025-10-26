// app/teacher/sections/[id]/edit/page.tsx
"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeftIcon,
  TrashIcon,
  CheckIcon,
  XIcon,
  BookIcon,
} from "@/components/ui/Icon";
import { UploadButton } from "@/components/ui/upload-button";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

interface Section {
  id: string;
  name: string;
  description: string;
  icon?: string | null;
}

export default function EditSectionPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const params = useParams();
  const sectionId = params.id as string;

  const [section, setSection] = useState<Section | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingIcon, setUploadingIcon] = useState(false);
  const [deletingIcon, setDeletingIcon] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

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
      const res = await fetch(`/api/sections/${sectionId}`, {
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("فشل في جلب بيانات القسم");
      }

      const sectionData = await res.json();
      setSection(sectionData);
      setFormData({
        name: sectionData.name,
        description: sectionData.description || "",
      });
    } catch (error) {
      console.error("Error fetching section data:", error);
      alert((error as Error).message || "حدث خطأ في جلب البيانات");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!section) return;

    setSubmitting(true);
    try {
      const res = await fetch(`/api/sections/${section.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          id: section.id,
          name: formData.name,
          description: formData.description,
        }),
      });

      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        throw new Error(payload.error || "فشل حفظ التعديلات");
      }

      alert("تم تحديث القسم بنجاح");
      router.push(`/teacher/sections/${sectionId}`);
    } catch (err) {
      console.error(err);
      alert((err as Error).message || "حدث خطأ أثناء حفظ التعديلات");
    } finally {
      setSubmitting(false);
    }
  };

  // دالة جديدة لمعالجة رفع الأيقونة باستخدام UploadThing
  const handleIconUpload = async (fileUrl: string) => {
    if (!section) return;

    setUploadingIcon(true);
    try {
      const updateRes = await fetch(`/api/sections/${section.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          id: section.id,
          icon: fileUrl,
        }),
      });

      if (!updateRes.ok) {
        const p = await updateRes.json().catch(() => ({}));
        throw new Error(p.error || "فشل تحديث القسم برابط الأيقونة");
      }

      alert("تم رفع الأيقونة بنجاح");
    } catch (err) {
      console.error("Icon update error:", err);
      alert((err as Error).message || "حدث خطأ أثناء تحديث الأيقونة");
    } finally {
      setUploadingIcon(false);
    }
  };

  const handleUploadError = (error: Error) => {
    alert(`خطأ في رفع الأيقونة: ${error.message}`);
  };

  const handleIconDelete = async () => {
    if (!section) return;
    if (!confirm("هل تريد حذف أيقونة هذا القسم؟")) return;

    setDeletingIcon(true);
    try {
      const res = await fetch(`/api/sections/${section.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          id: section.id,
          icon: null,
        }),
      });

      if (!res.ok) {
        const p = await res.json().catch(() => ({}));
        throw new Error(p.error || "فشل حذف الأيقونة");
      }

      await fetchSectionData();
      alert("تم حذف الأيقونة بنجاح");
    } catch (err) {
      console.error("Icon delete error:", err);
      alert((err as Error).message || "حدث خطأ أثناء حذف الأيقونة");
    } finally {
      setDeletingIcon(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center p-4">
        <div className="text-center">
          <LoadingSpinner size="lg" text="جاري تحميل بيانات القسم..." />
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
      <div className="max-w-4xl mx-auto">
        {/* رأس الصفحة */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/60 p-6 sm:p-8 mb-6 sm:mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl shadow-lg">
                <BookIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  تعديل القسم
                </h1>
                <p className="text-gray-600 mt-1">
                  قم بتعديل معلومات القسم والأيقونة
                </p>
              </div>
            </div>
            <Link
              href={`/teacher/sections/${sectionId}`}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 font-medium bg-white/60 backdrop-blur-sm px-4 py-2 rounded-2xl border border-gray-200 hover:border-gray-300 transition-all duration-200"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              رجوع للقسم
            </Link>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* قسم الأيقونة */}
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span>🖼️</span>
                أيقونة القسم
              </h3>

              <div className="flex flex-col sm:flex-row items-center gap-6">
                {/* معاينة الأيقونة */}
                <div className="flex-shrink-0">
                  <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center border-4 border-white shadow-2xl">
                    {section.icon ? (
                      <img
                        src={section.icon}
                        alt={section.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
                        <BookIcon className="text-white text-2xl" />
                      </div>
                    )}
                  </div>
                </div>

                {/* أزرار التحكم بالأيقونة */}
                <div className="flex-1 space-y-3">
                  <div className="flex flex-col sm:flex-row gap-3">
                    {/* زر رفع الأيقونة باستخدام UploadThing */}
                    <div className="flex-1">
                      <UploadButton
                        onUploadComplete={handleIconUpload}
                        onUploadError={handleUploadError}
                      />
                    </div>

                    {/* زر حذف الأيقونة */}
                    {section.icon && (
                      <button
                        type="button"
                        onClick={handleIconDelete}
                        disabled={deletingIcon}
                        className="flex-1 bg-gradient-to-r from-red-500 to-pink-600 text-white px-4 py-3 rounded-2xl font-medium hover:shadow-lg transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        <TrashIcon className="w-4 h-4" />
                        {deletingIcon ? "جارٍ الحذف..." : "حذف الأيقونة"}
                      </button>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 text-center sm:text-right">
                    المسموح: PNG, JPG, GIF, WebP, SVG - الحد الأقصى 4MB
                  </p>
                </div>
              </div>
            </div>

            {/* معلومات القسم */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span>📝</span>
                معلومات القسم
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    اسم القسم *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white/80"
                    placeholder="أدخل اسم القسم"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    وصف القسم
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white/80 resize-none"
                    placeholder="أدخل وصف القسم"
                  />
                </div>
              </div>
            </div>

            {/* أزرار الإجراء */}
            <div className="flex flex-col sm:flex-row gap-3 pt-6">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 px-6 rounded-2xl font-semibold hover:shadow-xl transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    جاري الحفظ...
                  </>
                ) : (
                  <>
                    <CheckIcon className="w-5 h-5" />
                    حفظ التعديلات
                  </>
                )}
              </button>

              <Link
                href={`/teacher/sections/${sectionId}`}
                className="flex-1 bg-gradient-to-r from-gray-500 to-gray-600 text-white py-4 px-6 rounded-2xl font-semibold hover:shadow-xl transition-all duration-200 text-center flex items-center justify-center gap-2"
              >
                <XIcon className="w-5 h-5" />
                إلغاء
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
