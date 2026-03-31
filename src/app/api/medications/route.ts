import { NextRequest, NextResponse } from "next/server";
import { MedicationService } from "@/backend/services/medication.service";
import { authenticateRequest, unauthorizedResponse } from "@/backend/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const payload = await authenticateRequest(request);
    if (!payload) return unauthorizedResponse();

    const result = await MedicationService.list(payload.userId);
    return NextResponse.json(result.data, { status: result.status });
  } catch (error) {
    console.error("Erro ao listar medicamentos:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = await authenticateRequest(request);
    if (!payload) return unauthorizedResponse();

    const body = await request.json();
    const result = await MedicationService.create(payload.userId, body);

    if (result.error) {
      return NextResponse.json(
        { error: result.error, errors: result.errors },
        { status: result.status }
      );
    }

    return NextResponse.json(result.data, { status: result.status });
  } catch (error) {
    console.error("Erro ao criar medicamento:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
