// app/api/sections/[id]/route.ts
import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helper";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth("teacher");
    const { id } = await params; // أضف await هنا

    const section = await prisma.section.findFirst({
      where: {
        id: id, // استخدم id بدلاً من params.id
        teacherId: session.user.id,
      },
    });

    if (!section) {
      return NextResponse.json(
        { error: "القسم غير موجود أو غير مصرح" },
        { status: 404 }
      );
    }

    return NextResponse.json(section);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "حدث خطأ في جلب البيانات" },
      { status: 401 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth("teacher");
    const { id } = await params; // أضف await هنا

    const section = await prisma.section.findFirst({
      where: {
        id: id, // استخدم id بدلاً من params.id
        teacherId: session.user.id,
      },
    });

    if (!section) {
      return NextResponse.json(
        { error: "القسم غير موجود أو غير مصرح" },
        { status: 404 }
      );
    }

    await prisma.section.delete({
      where: { id: id }, // استخدم id بدلاً من params.id
    });

    return NextResponse.json({ message: "تم حذف القسم بنجاح" });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "حدث خطأ في حذف القسم" },
      { status: 500 }
    );
  }
}
