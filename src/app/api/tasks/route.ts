// app/api/tasks/route.ts
import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helper";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await requireAuth("teacher");

    const tasks = await prisma.task.findMany({
      where: { teacherId: session.user.id },
      include: {
        section: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            studentTasks: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(tasks);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "حدث خطأ في جلب البيانات" },
      { status: 401 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireAuth("teacher");

    const { title, description, sectionId, deadline } = await request.json();

    if (!title || !sectionId) {
      return NextResponse.json(
        { error: "العنوان والقسم مطلوبان" },
        { status: 400 }
      );
    }

    const section = await prisma.section.findFirst({
      where: {
        id: sectionId,
        teacherId: session.user.id,
      },
    });

    if (!section) {
      return NextResponse.json(
        { error: "القسم غير موجود أو غير مصرح" },
        { status: 404 }
      );
    }

    const task = await prisma.task.create({
      data: {
        title,
        description: description || "",
        sectionId,
        teacherId: session.user.id,
        deadline: deadline ? new Date(deadline) : null,
      },
    });

    return NextResponse.json(task);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "حدث خطأ في إضافة المهمة" },
      { status: 401 }
    );
  }
}
