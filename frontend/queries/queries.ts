import { Database, Tables, TablesInsert } from "@/lib/database.types"
import { supabaseClient } from "@/lib/supabase-client"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

type BotSystem = Tables<"botsystems">
type Penalty = Tables<"penalties">
type Rule = Tables<"rules">
type Profile = Tables<"profiles">
type BotsystemMembers = Tables<"botsystem_members">

type PenaltyWithRelations = Penalty & {
    profiles: Profile;
}

type BotsystemMembersWithRelations = BotsystemMembers & {
    profiles: Profile;
}


export function useGetProfile(userId: string | null) {
    return useQuery<Profile | null>({
        enabled: !!userId,
        queryKey: ["profile", userId],
        queryFn: async() => {
            const {data} = await supabaseClient.from("profiles")
            .select("*")
            .eq("user_id", userId!)
            .maybeSingle()
            .throwOnError();

            return data;
        }
    })
}

export function useProfileSearch(query: string) {
  return useQuery<Profile[]>({
    queryKey: ["profile", "search", query],
    queryFn: async () => {
      if (!query.trim()) {
        return [];
      }

      const { data } = await supabaseClient
        .from("profiles")
        .select("*")
        .ilike("display_name", `%${query.trim()}%`)
        .order("display_name", { ascending: true })
        .limit(10)
        .throwOnError();

      return data;
    },
    enabled: query.trim().length > 0,
  })
}

export function useUpsertUserProfile() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: TablesInsert<"profiles">) => {
             const {data: profile} = await supabaseClient.from("profiles")
             .upsert(data)
             .select()
             .single()
             .throwOnError()

             return profile;
        },
        onSuccess: (profile: Tables<"profiles">) => {
            queryClient.setQueryData(["profile", profile.user_id], profile);
        }
    })
}

// fetch a single bot system
export function useBotSystem(botSystemId: string) {
  return useQuery<BotSystem | null>({
    queryKey: ["botsystems", botSystemId],
    queryFn: async () => {
      const { data } = await supabaseClient
        .from("botsystems")
        .select("*")
        .eq("id", botSystemId)
        .maybeSingle()
        .throwOnError();

      return data;
    },
    enabled: !!botSystemId,
  });
}

export function useBotsystemMembers(botSystemId: string) {
    return useQuery<BotsystemMembersWithRelations[]>({
        queryKey: ["botsystems", botSystemId, "members"],
        queryFn: async () => {
            const {data} = await supabaseClient.from("botsystem_members")
            .select(`
                *,
                profiles!botsystem_members_user_id_fkey (*)
            `)
            .eq("botsystem_id", botSystemId)
            .throwOnError();

            return data;
        },
        enabled: !!botSystemId,
    })
}

export function useAddBotsystemMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: TablesInsert<"botsystem_members">) => {
      const { data: member } = await supabaseClient
        .from("botsystem_members")
        .insert(data)
        .select()
        .single()
        .throwOnError();

      return member;
    },
    onSuccess: (member: Tables<"botsystem_members">) => {
      // Invalidate queries related to the bot system members
      queryClient.invalidateQueries({
        queryKey: ["botsystems", member.botsystem_id, "members"]
      });
    },
  })
}

// fetch penalties for a bot system
export function useBotSystemPenalties(botSystemId: string) {
  return useQuery<PenaltyWithRelations[]>({
    queryKey: ["botsystems", botSystemId, "penalties"],
    queryFn: async () => {
      const { data } = await supabaseClient
        .from("penalties")
        .select(`
          *,
          profiles!penalties_user_id_fkey (*)
        `)
        .eq("botsystem_id", botSystemId)
        .throwOnError();

      return data;
    },
    enabled: !!botSystemId,
  });
}

// fetch rules for a bot system
export function useBotSystemRules(botSystemId: string) {
  return useQuery<Rule[]>({
    queryKey: ["botsystems", botSystemId, "rules"],
    queryFn: async () => {
      const { data } = await supabaseClient
        .from("rules")
        .select("*")
        .eq("botsystem_id", botSystemId) // fixed column name
        .throwOnError();

      return data;
    },
    enabled: !!botSystemId,
  });
}


export function useBotSystems() {
    return useQuery<BotSystem[]>({
        queryKey: ["botsystems"],
        queryFn: async() => {
            const {data} = await supabaseClient.from("botsystems")
            .select("*")
            .throwOnError();

            return data;
        }
    })
}

export function useAddPenalty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: TablesInsert<"penalties">) => {
      const { data: penalty } = await supabaseClient
        .from("penalties")
        .insert(data)
        .select()
        .single()
        .throwOnError();

      return penalty;
    },
    onSuccess: (penalty: Tables<"penalties">) => {
        queryClient.invalidateQueries({
            queryKey: ["botsystems", penalty.botsystem_id, "penalties"]
        });
    },
  });
}

export function useAddRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: TablesInsert<"rules">) => {
      const { data: rule } = await supabaseClient
        .from("rules")
        .insert(data)
        .select()
        .single()
        .throwOnError();

      return rule;
    },
    onSuccess: (rule: Tables<"rules">) => {
      queryClient.invalidateQueries({
        queryKey: ["botsystems", rule.botsystem_id, "rules"]
      })
    },
  });
}