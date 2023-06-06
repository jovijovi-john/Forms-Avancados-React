import { useState } from "react";
import "./styles/global.css";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

/*
 *
 * [x] Validação / Transformação
 * [] Field Arrays
 * [] Upload de arquivos
 * [] Composition Pattern
 *
 */

const createUserFormSchema = z.object({
  email: z
    .string()
    .nonempty("O e-mail é obrigatório")
    .email("Formato de e-mail inválido"),
  password: z.string().min(6, "A senha precisa ter no mínimo 6 caracteres"),
});

type CreateUserFormData = z.infer<typeof createUserFormSchema>;
// quero inferir o tipo de CreateUserFormData com base no tipo de CreateUserFormSchema

export default function App() {
  const [output, setOutput] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserFormSchema),
  });

  function createUser(data: unknown) {
    setOutput(JSON.stringify(data, null, 2));
    return {};
  }

  return (
    <main className="h-screen bg-zinc-950 flex flex-col gap-y-10 text-zinc-300 items-center justify-center">
      <form
        className="flex flex-col gap-y-4 w-full max-w-sm"
        onSubmit={handleSubmit(createUser)}
      >
        <div className="flex flex-col gap-y-1">
          <label htmlFor="">E-mail</label>
          <input
            type="text"
            className="border text-white shadow-sm border-zinc-600 h-10 bg-zinc-800"
            {...register("email")}
          />

          {errors.email && <span>{errors.email.message}</span>}
        </div>

        <div className="flex flex-col gap-y-1">
          <label htmlFor="">Senha</label>
          <input
            type="password"
            className="border text-white shadow-sm border-zinc-600 h-10 bg-zinc-800"
            {...register("password")}
          />
          {errors.password && <span>{errors.password.message}</span>}
        </div>

        <button
          type="submit"
          className="bg-emerald-500 font-semibold text-white h-10 hover:bg-emerald-600"
        >
          Salvar
        </button>
      </form>
      <pre>{output}</pre>
    </main>
  );
}
