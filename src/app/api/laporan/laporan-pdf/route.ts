import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { mkdir, writeFile } from 'fs/promises';
import path from 'path';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q') || '';

    const dokumen = await prisma.pdf.findMany({
      where: {
        judul: {
          contains: q,
          mode: 'insensitive',
        },
      },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json({ data: dokumen }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Gagal mengambil data' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.formData();
    const file: File | null = data.get('file') as unknown as File;
    const judul = String(data.get('judul') || '').trim();

    if (!file || !judul) {
      return NextResponse.json({ message: 'File dan judul wajib diisi' }, { status: 400 });
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json({ message: 'File yang diunggah harus berformat PDF' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const safeName = path.basename(file.name).replace(/[^a-zA-Z0-9._-]/g, '_');
    const uniqueName = `${Date.now()}-${safeName || 'laporan.pdf'}`;
    
    // Menyimpan fisik file ke folder public/uploads
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadDir, { recursive: true });
    const filepath = path.join(uploadDir, uniqueName);
    await writeFile(filepath, buffer);

    // Menyimpan URL ke database
    const dokumen = await prisma.pdf.create({
      data: {
        judul: judul,
        file_url: `/uploads/${uniqueName}`,
      },
    });

    return NextResponse.json({ status: 'success', data: dokumen }, { status: 201 });
  } catch (error) {
    console.error('Gagal mengupload laporan PDF:', error);
    return NextResponse.json({ message: 'Gagal mengupload file' }, { status: 500 });
  }
}