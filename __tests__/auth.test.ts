import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import {
  testPrisma,
  cleanDatabase,
  createTestUser,
  generateTestToken,
} from "./helpers";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "medicare-jwt-secret-key-test-2026"
);

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

describe("Módulo 1 - Autenticação", () => {
  describe("Registro de Usuário", () => {
    it("deve criar um usuário com senha hasheada", async () => {
      const senha = "minhasenha123";
      const hashedPassword = await bcrypt.hash(senha, 12);

      const user = await testPrisma.usuario.create({
        data: {
          nome: "Maria Silva",
          email: "maria@test.com",
          senha: hashedPassword,
          tipoPerfil: "PACIENTE",
        },
      });

      expect(user.id).toBeDefined();
      expect(user.nome).toBe("Maria Silva");
      expect(user.email).toBe("maria@test.com");
      expect(user.tipoPerfil).toBe("PACIENTE");
      expect(user.senha).not.toBe(senha);

      const isValid = await bcrypt.compare(senha, user.senha);
      expect(isValid).toBe(true);
    });

    it("deve rejeitar email duplicado", async () => {
      await createTestUser({ email: "duplicado@test.com" });

      await expect(
        createTestUser({ email: "duplicado@test.com" })
      ).rejects.toThrow();
    });

    it("deve criar usuário com perfil CUIDADOR", async () => {
      const user = await createTestUser({
        nome: "Cuidador Teste",
        email: "cuidador@test.com",
        tipoPerfil: "CUIDADOR",
      });

      expect(user.tipoPerfil).toBe("CUIDADOR");
    });

    it("deve definir PACIENTE como perfil padrão", async () => {
      const hashedPassword = await bcrypt.hash("senha123", 10);
      const user = await testPrisma.usuario.create({
        data: {
          nome: "Paciente Padrão",
          email: "padrao@test.com",
          senha: hashedPassword,
        },
      });

      expect(user.tipoPerfil).toBe("PACIENTE");
    });

    it("deve armazenar campos opcionais corretamente", async () => {
      const hashedPassword = await bcrypt.hash("senha123", 10);
      const user = await testPrisma.usuario.create({
        data: {
          nome: "Completo",
          email: "completo@test.com",
          senha: hashedPassword,
          telefone: "11999999999",
          dataNascimento: new Date("1990-05-15"),
          tipoPerfil: "PACIENTE",
        },
      });

      expect(user.telefone).toBe("11999999999");
      expect(user.dataNascimento).toEqual(new Date("1990-05-15"));
    });
  });

  describe("Login (JWT)", () => {
    it("deve gerar um token JWT válido", async () => {
      const user = await createTestUser({ email: "jwt@test.com" });
      const token = await generateTestToken(user);

      expect(token).toBeDefined();
      expect(typeof token).toBe("string");

      const { payload } = await jwtVerify(token, JWT_SECRET);
      expect(payload.userId).toBe(user.id);
      expect(payload.email).toBe("jwt@test.com");
      expect(payload.tipoPerfil).toBe("PACIENTE");
    });

    it("deve verificar senha correta no login", async () => {
      const senha = "senhaCorreta123";
      const user = await createTestUser({
        email: "login@test.com",
        senha,
      });

      const isValid = await bcrypt.compare(senha, user.senha);
      expect(isValid).toBe(true);
    });

    it("deve rejeitar senha incorreta", async () => {
      const user = await createTestUser({
        email: "loginfalho@test.com",
        senha: "senhaCorreta123",
      });

      const isValid = await bcrypt.compare("senhaErrada", user.senha);
      expect(isValid).toBe(false);
    });

    it("deve rejeitar token com secret errado", async () => {
      const wrongSecret = new TextEncoder().encode("wrong-secret");
      const token = await new SignJWT({ userId: 1 })
        .setProtectedHeader({ alg: "HS256" })
        .setExpirationTime("1h")
        .sign(wrongSecret);

      await expect(jwtVerify(token, JWT_SECRET)).rejects.toThrow();
    });

    it("deve rejeitar token expirado", async () => {
      const token = await new SignJWT({ userId: 1 })
        .setProtectedHeader({ alg: "HS256" })
        .setExpirationTime("0s")
        .sign(JWT_SECRET);

      await new Promise((r) => setTimeout(r, 1100));

      await expect(jwtVerify(token, JWT_SECRET)).rejects.toThrow();
    });
  });

  describe("Buscar Usuário (me)", () => {
    it("deve encontrar usuário por ID", async () => {
      const user = await createTestUser({ email: "me@test.com" });

      const found = await testPrisma.usuario.findUnique({
        where: { id: user.id },
        select: {
          id: true,
          nome: true,
          email: true,
          tipoPerfil: true,
          telefone: true,
          dataNascimento: true,
          criadoEm: true,
        },
      });

      expect(found).not.toBeNull();
      expect(found!.email).toBe("me@test.com");
      expect(found).not.toHaveProperty("senha");
    });

    it("deve retornar null para ID inexistente", async () => {
      const found = await testPrisma.usuario.findUnique({
        where: { id: 99999 },
      });

      expect(found).toBeNull();
    });
  });
});
