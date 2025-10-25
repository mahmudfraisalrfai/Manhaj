import { NextRequest, NextResponse } from "next/server";
import { writeFile, unlink, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helper";

// 📌 رفع أيقونة جديدة أو تحديثها
export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth("teacher");
    const formData = await request.formData();
    const file = formData.get("icon") as File;
    const sectionId = formData.get("sectionId") as string;

    if (!file || !sectionId)
      return NextResponse.json(
        { error: "Missing file or sectionId" },
        { status: 400 }
      );

    // ✅ أنواع الملفات المسموحة
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "image/svg+xml",
    ];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "File type not allowed." },
        { status: 400 }
      );
    }

    // ✅ حد الحجم 5MB
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize)
      return NextResponse.json(
        { error: "File too large (max 5MB)" },
        { status: 400 }
      );

    // 📁 إنشاء مجلد التخزين
    const uploadDir = path.join(process.cwd(), "public/uploads/icons");
    if (!existsSync(uploadDir)) await mkdir(uploadDir, { recursive: true });

    // 🧠 إنشاء اسم فريد للملف
    const filename = `icon_${Date.now()}_${Math.random()
      .toString(36)
      .substring(2)}${path.extname(file.name)}`;
    const filePath = path.join(uploadDir, filename);

    // 📝 حفظ الملف
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, buffer);

    const fileUrl = `${
      process.env.NEXTAUTH_URL || "http://localhost:3000"
    }/uploads/icons/${filename}`;

    // 🔄 تحديث الأيقونة في قاعدة البيانات
    const updatedSection = await prisma.section.update({
      where: { id: sectionId, teacherId: session.user.id },
      data: { icon: fileUrl },
    });

    return NextResponse.json({
      success: true,
      message: "Icon uploaded successfully",
      fileUrl,
      section: updatedSection,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Upload failed", details: (error as Error).message },
      { status: 500 }
    );
  }
}

// 🔁 تحديث الأيقونة (يعني استبدالها)
export async function PUT(request: NextRequest) {
  try {
    const session = await requireAuth("teacher");
    const formData = await request.formData();
    const file = formData.get("icon") as File;
    const sectionId = formData.get("sectionId") as string;

    if (!file || !sectionId)
      return NextResponse.json(
        { error: "Missing file or sectionId" },
        { status: 400 }
      );

    // 🔍 جلب القسم الحالي لمعرفة الأيقونة القديمة
    const section = await prisma.section.findUnique({
      where: { id: sectionId, teacherId: session.user.id },
    });

    if (!section)
      return NextResponse.json(
        { error: "Section not found or unauthorized" },
        { status: 404 }
      );

    // 🔥 حذف الأيقونة القديمة من السيرفر إن وجدت
    if (section.icon) {
      const oldPath = path.join(
        process.cwd(),
        "public",
        section.icon.replace(/^\/+/, "")
      );
      try {
        await unlink(oldPath);
      } catch {
        console.warn("Old icon not found, skipping delete");
      }
    }

    // ⚙️ استدعاء دالة POST لرفع الأيقونة الجديدة
    return await POST(request);
  } catch (error) {
    console.error("Update error:", error);
    return NextResponse.json(
      { error: "Update failed", details: (error as Error).message },
      { status: 500 }
    );
  }
}

// ❌ حذف الأيقونة
export async function DELETE(request: NextRequest) {
  try {
    const session = await requireAuth("teacher");
    const { sectionId } = await request.json();

    if (!sectionId)
      return NextResponse.json({ error: "Missing sectionId" }, { status: 400 });

    // 🔍 جلب بيانات القسم الحالي
    const section = await prisma.section.findUnique({
      where: { id: sectionId, teacherId: session.user.id },
    });

    if (!section)
      return NextResponse.json(
        { error: "Section not found or unauthorized" },
        { status: 404 }
      );

    // 🧹 حذف الصورة من النظام إن كانت موجودة
    if (section.icon) {
      const iconPath = path.join(
        process.cwd(),
        "public",
        section.icon.replace(/^\/+/, "")
      );
      try {
        await unlink(iconPath);
      } catch {
        console.warn("File already deleted");
      }
    }

    // 🧠 تحديث قاعدة البيانات (إزالة الرابط)
    await prisma.section.update({
      where: { id: sectionId },
      data: { icon: null },
    });

    return NextResponse.json({
      success: true,
      message: "Icon deleted successfully",
    });
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json(
      { error: "Delete failed", details: (error as Error).message },
      { status: 500 }
    );
  }
}

// 🧱 منع طرق أخرى
export async function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
