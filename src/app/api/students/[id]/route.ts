// app/api/students/[id]/route.ts
import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helper";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth("teacher");
    const { id } = await params; // أضف await هنا

    await prisma.user.delete({
      where: { id: id }, // استخدم id بدلاً من params.id
    });

    return NextResponse.json({ message: "تم حذف الطالب بنجاح" });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error || "حدث خطأ في حذف الطالب" },
      { status: 500 }
    );
  }
}
