// app/api/tasks/[id]/progress/route.ts
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

    // جلب تفاصيل المهمة
    const task = await prisma.task.findFirst({
      where: {
        id: id, // استخدم id بدلاً من taskId
        teacherId: session.user.id,
      },
      include: {
        section: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!task) {
      return NextResponse.json(
        { error: "المهمة غير موجودة أو غير مصرح" },
        { status: 404 }
      );
    }

    // جلب تقدم الطلاب في هذه المهمة
    const studentProgress = await prisma.studentTask.findMany({
      where: { taskId: id }, // استخدم id بدلاً من taskId
      include: {
        student: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        student: {
          name: "asc",
        },
      },
    });

    // تنسيق البيانات
    const students = studentProgress.map((sp) => ({
      id: sp.id,
      name: sp.student.name,
      status: sp.status,
      submittedAt: sp.submittedAt,
      createdAt: sp.createdAt,
    }));

    return NextResponse.json({
      task: {
        id: task.id,
        title: task.title,
        description: task.description,
        deadline: task.deadline,
        completed: task.completed,
        section: task.section,
      },
      students,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error || "حدث خطأ في جلب بيانات التقدم" },
      { status: 401 }
    );
  }
}
