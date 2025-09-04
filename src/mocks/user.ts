export type UserRole = "estudante" | "professor" | "admin";

export interface UserMock {
  name: string;
  avatar: string;
  email: string;
  role: UserRole;
  matricula?: string;
}

export const mockUsers: Record<string, UserMock> = {
  "1": { name: "João da Silva", avatar: "/profile-default.svg", email: "joao@email.com", role: "estudante", matricula: "202500001" },
  "2": { name: "Maria Oliveira", avatar: "/profile-default.svg", email: "maria@email.com", role: "professor" },
  "3": { name: "Carlos Souza", avatar: "/profile-default.svg", email: "carlos@email.com", role: "estudante", matricula: "202500002" },
  "4": { name: "Fernanda Lima", avatar: "/profile-default.svg", email: "fernanda@email.com", role: "admin" },
};
