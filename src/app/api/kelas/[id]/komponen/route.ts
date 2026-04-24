import { NextResponse } from "next/server";
import { KelasService } from "@/services/kelas.service"; // Import Service kita

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const kelasId = parseInt(resolvedParams.id, 10);
    const body = await request.json();

    // --- MODE 1: SYNC RPS ---
    if (body.action === "sync_rps") {
      const result = await KelasService.syncRps(kelasId);
      return NextResponse.json({ message: result.message });
    }

    // --- MODE 2: IMPORT EXCEL ---
    if (body.action === "import_excel") {
      const { komponen, dataNilai } = body;

      if (!dataNilai || !Array.isArray(dataNilai)) {
        return NextResponse.json(
          { error: "Data Excel tidak valid" },
          { status: 400 }
        );
      }

      const result = await KelasService.importNilaiExcel(kelasId, komponen, dataNilai);

      let message = `Import Selesai. Sukses: ${result.successCount}, Gagal: ${result.failedCount}.`;

      if (result.errors.length > 0) {
        const errorPreview = result.errors.slice(0, 3).join("\n");
        const moreErrors = result.errors.length > 3 ? `\n...dan ${result.errors.length - 3} error lainnya.` : "";

        return NextResponse.json({
          success: true,
          message: message,
          details: errorPreview + moreErrors,
          hasError: true,
        });
      }

      return NextResponse.json({
        success: true,
        message: message,
        hasError: false,
      });
    }

    return NextResponse.json({ error: "Action tidak dikenal" }, { status: 400 });
  } catch (err: any) {
    console.error("API POST Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}