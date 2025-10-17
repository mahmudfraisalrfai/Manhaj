// app/api/sections/[id]/tasks/route.ts
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

    const tasks = await prisma.task.findMany({
      where: {
        sectionId: id, // استخدم id بدلاً من params.id
        teacherId: session.user.id,
      },
      include: {
        _count: {
          select: {
            studentTasks: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(tasks);
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error || "حدث خطأ في جلب البيانات" },
      { status: 401 }
    );
  }
}
