// app/components/StudentDashboard.tsx
"use client";
import Link from "next/link";
import {
  TasksIcon,
  ChartIcon,
  ArrowLeftIcon,
  AwardIcon,
  BookOpenIcon,
  TargetIcon,
  StarIcon,
  ClockIcon,
} from "@/components/ui/Icon";

export default function StudentDashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Quick Access Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Link
            href="/student/tasks"
            className="group bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-xl transition-all duration-300 hover:scale-105 hover:border-blue-300"
          >
            <div className="flex items-center mb-4">
              <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300">
                <TasksIcon className="w-7 h-7 text-white" />
              </div>
              <div className="mr-4">
                <h3 className="text-lg font-semibold text-gray-900">مهامي</h3>
                <p className="text-gray-500 text-sm mt-1">عرض وتسليم المهام</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-blue-600 text-sm font-medium">
                اذهب للمهام
              </span>
              <ArrowLeftIcon className="w-4 h-4 text-blue-500 group-hover:-translate-x-1 transition-transform duration-200" />
            </div>
          </Link>

          <Link
            href="/student/progress"
            className="group bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-xl transition-all duration-300 hover:scale-105 hover:border-green-300"
          >
            <div className="flex items-center mb-4">
              <div className="w-14 h-14 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300">
                <ChartIcon className="w-7 h-7 text-white" />
              </div>
              <div className="mr-4">
                <h3 className="text-lg font-semibold text-gray-900">تقدمي</h3>
                <p className="text-gray-500 text-sm mt-1">
                  متابعة الأداء والإحصائيات
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-green-600 text-sm font-medium">
                عرض التقدم
              </span>
              <ArrowLeftIcon className="w-4 h-4 text-green-500 group-hover:-translate-x-1 transition-transform duration-200" />
            </div>
          </Link>

          {/* Additional Feature Card */}
          <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-2xl p-6 text-white">
            <div className="flex items-center mb-4">
              <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center mr-4">
                <AwardIcon className="w-7 h-7 text-white" />
              </div>
              <div className="mr-4">
                <h3 className="text-lg font-semibold">إنجازاتي</h3>
                <p className="text-white/80 text-sm mt-1">
                  شاهد شاراتك وإنجازاتك
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between opacity-90">
              <span className="text-sm">..قريباً</span>
              <StarIcon className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Welcome Message */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 text-white relative overflow-hidden">
          <div className="absolute top-4 right-4 opacity-20">
            <StarIcon className="w-24 h-24" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-3">
              <BookOpenIcon className="w-6 h-6 text-yellow-300" />
              <h3 className="text-2xl font-bold">مرحباً بك في نظام المهام!</h3>
            </div>
            <p className="text-lg opacity-90 leading-relaxed">
              يمكنك الآن عرض مهامك وتسليمها من قسم مهامي، ومتابعة تقدمك وأدائك
              من تقدمي نحن هنا لمساعدتك في رحلة التعلم!
            </p>
            <div className="flex items-center gap-2 mt-4 text-blue-100">
              <TargetIcon className="w-4 h-4" />
              <span className="text-sm">ابدأ رحلتك التعليمية الآن</span>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-white rounded-xl p-4 text-center shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-blue-600">0</div>
            <div className="text-sm text-gray-500 mt-1">مهام مكتملة</div>
          </div>
          <div className="bg-white rounded-xl p-4 text-center shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-green-600">0</div>
            <div className="text-sm text-gray-500 mt-1">مهام قيد الانتظار</div>
          </div>
          <div className="bg-white rounded-xl p-4 text-center shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-orange-600">0</div>
            <div className="text-sm text-gray-500 mt-1">مستوى التقدم</div>
          </div>
          <div className="bg-white rounded-xl p-4 text-center shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-purple-600">0</div>
            <div className="text-sm text-gray-500 mt-1">نقاط المكافآت</div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mt-6">
          <div className="flex items-center gap-2 mb-4">
            <ClockIcon className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              النشاط الأخير
            </h3>
          </div>
          <div className="text-center py-8 text-gray-500">
            <BookOpenIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>لا توجد أنشطة حديثة</p>
            <p className="text-sm mt-1">
              سيظهر نشاطك هنا عند بدء استخدام النظام
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
