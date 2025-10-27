// app/api/student/tasks/[id]/route.ts
import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helper";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth("student");
    const { id } = await params;
    const body = await request.json().catch(() => ({}));

    const { status, studentNote, submittedAt } = body as {
      status?: string;
      studentNote?: string | null;
      submittedAt?: string | null;
    };

    // التحقق من وجود بيانات للتحديث
    if (
      status === undefined &&
      studentNote === undefined &&
      submittedAt === undefined
    ) {
      return NextResponse.json(
        { error: "لا توجد بيانات للتحديث" },
        { status: 400 }
      );
    }

    // تحقق من صحة القيم
    if (status && !["pending", "completed"].includes(status)) {
      return NextResponse.json(
        { error: "الحالة غير صالحة. يجب أن تكون 'pending' أو 'completed'" },
        { status: 400 }
      );
    }

    // تحقق من طول تعليق الطالب
    if (typeof studentNote === "string" && studentNote.length > 1000) {
      return NextResponse.json(
        { error: "التعليق طويل جداً (أقصى 1000 حرف)" },
        { status: 400 }
      );
    }

    // التحقق من ملكية السجل
    const studentTask = await prisma.studentTask.findFirst({
      where: {
        id,
        studentId: session.user.id, // تأكد من أن الطالب هو صاحب المهمة
      },
      include: {
        task: {
          select: {
            title: true,
            deadline: true,
          },
        },
      },
    });

    if (!studentTask) {
      return NextResponse.json(
        { error: "سجل مهمة الطالب غير موجود أو غير مصرح" },
        { status: 404 }
      );
    }

    // بناء بيانات التحديث
    const updateData: any = {};

    if (typeof status === "string") {
      updateData.status = status;

      // تحديث وقت التسليم تلقائياً عند إكمال المهمة
      if (status === "completed") {
        updateData.submittedAt = submittedAt
          ? new Date(submittedAt)
          : new Date();

        // إضافة تنبيه إذا تم التسليم بعد الموعد النهائي
        if (
          studentTask.task.deadline &&
          new Date() > new Date(studentTask.task.deadline)
        ) {
          console.warn(
            `الطالب ${session.user.name} سلم المهمة "${studentTask.task.title}" بعد الموعد النهائي`
          );
        }
      } else if (status === "pending") {
        updateData.submittedAt = null;
      }
    } else if (submittedAt !== undefined) {
      updateData.submittedAt = submittedAt ? new Date(submittedAt) : null;
    }

    if (studentNote !== undefined) {
      updateData.studentNote =
        studentNote === null ? null : String(studentNote).trim();
    }

    // التحديث في قاعدة البيانات
    const updatedStudentTask = await prisma.studentTask.update({
      where: { id },
      data: updateData,
      include: {
        task: {
          select: {
            title: true,
            section: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "تم تحديث المهمة بنجاح",
      studentTask: updatedStudentTask,
    });
  } catch (err) {
    console.error("PATCH /api/student/tasks/:id error:", err);

    // معالجة أخطاء محددة
    if (err instanceof Error) {
      if (err.message.includes("Record to update not found")) {
        return NextResponse.json(
          { error: "سجل المهمة غير موجود" },
          { status: 404 }
        );
      }
    }

    return NextResponse.json(
      { error: "فشل تحديث سجل المهمة" },
      { status: 500 }
    );
  }
}

// يمكنك أيضاً إضافة GET لاسترجاع بيانات مهمة محددة
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth("student");
    const { id } = await params;

    const studentTask = await prisma.studentTask.findFirst({
      where: {
        id,
        studentId: session.user.id,
      },
      include: {
        task: {
          include: {
            section: {
              select: {
                name: true,
              },
            },
            teacher: {
              select: {
                name: true,
                phone: true,
              },
            },
          },
        },
      },
    });

    if (!studentTask) {
      return NextResponse.json(
        { error: "المهمة غير موجودة أو غير مصرح" },
        { status: 404 }
      );
    }

    return NextResponse.json({ studentTask });
  } catch (err) {
    console.error("GET /api/student/tasks/:id error:", err);
    return NextResponse.json(
      { error: "فشل جلب بيانات المهمة" },
      { status: 500 }
    );
  }
}
