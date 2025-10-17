// app/api/sections/route.ts
import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helper";
import { prisma } from "@/lib/prisma";

// في دالة GET في app/api/sections/route.ts
export async function GET(request: Request) {
  try {
    const session = await requireAuth("teacher");

    const url = new URL(request.url);
    const includeTasks = url.searchParams.get("includeTasks") === "true";

    const sections = await prisma.section.findMany({
      where: { teacherId: session.user.id },
      include: {
        _count: {
          select: { tasks: true },
        },
        tasks: includeTasks
          ? {
              include: {
                _count: {
                  select: {
                    studentTasks: true,
                  },
                },
              },
              orderBy: { createdAt: "desc" },
            }
          : false,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(sections);
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error || "حدث خطأ في جلب البيانات" },
      { status: 401 }
    );
  }
}
export async function POST(request: Request) {
  try {
    const session = await requireAuth("teacher");

    const { name, description } = await request.json();

    if (!name) {
      return NextResponse.json({ error: "اسم القسم مطلوب" }, { status: 400 });
    }

    const existingSection = await prisma.section.findFirst({
      where: {
        name,
        teacherId: session.user.id,
      },
    });

    if (existingSection) {
      return NextResponse.json(
        { error: "اسم القسم موجود مسبقاً" },
        { status: 400 }
      );
    }

    const section = await prisma.section.create({
      data: {
        name,
        description: description || "",
        teacherId: session.user.id,
      },
    });

    return NextResponse.json(section);
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error || "حدث خطأ في إضافة القسم" },
      { status: 401 }
    );
  }
}
