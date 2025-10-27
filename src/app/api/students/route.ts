// app/api/students/route.ts
import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helper";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    await requireAuth("teacher"); // تأكد أن المستخدم مدرس

    const students = await prisma.user.findMany({
      where: { role: "student" },
      select: {
        id: true,
        name: true,
        password: true,
        createdAt: true,
        phone: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(students);
  } catch (error: unknown) {
    console.error("GET /api/students error:", error);

    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    return NextResponse.json(
      { error: "حدث خطأ في جلب بيانات الطلاب" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await requireAuth("teacher"); // تأكد أن المستخدم مدرس

    const { name, password, phone } = await request.json();

    // التحقق من البيانات المدخلة
    if (!name || !password) {
      return NextResponse.json(
        { error: "الاسم وكلمة المرور مطلوبان" },
        { status: 400 }
      );
    }

    if (name.length < 2) {
      return NextResponse.json(
        { error: "الاسم يجب أن يكون على الأقل حرفين" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "كلمة المرور يجب أن تكون على الأقل 6 أحرف" },
        { status: 400 }
      );
    }

    if (
      phone &&
      !/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/.test(phone)
    ) {
      return NextResponse.json(
        { error: "رقم الهاتف غير صالح" },
        { status: 400 }
      );
    }

    // التحقق من عدم وجود اسم مستخدم مكرر
    const existingUser = await prisma.user.findUnique({
      where: { name },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "اسم المستخدم موجود مسبقاً" },
        { status: 400 }
      );
    }

    // تشفير كلمة المرور

    // إنشاء الطالب
    const student = await prisma.user.create({
      data: {
        name,
        password,
        role: "student",
        phone: phone || null,
      },
      select: {
        id: true,
        name: true,
        phone: true,
        createdAt: true,
        password: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "تم إضافة الطالب بنجاح",
      student,
    });
  } catch (error: unknown) {
    console.error("POST /api/students error:", error);

    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    return NextResponse.json(
      { error: "حدث خطأ في إضافة الطالب" },
      { status: 500 }
    );
  }
}
