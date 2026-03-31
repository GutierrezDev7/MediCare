import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma";
import { signToken } from "../lib/auth";
import { registerSchema, loginSchema } from "../lib/validations";

export class AuthService {
  static async register(body: unknown) {
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return { error: "Dados inválidos", errors: parsed.error.flatten().fieldErrors, status: 400 };
    }

    const { nome, email, senha, telefone, dataNascimento, tipoPerfil } = parsed.data;

    const existing = await prisma.usuario.findUnique({ where: { email } });
    if (existing) {
      return { error: "Este email já está cadastrado", status: 400 };
    }

    const hashedPassword = await bcrypt.hash(senha, 12);

    const user = await prisma.usuario.create({
      data: {
        nome,
        email,
        senha: hashedPassword,
        telefone: telefone || null,
        dataNascimento: dataNascimento ? new Date(dataNascimento) : null,
        tipoPerfil,
      },
    });

    const token = await signToken({
      userId: user.id,
      email: user.email,
      tipoPerfil: user.tipoPerfil,
    });

    return {
      data: {
        user: {
          id: user.id,
          nome: user.nome,
          email: user.email,
          tipoPerfil: user.tipoPerfil,
          telefone: user.telefone,
          dataNascimento: user.dataNascimento,
        },
        token,
      },
      status: 201,
    };
  }

  static async login(body: unknown) {
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return { error: "Dados inválidos", errors: parsed.error.flatten().fieldErrors, status: 400 };
    }

    const { email, senha } = parsed.data;

    const user = await prisma.usuario.findUnique({ where: { email } });
    if (!user) {
      return { error: "Email ou senha incorretos", status: 401 };
    }

    const passwordValid = await bcrypt.compare(senha, user.senha);
    if (!passwordValid) {
      return { error: "Email ou senha incorretos", status: 401 };
    }

    const token = await signToken({
      userId: user.id,
      email: user.email,
      tipoPerfil: user.tipoPerfil,
    });

    return {
      data: {
        user: {
          id: user.id,
          nome: user.nome,
          email: user.email,
          tipoPerfil: user.tipoPerfil,
          telefone: user.telefone,
          dataNascimento: user.dataNascimento,
        },
        token,
      },
      status: 200,
    };
  }

  static async getMe(userId: number) {
    const user = await prisma.usuario.findUnique({
      where: { id: userId },
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

    if (!user) {
      return { error: "Usuário não encontrado", status: 401 };
    }

    return { data: { user }, status: 200 };
  }
}
