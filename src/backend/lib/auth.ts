import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "fallback-secret-do-not-use-in-prod"
);

const TOKEN_NAME = "medicare_token";
const TOKEN_EXPIRY = "7d";

export interface JWTPayload {
  userId: number;
  email: string;
  tipoPerfil: string;
}

export async function signToken(payload: JWTPayload): Promise<string> {
  return new SignJWT(payload as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(TOKEN_EXPIRY)
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<JWTPayload> {
  const { payload } = await jwtVerify(token, JWT_SECRET);
  return payload as unknown as JWTPayload;
}

export async function setAuthCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(TOKEN_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
}

export async function removeAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(TOKEN_NAME);
}

export async function getTokenFromRequest(
  request: NextRequest
): Promise<string | null> {
  const cookieToken = request.cookies.get(TOKEN_NAME)?.value;
  if (cookieToken) return cookieToken;

  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }

  return null;
}

export async function authenticateRequest(
  request: NextRequest
): Promise<JWTPayload | null> {
  const token = await getTokenFromRequest(request);
  if (!token) return null;

  try {
    return await verifyToken(token);
  } catch {
    return null;
  }
}

export function unauthorizedResponse(message = "Não autorizado") {
  return NextResponse.json({ error: message }, { status: 401 });
}

export function forbiddenResponse(message = "Acesso negado") {
  return NextResponse.json({ error: message }, { status: 403 });
}

export function badRequestResponse(message: string, errors?: unknown) {
  return NextResponse.json({ error: message, errors }, { status: 400 });
}

export function notFoundResponse(message = "Recurso não encontrado") {
  return NextResponse.json({ error: message }, { status: 404 });
}

export function successResponse(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}
