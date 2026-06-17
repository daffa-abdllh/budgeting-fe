import { useQuery } from "@tanstack/react-query";
import { getUserinfo } from "./auth.api";

export const USERINFO_QUERY_KEY = ["auth", "userinfo"] as const;

export function useUserinfoQuery() {
  return useQuery({
    queryKey: USERINFO_QUERY_KEY,
    queryFn: async () => {
      const response = await getUserinfo();
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 menit
    retry: false, // Jangan retry jika gagal (redirect ke login)
  });
}
