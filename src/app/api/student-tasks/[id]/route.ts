// app/api/student-tasks/[id]/route.ts
import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helper";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // تأكد أن المستخدم هو مدرس
    const session = await requireAuth("teacher");
    const { id } = await params;

    const body = await request.json().catch(() => ({}));
    const { status, note, submittedAt } = body as {
      status?: string;
      note?: string | null;
      submittedAt?: string | null;
    };

    // لا تقبل طلب خالٍ من بيانات التحديث
    if (
      status === undefined &&
      note === undefined &&
      submittedAt === undefined
    ) {
      return NextResponse.json(
        { error: "لا توجد بيانات للتحديث" },
        { status: 400 }
      );
    }

    // تحقق من طول الملاحظة إذا وُجدت
    if (typeof note === "string" && note.length > 1000) {
      return NextResponse.json(
        { error: "الملاحظة طويلة جداً (أقصى 1000 حرف)" },
        { status: 400 }
      );
    }

    // البحث عن سجل مهمة الطالب مع المهمة للتحقق من الصلاحية
    const studentTask = await prisma.studentTask.findFirst({
      where: { id },
      include: { task: true },
    });

    if (!studentTask) {
      return NextResponse.json(
        { error: "مهمة الطالب غير موجودة" },
        { status: 404 }
      );
    }

    // تحقق أن المدرّس الحالي هو صاحب المهمة
    if (studentTask.task.teacherId !== session.user.id) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    // إعداد كائن البيانات الذي سنمرره إلى Prisma.update
    const data: any = {};

    if (typeof status === "string") {
      data.status = status;
      // إذا أصبحت الحالة مكتملة و لم يُمرَّ submittedAt فضع التاريخ الآن
      if (status === "completed") {
        data.submittedAt = submittedAt ? new Date(submittedAt) : new Date();
      } else {
        // إن كانت الحالة ليست مكتملة - نزيل submittedAt
        data.submittedAt = null;
      }
    } else if (submittedAt !== undefined) {
      // لو تم تمرير submittedAt بدون status
      data.submittedAt = submittedAt ? new Date(submittedAt) : null;
    }

    if (note !== undefined) {
      // اقبل null أو النص، وحوّل إلى string إذا لزم
      data.note = note === null ? null : String(note);
    }

    const updatedStudentTask = await prisma.studentTask.update({
      where: { id },
      data,
    });

    return NextResponse.json({ studentTask: updatedStudentTask });
  } catch (error) {
    console.error("PATCH /api/student-tasks/:id error:", error);
    return NextResponse.json(
      { error: "حدث خطأ في تحديث بيانات مهمة الطالب" },
      { status: 500 }
    );
  }
}
