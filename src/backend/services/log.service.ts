import { prisma } from "../lib/prisma";

export class LogService {
  static async list(
    userId: number,
    filters: {
      medicamentoId?: string | null;
      status?: string | null;
      dataInicio?: string | null;
      dataFim?: string | null;
      limit?: number;
      offset?: number;
    }
  ) {
    const where: Record<string, unknown> = {
      medicamento: { usuarioId: userId },
    };

    if (filters.medicamentoId) {
      where.medicamentoId = parseInt(filters.medicamentoId);
    }
    if (filters.status) {
      where.status = filters.status;
    }
    if (filters.dataInicio || filters.dataFim) {
      where.horario = {
        ...(filters.dataInicio && { gte: new Date(filters.dataInicio) }),
        ...(filters.dataFim && { lte: new Date(filters.dataFim) }),
      };
    }

    const limit = filters.limit || 100;
    const offset = filters.offset || 0;

    const [logs, total] = await Promise.all([
      prisma.lembrete.findMany({
        where,
        include: {
          medicamento: {
            select: { id: true, nome: true, dosagem: true, cor: true },
          },
        },
        orderBy: { horario: "desc" },
        take: limit,
        skip: offset,
      }),
      prisma.lembrete.count({ where }),
    ]);

    return { data: { logs, total, limit, offset }, status: 200 };
  }

  static async markAsTaken(userId: number, lembreteId: number) {
    const lembrete = await prisma.lembrete.findUnique({
      where: { id: lembreteId },
      include: { medicamento: true },
    });

    if (!lembrete) return { error: "Lembrete não encontrado", status: 404 };
    if (lembrete.medicamento.usuarioId !== userId) return { error: "Acesso negado", status: 403 };

    const updated = await prisma.lembrete.update({
      where: { id: lembreteId },
      data: { status: "CONFIRMADO" },
    });

    await prisma.historico.create({
      data: {
        usuarioId: userId,
        medicamentoId: lembrete.medicamentoId,
        dataHora: new Date(),
        statusAdministracao: "ADMINISTRADO",
      },
    });

    if (lembrete.medicamento.estoque && lembrete.medicamento.estoque > 0) {
      await prisma.medicamento.update({
        where: { id: lembrete.medicamentoId },
        data: { estoque: lembrete.medicamento.estoque - 1 },
      });
    }

    return { data: { log: updated, message: "Dose marcada como tomada" }, status: 200 };
  }

  static async markAsSkipped(userId: number, lembreteId: number, observacao?: string) {
    const lembrete = await prisma.lembrete.findUnique({
      where: { id: lembreteId },
      include: { medicamento: true },
    });

    if (!lembrete) return { error: "Lembrete não encontrado", status: 404 };
    if (lembrete.medicamento.usuarioId !== userId) return { error: "Acesso negado", status: 403 };

    const updated = await prisma.lembrete.update({
      where: { id: lembreteId },
      data: { status: "IGNORADO" },
    });

    await prisma.historico.create({
      data: {
        usuarioId: userId,
        medicamentoId: lembrete.medicamentoId,
        dataHora: new Date(),
        statusAdministracao: "NAO_ADMINISTRADO",
        observacao: observacao || null,
      },
    });

    return { data: { log: updated, message: "Dose pulada" }, status: 200 };
  }
}
