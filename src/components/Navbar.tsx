// app/components/Navbar.tsx
"use client";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  HomeIcon,
  UsersIcon,
  BookIcon,
  TasksIcon,
  UserIcon,
  LogoutIcon,
  MenuIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  BookOpenIcon,
  ChartIcon,
  TargetIcon,
} from "@/components/ui/Icon";
import LoadingSpinner from "./ui/LoadingSpinner";

export default function Navbar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // إذا كان في صفحة تسجيل الدخول، لا تظهر navbar
  if (pathname === "/auth/signin") {
    return null;
  }

  // عرض حالة التحميل أثناء جلب الجلسة
  if (status === "loading") {
    return (
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 w-8 h-8 rounded-lg flex items-center justify-center">
                <BookIcon className="text-white text-sm" />
              </div>
              <span className="mr-3 text-xl font-semibold text-gray-800">
                نظام المهام
              </span>
            </div>
            <div className="text-gray-500 text-sm">
              <LoadingSpinner />
            </div>
          </div>
        </div>
      </nav>
    );
  }

  const isActive = (path: string) => {
    return pathname === path
      ? "bg-blue-50 text-blue-700 border-r-2 border-blue-500"
      : "text-gray-700 hover:bg-gray-50 hover:text-gray-900";
  };

  const teacherLinks = [
    { href: "/teacher/sections", label: "الأقسام", icon: BookIcon },
    { href: "/teacher/students", label: "الطلاب", icon: UsersIcon },
  ];

  const studentLinks = [
    { href: "/dashboard", label: "الرئيسية", icon: HomeIcon },
    { href: "/student/tasks", label: "مهامي", icon: TasksIcon },
    { href: "/student/progress", label: "تقدمي", icon: ChartIcon },
  ];

  const currentLinks =
    session?.user?.role === "teacher" ? teacherLinks : studentLinks;

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* الشعار واسم التطبيق */}
          <div className="flex items-center">
            <Link href="/dashboard" className="flex items-center">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 w-8 h-8 rounded-lg flex items-center justify-center">
                <BookIcon className="text-white text-sm" />
              </div>
              <span className="mr-3 text-xl font-semibold text-gray-800">
                نظام المهام
              </span>
            </Link>
          </div>

          {/* قائمة التنقل - سطح المكتب */}
          <div className="hidden md:flex items-center space-x-1 space-x-reverse">
            {session ? (
              <>
                {/* روابط التنقل */}
                <div className="flex items-center space-x-1 space-x-reverse">
                  {currentLinks.map((link) => {
                    const IconComponent = link.icon;
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${isActive(
                          link.href
                        )}`}
                      >
                        <IconComponent className="ml-2 w-4 h-4" />
                        {link.label}
                      </Link>
                    );
                  })}
                </div>

                {/* معلومات المستخدم */}
                <div className="flex items-center space-x-3 space-x-reverse mr-4 pr-4 border-r border-gray-200">
                  <div className="flex flex-col items-end">
                    <span className="text-sm font-medium text-gray-700">
                      {session.user.name}
                    </span>
                  </div>
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                    <UserIcon className="text-white text-sm" />
                  </div>
                </div>

                {/* زر تسجيل الخروج */}
                <button
                  onClick={() => signOut()}
                  className="flex items-center text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                >
                  <LogoutIcon className="ml-2 w-4 h-4" />
                  خروج
                </button>
              </>
            ) : (
              <Link
                href="/auth/signin"
                className="bg-blue-500 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-600 transition-colors duration-200"
              >
                تسجيل الدخول
              </Link>
            )}
          </div>

          {/* زر القائمة المتنقلة - الجوال */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-500 hover:text-gray-700 p-2 rounded-md"
            >
              <MenuIcon className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* القائمة المتنقلة - الجوال */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {session ? (
                <>
                  {/* روابط التنقل للجوال */}
                  {currentLinks.map((link) => {
                    const IconComponent = link.icon;
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        className={`flex items-center px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${isActive(
                          link.href
                        )}`}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <IconComponent className="ml-2 w-4 h-4" />
                        {link.label}
                      </Link>
                    );
                  })}

                  {/* معلومات المستخدم للجوال */}
                  <div className="px-3 py-2 border-t border-gray-200 mt-2 pt-3">
                    <div className="flex items-center space-x-3 space-x-reverse">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                        <UserIcon className="text-white text-sm" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-700">
                          {session.user.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {session.user.role === "teacher" ? "شيخ" : "طالب"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* زر تسجيل الخروج للجوال */}
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      signOut();
                    }}
                    className="flex items-center w-full text-right px-3 py-2 text-red-600 hover:bg-red-50 rounded-md text-base font-medium transition-colors duration-200"
                  >
                    <LogoutIcon className="ml-2 w-4 h-4" />
                    تسجيل الخروج
                  </button>
                </>
              ) : (
                <Link
                  href="/auth/signin"
                  className="block px-3 py-2 bg-blue-500 text-white rounded-md text-base font-medium text-center hover:bg-blue-600 transition-colors duration-200"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  تسجيل الدخول
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
