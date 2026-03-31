import { NextRequest, NextResponse } from "next/server";
import { CaregiverService } from "@/backend/services/caregiver.service";
import { authenticateRequest, unauthorizedResponse } from "@/backend/lib/auth";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const payload = await authenticateRequest(request);
    if (!payload) return unauthorizedResponse();

    const { id } = await params;
    const pacienteId = parseInt(id);
    if (isNaN(pacienteId)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    const result = await CaregiverService.getPatientMedications(payload.userId, pacienteId);

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json(result.data, { status: result.status });
  } catch (error) {
    console.error("Erro ao listar medicamentos do paciente:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
