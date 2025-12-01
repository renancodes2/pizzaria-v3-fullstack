"use client"

import { useForm } from "react-hook-form";
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from "zod";

const schema = z.object({
  email: z.string().email("Email inválido"), 
  password: z.string().min(6, "Senha deve ter ao menos 6 caracteres"),
});

export type LoginSchemaTypeOf = z.infer<typeof schema>;

export const LoginSchema = () => {
  return useForm<LoginSchemaTypeOf>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
}