import { prisma } from "../lib/prisma";
import { medicamentoSchema, medicamentoUpdateSchema } from "../lib/validations";
import { addHours, addDays } from "date-fns";

function generateReminders(
  medicamentoId: number,
  frequencia: string,
  dataInicio: Date,
  dataFim?: Date | null
) {
  const match = frequencia.match(/(\d+)h/);
  const hours = match ? parseInt(match[1]) : 24;
  const reminders: { medicamentoId: number; horario: Date }[] = [];
  const horizon = dataFim || addDays(new Date(), 30);
  let nextTime = new Date(dataInicio);

  while (nextTime <= horizon && reminders.length < 1000) {
    if (nextTime >= new Date(Date.now() - 24 * 60 * 60 * 1000)) {
      reminders.push({ medicamentoId, horario: new Date(nextTime) });
    }
    nextTime = addHours(nextTime, hours);
  }

  return reminders;
}

export class MedicationService {
  static async list(userId: number) {
    const medications = await prisma.medicamento.findMany({
      where: { usuarioId: userId },
      include: {
        lembretes: {
          where: { horario: { gte: new Date() } },
          orderBy: { horario: "asc" },
          take: 5,
        },
      },
      orderBy: { criadoEm: "desc" },
    });

    return { data: { medications }, status: 200 };
  }

  static async create(userId: number, body: unknown) {
    const parsed = medicamentoSchema.safeParse(body);
    if (!parsed.success) {
      return { error: "Dados inválidos", errors: parsed.error.flatten().fieldErrors, status: 400 };
    }

    const data = parsed.data;

    const medication = await prisma.medicamento.create({
      data: {
        usuarioId: userId,
        nome: data.nome,
        dosagem: data.dosagem,
        frequencia: data.frequencia,
        dataInicio: new Date(data.dataInicio),
        dataFim: data.dataFim ? new Date(data.dataFim) : null,
        estoque: data.estoque ?? null,
        cor: data.cor ?? null,
        instrucoes: data.instrucoes ?? null,
        ativo: data.ativo,
      },
    });

    const reminders = generateReminders(
      medication.id,
      medication.frequencia,
      medication.dataInicio,
      medication.dataFim
    );

    if (reminders.length > 0) {
      await prisma.lembrete.createMany({ data: reminders });
    }

    const result = await prisma.medicamento.findUnique({
      where: { id: medication.id },
      include: { lembretes: { orderBy: { horario: "asc" }, take: 5 } },
    });

    return { data: { medication: result }, status: 201 };
  }

  static async update(userId: number, medicamentoId: number, body: unknown) {
    const existing = await prisma.medicamento.findUnique({
      where: { id: medicamentoId },
    });

    if (!existing) return { error: "Medicamento não encontrado", status: 404 };
    if (existing.usuarioId !== userId) return { error: "Acesso negado", status: 403 };

    const parsed = medicamentoUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return { error: "Dados inválidos", errors: parsed.error.flatten().fieldErrors, status: 400 };
    }

    const data = parsed.data;

    const updated = await prisma.medicamento.update({
      where: { id: medicamentoId },
      data: {
        ...(data.nome !== undefined && { nome: data.nome }),
        ...(data.dosagem !== undefined && { dosagem: data.dosagem }),
        ...(data.frequencia !== undefined && { frequencia: data.frequencia }),
        ...(data.dataInicio !== undefined && { dataInicio: new Date(data.dataInicio) }),
        ...(data.dataFim !== undefined && { dataFim: data.dataFim ? new Date(data.dataFim) : null }),
        ...(data.estoque !== undefined && { estoque: data.estoque }),
        ...(data.cor !== undefined && { cor: data.cor }),
        ...(data.instrucoes !== undefined && { instrucoes: data.instrucoes }),
        ...(data.ativo !== undefined && { ativo: data.ativo }),
      },
    });

    if (data.frequencia || data.dataInicio || data.dataFim) {
      await prisma.lembrete.deleteMany({
        where: { medicamentoId, status: "PENDENTE", horario: { gte: new Date() } },
      });

      const reminders = generateReminders(medicamentoId, updated.frequencia, updated.dataInicio, updated.dataFim);
      if (reminders.length > 0) {
        await prisma.lembrete.createMany({ data: reminders });
      }
    }

    const result = await prisma.medicamento.findUnique({
      where: { id: medicamentoId },
      include: { lembretes: { orderBy: { horario: "asc" }, take: 5 } },
    });

    return { data: { medication: result }, status: 200 };
  }

  static async delete(userId: number, medicamentoId: number) {
    const existing = await prisma.medicamento.findUnique({
      where: { id: medicamentoId },
    });

    if (!existing) return { error: "Medicamento não encontrado", status: 404 };
    if (existing.usuarioId !== userId) return { error: "Acesso negado", status: 403 };

    await prisma.medicamento.delete({ where: { id: medicamentoId } });

    return { data: { message: "Medicamento excluído com sucesso" }, status: 200 };
  }

  static async toggle(userId: number, medicamentoId: number) {
    const existing = await prisma.medicamento.findUnique({
      where: { id: medicamentoId },
    });

    if (!existing) return { error: "Medicamento não encontrado", status: 404 };
    if (existing.usuarioId !== userId) return { error: "Acesso negado", status: 403 };

    const updated = await prisma.medicamento.update({
      where: { id: medicamentoId },
      data: { ativo: !existing.ativo },
    });

    return {
      data: {
        medication: updated,
        message: updated.ativo ? "Medicamento ativado" : "Medicamento pausado",
      },
      status: 200,
    };
  }
}
