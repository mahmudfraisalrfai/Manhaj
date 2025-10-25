// app/api/sections/[id]/route.ts
import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helper";
import { prisma } from "@/lib/prisma";

// 🔹 جلب قسم محدد
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAuth("teacher");
    const { id } = await params; // أضف await هنا

    const section = await prisma.section.findFirst({
      where: { id, teacherId: session.user.id },
      include: {
        _count: { select: { tasks: true } },
        tasks: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!section)
      return NextResponse.json(
        { error: "القسم غير موجود أو غير مصرح" },
        { status: 404 }
      );

    return NextResponse.json(section);
  } catch (error: unknown) {
    return NextResponse.json(
      { error: "حدث خطأ في جلب القسم" },
      { status: 500 }
    );
  }
}

// ✏️ تعديل قسم
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAuth("teacher");
    const { id } = params;
    const { name, description, icon } = await request.json();

    const section = await prisma.section.findFirst({
      where: { id, teacherId: session.user.id },
    });

    if (!section)
      return NextResponse.json(
        { error: "القسم غير موجود أو غير مصرح" },
        { status: 404 }
      );

    const updated = await prisma.section.update({
      where: { id },
      data: {
        name: name ?? section.name,
        description: description ?? section.description,
        icon: icon ?? section.icon,
      },
    });

    return NextResponse.json({
      success: true,
      message: "تم تعديل القسم بنجاح",
      section: updated,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: "حدث خطأ أثناء تعديل القسم" },
      { status: 500 }
    );
  }
}

// ❌ حذف قسم
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAuth("teacher");
    const { id } = params;

    const section = await prisma.section.findFirst({
      where: { id, teacherId: session.user.id },
    });

    if (!section)
      return NextResponse.json(
        { error: "القسم غير موجود أو غير مصرح" },
        { status: 404 }
      );

    await prisma.section.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: "تم حذف القسم بنجاح",
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: "حدث خطأ أثناء حذف القسم" },
      { status: 500 }
    );
  }
}
