// app/api/tasks/[id]/route.ts
import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helper";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth("teacher");
    const { id } = await params; // أضف await هنا

    // التحقق من أن المهمة مملوكة للشيخ
    const task = await prisma.task.findFirst({
      where: {
        id: id, // استخدم id بدلاً من params.id
        teacherId: session.user.id,
      },
    });

    if (!task) {
      return NextResponse.json(
        { error: "المهمة غير موجودة أو غير مصرح" },
        { status: 404 }
      );
    }

    await prisma.task.delete({
      where: { id: id }, // استخدم id بدلاً من params.id
    });

    return NextResponse.json({ message: "تم حذف المهمة بنجاح" });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "حدث خطأ في حذف المهمة" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth("teacher");
    const { id } = await params; // أضف await هنا

    const { completed } = await request.json();

    // التحقق من أن المهمة مملوكة للشيخ
    const task = await prisma.task.findFirst({
      where: {
        id: id, // استخدم id بدلاً من params.id
        teacherId: session.user.id,
      },
    });

    if (!task) {
      return NextResponse.json(
        { error: "المهمة غير موجودة أو غير مصرح" },
        { status: 404 }
      );
    }

    const updatedTask = await prisma.task.update({
      where: { id: id }, // استخدم id بدلاً من params.id
      data: { completed },
    });

    return NextResponse.json(updatedTask);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "حدث خطأ في تحديث المهمة" },
      { status: 500 }
    );
  }
}

// أضف دالة GET للحصول على معلومات المهمة
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth("teacher");
    const { id } = await params; // أضف await هنا

    const task = await prisma.task.findFirst({
      where: {
        id: id,
        teacherId: session.user.id,
      },
      select: {
        id: true,
        title: true,
        description: true,
      },
    });

    if (!task) {
      return NextResponse.json(
        { error: "المهمة غير موجودة أو غير مصرح" },
        { status: 404 }
      );
    }

    return NextResponse.json(task);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "حدث خطأ في جلب البيانات" },
      { status: 401 }
    );
  }
}
