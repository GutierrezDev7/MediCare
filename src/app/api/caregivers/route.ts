import { NextRequest, NextResponse } from "next/server";
import { CaregiverService } from "@/backend/services/caregiver.service";
import { authenticateRequest, unauthorizedResponse } from "@/backend/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const payload = await authenticateRequest(request);
    if (!payload) return unauthorizedResponse();

    const result = await CaregiverService.listCaregivers(payload.userId);
    return NextResponse.json(result.data, { status: result.status });
  } catch (error) {
    console.error("Erro ao listar cuidadores:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = await authenticateRequest(request);
    if (!payload) return unauthorizedResponse();

    const body = await request.json();
    const result = await CaregiverService.addCaregiver(payload.userId, body);

    if (result.error) {
      return NextResponse.json(
        { error: result.error, errors: result.errors },
        { status: result.status }
      );
    }

    return NextResponse.json(result.data, { status: result.status });
  } catch (error) {
    console.error("Erro ao vincular cuidador:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
