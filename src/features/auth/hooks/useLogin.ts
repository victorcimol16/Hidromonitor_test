import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

type LoginInput = { email: string; password: string };

function translateLoginError(message: string) {
  return message === "Invalid login credentials" ? "E-mail ou senha inválidos." : message;
}

export function useLogin() {
  return useMutation({
    mutationFn: async ({ email, password }: LoginInput) => {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw new Error(translateLoginError(error.message));
    },
  });
}
