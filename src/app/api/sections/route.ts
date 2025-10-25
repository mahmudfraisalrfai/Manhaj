import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helper";
import { prisma } from "@/lib/prisma";

// GET - جلب جميع الأقسام (مسطحة أو شجرة)
export async function GET(request: Request) {
  try {
    const session = await requireAuth("teacher");
    const url = new URL(request.url);

    const flat = url.searchParams.get("flat") === "true";
    const includeCounts = url.searchParams.get("includeCounts") === "true";

    if (flat) {
      // للقوائم المنسدلة
      const sections = await prisma.section.findMany({
        where: { teacherId: session.user.id },
        select: {
          id: true,
          name: true,
          description: true,
          parentSectionId: true,
          icon: true,
        },
        orderBy: { name: "asc" },
      });
      return NextResponse.json(sections);
    }

    // مع العدادات
    const sections = await prisma.section.findMany({
      where: { teacherId: session.user.id },
      include: {
        _count: {
          select: {
            tasks: includeCounts,
            children: includeCounts,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(sections);
  } catch (error: unknown) {
    return NextResponse.json(
      { error: "حدث خطأ أثناء جلب الأقسام" },
      { status: 500 }
    );
  }
}

// POST - إنشاء قسم جديد
export async function POST(request: Request) {
  try {
    const session = await requireAuth("teacher");
    const { name, description, parentSectionId } = await request.json();

    if (!name) {
      return NextResponse.json({ error: "اسم القسم مطلوب" }, { status: 400 });
    }

    // التحقق من التكرار تحت نفس الأب
    const existing = await prisma.section.findFirst({
      where: {
        name,
        parentSectionId: parentSectionId || null,
        teacherId: session.user.id,
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "اسم القسم موجود مسبقاً في هذا المستوى" },
        { status: 400 }
      );
    }

    // إذا كان هناك قسم أب، التحقق من وجوده
    if (parentSectionId) {
      const parent = await prisma.section.findFirst({
        where: {
          id: parentSectionId,
          teacherId: session.user.id,
        },
      });

      if (!parent) {
        return NextResponse.json(
          { error: "القسم الأب غير موجود" },
          { status: 404 }
        );
      }
    }

    // إنشاء القسم
    const section = await prisma.section.create({
      data: {
        name,
        description: description || "",
        parentSectionId: parentSectionId || null,
        teacherId: session.user.id,
      },
      include: {
        _count: {
          select: { tasks: true, children: true },
        },
      },
    });

    return NextResponse.json(section);
  } catch (error: unknown) {
    console.error("Error creating section:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء إضافة القسم" },
      { status: 500 }
    );
  }
}
