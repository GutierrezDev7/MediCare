import { NextRequest, NextResponse } from "next/server";
import { ReportService } from "@/backend/services/report.service";
import { authenticateRequest, unauthorizedResponse } from "@/backend/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const payload = await authenticateRequest(request);
    if (!payload) return unauthorizedResponse();

    const { searchParams } = new URL(request.url);

    const result = await ReportService.getAdherence(payload.userId, {
      days: parseInt(searchParams.get("days") || "30"),
      periodoInicio: searchParams.get("periodoInicio"),
      periodoFim: searchParams.get("periodoFim"),
    });

    return NextResponse.json(result.data, { status: result.status });
  } catch (error) {
    console.error("Erro ao gerar relatório de aderência:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
