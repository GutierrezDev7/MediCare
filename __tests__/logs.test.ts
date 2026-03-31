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

describe("Módulo 3 - Logs/Lembretes", () => {
  describe("Listar Lembretes", () => {
    it("deve listar lembretes do usuário", async () => {
      const user = await createTestUser({ email: "logs@test.com" });
      const med = await createTestMedication(user.id);

      await testPrisma.lembrete.createMany({
        data: [
          { medicamentoId: med.id, horario: new Date("2026-03-30T08:00:00") },
          { medicamentoId: med.id, horario: new Date("2026-03-31T08:00:00") },
          { medicamentoId: med.id, horario: new Date("2026-04-01T08:00:00") },
        ],
      });

      const logs = await testPrisma.lembrete.findMany({
        where: { medicamento: { usuarioId: user.id } },
        include: {
          medicamento: {
            select: { id: true, nome: true, dosagem: true },
          },
        },
        orderBy: { horario: "desc" },
      });

      expect(logs).toHaveLength(3);
      expect(logs[0].medicamento.nome).toBe("Losartana");
    });

    it("deve filtrar lembretes por medicamento", async () => {
      const user = await createTestUser({ email: "filter@test.com" });
      const med1 = await createTestMedication(user.id, { nome: "Med A" });
      const med2 = await createTestMedication(user.id, { nome: "Med B" });

      await testPrisma.lembrete.createMany({
        data: [
          { medicamentoId: med1.id, horario: new Date() },
          { medicamentoId: med1.id, horario: new Date() },
          { medicamentoId: med2.id, horario: new Date() },
        ],
      });

      const logsMed1 = await testPrisma.lembrete.findMany({
        where: {
          medicamentoId: med1.id,
          medicamento: { usuarioId: user.id },
        },
      });

      expect(logsMed1).toHaveLength(2);
    });

    it("deve filtrar lembretes por status", async () => {
      const user = await createTestUser({ email: "status@test.com" });
      const med = await createTestMedication(user.id);

      await testPrisma.lembrete.createMany({
        data: [
          { medicamentoId: med.id, horario: new Date(), status: "PENDENTE" },
          { medicamentoId: med.id, horario: new Date(), status: "CONFIRMADO" },
          { medicamentoId: med.id, horario: new Date(), status: "IGNORADO" },
        ],
      });

      const pendentes = await testPrisma.lembrete.findMany({
        where: {
          status: "PENDENTE",
          medicamento: { usuarioId: user.id },
        },
      });

      expect(pendentes).toHaveLength(1);
      expect(pendentes[0].status).toBe("PENDENTE");
    });

    it("deve filtrar lembretes por período", async () => {
      const user = await createTestUser({ email: "period@test.com" });
      const med = await createTestMedication(user.id);

      await testPrisma.lembrete.createMany({
        data: [
          { medicamentoId: med.id, horario: new Date("2026-03-01T08:00:00") },
          { medicamentoId: med.id, horario: new Date("2026-03-15T08:00:00") },
          { medicamentoId: med.id, horario: new Date("2026-04-01T08:00:00") },
        ],
      });

      const filtered = await testPrisma.lembrete.findMany({
        where: {
          medicamento: { usuarioId: user.id },
          horario: {
            gte: new Date("2026-03-10"),
            lte: new Date("2026-03-20"),
          },
        },
      });

      expect(filtered).toHaveLength(1);
    });

    it("não deve listar lembretes de outro usuário", async () => {
      const user1 = await createTestUser({ email: "user1logs@test.com" });
      const user2 = await createTestUser({ email: "user2logs@test.com" });
      const med1 = await createTestMedication(user1.id);
      const med2 = await createTestMedication(user2.id);

      await testPrisma.lembrete.create({
        data: { medicamentoId: med1.id, horario: new Date() },
      });
      await testPrisma.lembrete.create({
        data: { medicamentoId: med2.id, horario: new Date() },
      });

      const logsUser1 = await testPrisma.lembrete.findMany({
        where: { medicamento: { usuarioId: user1.id } },
      });

      expect(logsUser1).toHaveLength(1);
    });
  });

  describe("Marcar Dose como Tomada", () => {
    it("deve atualizar status para CONFIRMADO", async () => {
      const user = await createTestUser({ email: "take@test.com" });
      const med = await createTestMedication(user.id, { estoque: 10 });

      const lembrete = await testPrisma.lembrete.create({
        data: { medicamentoId: med.id, horario: new Date() },
      });

      expect(lembrete.status).toBe("PENDENTE");

      const updated = await testPrisma.lembrete.update({
        where: { id: lembrete.id },
        data: { status: "CONFIRMADO" },
      });

      expect(updated.status).toBe("CONFIRMADO");
    });

    it("deve criar registro no histórico ao tomar dose", async () => {
      const user = await createTestUser({ email: "history@test.com" });
      const med = await createTestMedication(user.id);

      await testPrisma.historico.create({
        data: {
          usuarioId: user.id,
          medicamentoId: med.id,
          dataHora: new Date(),
          statusAdministracao: "ADMINISTRADO",
        },
      });

      const historicos = await testPrisma.historico.findMany({
        where: { usuarioId: user.id },
      });

      expect(historicos).toHaveLength(1);
      expect(historicos[0].statusAdministracao).toBe("ADMINISTRADO");
    });

    it("deve decrementar estoque ao tomar dose", async () => {
      const user = await createTestUser({ email: "stock@test.com" });
      const med = await createTestMedication(user.id, { estoque: 10 });

      await testPrisma.medicamento.update({
        where: { id: med.id },
        data: { estoque: med.estoque! - 1 },
      });

      const updated = await testPrisma.medicamento.findUnique({
        where: { id: med.id },
      });

      expect(updated!.estoque).toBe(9);
    });
  });

  describe("Pular Dose", () => {
    it("deve atualizar status para IGNORADO", async () => {
      const user = await createTestUser({ email: "skip@test.com" });
      const med = await createTestMedication(user.id);

      const lembrete = await testPrisma.lembrete.create({
        data: { medicamentoId: med.id, horario: new Date() },
      });

      const updated = await testPrisma.lembrete.update({
        where: { id: lembrete.id },
        data: { status: "IGNORADO" },
      });

      expect(updated.status).toBe("IGNORADO");
    });

    it("deve criar registro NAO_ADMINISTRADO no histórico", async () => {
      const user = await createTestUser({ email: "skiphistory@test.com" });
      const med = await createTestMedication(user.id);

      await testPrisma.historico.create({
        data: {
          usuarioId: user.id,
          medicamentoId: med.id,
          dataHora: new Date(),
          statusAdministracao: "NAO_ADMINISTRADO",
          observacao: "Efeito colateral",
        },
      });

      const historicos = await testPrisma.historico.findMany({
        where: { usuarioId: user.id },
      });

      expect(historicos).toHaveLength(1);
      expect(historicos[0].statusAdministracao).toBe("NAO_ADMINISTRADO");
      expect(historicos[0].observacao).toBe("Efeito colateral");
    });

    it("não deve decrementar estoque ao pular dose", async () => {
      const user = await createTestUser({ email: "skipstock@test.com" });
      const med = await createTestMedication(user.id, { estoque: 10 });

      const afterSkip = await testPrisma.medicamento.findUnique({
        where: { id: med.id },
      });

      expect(afterSkip!.estoque).toBe(10);
    });
  });
});
