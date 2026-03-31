import { subDays } from "date-fns";
import {
  testPrisma,
  cleanDatabase,
  createTestUser,
  createTestMedication,
} from "./helpers";

beforeAll(async () => {
  await testPrisma.$connect();
});

beforeEach(async () => {
  await cleanDatabase();
});

afterAll(async () => {
  await cleanDatabase();
  await testPrisma.$disconnect();
});

describe("Módulo 5 - Relatórios", () => {
  describe("Aderência", () => {
    it("deve calcular aderência 100% quando todas as doses são confirmadas", async () => {
      const user = await createTestUser({ email: "aderencia@test.com" });
      const med = await createTestMedication(user.id);

      await testPrisma.lembrete.createMany({
        data: Array.from({ length: 10 }, (_, i) => ({
          medicamentoId: med.id,
          horario: subDays(new Date(), i),
          status: "CONFIRMADO" as const,
        })),
      });

      const lembretes = await testPrisma.lembrete.findMany({
        where: { medicamento: { usuarioId: user.id } },
      });

      const total = lembretes.length;
      const confirmados = lembretes.filter(
        (l) => l.status === "CONFIRMADO"
      ).length;
      const aderencia = (confirmados / total) * 100;

      expect(total).toBe(10);
      expect(confirmados).toBe(10);
      expect(aderencia).toBe(100);
    });

    it("deve calcular aderência parcial corretamente", async () => {
      const user = await createTestUser({ email: "parcial@test.com" });
      const med = await createTestMedication(user.id);

      await testPrisma.lembrete.createMany({
        data: [
          ...Array.from({ length: 7 }, (_, i) => ({
            medicamentoId: med.id,
            horario: subDays(new Date(), i),
            status: "CONFIRMADO" as const,
          })),
          ...Array.from({ length: 3 }, (_, i) => ({
            medicamentoId: med.id,
            horario: subDays(new Date(), i + 7),
            status: "IGNORADO" as const,
          })),
        ],
      });

      const lembretes = await testPrisma.lembrete.findMany({
        where: { medicamento: { usuarioId: user.id } },
      });

      const total = lembretes.length;
      const confirmados = lembretes.filter(
        (l) => l.status === "CONFIRMADO"
      ).length;
      const aderencia = (confirmados / total) * 100;

      expect(total).toBe(10);
      expect(confirmados).toBe(7);
      expect(aderencia).toBe(70);
    });

    it("deve calcular aderência 0% quando nenhuma dose é confirmada", async () => {
      const user = await createTestUser({ email: "zero@test.com" });
      const med = await createTestMedication(user.id);

      await testPrisma.lembrete.createMany({
        data: Array.from({ length: 5 }, (_, i) => ({
          medicamentoId: med.id,
          horario: subDays(new Date(), i),
          status: "IGNORADO" as const,
        })),
      });

      const lembretes = await testPrisma.lembrete.findMany({
        where: { medicamento: { usuarioId: user.id } },
      });

      const confirmados = lembretes.filter(
        (l) => l.status === "CONFIRMADO"
      ).length;
      const aderencia =
        lembretes.length > 0 ? (confirmados / lembretes.length) * 100 : 0;

      expect(aderencia).toBe(0);
    });

    it("deve retornar 0% quando não há lembretes", async () => {
      const user = await createTestUser({ email: "empty@test.com" });

      const lembretes = await testPrisma.lembrete.findMany({
        where: { medicamento: { usuarioId: user.id } },
      });

      const aderencia =
        lembretes.length > 0
          ? (lembretes.filter((l) => l.status === "CONFIRMADO").length /
              lembretes.length) *
            100
          : 0;

      expect(aderencia).toBe(0);
    });

    it("deve calcular aderência por medicamento", async () => {
      const user = await createTestUser({ email: "pormed@test.com" });
      const med1 = await createTestMedication(user.id, { nome: "Med A" });
      const med2 = await createTestMedication(user.id, { nome: "Med B" });

      await testPrisma.lembrete.createMany({
        data: [
          { medicamentoId: med1.id, horario: new Date(), status: "CONFIRMADO" },
          { medicamentoId: med1.id, horario: subDays(new Date(), 1), status: "CONFIRMADO" },
          { medicamentoId: med2.id, horario: new Date(), status: "CONFIRMADO" },
          { medicamentoId: med2.id, horario: subDays(new Date(), 1), status: "IGNORADO" },
        ],
      });

      const lembretesMed1 = await testPrisma.lembrete.findMany({
        where: { medicamentoId: med1.id },
      });
      const lembretesMed2 = await testPrisma.lembrete.findMany({
        where: { medicamentoId: med2.id },
      });

      const aderenciaMed1 =
        (lembretesMed1.filter((l) => l.status === "CONFIRMADO").length /
          lembretesMed1.length) *
        100;
      const aderenciaMed2 =
        (lembretesMed2.filter((l) => l.status === "CONFIRMADO").length /
          lembretesMed2.length) *
        100;

      expect(aderenciaMed1).toBe(100);
      expect(aderenciaMed2).toBe(50);
    });

    it("deve filtrar por período", async () => {
      const user = await createTestUser({ email: "periodo@test.com" });
      const med = await createTestMedication(user.id);

      await testPrisma.lembrete.createMany({
        data: [
          { medicamentoId: med.id, horario: new Date("2026-03-01"), status: "CONFIRMADO" },
          { medicamentoId: med.id, horario: new Date("2026-03-15"), status: "IGNORADO" },
          { medicamentoId: med.id, horario: new Date("2026-04-01"), status: "CONFIRMADO" },
        ],
      });

      const filtered = await testPrisma.lembrete.findMany({
        where: {
          medicamento: { usuarioId: user.id },
          horario: {
            gte: new Date("2026-03-01"),
            lte: new Date("2026-03-31"),
          },
        },
      });

      expect(filtered).toHaveLength(2);
    });
  });

  describe("Resumo Dashboard", () => {
    it("deve contar medicamentos ativos e inativos", async () => {
      const user = await createTestUser({ email: "summary@test.com" });

      await createTestMedication(user.id, { nome: "Ativo 1", ativo: true });
      await createTestMedication(user.id, { nome: "Ativo 2", ativo: true });
      await createTestMedication(user.id, { nome: "Inativo", ativo: false });

      const total = await testPrisma.medicamento.count({
        where: { usuarioId: user.id },
      });
      const ativos = await testPrisma.medicamento.count({
        where: { usuarioId: user.id, ativo: true },
      });

      expect(total).toBe(3);
      expect(ativos).toBe(2);
    });

    it("deve identificar estoques baixos (<=10)", async () => {
      const user = await createTestUser({ email: "estoque@test.com" });

      await createTestMedication(user.id, { nome: "Baixo", estoque: 5 });
      await createTestMedication(user.id, { nome: "Normal", estoque: 30 });
      await createTestMedication(user.id, { nome: "Crítico", estoque: 2 });

      const estoquesBaixos = await testPrisma.medicamento.findMany({
        where: {
          usuarioId: user.id,
          ativo: true,
          estoque: { not: null, lte: 10 },
        },
      });

      expect(estoquesBaixos).toHaveLength(2);
      expect(estoquesBaixos.map((m) => m.nome)).toContain("Baixo");
      expect(estoquesBaixos.map((m) => m.nome)).toContain("Crítico");
    });

    it("deve retornar histórico recente ordenado", async () => {
      const user = await createTestUser({ email: "histrecent@test.com" });
      const med = await createTestMedication(user.id);

      await testPrisma.historico.createMany({
        data: [
          {
            usuarioId: user.id,
            medicamentoId: med.id,
            dataHora: subDays(new Date(), 2),
            statusAdministracao: "ADMINISTRADO",
          },
          {
            usuarioId: user.id,
            medicamentoId: med.id,
            dataHora: subDays(new Date(), 1),
            statusAdministracao: "ADMINISTRADO",
          },
          {
            usuarioId: user.id,
            medicamentoId: med.id,
            dataHora: new Date(),
            statusAdministracao: "NAO_ADMINISTRADO",
          },
        ],
      });

      const historico = await testPrisma.historico.findMany({
        where: { usuarioId: user.id },
        orderBy: { dataHora: "desc" },
        take: 10,
      });

      expect(historico).toHaveLength(3);
      expect(historico[0].statusAdministracao).toBe("NAO_ADMINISTRADO");
    });
  });
});
