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

describe("Módulo 4 - Cuidadores", () => {
  describe("Vincular Cuidador", () => {
    it("deve vincular um cuidador a um paciente", async () => {
      const paciente = await createTestUser({
        email: "paciente@test.com",
        tipoPerfil: "PACIENTE",
      });
      const cuidador = await createTestUser({
        email: "cuidador@test.com",
        tipoPerfil: "CUIDADOR",
      });

      const vinculo = await testPrisma.cuidadorPaciente.create({
        data: {
          pacienteId: paciente.id,
          cuidadorId: cuidador.id,
          relacionamento: "Filho(a)",
        },
      });

      expect(vinculo.id).toBeDefined();
      expect(vinculo.pacienteId).toBe(paciente.id);
      expect(vinculo.cuidadorId).toBe(cuidador.id);
      expect(vinculo.relacionamento).toBe("Filho(a)");
    });

    it("deve rejeitar vínculo duplicado", async () => {
      const paciente = await createTestUser({ email: "pac1@test.com" });
      const cuidador = await createTestUser({ email: "cuid1@test.com" });

      await testPrisma.cuidadorPaciente.create({
        data: { pacienteId: paciente.id, cuidadorId: cuidador.id },
      });

      await expect(
        testPrisma.cuidadorPaciente.create({
          data: { pacienteId: paciente.id, cuidadorId: cuidador.id },
        })
      ).rejects.toThrow();
    });

    it("deve permitir múltiplos cuidadores para um paciente", async () => {
      const paciente = await createTestUser({ email: "pac2@test.com" });
      const cuidador1 = await createTestUser({ email: "cuid2@test.com" });
      const cuidador2 = await createTestUser({ email: "cuid3@test.com" });

      await testPrisma.cuidadorPaciente.create({
        data: {
          pacienteId: paciente.id,
          cuidadorId: cuidador1.id,
          relacionamento: "Filho(a)",
        },
      });
      await testPrisma.cuidadorPaciente.create({
        data: {
          pacienteId: paciente.id,
          cuidadorId: cuidador2.id,
          relacionamento: "Enfermeiro(a)",
        },
      });

      const vinculos = await testPrisma.cuidadorPaciente.findMany({
        where: { pacienteId: paciente.id },
      });

      expect(vinculos).toHaveLength(2);
    });

    it("deve permitir um cuidador cuidar de múltiplos pacientes", async () => {
      const pac1 = await createTestUser({ email: "pac3@test.com" });
      const pac2 = await createTestUser({ email: "pac4@test.com" });
      const cuidador = await createTestUser({ email: "cuid4@test.com" });

      await testPrisma.cuidadorPaciente.create({
        data: { pacienteId: pac1.id, cuidadorId: cuidador.id },
      });
      await testPrisma.cuidadorPaciente.create({
        data: { pacienteId: pac2.id, cuidadorId: cuidador.id },
      });

      const pacientes = await testPrisma.cuidadorPaciente.findMany({
        where: { cuidadorId: cuidador.id },
        include: { paciente: { select: { nome: true, email: true } } },
      });

      expect(pacientes).toHaveLength(2);
    });
  });

  describe("Listar Cuidadores do Paciente", () => {
    it("deve listar cuidadores vinculados ao paciente", async () => {
      const paciente = await createTestUser({ email: "paclist@test.com" });
      const cuidador = await createTestUser({
        email: "cuidlist@test.com",
        nome: "Dr. João",
      });

      await testPrisma.cuidadorPaciente.create({
        data: {
          pacienteId: paciente.id,
          cuidadorId: cuidador.id,
          relacionamento: "Médico",
        },
      });

      const caregivers = await testPrisma.cuidadorPaciente.findMany({
        where: { pacienteId: paciente.id },
        include: {
          cuidador: { select: { id: true, nome: true, email: true } },
        },
      });

      expect(caregivers).toHaveLength(1);
      expect(caregivers[0].cuidador.nome).toBe("Dr. João");
    });
  });

  describe("Listar Pacientes do Cuidador", () => {
    it("deve listar pacientes do cuidador", async () => {
      const pac = await createTestUser({
        email: "pacview@test.com",
        nome: "Maria",
      });
      const cuid = await createTestUser({ email: "cuidview@test.com" });

      await testPrisma.cuidadorPaciente.create({
        data: { pacienteId: pac.id, cuidadorId: cuid.id },
      });

      const patients = await testPrisma.cuidadorPaciente.findMany({
        where: { cuidadorId: cuid.id },
        include: {
          paciente: { select: { id: true, nome: true, email: true } },
        },
      });

      expect(patients).toHaveLength(1);
      expect(patients[0].paciente.nome).toBe("Maria");
    });
  });

  describe("Ver Medicamentos do Paciente", () => {
    it("cuidador deve ver medicamentos do paciente vinculado", async () => {
      const pac = await createTestUser({ email: "pacmeds@test.com" });
      const cuid = await createTestUser({ email: "cuidmeds@test.com" });

      await testPrisma.cuidadorPaciente.create({
        data: { pacienteId: pac.id, cuidadorId: cuid.id },
      });

      await createTestMedication(pac.id, { nome: "Losartana" });
      await createTestMedication(pac.id, { nome: "Metformina" });

      const vinculo = await testPrisma.cuidadorPaciente.findUnique({
        where: {
          pacienteId_cuidadorId: {
            pacienteId: pac.id,
            cuidadorId: cuid.id,
          },
        },
      });

      expect(vinculo).not.toBeNull();

      const meds = await testPrisma.medicamento.findMany({
        where: { usuarioId: pac.id },
      });

      expect(meds).toHaveLength(2);
    });

    it("cuidador não vinculado não deve ter acesso", async () => {
      const pac = await createTestUser({ email: "pacnoaccess@test.com" });
      const cuid = await createTestUser({ email: "cuidnoaccess@test.com" });

      const vinculo = await testPrisma.cuidadorPaciente.findUnique({
        where: {
          pacienteId_cuidadorId: {
            pacienteId: pac.id,
            cuidadorId: cuid.id,
          },
        },
      });

      expect(vinculo).toBeNull();
    });
  });

  describe("Remover Vínculo", () => {
    it("deve remover vínculo entre cuidador e paciente", async () => {
      const pac = await createTestUser({ email: "pacdel@test.com" });
      const cuid = await createTestUser({ email: "cuiddel@test.com" });

      const vinculo = await testPrisma.cuidadorPaciente.create({
        data: { pacienteId: pac.id, cuidadorId: cuid.id },
      });

      await testPrisma.cuidadorPaciente.delete({
        where: { id: vinculo.id },
      });

      const found = await testPrisma.cuidadorPaciente.findUnique({
        where: { id: vinculo.id },
      });

      expect(found).toBeNull();
    });

    it("deve manter cascade ao deletar usuário", async () => {
      const pac = await createTestUser({ email: "paccascade@test.com" });
      const cuid = await createTestUser({ email: "cuidcascade@test.com" });

      await testPrisma.cuidadorPaciente.create({
        data: { pacienteId: pac.id, cuidadorId: cuid.id },
      });

      await testPrisma.usuario.delete({ where: { id: pac.id } });

      const vinculos = await testPrisma.cuidadorPaciente.findMany({
        where: { cuidadorId: cuid.id },
      });

      expect(vinculos).toHaveLength(0);
    });
  });
});
