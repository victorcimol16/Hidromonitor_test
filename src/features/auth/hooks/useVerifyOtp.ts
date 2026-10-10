import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

type VerifyOtpInput = { email: string; token: string };

export function useVerifyOtp() {
  return useMutation({
    mutationFn: async ({ email, token }: VerifyOtpInput) => {
      const { error } = await supabase.auth.verifyOtp({ email, token, type: "signup" });
      if (error) throw error;
    },
  });
}

export function useResendOtp() {
  return useMutation({
    mutationFn: async (email: string) => {
      const { error } = await supabase.auth.resend({ type: "signup", email });
      if (error) throw error;
    },
  });
}
