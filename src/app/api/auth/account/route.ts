import { NextRequest, NextResponse } from "next/server";
import { AuthService } from "@/backend/services/auth.service";
import { authenticateRequest, removeAuthCookie, unauthorizedResponse } from "@/backend/lib/auth";

export async function DELETE(request: NextRequest) {
  try {
    const payload = await authenticateRequest(request);
    if (!payload) return unauthorizedResponse();

    const body = await request.json();
    const senha = body?.senha as string | undefined;

    if (!senha) {
      return NextResponse.json({ error: "Senha é obrigatória para excluir a conta" }, { status: 400 });
    }

    const result = await AuthService.deleteAccount(payload.userId, senha);

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    await removeAuthCookie();
    return NextResponse.json(result.data, { status: result.status });
  } catch (error) {
    console.error("Erro ao excluir conta:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
