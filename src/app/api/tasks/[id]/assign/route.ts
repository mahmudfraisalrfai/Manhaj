// app/api/tasks/[id]/assign/route.ts
import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helper";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth("teacher");
    const { id } = await params; // أضف await هنا

    const { studentIds } = await request.json();

    if (!studentIds || !Array.isArray(studentIds)) {
      return NextResponse.json(
        { error: "يجب تحديد قائمة بالطلاب" },
        { status: 400 }
      );
    }

    // التحقق من أن المهمة مملوكة للشيخ
    const task = await prisma.task.findFirst({
      where: {
        id: id, // استخدم id بدلاً من taskId
        teacherId: session.user.id,
      },
    });

    if (!task) {
      return NextResponse.json(
        { error: "المهمة غير موجودة أو غير مصرح" },
        { status: 404 }
      );
    }

    let assignedCount = 0;

    // تعيين المهمة للطلاب المحددين
    for (const studentId of studentIds) {
      const existingAssignment = await prisma.studentTask.findFirst({
        where: {
          studentId: studentId,
          taskId: id, // استخدم id بدلاً من taskId
        },
      });

      if (!existingAssignment) {
        await prisma.studentTask.create({
          data: {
            studentId: studentId,
            taskId: id, // استخدم id بدلاً من taskId
            status: "pending",
          },
        });
        assignedCount++;
      }
    }

    return NextResponse.json({
      message: "تم تعيين المهمة بنجاح",
      assignedCount,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error || "حدث خطأ في تعيين المهمة" },
      { status: 500 }
    );
  }
}
