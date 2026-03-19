import { useEffect, useState } from "react";
import { supabase, type Business } from "./supabase";

export function useBusinessId() {
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      // Try owner first
      const { data: ownedBiz } = await supabase
        .from("businesses").select("*").eq("owner_id", user.id).single();

      if (ownedBiz) {
        setBusiness(ownedBiz);
        setIsOwner(true);
        setLoading(false);
        return;
      }

      // Try team member
      const { data: membership } = await supabase
        .from("team_members")
        .select("business_id")
        .eq("user_id", user.id)
        .eq("status", "active")
        .single();

      if (membership) {
        const { data: memberBiz } = await supabase
          .from("businesses").select("*").eq("id", membership.business_id).single();
        if (memberBiz) {
          setBusiness(memberBiz);
          setIsOwner(false);
        }
      }

      setLoading(false);
    }
    load();
  }, []);

  return { business, loading, isOwner };
}
