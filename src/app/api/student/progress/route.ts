// app/api/student/progress/route.ts
import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helper";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await requireAuth("student");

    // جلب جميع مهام الطالب
    const studentTasks = await prisma.studentTask.findMany({
      where: { studentId: session.user.id },
      include: {
        task: {
          include: {
            section: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const totalTasks = studentTasks.length;
    const completedTasks = studentTasks.filter(
      (t) => t.status === "completed"
    ).length;
    const pendingTasks = studentTasks.filter(
      (t) => t.status === "pending"
    ).length;
    const completionRate =
      totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // آخر 5 مهام
    const recentTasks = studentTasks.slice(0, 5).map((t) => ({
      title: t.task.title,
      section: t.task.section.name,
      status: t.status,
      submittedAt: t.submittedAt,
    }));

    return NextResponse.json({
      totalTasks,
      completedTasks,
      pendingTasks,
      completionRate,
      recentTasks,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error || "حدث خطأ في جلب الإحصائيات" },
      { status: 401 }
    );
  }
}
