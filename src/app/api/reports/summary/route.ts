import { NextRequest, NextResponse } from "next/server";
import { ReportService } from "@/backend/services/report.service";
import { authenticateRequest, unauthorizedResponse } from "@/backend/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const payload = await authenticateRequest(request);
    if (!payload) return unauthorizedResponse();

    const result = await ReportService.getSummary(payload.userId);
    return NextResponse.json(result.data, { status: result.status });
  } catch (error) {
    console.error("Erro ao gerar resumo:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
