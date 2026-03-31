import { NextRequest, NextResponse } from "next/server";
import { MedicationService } from "@/backend/services/medication.service";
import { authenticateRequest, unauthorizedResponse } from "@/backend/lib/auth";

type RouteParams = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const payload = await authenticateRequest(request);
    if (!payload) return unauthorizedResponse();

    const { id } = await params;
    const medicamentoId = parseInt(id);
    if (isNaN(medicamentoId)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    const result = await MedicationService.toggle(payload.userId, medicamentoId);

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json(result.data, { status: result.status });
  } catch (error) {
    console.error("Erro ao alternar medicamento:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
