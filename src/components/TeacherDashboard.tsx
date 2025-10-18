// app/components/TeacherDashboard.tsx
"use client";
import { useSession } from "next-auth/react";
import Link from "next/link";

// تعريف الأنواع
type ColorType = "blue" | "green" | "yellow" | "purple";

interface ColorClasses {
  blue: string;
  green: string;
  yellow: string;
  purple: string;
}

export default function TeacherDashboard() {
  const { data: session } = useSession();

  const stats = [
    { label: "عدد الطلاب", value: "5", color: "blue" as ColorType, icon: "👨‍🎓" },
    {
      label: "عدد الأقسام",
      value: "3",
      color: "green" as ColorType,
      icon: "📚",
    },
    {
      label: "المهام النشطة",
      value: "12",
      color: "yellow" as ColorType,
      icon: "📝",
    },
    {
      label: "المهام المكتملة",
      value: "8",
      color: "purple" as ColorType,
      icon: "✅",
    },
  ];

  const quickActions = [
    {
      title: "إدارة الطلاب",
      description: "إضافة وحذف وتعديل الطلاب",
      href: "/teacher/students",
      icon: "👨‍🎓",
      color: "blue" as ColorType,
    },
    {
      title: "إدارة الأقسام",
      description: "إنشاء وتعديل الأقسام",
      href: "/teacher/sections",
      icon: "📚",
      color: "green" as ColorType,
    },
    {
      title: "إدارة المهام",
      description: "إضافة ومتابعة المهام",
      href: "/teacher/tasks",
      icon: "📝",
      color: "yellow" as ColorType,
    },
  ];

  const getColorClasses = (color: ColorType): string => {
    const colors: ColorClasses = {
      blue: "from-blue-500 to-blue-600",
      green: "from-green-500 to-green-600",
      yellow: "from-amber-500 to-amber-600",
      purple: "from-purple-500 to-purple-600",
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* الرأس */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            مرحباً، {session?.user?.name}
          </h1>
          <p className="text-gray-600">هذه نظرة عامة على نظام إدارة المهام</p>
        </div>

        {/* الإحصائيات */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    {stat.label}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                </div>
                <div
                  className={`w-12 h-12 bg-gradient-to-r ${getColorClasses(
                    stat.color
                  )} rounded-lg flex items-center justify-center`}
                >
                  <span className="text-white text-xl">{stat.icon}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* الإجراءات السريعة */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            الإجراءات السريعة
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {quickActions.map((action, index) => (
              <Link
                key={index}
                href={action.href}
                className="group block p-6 border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-center mb-4">
                  <div
                    className={`w-10 h-10 bg-gradient-to-r ${getColorClasses(
                      action.color
                    )} rounded-lg flex items-center justify-center mr-3`}
                  >
                    <span className="text-white text-lg">{action.icon}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-gray-700">
                    {action.title}
                  </h3>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {action.description}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
