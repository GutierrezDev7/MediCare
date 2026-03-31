import { NextRequest, NextResponse } from "next/server";
import { LogService } from "@/backend/services/log.service";
import { authenticateRequest, unauthorizedResponse } from "@/backend/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const payload = await authenticateRequest(request);
    if (!payload) return unauthorizedResponse();

    const { searchParams } = new URL(request.url);

    const result = await LogService.list(payload.userId, {
      medicamentoId: searchParams.get("medicamentoId"),
      status: searchParams.get("status"),
      dataInicio: searchParams.get("dataInicio"),
      dataFim: searchParams.get("dataFim"),
      limit: parseInt(searchParams.get("limit") || "100"),
      offset: parseInt(searchParams.get("offset") || "0"),
    });

    return NextResponse.json(result.data, { status: result.status });
  } catch (error) {
    console.error("Erro ao listar logs:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
