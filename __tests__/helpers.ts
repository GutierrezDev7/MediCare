import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "medicare-jwt-secret-key-test-2026"
);

export const testPrisma = new PrismaClient();

export async function cleanDatabase() {
  await testPrisma.historico.deleteMany();
  await testPrisma.lembrete.deleteMany();
  await testPrisma.relatorio.deleteMany();
  await testPrisma.medicamento.deleteMany();
  await testPrisma.cuidadorPaciente.deleteMany();
  await testPrisma.usuario.deleteMany();
}

export async function createTestUser(overrides: {
  nome?: string;
  email?: string;
  senha?: string;
  tipoPerfil?: "PACIENTE" | "CUIDADOR";
} = {}) {
  const hashedPassword = await bcrypt.hash(overrides.senha || "senha123", 10);
  return testPrisma.usuario.create({
    data: {
      nome: overrides.nome || "Usuário Teste",
      email: overrides.email || `test-${Date.now()}@test.com`,
      senha: hashedPassword,
      tipoPerfil: overrides.tipoPerfil || "PACIENTE",
    },
  });
}

export async function generateTestToken(user: {
  id: number;
  email: string;
  tipoPerfil: string;
}) {
  return new SignJWT({
    userId: user.id,
    email: user.email,
    tipoPerfil: user.tipoPerfil,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(JWT_SECRET);
}

export async function createTestMedication(
  usuarioId: number,
  overrides: Record<string, unknown> = {}
) {
  return testPrisma.medicamento.create({
    data: {
      usuarioId,
      nome: (overrides.nome as string) || "Losartana",
      dosagem: (overrides.dosagem as string) || "50mg",
      frequencia: (overrides.frequencia as string) || "24h",
      dataInicio: (overrides.dataInicio as Date) || new Date(),
      ativo: overrides.ativo !== undefined ? (overrides.ativo as boolean) : true,
      estoque: (overrides.estoque as number) ?? 30,
      cor: (overrides.cor as string) || "#10b981",
      instrucoes: (overrides.instrucoes as string) || "Tomar pela manhã",
    },
  });
}
