import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helper";
import { prisma } from "@/lib/prisma";

// تعريف نوع القسم مع الأطفال
interface TreeSection {
  id: string;
  name: string;
  description: string | null;
  parentSectionId: string | null;
  icon: string | null;
  teacherId: string;
  createdAt: Date;
  updatedAt: Date;
  _count: {
    tasks: number;
    children: number;
  };
  children: TreeSection[];
}

export async function GET(request: Request) {
  try {
    const session = await requireAuth("teacher");

    const sections = await prisma.section.findMany({
      where: {
        teacherId: session.user.id,
      },
      include: {
        _count: {
          select: {
            tasks: true,
            children: true,
          },
        },
        children: {
          include: {
            _count: {
              select: {
                tasks: true,
                children: true,
              },
            },
            children: {
              include: {
                _count: {
                  select: {
                    tasks: true,
                    children: true,
                  },
                },
              },
            },
          },
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    // تعريف نوع واضح للدالة
    function buildTree(parentId: string | null): TreeSection[] {
      const treeNodes = sections
        .filter((section) => section.parentSectionId === parentId)
        .map((section) => ({
          ...section,
          children: buildTree(section.id),
        })) as TreeSection[];

      return treeNodes;
    }

    const treeData = buildTree(null);
    return NextResponse.json(treeData);
  } catch (error: unknown) {
    console.error("Error in sections/tree API:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء جلب شجرة الأقسام" },
      { status: 500 }
    );
  }
}
