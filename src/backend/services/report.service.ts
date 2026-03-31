import { prisma } from "../lib/prisma";
import { subDays, startOfDay, endOfDay } from "date-fns";

export class ReportService {
  static async getAdherence(
    userId: number,
    filters: { days?: number; periodoInicio?: string | null; periodoFim?: string | null }
  ) {
    const days = filters.days || 30;
    const startDate = filters.periodoInicio ? new Date(filters.periodoInicio) : subDays(new Date(), days);
    const endDate = filters.periodoFim ? new Date(filters.periodoFim) : new Date();

    const lembretes = await prisma.lembrete.findMany({
      where: {
        medicamento: { usuarioId: userId },
        horario: { gte: startDate, lte: endDate },
      },
      include: { medicamento: { select: { id: true, nome: true, cor: true } } },
    });

    const total = lembretes.length;
    const confirmados = lembretes.filter((l) => l.status === "CONFIRMADO").length;
    const ignorados = lembretes.filter((l) => l.status === "IGNORADO").length;
    const pendentes = lembretes.filter((l) => l.status === "PENDENTE").length;
    const enviados = lembretes.filter((l) => l.status === "ENVIADO").length;
    const aderencia = total > 0 ? (confirmados / total) * 100 : 0;

    const porMedicamento: Record<
      string,
      { nome: string; cor: string | null; total: number; confirmados: number; aderencia: number }
    > = {};

    lembretes.forEach((l) => {
      const key = l.medicamento.id.toString();
      if (!porMedicamento[key]) {
        porMedicamento[key] = { nome: l.medicamento.nome, cor: l.medicamento.cor, total: 0, confirmados: 0, aderencia: 0 };
      }
      porMedicamento[key].total++;
      if (l.status === "CONFIRMADO") porMedicamento[key].confirmados++;
    });

    Object.values(porMedicamento).forEach((m) => {
      m.aderencia = m.total > 0 ? (m.confirmados / m.total) * 100 : 0;
    });

    return {
      data: {
        periodo: { inicio: startDate, fim: endDate },
        resumo: { total, confirmados, ignorados, pendentes, enviados, aderencia: Math.round(aderencia * 100) / 100 },
        porMedicamento: Object.values(porMedicamento),
      },
      status: 200,
    };
  }

  static async getSummary(userId: number) {
    const today = new Date();
    const todayStart = startOfDay(today);
    const todayEnd = endOfDay(today);
    const weekAgo = subDays(today, 7);

    const [
      totalMedicamentos, medicamentosAtivos,
      lembretesHoje, confirmadosHoje,
      lembretesSemana, confirmadosSemana,
      estoquesBaixos, historicoRecente,
    ] = await Promise.all([
      prisma.medicamento.count({ where: { usuarioId: userId } }),
      prisma.medicamento.count({ where: { usuarioId: userId, ativo: true } }),
      prisma.lembrete.count({ where: { medicamento: { usuarioId: userId }, horario: { gte: todayStart, lte: todayEnd } } }),
      prisma.lembrete.count({ where: { medicamento: { usuarioId: userId }, horario: { gte: todayStart, lte: todayEnd }, status: "CONFIRMADO" } }),
      prisma.lembrete.count({ where: { medicamento: { usuarioId: userId }, horario: { gte: weekAgo, lte: todayEnd } } }),
      prisma.lembrete.count({ where: { medicamento: { usuarioId: userId }, horario: { gte: weekAgo, lte: todayEnd }, status: "CONFIRMADO" } }),
      prisma.medicamento.findMany({ where: { usuarioId: userId, ativo: true, estoque: { not: null, lte: 10 } }, select: { id: true, nome: true, estoque: true, cor: true } }),
      prisma.historico.findMany({ where: { usuarioId: userId }, include: { medicamento: { select: { nome: true, cor: true } } }, orderBy: { dataHora: "desc" }, take: 10 }),
    ]);

    const aderenciaHoje = lembretesHoje > 0 ? (confirmadosHoje / lembretesHoje) * 100 : 0;
    const aderenciaSemana = lembretesSemana > 0 ? (confirmadosSemana / lembretesSemana) * 100 : 0;

    const proximasDoses = await prisma.lembrete.findMany({
      where: { medicamento: { usuarioId: userId, ativo: true }, horario: { gte: new Date() }, status: "PENDENTE" },
      include: { medicamento: { select: { id: true, nome: true, dosagem: true, cor: true } } },
      orderBy: { horario: "asc" },
      take: 10,
    });

    return {
      data: {
        medicamentos: { total: totalMedicamentos, ativos: medicamentosAtivos },
        aderencia: {
          hoje: Math.round(aderenciaHoje * 100) / 100,
          semana: Math.round(aderenciaSemana * 100) / 100,
          dosesHoje: { total: lembretesHoje, confirmadas: confirmadosHoje },
          dosesSemana: { total: lembretesSemana, confirmadas: confirmadosSemana },
        },
        estoquesBaixos,
        proximasDoses,
        historicoRecente,
      },
      status: 200,
    };
  }
}
