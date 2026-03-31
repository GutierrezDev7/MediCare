import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import {
  subDays,
  addDays,
  setHours,
  setMinutes,
  addHours,
  startOfDay,
  isBefore,
  isAfter,
} from "date-fns";

const prisma = new PrismaClient();

async function main() {
  console.log("Limpando banco de dados...");
  await prisma.historico.deleteMany();
  await prisma.lembrete.deleteMany();
  await prisma.relatorio.deleteMany();
  await prisma.medicamento.deleteMany();
  await prisma.cuidadorPaciente.deleteMany();
  await prisma.usuario.deleteMany();

  const senhaPadrao = await bcrypt.hash("123456", 12);
  const now = new Date();

  // ── Usuários ──────────────────────────────────────────────
  console.log("Criando usuários...");

  const maria = await prisma.usuario.create({
    data: {
      nome: "Maria Silva",
      email: "maria@medicare.com",
      senha: senhaPadrao,
      tipoPerfil: "PACIENTE",
      telefone: "11999999999",
      dataNascimento: new Date("1965-05-15"),
    },
  });

  const joao = await prisma.usuario.create({
    data: {
      nome: "João Silva",
      email: "joao@medicare.com",
      senha: senhaPadrao,
      tipoPerfil: "CUIDADOR",
      telefone: "11988888888",
    },
  });

  const ana = await prisma.usuario.create({
    data: {
      nome: "Ana Costa",
      email: "ana@medicare.com",
      senha: senhaPadrao,
      tipoPerfil: "PACIENTE",
      telefone: "11977777777",
      dataNascimento: new Date("1980-10-20"),
    },
  });

  // ── Vínculo cuidador ─────────────────────────────────────
  console.log("Vinculando cuidador...");
  await prisma.cuidadorPaciente.create({
    data: {
      pacienteId: maria.id,
      cuidadorId: joao.id,
      relacionamento: "Filho",
    },
  });

  // ── Medicamentos da Maria ────────────────────────────────
  console.log("Criando medicamentos para Maria...");

  const medsConfig = [
    {
      nome: "Losartana",
      dosagem: "50mg",
      frequencia: "24h",
      diasAtras: 60,
      estoque: 28,
      cor: "#10b981",
      instrucoes: "Tomar pela manhã em jejum",
      horaBase: 8,
    },
    {
      nome: "Metformina",
      dosagem: "850mg",
      frequencia: "12h",
      diasAtras: 45,
      estoque: 50,
      cor: "#0ea5e9",
      instrucoes: "Tomar após as refeições",
      horaBase: 8,
    },
    {
      nome: "Simvastatina",
      dosagem: "20mg",
      frequencia: "24h",
      diasAtras: 90,
      estoque: 15,
      cor: "#8b5cf6",
      instrucoes: "Tomar à noite",
      horaBase: 22,
    },
    {
      nome: "Vitamina D",
      dosagem: "2000UI",
      frequencia: "24h",
      diasAtras: 30,
      estoque: 60,
      cor: "#f59e0b",
      instrucoes: "Tomar com o almoço",
      horaBase: 12,
    },
    {
      nome: "Ômega 3",
      dosagem: "1000mg",
      frequencia: "12h",
      diasAtras: 15,
      estoque: 45,
      cor: "#f43f5e",
      instrucoes: null,
      horaBase: 9,
    },
  ];

  const createdMeds: { med: { id: number; frequencia: string; estoque: number | null }; config: (typeof medsConfig)[0] }[] = [];

  for (const cfg of medsConfig) {
    const med = await prisma.medicamento.create({
      data: {
        usuarioId: maria.id,
        nome: cfg.nome,
        dosagem: cfg.dosagem,
        frequencia: cfg.frequencia,
        dataInicio: subDays(now, cfg.diasAtras),
        estoque: cfg.estoque,
        cor: cfg.cor,
        instrucoes: cfg.instrucoes,
        ativo: true,
      },
    });
    createdMeds.push({ med, config: cfg });
  }

  // ── Medicamento da Ana ───────────────────────────────────
  console.log("Criando medicamentos para Ana...");
  const levoAna = await prisma.medicamento.create({
    data: {
      usuarioId: ana.id,
      nome: "Levotiroxina",
      dosagem: "75mcg",
      frequencia: "24h",
      dataInicio: subDays(now, 120),
      estoque: 20,
      cor: "#06b6d4",
      instrucoes: "Tomar em jejum, 30min antes do café",
      ativo: true,
    },
  });

  // ── Lembretes passados (últimos 30 dias) com status variados ──
  console.log("Gerando lembretes passados (últimos 30 dias)...");

  const pastReminders: {
    medicamentoId: number;
    horario: Date;
    status: "CONFIRMADO" | "IGNORADO" | "PENDENTE";
  }[] = [];

  const pastHistory: {
    usuarioId: number;
    medicamentoId: number;
    dataHora: Date;
    statusAdministracao: "ADMINISTRADO" | "NAO_ADMINISTRADO";
    observacao: string | null;
  }[] = [];

  for (const { med, config } of createdMeds) {
    const freqMatch = config.frequencia.match(/(\d+)h/);
    const intervalHours = freqMatch ? parseInt(freqMatch[1]) : 24;

    for (let day = 1; day <= 30; day++) {
      const baseDate = startOfDay(subDays(now, day));
      let time = setMinutes(setHours(baseDate, config.horaBase), 0);
      const dayEnd = addDays(baseDate, 1);

      while (isBefore(time, dayEnd)) {
        const rand = Math.random();
        let status: "CONFIRMADO" | "IGNORADO";
        let adminStatus: "ADMINISTRADO" | "NAO_ADMINISTRADO";
        let obs: string | null = null;

        if (rand > 0.12) {
          status = "CONFIRMADO";
          adminStatus = "ADMINISTRADO";
        } else {
          status = "IGNORADO";
          adminStatus = "NAO_ADMINISTRADO";
          const reasons = [
            "Esqueci de tomar",
            "Estava fora de casa",
            "Efeito colateral",
            "Sem estoque",
            null,
          ];
          obs = reasons[Math.floor(Math.random() * reasons.length)];
        }

        pastReminders.push({ medicamentoId: med.id, horario: time, status });
        pastHistory.push({
          usuarioId: maria.id,
          medicamentoId: med.id,
          dataHora: status === "CONFIRMADO"
            ? addHours(time, Math.random() * 0.5)
            : time,
          statusAdministracao: adminStatus,
          observacao: obs,
        });

        time = addHours(time, intervalHours);
        if (intervalHours >= 24) break;
      }
    }
  }

  // Lembretes passados da Ana
  for (let day = 1; day <= 30; day++) {
    const baseDate = startOfDay(subDays(now, day));
    const time = setMinutes(setHours(baseDate, 7), 0);
    const taken = Math.random() > 0.08;

    pastReminders.push({
      medicamentoId: levoAna.id,
      horario: time,
      status: taken ? "CONFIRMADO" : "IGNORADO",
    });
    pastHistory.push({
      usuarioId: ana.id,
      medicamentoId: levoAna.id,
      dataHora: taken ? addHours(time, 0.1) : time,
      statusAdministracao: taken ? "ADMINISTRADO" : "NAO_ADMINISTRADO",
      observacao: null,
    });
  }

  await prisma.lembrete.createMany({ data: pastReminders });
  console.log(`  → ${pastReminders.length} lembretes passados criados`);

  await prisma.historico.createMany({ data: pastHistory });
  console.log(`  → ${pastHistory.length} registros de histórico criados`);

  // ── Lembretes de hoje ────────────────────────────────────
  console.log("Gerando lembretes de hoje...");

  const todayReminders: {
    medicamentoId: number;
    horario: Date;
    status: "CONFIRMADO" | "IGNORADO" | "PENDENTE";
  }[] = [];

  const todayHistory: typeof pastHistory = [];
  const todayStart = startOfDay(now);

  for (const { med, config } of createdMeds) {
    const freqMatch = config.frequencia.match(/(\d+)h/);
    const intervalHours = freqMatch ? parseInt(freqMatch[1]) : 24;
    let time = setMinutes(setHours(todayStart, config.horaBase), 0);
    const dayEnd = addDays(todayStart, 1);

    while (isBefore(time, dayEnd)) {
      if (isBefore(time, now)) {
        const taken = Math.random() > 0.3;
        todayReminders.push({
          medicamentoId: med.id,
          horario: time,
          status: taken ? "CONFIRMADO" : "PENDENTE",
        });
        if (taken) {
          todayHistory.push({
            usuarioId: maria.id,
            medicamentoId: med.id,
            dataHora: addHours(time, Math.random() * 0.3),
            statusAdministracao: "ADMINISTRADO",
            observacao: null,
          });
        }
      } else {
        todayReminders.push({
          medicamentoId: med.id,
          horario: time,
          status: "PENDENTE",
        });
      }

      time = addHours(time, intervalHours);
      if (intervalHours >= 24) break;
    }
  }

  // Hoje da Ana
  const anaToday = setMinutes(setHours(todayStart, 7), 0);
  if (isBefore(anaToday, now)) {
    todayReminders.push({
      medicamentoId: levoAna.id,
      horario: anaToday,
      status: "CONFIRMADO",
    });
    todayHistory.push({
      usuarioId: ana.id,
      medicamentoId: levoAna.id,
      dataHora: addHours(anaToday, 0.1),
      statusAdministracao: "ADMINISTRADO",
      observacao: null,
    });
  } else {
    todayReminders.push({
      medicamentoId: levoAna.id,
      horario: anaToday,
      status: "PENDENTE",
    });
  }

  await prisma.lembrete.createMany({ data: todayReminders });
  console.log(`  → ${todayReminders.length} lembretes de hoje criados`);

  if (todayHistory.length > 0) {
    await prisma.historico.createMany({ data: todayHistory });
    console.log(`  → ${todayHistory.length} registros de histórico de hoje criados`);
  }

  // ── Lembretes futuros (próximos 14 dias) ─────────────────
  console.log("Gerando lembretes futuros (próximos 14 dias)...");

  const futureReminders: { medicamentoId: number; horario: Date }[] = [];

  for (const { med, config } of createdMeds) {
    const freqMatch = config.frequencia.match(/(\d+)h/);
    const intervalHours = freqMatch ? parseInt(freqMatch[1]) : 24;

    for (let day = 1; day <= 14; day++) {
      const baseDate = startOfDay(addDays(now, day));
      let time = setMinutes(setHours(baseDate, config.horaBase), 0);
      const dayEnd = addDays(baseDate, 1);

      while (isBefore(time, dayEnd)) {
        futureReminders.push({ medicamentoId: med.id, horario: time });
        time = addHours(time, intervalHours);
        if (intervalHours >= 24) break;
      }
    }
  }

  // Futuros da Ana
  for (let day = 1; day <= 14; day++) {
    const time = setMinutes(setHours(startOfDay(addDays(now, day)), 7), 0);
    futureReminders.push({ medicamentoId: levoAna.id, horario: time });
  }

  await prisma.lembrete.createMany({ data: futureReminders });
  console.log(`  → ${futureReminders.length} lembretes futuros criados`);

  // ── Resumo final ─────────────────────────────────────────
  const totalLembretes = await prisma.lembrete.count();
  const totalHistorico = await prisma.historico.count();
  const totalMeds = await prisma.medicamento.count();

  console.log("");
  console.log("═══════════════════════════════════════════");
  console.log("  SEED CONCLUÍDO COM SUCESSO!");
  console.log("═══════════════════════════════════════════");
  console.log("");
  console.log("  Dados criados:");
  console.log(`    Usuários:      3`);
  console.log(`    Medicamentos:  ${totalMeds}`);
  console.log(`    Lembretes:     ${totalLembretes}`);
  console.log(`    Histórico:     ${totalHistorico}`);
  console.log(`    Vínculos:      1 (João → Maria)`);
  console.log("");
  console.log("  Credenciais de acesso:");
  console.log("    maria@medicare.com  (Paciente) - senha: 123456");
  console.log("    joao@medicare.com   (Cuidador) - senha: 123456");
  console.log("    ana@medicare.com    (Paciente) - senha: 123456");
  console.log("");
  console.log("  A Maria tem 5 medicamentos com:");
  console.log("    - 30 dias de histórico passado (lembretes + histórico)");
  console.log("    - Lembretes de hoje (alguns já confirmados)");
  console.log("    - 14 dias de lembretes futuros");
  console.log("═══════════════════════════════════════════");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
