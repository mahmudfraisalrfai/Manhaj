import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  console.log("🔹 بدء إضافة البيانات الأولية...");

  await prisma.studentTask.deleteMany();
  await prisma.task.deleteMany();
  await prisma.section.deleteMany();
  await prisma.user.deleteMany();

  const teacher = await prisma.user.create({
    data: { name: "د.أبو النصر", password: "123456", role: "teacher" },
  });

  const students = await prisma.user.createMany({
    data: [
      { name: "طالب1", password: "123456", role: "student" },
      { name: "طالب2", password: "123456", role: "student" },
      { name: "طالب3", password: "123456", role: "student" },
    ],
  });
  console.log("👨‍🏫 تم إضافة الشيخ والطلاب");

  const quran = await prisma.section.create({
    data: {
      name: "حفظ القرآن",
      description: "قسم مخصص لحفظ القرآن الكريم وتلاوته",
      teacherId: teacher.id,
    },
  });

  const quranSub = await prisma.section.create({
    data: {
      name: "حفظ جزء عمّ",
      description: "قسم فرعي تابع لحفظ القرآن",
      teacherId: teacher.id,
      parentSectionId: quran.id,
    },
  });

  const fiqh = await prisma.section.create({
    data: {
      name: "الفقه",
      description: "قسم لدراسة أحكام الفقه الإسلامي",
      teacherId: teacher.id,
    },
  });

  console.log("📘 تم إنشاء الأقسام:", quran.name, quranSub.name, fiqh.name);

  const task1 = await prisma.task.create({
    data: {
      title: "حفظ سورة البقرة - الصفحات 1-2",
      description: "حفظ الصفحتين الأولى والثانية من سورة البقرة",
      sectionId: quran.id,
      teacherId: teacher.id,
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  const task2 = await prisma.task.create({
    data: {
      title: "مراجعة جزء عمّ",
      description: "مراجعة وحفظ سور جزء عمّ",
      sectionId: quranSub.id,
      teacherId: teacher.id,
    },
  });

  console.log("✅ تم إنشاء المهام:", task1.title, task2.title);
}

main()
  .catch((e) => {
    console.error("❌ خطأ:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
