"use client";

import React from "react";

import { Button } from "../ui/button";
import { Input } from "../ui/input";

interface RegistrationFormData {
  name: string;
  email: string;
  studentRegistration: string;
  password: string;
  confirmPassword: string;
}

interface RegistrationFormProps {
  formData: {
    name: string;
    email: string;
    studentRegistration: string;
    password: string;
    confirmPassword: string;
  };
  setFormData: (data: RegistrationFormData) => void;
  onSubmit: () => void;
  loading: boolean;
  error: string;
}

export default function RegistrationForm({
  formData,
  setFormData,
  onSubmit,
  loading,
  error
}: RegistrationFormProps) {
  const handleChange = (field: string, value: string) => {
    setFormData({
      ...formData,
      [field]: value
    });
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nome Completo
        </label>
        <Input
          type="text"
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          placeholder="Digite seu nome completo"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Email
        </label>
        <Input
          type="email"
          value={formData.email}
          onChange={(e) => handleChange('email', e.target.value)}
          placeholder="Digite seu email"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Matrícula
        </label>
        <Input
          type="text"
          value={formData.studentRegistration}
          onChange={(e) => handleChange('studentRegistration', e.target.value)}
          placeholder="Digite sua matrícula"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Senha
        </label>
        <Input
          type="password"
          value={formData.password}
          onChange={(e) => handleChange('password', e.target.value)}
          placeholder="Digite sua senha"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Confirmar Senha
        </label>
        <Input
          type="password"
          value={formData.confirmPassword}
          onChange={(e) => handleChange('confirmPassword', e.target.value)}
          placeholder="Confirme sua senha"
          required
        />
      </div>

      <Button
        onClick={onSubmit}
        disabled={loading}
        className="w-full"
      >
        {loading ? "Criando conta..." : "Criar Conta"}
      </Button>
    </div>
  );
}
