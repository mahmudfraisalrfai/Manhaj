// app/api/student/tasks/route.ts
import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helper";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await requireAuth("student");

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

    return NextResponse.json(studentTasks);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "حدث خطأ في جلب المهام" },
      { status: 401 }
    );
  }
}
