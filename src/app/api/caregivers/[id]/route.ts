import { NextRequest, NextResponse } from "next/server";
import { CaregiverService } from "@/backend/services/caregiver.service";
import { authenticateRequest, unauthorizedResponse } from "@/backend/lib/auth";

type RouteParams = { params: Promise<{ id: string }> };

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const payload = await authenticateRequest(request);
    if (!payload) return unauthorizedResponse();

    const { id } = await params;
    const vinculoId = parseInt(id);
    if (isNaN(vinculoId)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    const result = await CaregiverService.removeCaregiver(payload.userId, vinculoId);

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json(result.data, { status: result.status });
  } catch (error) {
    console.error("Erro ao remover vínculo:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
