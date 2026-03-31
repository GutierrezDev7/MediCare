import { z } from "zod";

export const registerSchema = z.object({
  nome: z.string().min(2, "Nome deve ter pelo menos 2 caracteres").max(100),
  email: z.string().email("Email inválido").max(100),
  senha: z.string().min(6, "Senha deve ter pelo menos 6 caracteres").max(100),
  telefone: z.string().max(15).optional().nullable(),
  dataNascimento: z.string().optional().nullable(),
  tipoPerfil: z.enum(["PACIENTE", "CUIDADOR"]).default("PACIENTE"),
});

export const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  senha: z.string().min(1, "Senha é obrigatória"),
});

export const medicamentoSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório").max(100),
  dosagem: z.string().min(1, "Dosagem é obrigatória").max(50),
  frequencia: z.string().min(1, "Frequência é obrigatória").max(20),
  dataInicio: z.string().min(1, "Data de início é obrigatória"),
  dataFim: z.string().optional().nullable(),
  estoque: z.number().int().min(0).optional().nullable(),
  cor: z.string().max(20).optional().nullable(),
  instrucoes: z.string().max(255).optional().nullable(),
  ativo: z.boolean().default(true),
});

export const medicamentoUpdateSchema = medicamentoSchema.partial();

export const logFilterSchema = z.object({
  medicamentoId: z.coerce.number().int().optional(),
  status: z
    .enum(["PENDENTE", "ENVIADO", "CONFIRMADO", "IGNORADO"])
    .optional(),
  dataInicio: z.string().optional(),
  dataFim: z.string().optional(),
});

export const cuidadorSchema = z.object({
  pacienteEmail: z.string().email("Email do paciente inválido"),
  relacionamento: z.string().max(50).optional(),
});

export const reportFilterSchema = z.object({
  periodoInicio: z.string().optional(),
  periodoFim: z.string().optional(),
});
