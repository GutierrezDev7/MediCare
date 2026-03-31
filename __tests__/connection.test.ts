import { testPrisma, cleanDatabase } from "./helpers";

beforeAll(async () => {
  await testPrisma.$connect();
});

afterAll(async () => {
  await cleanDatabase();
  await testPrisma.$disconnect();
});

describe("Módulo 0 - Conexão com Banco de Dados", () => {
  it("deve conectar ao PostgreSQL com sucesso", async () => {
    const result = await testPrisma.$queryRaw<
      { current_database: string }[]
    >`SELECT current_database()`;
    expect(result[0].current_database).toBe("medicare_test");
  });

  it("deve ter todas as tabelas criadas", async () => {
    const tables = await testPrisma.$queryRaw<{ tablename: string }[]>`
      SELECT tablename FROM pg_tables WHERE schemaname = 'public'
      ORDER BY tablename
    `;
    const tableNames = tables.map((t) => t.tablename);

    expect(tableNames).toContain("usuarios");
    expect(tableNames).toContain("medicamentos");
    expect(tableNames).toContain("lembretes");
    expect(tableNames).toContain("historicos");
    expect(tableNames).toContain("relatorios");
    expect(tableNames).toContain("cuidadores_pacientes");
  });

  it("deve criar e ler um usuário", async () => {
    const user = await testPrisma.usuario.create({
      data: {
        nome: "Teste Conexão",
        email: "conexao@test.com",
        senha: "hash_fake",
        tipoPerfil: "PACIENTE",
      },
    });

    expect(user.id).toBeDefined();
    expect(user.nome).toBe("Teste Conexão");

    const found = await testPrisma.usuario.findUnique({
      where: { id: user.id },
    });
    expect(found).not.toBeNull();
    expect(found!.email).toBe("conexao@test.com");
  });
});
