import { useState } from "react";
import "./styles/global.css";

import { useForm } from "react-hook-form";

export default function App() {
  const [output, setOutput] = useState("");
  const { register, handleSubmit } = useForm();

  function createUser(data: unknown) {
    setOutput(JSON.stringify(data, null, 2));
    return {};
  }

  return (
    <main className="h-screen bg-zinc-950 flex flex-col gap-y-10 text-zinc-300 items-center justify-center">
      <form
        action=""
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
        </div>

        <div className="flex flex-col gap-y-1">
          <label htmlFor="">Senha</label>
          <input
            type="password"
            className="border text-white shadow-sm border-zinc-600 h-10 bg-zinc-800"
            {...register("password")}
          />
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
