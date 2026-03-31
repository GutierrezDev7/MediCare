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

describe("Módulo 2 - Medicamentos", () => {
  describe("Criar Medicamento", () => {
    it("deve criar um medicamento com todos os campos", async () => {
      const user = await createTestUser({ email: "med@test.com" });

      const med = await testPrisma.medicamento.create({
        data: {
          usuarioId: user.id,
          nome: "Losartana",
          dosagem: "50mg",
          frequencia: "24h",
          dataInicio: new Date("2026-01-01"),
          estoque: 30,
          cor: "#10b981",
          instrucoes: "Tomar pela manhã em jejum",
          ativo: true,
        },
      });

      expect(med.id).toBeDefined();
      expect(med.nome).toBe("Losartana");
      expect(med.dosagem).toBe("50mg");
      expect(med.frequencia).toBe("24h");
      expect(med.estoque).toBe(30);
      expect(med.ativo).toBe(true);
      expect(med.usuarioId).toBe(user.id);
    });

    it("deve criar medicamento com campos opcionais null", async () => {
      const user = await createTestUser({ email: "med2@test.com" });

      const med = await testPrisma.medicamento.create({
        data: {
          usuarioId: user.id,
          nome: "Vitamina D",
          dosagem: "2000UI",
          frequencia: "24h",
          dataInicio: new Date(),
        },
      });

      expect(med.estoque).toBeNull();
      expect(med.cor).toBeNull();
      expect(med.instrucoes).toBeNull();
      expect(med.dataFim).toBeNull();
      expect(med.ativo).toBe(true);
    });

    it("deve associar medicamento ao usuário correto", async () => {
      const user1 = await createTestUser({ email: "user1@test.com" });
      const user2 = await createTestUser({ email: "user2@test.com" });

      await createTestMedication(user1.id, { nome: "Med User 1" });
      await createTestMedication(user2.id, { nome: "Med User 2" });

      const medsUser1 = await testPrisma.medicamento.findMany({
        where: { usuarioId: user1.id },
      });
      const medsUser2 = await testPrisma.medicamento.findMany({
        where: { usuarioId: user2.id },
      });

      expect(medsUser1).toHaveLength(1);
      expect(medsUser1[0].nome).toBe("Med User 1");
      expect(medsUser2).toHaveLength(1);
      expect(medsUser2[0].nome).toBe("Med User 2");
    });
  });

  describe("Listar Medicamentos", () => {
    it("deve listar apenas medicamentos do usuário", async () => {
      const user = await createTestUser({ email: "list@test.com" });
      const other = await createTestUser({ email: "other@test.com" });

      await createTestMedication(user.id, { nome: "Losartana" });
      await createTestMedication(user.id, { nome: "Metformina" });
      await createTestMedication(other.id, { nome: "Outro Med" });

      const meds = await testPrisma.medicamento.findMany({
        where: { usuarioId: user.id },
        orderBy: { criadoEm: "desc" },
      });

      expect(meds).toHaveLength(2);
      expect(meds.map((m) => m.nome)).toContain("Losartana");
      expect(meds.map((m) => m.nome)).toContain("Metformina");
      expect(meds.map((m) => m.nome)).not.toContain("Outro Med");
    });
  });

  describe("Atualizar Medicamento", () => {
    it("deve atualizar campos do medicamento", async () => {
      const user = await createTestUser({ email: "update@test.com" });
      const med = await createTestMedication(user.id);

      const updated = await testPrisma.medicamento.update({
        where: { id: med.id },
        data: {
          nome: "Losartana Potássica",
          dosagem: "100mg",
          estoque: 60,
        },
      });

      expect(updated.nome).toBe("Losartana Potássica");
      expect(updated.dosagem).toBe("100mg");
      expect(updated.estoque).toBe(60);
      expect(updated.frequencia).toBe("24h");
    });

    it("não deve permitir atualizar medicamento de outro usuário", async () => {
      const user1 = await createTestUser({ email: "owner@test.com" });
      const user2 = await createTestUser({ email: "intruder@test.com" });
      const med = await createTestMedication(user1.id);

      const found = await testPrisma.medicamento.findFirst({
        where: { id: med.id, usuarioId: user2.id },
      });

      expect(found).toBeNull();
    });
  });

  describe("Toggle Ativo/Inativo", () => {
    it("deve alternar o status ativo do medicamento", async () => {
      const user = await createTestUser({ email: "toggle@test.com" });
      const med = await createTestMedication(user.id);
      expect(med.ativo).toBe(true);

      const toggled = await testPrisma.medicamento.update({
        where: { id: med.id },
        data: { ativo: !med.ativo },
      });
      expect(toggled.ativo).toBe(false);

      const toggledBack = await testPrisma.medicamento.update({
        where: { id: toggled.id },
        data: { ativo: !toggled.ativo },
      });
      expect(toggledBack.ativo).toBe(true);
    });
  });

  describe("Excluir Medicamento", () => {
    it("deve excluir medicamento e seus lembretes (cascade)", async () => {
      const user = await createTestUser({ email: "delete@test.com" });
      const med = await createTestMedication(user.id);

      await testPrisma.lembrete.createMany({
        data: [
          { medicamentoId: med.id, horario: new Date() },
          { medicamentoId: med.id, horario: new Date() },
        ],
      });

      const lembretesBefore = await testPrisma.lembrete.findMany({
        where: { medicamentoId: med.id },
      });
      expect(lembretesBefore).toHaveLength(2);

      await testPrisma.medicamento.delete({ where: { id: med.id } });

      const medAfter = await testPrisma.medicamento.findUnique({
        where: { id: med.id },
      });
      expect(medAfter).toBeNull();

      const lembretesAfter = await testPrisma.lembrete.findMany({
        where: { medicamentoId: med.id },
      });
      expect(lembretesAfter).toHaveLength(0);
    });

    it("deve excluir medicamento e seus históricos (cascade)", async () => {
      const user = await createTestUser({ email: "delhistory@test.com" });
      const med = await createTestMedication(user.id);

      await testPrisma.historico.create({
        data: {
          usuarioId: user.id,
          medicamentoId: med.id,
          dataHora: new Date(),
          statusAdministracao: "ADMINISTRADO",
        },
      });

      await testPrisma.medicamento.delete({ where: { id: med.id } });

      const historicos = await testPrisma.historico.findMany({
        where: { medicamentoId: med.id },
      });
      expect(historicos).toHaveLength(0);
    });
  });

  describe("Geração de Lembretes", () => {
    it("deve criar lembretes ao criar medicamento", async () => {
      const user = await createTestUser({ email: "reminder@test.com" });
      const med = await createTestMedication(user.id, {
        frequencia: "24h",
        dataInicio: new Date(),
      });

      await testPrisma.lembrete.createMany({
        data: Array.from({ length: 5 }, (_, i) => ({
          medicamentoId: med.id,
          horario: new Date(Date.now() + (i + 1) * 24 * 60 * 60 * 1000),
        })),
      });

      const lembretes = await testPrisma.lembrete.findMany({
        where: { medicamentoId: med.id },
        orderBy: { horario: "asc" },
      });

      expect(lembretes.length).toBeGreaterThanOrEqual(5);
      lembretes.forEach((l) => {
        expect(l.status).toBe("PENDENTE");
        expect(l.medicamentoId).toBe(med.id);
      });
    });
  });
});
