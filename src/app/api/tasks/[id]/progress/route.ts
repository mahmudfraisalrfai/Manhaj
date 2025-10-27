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
    const { id } = await params;

    // جلب تفاصيل المهمة مع اسم القسم
    const task = await prisma.task.findFirst({
      where: {
        id: id,
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

    // جلب تقدم الطلاب في هذه المهمة مع حقل الملاحظة
    const studentProgress = await prisma.studentTask.findMany({
      where: { taskId: id },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
      },
      orderBy: {
        student: {
          name: "asc",
        },
      },
    });

    // تنسيق البيانات ليطابق الواجهة (id هنا هو id لسجل StudentTask)
    const students = studentProgress.map((sp) => ({
      id: sp.id,
      name: sp.student.name,
      status: sp.status,
      submittedAt: sp.submittedAt,
      createdAt: sp.createdAt,
      note: sp.note ?? null, // ← إضافة حقل الملاحظة
      studentNote: sp.studentNote ?? null,
      phone: sp.student.phone,
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
    console.error("GET /api/tasks/:id/progress error:", error);
    return NextResponse.json(
      { error: "حدث خطأ في جلب بيانات التقدم" },
      { status: 500 }
    );
  }
}
