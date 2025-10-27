// app/teacher/students/add/page.tsx
"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeftIcon, ChevronDownIcon } from "@/components/ui/Icon";

// بيانات رموز الدول العربية والعالمية
const countryCodes = [
  { code: "+966", flag: "🇸🇦", name: "السعودية" },
  { code: "+971", flag: "🇦🇪", name: "الإمارات" },
  { code: "+965", flag: "🇰🇼", name: "الكويت" },
  { code: "+974", flag: "🇶🇦", name: "قطر" },
  { code: "+973", flag: "🇧🇭", name: "البحرين" },
  { code: "+968", flag: "🇴🇲", name: "عمان" },
  { code: "+962", flag: "🇯🇴", name: "الأردن" },
  { code: "+963", flag: "🇸🇾", name: "سوريا" },
  { code: "+961", flag: "🇱🇧", name: "لبنان" },
  { code: "+20", flag: "🇪🇬", name: "مصر" },
  { code: "+212", flag: "🇲🇦", name: "المغرب" },
  { code: "+216", flag: "🇹🇳", name: "تونس" },
  { code: "+213", flag: "🇩🇿", name: "الجزائر" },
  { code: "+218", flag: "🇱🇾", name: "ليبيا" },
  { code: "+967", flag: "🇾🇪", name: "اليمن" },
  { code: "+964", flag: "🇮🇶", name: "العراق" },
  { code: "+249", flag: "🇸🇩", name: "السودان" },
  { code: "+252", flag: "🇸🇴", name: "الصومال" },
  { code: "+973", flag: "🇧🇭", name: "البحرين" },
];

export default function EnhancedAddStudentPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    password: "",
    phone: "",
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(countryCodes[0]); // السعودية افتراضياً
  const [phoneNumber, setPhoneNumber] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // إغلاق dropdown عند النقر خارجها
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowCountryDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // دمج رمز الدولة مع رقم الهاتف
      const fullPhone = phoneNumber
        ? `${selectedCountry.code}${phoneNumber}`
        : "";

      const response = await fetch("/api/students", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          phone: fullPhone,
        }),
      });

      if (response.ok) {
        // استخدام toast بدلاً من alert
        setTimeout(() => {
          router.push("/teacher/students");
        }, 1000);
      } else {
        const error = await response.json();
        alert(error.error || "حدث خطأ أثناء إضافة الطالب");
      }
    } catch (error) {
      alert("حدث خطأ أثناء إضافة الطالب");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^\d]/g, ""); // إزالة أي حروف غير رقمية
    setPhoneNumber(value);
  };

  const generatePassword = () => {
    const chars =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let password = "";
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData((prev) => ({ ...prev, password }));
  };

  const selectCountry = (country: (typeof countryCodes)[0]) => {
    setSelectedCountry(country);
    setShowCountryDropdown(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-8">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <Link
              href="/teacher/students"
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                إضافة طالب جديد
              </h1>
              <p className="text-gray-600 text-sm mt-1">
                أدخل بيانات الطالب الجديد
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                اسم الطالب
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                placeholder="أدخل اسم الطالب"
                required
              />
            </div>

            {/* Phone Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                رقم الهاتف (اختياري)
              </label>

              <div className="flex gap-2">
                {/* Country Code Selector */}
                <div className="relative flex-1 max-w-32" ref={dropdownRef}>
                  <button
                    type="button"
                    onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                    className="w-full flex items-center justify-between px-3 py-3 border border-gray-300 rounded-xl bg-white hover:bg-gray-50 transition-colors"
                  >
                    <span className="flex items-center gap-2 text-sm">
                      <span>{selectedCountry.flag}</span>
                      <span>{selectedCountry.code}</span>
                    </span>
                    <ChevronDownIcon
                      className={`w-4 h-4 text-gray-400 transition-transform ${
                        showCountryDropdown ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {/* Dropdown Menu */}
                  {showCountryDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-10 max-h-60 overflow-y-auto">
                      {countryCodes.map((country) => (
                        <button
                          key={country.code}
                          type="button"
                          onClick={() => selectCountry(country)}
                          className={`w-full flex items-center gap-3 px-3 py-2 text-right hover:bg-gray-50 transition-colors ${
                            selectedCountry.code === country.code
                              ? "bg-blue-50 text-blue-600"
                              : ""
                          }`}
                        >
                          <span className="text-lg">{country.flag}</span>
                          <div className="flex-1 text-right">
                            <div className="text-sm font-medium">
                              {country.name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {country.code}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Phone Number Input */}
                <div className="flex-1">
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={handlePhoneChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="5XXXXXXXX"
                  />
                </div>
              </div>

              {/* Phone Preview */}
              {phoneNumber && (
                <div className="mt-2 text-xs text-gray-500 bg-gray-50 p-2 rounded-lg">
                  الرقم الكامل: {selectedCountry.code} {phoneNumber}
                </div>
              )}
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  كلمة المرور
                </label>
                <button
                  type="button"
                  onClick={generatePassword}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  توليد كلمة مرور
                </button>
              </div>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all pr-12"
                  placeholder="أدخل كلمة المرور"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? "إخفاء" : "إظهار"}
                </button>
              </div>

              {/* Password Strength Indicator */}
              {formData.password && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4].map((level) => (
                      <div
                        key={level}
                        className={`flex-1 h-1 rounded-full ${
                          formData.password.length >= level * 2
                            ? formData.password.length >= 8
                              ? "bg-green-500"
                              : formData.password.length >= 6
                              ? "bg-yellow-500"
                              : "bg-red-500"
                            : "bg-gray-200"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-gray-500">
                    {formData.password.length < 6
                      ? "كلمة مرور ضعيفة"
                      : formData.password.length < 8
                      ? "كلمة مرور متوسطة"
                      : "كلمة مرور قوية"}
                  </p>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium shadow-sm hover:shadow-md"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  جاري الإضافة...
                </div>
              ) : (
                "إضافة الطالب"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
