// app/api/student/tasks/[id]/route.ts
import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helper";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAuth("student");

    const { status } = await request.json();

    // التحقق من أن المهمة مملوكة للطالب
    const studentTask = await prisma.studentTask.findFirst({
      where: {
        id: params.id,
        studentId: session.user.id,
      },
    });

    if (!studentTask) {
      return NextResponse.json(
        { error: "المهمة غير موجودة أو غير مصرح" },
        { status: 404 }
      );
    }

    const updatedStudentTask = await prisma.studentTask.update({
      where: { id: params.id },
      data: {
        status,
        submittedAt: status === "completed" ? new Date() : null,
      },
    });

    return NextResponse.json(updatedStudentTask);
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error || "حدث خطأ في تحديث المهمة" },
      { status: 401 }
    );
  }
}
