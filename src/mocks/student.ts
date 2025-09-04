export interface StudentMock {
  id: string;
  name: string;
  avatar: string;
  email: string;
  matricula: string;
  role: string;
}

export const mockStudents: StudentMock[] = [
  { id: "1", name: "João da Silva", avatar: "/profile-default.svg", email: "joao@email.com", matricula: "202500001", role: "student" },
  { id: "2", name: "Maria Oliveira", avatar: "/profile-default.svg", email: "maria@email.com", matricula: "", role: "teacher" },
  { id: "3", name: "Carlos Souza", avatar: "/profile-default.svg", email: "carlos@email.com", matricula: "202500003", role: "student" },
  { id: "4", name: "Fernanda Lima", avatar: "/profile-default.svg", email: "fernanda@email.com", matricula: "", role: "admin" },
];
