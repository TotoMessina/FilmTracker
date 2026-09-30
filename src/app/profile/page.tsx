"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/context/AuthContext";
import { Film } from "lucide-react";

export default function ProfileRedirectPage() {
  const { user, isGuest } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user?.id) {
      router.replace(`/profile/${user.id}`);
    } else {
      router.replace("/auth");
    }
  }, [user, router]);

  return (
    <div className="min-h-[50vh] flex items-center justify-center text-zinc-400 gap-2">
      <Film className="w-6 h-6 animate-pulse text-red-500" />
      <span>Redirigiendo a tu perfil...</span>
    </div>
  );
}
