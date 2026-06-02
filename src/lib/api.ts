const BASE_URL = "/api";

interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  errors?: Record<string, string[]>;
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    });

    const data = await res.json();

    if (!res.ok) {
      return { error: data.error || "Erro desconhecido", errors: data.errors };
    }

    return { data };
  } catch {
    return { error: "Erro de conexão com o servidor" };
  }
}

export const api = {
  auth: {
    register: (body: {
      nome: string;
      email: string;
      senha: string;
      tipoPerfil?: string;
    }) => request<{ user: unknown; token: string }>("/auth/register", { method: "POST", body: JSON.stringify(body) }),

    login: (body: { email: string; senha: string }) =>
      request<{ user: unknown; token: string }>("/auth/login", { method: "POST", body: JSON.stringify(body) }),

    me: () => request<{ user: unknown }>("/auth/me"),

    logout: () => request("/auth/logout", { method: "POST" }),

    updateProfile: (body: { nome: string; telefone?: string | null; dataNascimento?: string | null }) =>
      request<{ user: unknown }>("/auth/profile", { method: "PUT", body: JSON.stringify(body) }),

    changePassword: (body: { senhaAtual: string; novaSenha: string; confirmarSenha: string }) =>
      request<{ message: string }>("/auth/password", { method: "PATCH", body: JSON.stringify(body) }),

    exportData: () => request<Record<string, unknown>>("/auth/export"),

    deleteAccount: (senha: string) =>
      request<{ message: string }>("/auth/account", { method: "DELETE", body: JSON.stringify({ senha }) }),
  },

  medications: {
    list: () => request<{ medications: unknown[] }>("/medications"),

    create: (body: Record<string, unknown>) =>
      request<{ medication: unknown }>("/medications", { method: "POST", body: JSON.stringify(body) }),

    update: (id: number, body: Record<string, unknown>) =>
      request<{ medication: unknown }>(`/medications/${id}`, { method: "PUT", body: JSON.stringify(body) }),

    delete: (id: number) =>
      request(`/medications/${id}`, { method: "DELETE" }),

    toggle: (id: number) =>
      request<{ medication: unknown }>(`/medications/${id}/toggle`, { method: "PATCH" }),
  },

  logs: {
    list: (params?: Record<string, string>) => {
      const query = params ? `?${new URLSearchParams(params)}` : "";
      return request<{ logs: unknown[]; total: number }>(`/logs${query}`);
    },

    take: (id: number) =>
      request(`/logs/${id}/take`, { method: "PATCH" }),

    skip: (id: number, observacao?: string) =>
      request(`/logs/${id}/skip`, {
        method: "PATCH",
        body: JSON.stringify({ observacao }),
      }),
  },

  caregivers: {
    list: () => request<{ caregivers: unknown[] }>("/caregivers"),

    add: (body: { pacienteEmail?: string; cuidadorEmail?: string; relacionamento?: string }) =>
      request("/caregivers", { method: "POST", body: JSON.stringify(body) }),

    remove: (id: number) =>
      request(`/caregivers/${id}`, { method: "DELETE" }),

    patients: () => request<{ patients: unknown[] }>("/caregivers/patients"),

    patientMedications: (patientId: number) =>
      request<{ medications: unknown[] }>(`/caregivers/patients/${patientId}/medications`),
  },

  reports: {
    adherence: (params?: Record<string, string>) => {
      const query = params ? `?${new URLSearchParams(params)}` : "";
      return request(`/reports/adherence${query}`);
    },

    summary: () => request(`/reports/summary`),
  },
};
