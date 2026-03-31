-- CreateEnum
CREATE TYPE "TipoPerfil" AS ENUM ('PACIENTE', 'CUIDADOR');

-- CreateEnum
CREATE TYPE "StatusLembrete" AS ENUM ('PENDENTE', 'ENVIADO', 'CONFIRMADO', 'IGNORADO');

-- CreateEnum
CREATE TYPE "StatusAdministracao" AS ENUM ('ADMINISTRADO', 'NAO_ADMINISTRADO', 'ADIADO', 'CANCELADO');

-- CreateTable
CREATE TABLE "usuarios" (
    "id" SERIAL NOT NULL,
    "nome" VARCHAR(100) NOT NULL,
    "email" VARCHAR(100) NOT NULL,
    "senha" VARCHAR(255) NOT NULL,
    "telefone" VARCHAR(15),
    "data_nascimento" DATE,
    "tipo_perfil" "TipoPerfil" NOT NULL DEFAULT 'PACIENTE',
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cuidadores_pacientes" (
    "id" SERIAL NOT NULL,
    "paciente_id" INTEGER NOT NULL,
    "cuidador_id" INTEGER NOT NULL,
    "relacionamento" VARCHAR(50),
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cuidadores_pacientes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "medicamentos" (
    "id" SERIAL NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "nome" VARCHAR(100) NOT NULL,
    "dosagem" VARCHAR(50) NOT NULL,
    "frequencia" VARCHAR(20) NOT NULL,
    "data_inicio" DATE NOT NULL,
    "data_fim" DATE,
    "estoque" INTEGER,
    "cor" VARCHAR(20),
    "instrucoes" VARCHAR(255),
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "medicamentos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lembretes" (
    "id" SERIAL NOT NULL,
    "medicamento_id" INTEGER NOT NULL,
    "horario" TIMESTAMP(3) NOT NULL,
    "status" "StatusLembrete" NOT NULL DEFAULT 'PENDENTE',
    "mensagem" VARCHAR(255),
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lembretes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "historicos" (
    "id" SERIAL NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "medicamento_id" INTEGER NOT NULL,
    "data_hora" TIMESTAMP(3) NOT NULL,
    "status_administracao" "StatusAdministracao" NOT NULL,
    "observacao" TEXT,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "historicos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "relatorios" (
    "id" SERIAL NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "periodo_inicio" DATE NOT NULL,
    "periodo_fim" DATE NOT NULL,
    "aderencia" DECIMAL(5,2) NOT NULL,
    "dados_gerais" TEXT,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "relatorios_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "cuidadores_pacientes_paciente_id_cuidador_id_key" ON "cuidadores_pacientes"("paciente_id", "cuidador_id");

-- AddForeignKey
ALTER TABLE "cuidadores_pacientes" ADD CONSTRAINT "cuidadores_pacientes_paciente_id_fkey" FOREIGN KEY ("paciente_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cuidadores_pacientes" ADD CONSTRAINT "cuidadores_pacientes_cuidador_id_fkey" FOREIGN KEY ("cuidador_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medicamentos" ADD CONSTRAINT "medicamentos_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lembretes" ADD CONSTRAINT "lembretes_medicamento_id_fkey" FOREIGN KEY ("medicamento_id") REFERENCES "medicamentos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historicos" ADD CONSTRAINT "historicos_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historicos" ADD CONSTRAINT "historicos_medicamento_id_fkey" FOREIGN KEY ("medicamento_id") REFERENCES "medicamentos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "relatorios" ADD CONSTRAINT "relatorios_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;
