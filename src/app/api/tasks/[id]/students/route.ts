// app/api/tasks/[id]/students/route.ts
import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helper";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth("teacher");
    const { id } = await params; // أضف await هنا

    // جلب جميع الطلاب
    const students = await prisma.user.findMany({
      where: { role: "student" },
      select: {
        id: true,
        name: true,
      },
      orderBy: { name: "asc" },
    });

    // جلب الطلاب المعينين لهذه المهمة
    const assignedStudents = await prisma.studentTask.findMany({
      where: { taskId: id }, // استخدم id بدلاً من params.id
      select: {
        studentId: true,
      },
    });

    const assignedStudentIds = new Set(
      assignedStudents.map((st) => st.studentId)
    );

    // دمج البيانات
    const studentsWithAssignment = students.map((student) => ({
      id: student.id,
      name: student.name,
      assigned: assignedStudentIds.has(student.id),
    }));

    return NextResponse.json(studentsWithAssignment);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "حدث خطأ في جلب البيانات" },
      { status: 401 }
    );
  }
}
