import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

type SignupInput = { email: string; password: string };

export function useSignup() {
  return useMutation({
    mutationFn: async ({ email, password }: SignupInput) => {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${window.location.origin}/dashboard` },
      });
      if (error) throw error;
    },
  });
}
