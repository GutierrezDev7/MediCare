import bcrypt from "bcryptjs";
import {
  testPrisma,
  cleanDatabase,
  createTestUser,
} from "./helpers";
import { AuthService } from "@/backend/services/auth.service";
import { CaregiverService } from "@/backend/services/caregiver.service";

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

describe("Módulo 5 - Configurações", () => {
  describe("Atualizar Perfil", () => {
    it("deve atualizar nome, telefone e data de nascimento", async () => {
      const user = await createTestUser({ email: "profile@test.com" });

      const result = await AuthService.updateProfile(user.id, {
        nome: "Nome Atualizado",
        telefone: "11999998888",
        dataNascimento: "1990-01-15",
      });

      expect(result.error).toBeUndefined();
      expect(result.data?.user.nome).toBe("Nome Atualizado");
      expect(result.data?.user.telefone).toBe("11999998888");
    });

    it("deve rejeitar nome muito curto", async () => {
      const user = await createTestUser({ email: "profile2@test.com" });

      const result = await AuthService.updateProfile(user.id, {
        nome: "A",
        telefone: null,
        dataNascimento: null,
      });

      expect(result.error).toBe("Dados inválidos");
      expect(result.status).toBe(400);
    });
  });

  describe("Alterar Senha", () => {
    it("deve alterar senha com credenciais corretas", async () => {
      const senha = await bcrypt.hash("123456", 12);
      const user = await testPrisma.usuario.create({
        data: {
          nome: "Test User",
          email: "pass@test.com",
          senha,
          tipoPerfil: "PACIENTE",
        },
      });

      const result = await AuthService.changePassword(user.id, {
        senhaAtual: "123456",
        novaSenha: "654321",
        confirmarSenha: "654321",
      });

      expect(result.error).toBeUndefined();
      expect(result.data?.message).toBe("Senha alterada com sucesso");

      const updated = await testPrisma.usuario.findUnique({ where: { id: user.id } });
      const valid = await bcrypt.compare("654321", updated!.senha);
      expect(valid).toBe(true);
    });

    it("deve rejeitar senha atual incorreta", async () => {
      const user = await createTestUser({ email: "pass2@test.com" });

      const result = await AuthService.changePassword(user.id, {
        senhaAtual: "wrong",
        novaSenha: "654321",
        confirmarSenha: "654321",
      });

      expect(result.error).toBe("Senha atual incorreta");
      expect(result.status).toBe(400);
    });
  });

  describe("Exportar Dados", () => {
    it("deve exportar dados do usuário", async () => {
      const user = await createTestUser({ email: "export@test.com" });

      const result = await AuthService.exportUserData(user.id);

      expect(result.error).toBeUndefined();
      expect(result.data?.usuario.email).toBe("export@test.com");
      expect(result.data?.exportadoEm).toBeDefined();
    });
  });

  describe("Excluir Conta", () => {
    it("deve excluir conta com senha correta", async () => {
      const senha = await bcrypt.hash("123456", 12);
      const user = await testPrisma.usuario.create({
        data: {
          nome: "Delete User",
          email: "delete@test.com",
          senha,
          tipoPerfil: "PACIENTE",
        },
      });

      const result = await AuthService.deleteAccount(user.id, "123456");

      expect(result.error).toBeUndefined();
      const found = await testPrisma.usuario.findUnique({ where: { id: user.id } });
      expect(found).toBeNull();
    });
  });

  describe("Convidar Cuidador (Paciente)", () => {
    it("paciente deve convidar cuidador por email", async () => {
      const paciente = await createTestUser({
        email: "pac-invite@test.com",
        tipoPerfil: "PACIENTE",
      });
      const cuidador = await createTestUser({
        email: "cuid-invite@test.com",
        tipoPerfil: "CUIDADOR",
      });

      const result = await CaregiverService.inviteCaregiverByPatient(paciente.id, {
        cuidadorEmail: cuidador.email,
        relacionamento: "Filho",
      });

      expect(result.error).toBeUndefined();
      expect(result.status).toBe(201);

      const vinculo = await testPrisma.cuidadorPaciente.findUnique({
        where: {
          pacienteId_cuidadorId: { pacienteId: paciente.id, cuidadorId: cuidador.id },
        },
      });
      expect(vinculo).not.toBeNull();
    });

    it("deve rejeitar convite para usuário que não é cuidador", async () => {
      const paciente = await createTestUser({
        email: "pac-invite2@test.com",
        tipoPerfil: "PACIENTE",
      });
      const outroPaciente = await createTestUser({
        email: "pac-invite3@test.com",
        tipoPerfil: "PACIENTE",
      });

      const result = await CaregiverService.inviteCaregiverByPatient(paciente.id, {
        cuidadorEmail: outroPaciente.email,
        relacionamento: "Amigo",
      });

      expect(result.error).toBe("Este usuário não possui perfil de cuidador");
      expect(result.status).toBe(400);
    });
  });
});
