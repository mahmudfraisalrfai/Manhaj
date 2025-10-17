// app/api/student-tasks/[id]/route.ts
import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helper";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth("teacher");
    const { id } = await params; // أضف await هنا

    const { status } = await request.json();

    // البحث عن مهمة الطالب
    const studentTask = await prisma.studentTask.findFirst({
      where: { id: id }, // استخدم id بدلاً من params.id
      include: {
        task: true,
      },
    });

    if (!studentTask) {
      return NextResponse.json(
        { error: "مهمة الطالب غير موجودة" },
        { status: 404 }
      );
    }

    // التحقق من أن المهمة الأصلية مملوكة للشيخ
    if (studentTask.task.teacherId !== session.user.id) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const updatedStudentTask = await prisma.studentTask.update({
      where: { id: id }, // استخدم id بدلاً من params.id
      data: {
        status,
        submittedAt: status === "completed" ? new Date() : null,
      },
    });

    return NextResponse.json(updatedStudentTask);
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error || "حدث خطأ في تحديث حالة المهمة" },
      { status: 500 }
    );
  }
}
