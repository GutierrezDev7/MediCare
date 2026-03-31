# MediCare - Gestão Inteligente de Medicamentos

Sistema web para gerenciamento de medicamentos com lembretes inteligentes, acompanhamento de aderência e monitoramento por cuidadores.

## Stack Tecnológica

- **Frontend:** Next.js 16, React 19, Tailwind CSS 4, Radix UI, Framer Motion
- **Backend:** Next.js API Routes, Prisma ORM, PostgreSQL
- **Autenticação:** JWT (jose) + bcrypt, cookies httpOnly
- **Validação:** Zod
- **Testes:** Jest + ts-jest

## Pré-requisitos

- Node.js 22+
- PostgreSQL 18 rodando localmente na porta 5432

## Setup

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar banco de dados

Crie o banco PostgreSQL:

```sql
CREATE DATABASE medicare_dev;
CREATE DATABASE medicare_test;
```

### 3. Configurar variáveis de ambiente

Crie um arquivo `.env` na raiz:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/medicare_dev"
JWT_SECRET="sua-chave-secreta-aqui"
```

### 4. Rodar migrações

```bash
npx prisma migrate dev
```

### 5. Popular banco com dados de exemplo

```bash
npm run db:seed
```

Usuários criados:
- `maria@medicare.com` (Paciente) - senha: `123456`
- `joao@medicare.com` (Cuidador) - senha: `123456`
- `ana@medicare.com` (Paciente) - senha: `123456`

### 6. Iniciar o servidor

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000)

## Scripts Disponíveis

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm test` | Rodar testes |
| `npm run test:watch` | Testes em modo watch |
| `npm run db:migrate` | Rodar migrações |
| `npm run db:seed` | Popular banco com dados de exemplo |
| `npm run db:studio` | Abrir Prisma Studio |
| `npm run db:reset` | Resetar banco e re-rodar migrações |

## API Endpoints

### Autenticação
- `POST /api/auth/register` - Cadastro
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Dados do usuário autenticado
- `POST /api/auth/logout` - Logout

### Medicamentos
- `GET /api/medications` - Listar medicamentos
- `POST /api/medications` - Criar medicamento
- `PUT /api/medications/:id` - Atualizar medicamento
- `PATCH /api/medications/:id/toggle` - Ativar/desativar
- `DELETE /api/medications/:id` - Excluir medicamento

### Lembretes/Logs
- `GET /api/logs` - Listar lembretes (filtros: medicamentoId, status, dataInicio, dataFim)
- `PATCH /api/logs/:id/take` - Marcar dose como tomada
- `PATCH /api/logs/:id/skip` - Pular dose

### Cuidadores
- `GET /api/caregivers` - Listar cuidadores do paciente
- `POST /api/caregivers` - Vincular cuidador
- `DELETE /api/caregivers/:id` - Remover vínculo
- `GET /api/caregivers/patients` - Listar pacientes (visão do cuidador)
- `GET /api/caregivers/patients/:id/medications` - Ver medicamentos do paciente

### Relatórios
- `GET /api/reports/adherence` - Relatório de aderência
- `GET /api/reports/summary` - Resumo para dashboard

## Testes

```bash
npm test
```

Os testes rodam contra o banco `medicare_test`. Configure em `.env.test`:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/medicare_test"
JWT_SECRET="medicare-jwt-secret-key-test-2026"
```

## Estrutura do Projeto

```
src/
  app/
    api/              # API Routes (backend)
      auth/           # Autenticação
      medications/    # CRUD de medicamentos
      logs/           # Lembretes e doses
      caregivers/     # Cuidadores
      reports/        # Relatórios
    login/            # Página de login
    registro/         # Página de cadastro
    ...               # Demais páginas do frontend
  components/         # Componentes React
  contexts/           # AuthContext + MedicationContext
  lib/                # Utilitários (prisma, auth, validations, api)
  types/              # Tipos TypeScript
prisma/
  schema.prisma       # Schema do banco de dados
  seed.ts             # Script de seed
  migrations/         # Migrações SQL
__tests__/            # Testes automatizados
```


maria@medicare.com / 123456 (Paciente - 5 medicamentos)
joao@medicare.com / 123456 (Cuidador)
ana@medicare.com / 123456 (Paciente - 1 medicamento)