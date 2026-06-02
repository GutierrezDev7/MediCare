import { prisma } from "../lib/prisma";
import { cuidadorSchema, inviteCaregiverSchema } from "../lib/validations";

export class CaregiverService {
  static async listCaregivers(pacienteId: number) {
    const caregivers = await prisma.cuidadorPaciente.findMany({
      where: { pacienteId },
      include: {
        cuidador: { select: { id: true, nome: true, email: true, telefone: true } },
      },
    });

    return { data: { caregivers }, status: 200 };
  }

  static async inviteCaregiverByPatient(pacienteId: number, body: unknown) {
    const parsed = inviteCaregiverSchema.safeParse(body);
    if (!parsed.success) {
      return { error: "Dados inválidos", errors: parsed.error.flatten().fieldErrors, status: 400 };
    }

    const { cuidadorEmail, relacionamento } = parsed.data;

    const cuidador = await prisma.usuario.findUnique({ where: { email: cuidadorEmail } });
    if (!cuidador) return { error: "Cuidador não encontrado com este email", status: 404 };
    if (cuidador.tipoPerfil !== "CUIDADOR") {
      return { error: "Este usuário não possui perfil de cuidador", status: 400 };
    }
    if (cuidador.id === pacienteId) {
      return { error: "Você não pode adicionar a si mesmo como cuidador", status: 400 };
    }

    const existing = await prisma.cuidadorPaciente.findUnique({
      where: { pacienteId_cuidadorId: { pacienteId, cuidadorId: cuidador.id } },
    });
    if (existing) return { error: "Este cuidador já está vinculado", status: 400 };

    const caregiver = await prisma.cuidadorPaciente.create({
      data: { pacienteId, cuidadorId: cuidador.id, relacionamento: relacionamento || null },
      include: {
        cuidador: { select: { id: true, nome: true, email: true, telefone: true } },
      },
    });

    return { data: { caregiver }, status: 201 };
  }

  static async addCaregiver(cuidadorId: number, body: unknown) {
    const parsed = cuidadorSchema.safeParse(body);
    if (!parsed.success) {
      return { error: "Dados inválidos", errors: parsed.error.flatten().fieldErrors, status: 400 };
    }

    const { pacienteEmail, relacionamento } = parsed.data;

    const paciente = await prisma.usuario.findUnique({ where: { email: pacienteEmail } });
    if (!paciente) return { error: "Paciente não encontrado com este email", status: 404 };
    if (paciente.id === cuidadorId) return { error: "Você não pode ser cuidador de si mesmo", status: 400 };

    const existing = await prisma.cuidadorPaciente.findUnique({
      where: { pacienteId_cuidadorId: { pacienteId: paciente.id, cuidadorId } },
    });
    if (existing) return { error: "Você já é cuidador deste paciente", status: 400 };

    const caregiver = await prisma.cuidadorPaciente.create({
      data: { pacienteId: paciente.id, cuidadorId, relacionamento: relacionamento || null },
      include: { paciente: { select: { id: true, nome: true, email: true } } },
    });

    return { data: { caregiver }, status: 201 };
  }

  static async removeCaregiver(userId: number, vinculoId: number) {
    const vinculo = await prisma.cuidadorPaciente.findUnique({ where: { id: vinculoId } });
    if (!vinculo) return { error: "Vínculo não encontrado", status: 404 };
    if (vinculo.pacienteId !== userId && vinculo.cuidadorId !== userId) {
      return { error: "Acesso negado", status: 403 };
    }

    await prisma.cuidadorPaciente.delete({ where: { id: vinculoId } });
    return { data: { message: "Vínculo removido com sucesso" }, status: 200 };
  }

  static async listPatients(cuidadorId: number) {
    const patients = await prisma.cuidadorPaciente.findMany({
      where: { cuidadorId },
      include: {
        paciente: { select: { id: true, nome: true, email: true, telefone: true } },
      },
    });

    return { data: { patients }, status: 200 };
  }

  static async getPatientMedications(cuidadorId: number, pacienteId: number) {
    const vinculo = await prisma.cuidadorPaciente.findUnique({
      where: { pacienteId_cuidadorId: { pacienteId, cuidadorId } },
    });
    if (!vinculo) return { error: "Você não é cuidador deste paciente", status: 403 };

    const medications = await prisma.medicamento.findMany({
      where: { usuarioId: pacienteId },
      include: {
        lembretes: { where: { horario: { gte: new Date() } }, orderBy: { horario: "asc" }, take: 5 },
      },
      orderBy: { criadoEm: "desc" },
    });

    return { data: { medications }, status: 200 };
  }
}
