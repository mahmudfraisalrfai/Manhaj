// app/api/student/tasks/route.ts
import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helper";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const session = await requireAuth("student"); // تأكد أن المستخدم طالب
    const studentId = session.user.id;

    const studentTasks = await prisma.studentTask.findMany({
      where: { studentId },
      include: {
        task: {
          include: {
            section: { select: { name: true } },
            teacher: {
              // إضافة بيانات المدرس للحصول على رقم الهاتف
              select: {
                id: true,
                name: true,
                phone: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const data = studentTasks.map((st) => ({
      id: st.id, // id لسجل StudentTask
      task: {
        id: st.task.id,
        title: st.task.title,
        description: st.task.description,
        deadline: st.task.deadline,
        section: { name: st.task.section.name },
        teacher: {
          // إضافة بيانات المدرس
          id: st.task.teacher.id,
          name: st.task.teacher.name,
          phone: st.task.teacher.phone,
        },
      },
      status: st.status,
      submittedAt: st.submittedAt,
      createdAt: st.createdAt,
      note: st.note ?? null, // ملاحظة المدرّس
      studentNote: st.studentNote ?? null, // تعليق الطالب (إن وُجد)
    }));

    return NextResponse.json(data);
  } catch (err) {
    console.error("GET /api/student/tasks error:", err);
    return NextResponse.json({ error: "فشل جلب المهام" }, { status: 500 });
  }
}
