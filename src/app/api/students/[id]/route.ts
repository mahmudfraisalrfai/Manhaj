// app/api/students/[id]/route.ts
import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helper";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth("teacher");
    const { id } = await params;

    // التحقق من وجود الطالب أولاً
    const student = await prisma.user.findUnique({
      where: {
        id,
        role: "student",
      },
    });

    if (!student) {
      return NextResponse.json({ error: "الطالب غير موجود" }, { status: 404 });
    }

    // حذف جميع مهام الطالب أولاً (لتفادي أخطاء Foreign Key)
    await prisma.studentTask.deleteMany({
      where: { studentId: id },
    });

    // ثم حذف الطالب
    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "تم حذف الطالب وجميع مهامه بنجاح",
    });
  } catch (error: unknown) {
    console.error("DELETE /api/students/[id] error:", error);

    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    return NextResponse.json(
      { error: "حدث خطأ في حذف الطالب" },
      { status: 500 }
    );
  }
}
