import { useState } from "react";
import "./styles/global.css";

import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "./lib/supabase";

/*
 * [x] Validação / Transformação
 * [ ] Field Arrays
 * [ ] Upload de arquivos
 * [ ] Composition Pattern
 */

const createUserFormSchema = z.object({
  avatar: z
    .instanceof(FileList)
    .transform((list) => list.item(0)!)
    .refine(
      (file) => file!.size <= 4 * 1024 * 1024,
      "O arquivo deve ter no máximo 5mb"
    ),
  name: z
    .string()
    .nonempty("O nome é obrigatório")
    .min(6, "O nome deve ter no mínimo 6 caracteres ")
    .transform((name) => {
      return name
        .trim()
        .split(" ")
        .map((word) => {
          // pegando cada palavra, alterando a primeira letra pra maiuscula e concatenando com o resto da palavra
          return word[0].toLocaleUpperCase().concat(word.substring(1));
        })
        .join(" ");
    }),
  email: z
    .string()
    .nonempty("O e-mail é obrigatório")
    .email("Formato de e-mail inválido")
    .refine((email) => {
      // o refine é pra adicionar validações q n tenham no zod
      return email.endsWith("gmail.com");
    }, "O email deve ser do gmail"),
  // .superRefine() serve para fazer validações usando mais de um campo ( tipo senha e confirmar senha). Ou seja, fazer validações acessando todos os campos.
  password: z.string().min(6, "A senha precisa ter no mínimo 6 caracteres"),
  techs: z
    .array(
      z.object({
        title: z.string().nonempty(),
        knowledge: z.coerce.number().min(1).max(100),
      })
    )
    .min(2, "Insira pelo menos 2 tecnologias")
    .refine((techs) => {
      return techs.some((tech) => tech.knowledge > 50);
    }, "Você está aprendendo"),
});

type CreateUserFormData = z.infer<typeof createUserFormSchema>;
// quero inferir o tipo de CreateUserFormData com base no tipo de CreateUserFormSchema

export default function App() {
  const [output, setOutput] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
  } = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserFormSchema),
  });

  // o control é pra associar o field array ao createUserFormData

  const { fields, append, remove } = useFieldArray({
    control,
    name: "techs",
  });

  async function createUser(data: CreateUserFormData) {
    // esse console é pra mostrar o avatar, pq o tipo File nao tem uma definição do toString
    console.log(data.avatar);

    await supabase.storage
      .from("forms-react-bucket")
      .upload(data.avatar?.name, data.avatar);

    setOutput(JSON.stringify(data, null, 2));
  }

  function addNewTech() {
    append({ title: "", knowledge: 0 });
  }

  return (
    <main className="h-screen bg-zinc-950 flex flex-col gap-y-10 text-zinc-300 items-center justify-center">
      <form
        className="flex flex-col gap-y-4 w-full max-w-sm"
        onSubmit={handleSubmit(createUser)}
      >
        {/* avatar */}
        <div className="flex flex-col gap-y-1">
          <label htmlFor="name">Avatar</label>
          <input type="file" accept="image/*" {...register("avatar")} />

          {errors.avatar && (
            <span className="text-red-500 text-sm">
              {errors.avatar.message}
            </span>
          )}
        </div>

        {/* Nome */}
        <div className="flex flex-col gap-y-1">
          <label htmlFor="name">Nome</label>
          <input
            type="text"
            className="border text-white shadow-sm border-zinc-600 h-10 bg-zinc-800"
            {...register("name")}
          />

          {errors.name && (
            <span className="text-red-500 text-sm">{errors.name.message}</span>
          )}
        </div>

        {/* E-mail */}
        <div className="flex flex-col gap-y-1">
          <label htmlFor="email">E-mail</label>
          <input
            type="text"
            className="border text-white shadow-sm border-zinc-700 h-10 bg-zinc-800"
            {...register("email")}
          />

          {errors.email && (
            <span className="text-red-500 text-sm">{errors.email.message}</span>
          )}
        </div>

        {/* Senha */}
        <div className="flex flex-col gap-y-1">
          <label htmlFor="password">Senha</label>
          <input
            type="password"
            className="border text-white shadow-sm border-zinc-700 h-10 bg-zinc-800"
            {...register("password")}
          />
          {errors.password && (
            <span className="text-red-500 text-sm">
              {errors.password.message}
            </span>
          )}
        </div>

        {/* Techs */}
        <div className="flex flex-col gap-y-1">
          <label
            htmlFor="password"
            className="flex items-center justify-between text-emerald-500 text-sm"
          >
            Tecnologias
            <button onClick={addNewTech}>Adicionar</button>
          </label>

          {fields.map((field, index) => {
            return (
              <div key={field.id} className="flex gap-2">
                <div className="flex flex-1 flex-col gap-y-1">
                  <input
                    type="text"
                    className="border text-white shadow-sm border-zinc-700 h-10 bg-zinc-800"
                    {...register(`techs.${index}.title`)}
                  />

                  {errors.techs?.[index]?.title && (
                    <span className="text-red-500 text-sm">
                      {errors.techs?.[index]?.title?.message}
                    </span>
                  )}
                </div>

                <div className="flex flex-col  gap-y-1">
                  <input
                    type="number"
                    className="w-16 border text-white shadow-sm border-zinc-700 h-10 bg-zinc-800 "
                    {...register(`techs.${index}.knowledge`)}
                  />
                  {errors.techs?.[index]?.knowledge && (
                    <span className="text-red-500 text-sm">
                      {errors.techs?.[index]?.knowledge?.message}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
          {errors.techs && (
            <span className="text-red-500 text-sm">{errors.techs.message}</span>
          )}
        </div>

        {/* Submit */}
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
