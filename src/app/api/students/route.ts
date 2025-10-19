// app/api/students/route.ts
import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helper";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const students = await prisma.user.findMany({
      where: { role: "student" },
      select: {
        id: true,
        name: true,
        password: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(students);
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error || "حدث خطأ في جلب المهام" },
      { status: 401 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { name, password } = await request.json();

    if (!name || !password) {
      return NextResponse.json(
        { error: "الاسم وكلمة المرور مطلوبان" },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { name },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "اسم المستخدم موجود مسبقاً" },
        { status: 400 }
      );
    }

    const student = await prisma.user.create({
      data: {
        name,
        password,
        role: "student",
      },
    });

    return NextResponse.json(student);
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error || "حدث خطأ في إضافة الطالب" },
      { status: 401 }
    );
  }
}
