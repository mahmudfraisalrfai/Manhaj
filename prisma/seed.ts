// prisma/seed.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("بدء إضافة البيانات الأولية...");

  // تنظيف البيانات القديمة أولاً
  await prisma.studentTask.deleteMany();
  await prisma.task.deleteMany();
  await prisma.section.deleteMany();
  await prisma.user.deleteMany();

  // إضافة الشيخ (المدير)
  const teacher = await prisma.user.create({
    data: {
      name: "الشيخ",
      password: "123456",
      role: "teacher",
    },
  });
  console.log("تم إضافة الشيخ:", teacher.name);

  // إضافة طلاب
  const student1 = await prisma.user.create({
    data: {
      name: "طالب1",
      password: "123456",
      role: "student",
    },
  });
  console.log("تم إضافة الطالب:", student1.name);

  const student2 = await prisma.user.create({
    data: {
      name: "طالب2",
      password: "123456",
      role: "student",
    },
  });
  console.log("تم إضافة الطالب:", student2.name);

  const student3 = await prisma.user.create({
    data: {
      name: "طالب3",
      password: "123456",
      role: "student",
    },
  });
  console.log("تم إضافة الطالب:", student3.name);

  // إضافة أقسام
  const section1 = await prisma.section.create({
    data: {
      name: "حفظ القرآن",
      description: "قسم مخصص لحفظ القرآن الكريم وتلاوته",
      teacherId: teacher.id,
    },
  });

  const section2 = await prisma.section.create({
    data: {
      name: "مراجعة الأحاديث",
      description: "قسم لمراجعة الأحاديث النبوية وحفظها",
      teacherId: teacher.id,
    },
  });

  const section3 = await prisma.section.create({
    data: {
      name: "الفقه",
      description: "قسم لدراسة أحكام الفقه الإسلامي",
      teacherId: teacher.id,
    },
  });
  console.log("تم إضافة الأقسام:", section1.name, section2.name, section3.name);

  // إضافة مهام
  const task1 = await prisma.task.create({
    data: {
      title: "حفظ سورة البقرة - الصفحات 1-2",
      description:
        "حفظ الصفحتين الأولى والثانية من سورة البقرة مع مراجعة التلاوة",
      sectionId: section1.id,
      teacherId: teacher.id,
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // بعد أسبوع
    },
  });

  const task2 = await prisma.task.create({
    data: {
      title: "مراجعة حديث الصيام",
      description: "مراجعة أحاديث الصيام من كتاب الأربعين النووية",
      sectionId: section2.id,
      teacherId: teacher.id,
      deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // بعد 3 أيام
    },
  });

  const task3 = await prisma.task.create({
    data: {
      title: "دراسة كتاب الطهارة",
      description: "قراءة ومراجعة باب الطهارة من كتاب الفقه الميسر",
      sectionId: section3.id,
      teacherId: teacher.id,
      // بدون موعد تسليم
    },
  });

  const task4 = await prisma.task.create({
    data: {
      title: "تلاوة سورة يس",
      description: "تلاوة سورة يس مع التدبر في المعاني",
      sectionId: section1.id,
      teacherId: teacher.id,
      completed: true, // مهمة مكتملة
    },
  });
  console.log(
    "تم إضافة المهام:",
    task1.title,
    task2.title,
    task3.title,
    task4.title
  );

  // تعيين المهام للطلاب
  await prisma.studentTask.create({
    data: {
      studentId: student1.id,
      taskId: task1.id,
      status: "completed",
      submittedAt: new Date(),
    },
  });

  await prisma.studentTask.create({
    data: {
      studentId: student2.id,
      taskId: task1.id,
      status: "pending",
    },
  });

  await prisma.studentTask.create({
    data: {
      studentId: student3.id,
      taskId: task1.id,
      status: "pending",
    },
  });

  await prisma.studentTask.create({
    data: {
      studentId: student1.id,
      taskId: task2.id,
      status: "completed",
      submittedAt: new Date(),
    },
  });

  await prisma.studentTask.create({
    data: {
      studentId: student2.id,
      taskId: task2.id,
      status: "completed",
      submittedAt: new Date(),
    },
  });

  await prisma.studentTask.create({
    data: {
      studentId: student1.id,
      taskId: task3.id,
      status: "pending",
    },
  });

  await prisma.studentTask.create({
    data: {
      studentId: student1.id,
      taskId: task4.id,
      status: "completed",
      submittedAt: new Date(),
    },
  });

  await prisma.studentTask.create({
    data: {
      studentId: student2.id,
      taskId: task4.id,
      status: "completed",
      submittedAt: new Date(),
    },
  });

  await prisma.studentTask.create({
    data: {
      studentId: student3.id,
      taskId: task4.id,
      status: "completed",
      submittedAt: new Date(),
    },
  });

  console.log("✅ تم إضافة جميع البيانات الأولية بنجاح!");
  console.log("📊 الإحصائيات:");
  console.log("   - 1 شيخ (المدير)");
  console.log("   - 3 طلاب");
  console.log("   - 3 أقسام");
  console.log("   - 4 مهام");
  console.log("   - 9 تعيينات مهام للطلاب");
}

main()
  .catch((e) => {
    console.error("❌ خطأ في إضافة البيانات:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
