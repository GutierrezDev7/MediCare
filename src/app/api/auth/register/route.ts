import { NextRequest, NextResponse } from "next/server";
import { AuthService } from "@/backend/services/auth.service";
import { setAuthCookie } from "@/backend/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await AuthService.register(body);

    if (result.error) {
      return NextResponse.json(
        { error: result.error, errors: result.errors },
        { status: result.status }
      );
    }

    await setAuthCookie(result.data!.token);
    return NextResponse.json(result.data, { status: result.status });
  } catch (error) {
    console.error("Erro no registro:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
