import { NextResponse } from "next/server";
import { removeAuthCookie } from "@/backend/lib/auth";

export async function POST() {
  try {
    await removeAuthCookie();
    return NextResponse.json({ message: "Logout realizado com sucesso" });
  } catch {
    return NextResponse.json({ message: "Logout realizado" });
  }
}
