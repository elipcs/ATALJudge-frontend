import { NextResponse } from "next/server";
import inviteTokens from "@/mocks/invite_tokens.json";
import users from "@/mocks/users.json";
import students from "@/mocks/students.json";
import fs from "fs";
import path from "path";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, studentId, password, token } = body;

    // Validar campos obrigatórios
    if (!name || !email || !password) {
      return NextResponse.json({ error: "Campos obrigatórios não preenchidos" }, { status: 400 });
    }

    // Verificar se token existe
    const tokenData = inviteTokens.find(t => t.token === token);
    if (!tokenData) {
      return NextResponse.json({ error: "Token inválido" }, { status: 400 });
    }

    // Verificar se token expirou
    const now = new Date();
    const expiresAt = new Date(tokenData.expires_at);
    if (now > expiresAt) {
      return NextResponse.json({ error: "Token expirado" }, { status: 410 });
    }

    // Verificar se email já existe
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      return NextResponse.json({ error: "Email já cadastrado" }, { status: 409 });
    }

    // Verificar se studentId já existe (para alunos)
    if (tokenData.type === 'student' && studentId) {
      const existingStudent = users.find(u => u.studentID === studentId);
      if (existingStudent) {
        return NextResponse.json({ error: "Matrícula já cadastrada" }, { status: 409 });
      }
    }

    // Gerar novo ID para o usuário
    const newUserId = `65000000000000000010${String(users.length + 1).padStart(3, '0')}`;

    // Criar novo usuário
    const newUser = {
      _id: { $oid: newUserId },
      name: name,
      avatar: "/profile-default.svg",
      email: email,
      role: tokenData.type === 'student' ? 'student' : tokenData.type,
      ...(tokenData.type === 'student' && studentId && { studentID: studentId })
    };

    // Se for aluno, criar entrada em students
    if (tokenData.type === 'student' && tokenData.class_id) {
      const newStudentId = `65000000000000000091${String(students.length + 1).padStart(2, '0')}`;
      const newStudent = {
        _id: { $oid: newStudentId },
        user_id: { $oid: newUserId },
        studentID: studentId || `2025${String(students.length + 1).padStart(5, '0')}`,
        class_id: tokenData.class_id,
        grades: [],
        created_at: new Date().toISOString(),
        active: true
      };

      // Em um cenário real, você salvaria nos bancos de dados aqui
      // Para este mock, retornamos sucesso simulado
    }

    // Simular atualização do token (incrementar current_uses)
    // Em um cenário real, você atualizaria o banco de dados

    return NextResponse.json({
      message: "Usuário registrado com sucesso",
      user: {
        id: newUserId,
        name: name,
        email: email,
        role: newUser.role
      }
    });

  } catch (error) {
    console.error('Erro ao registrar usuário:', error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
