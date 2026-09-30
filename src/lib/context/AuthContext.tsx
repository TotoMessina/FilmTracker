"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "../supabase/client";
import { Profile } from "../supabase/types";

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  isGuest: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, username: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  enableGuestMode: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (!error && data) {
        setProfile(data as Profile);
      } else {
        // Fallback profile if row is not created yet
        setProfile({
          id: userId,
          username: user?.email ? user.email.split("@")[0] : "Cinéfilo",
          avatar_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.email || "User")}&background=e50914&color=fff`,
        });
      }
    } catch {
      // Ignore network errors on init
    }
  };

  useEffect(() => {
    // Check initial session
    const getSession = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) {
          await supabase.auth.signOut();
          setUser(null);
          setProfile(null);
          return;
        }

        if (session?.user) {
          // Validate session with the server to ensure token isn't from another project
          const { data: userData, error: userError } = await supabase.auth.getUser();
          if (userError || !userData?.user) {
            console.warn("Stale or invalid token detected, clearing session:", userError);
            await supabase.auth.signOut();
            setUser(null);
            setProfile(null);
          } else {
            setUser(userData.user);
            await fetchProfile(userData.user.id);
          }
        } else {
          // Check if guest was active in localStorage
          const savedGuest = localStorage.getItem("filmtracker_guest_mode");
          if (savedGuest === "true") {
            setIsGuest(true);
            setProfile({
              id: "guest-user-123",
              username: "Invitado Cinéfilo",
              avatar_url: "https://ui-avatars.com/api/?name=Invitado&background=e50914&color=fff",
            });
          }
        }
      } catch (err) {
        console.warn("Supabase auth check error:", err);
      } finally {
        setLoading(false);
      }
    };

    getSession();

    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user);
          setIsGuest(false);
          localStorage.removeItem("filmtracker_guest_mode");
          await fetchProfile(session.user.id);
        } else {
          setUser(null);
          if (!isGuest) setProfile(null);
        }
        setLoading(false);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [isGuest]);

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) return { error };
      if (data.user) {
        setUser(data.user);
        setIsGuest(false);
        localStorage.removeItem("filmtracker_guest_mode");
        await fetchProfile(data.user.id);
      }
      return { error: null };
    } catch (err: unknown) {
      return { error: err as Error };
    }
  };

  const signUp = async (email: string, password: string, username: string) => {
    try {
      const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=e50914&color=fff`;
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: username || email.split("@")[0],
            avatar_url: defaultAvatar,
          },
        },
      });

      if (error) return { error };

      if (data.user) {
        setUser(data.user);
        // Ensure profile row exists
        await supabase.from("profiles").upsert({
          id: data.user.id,
          username: username || email.split("@")[0],
          avatar_url: defaultAvatar,
        });
        await fetchProfile(data.user.id);
      }
      return { error: null };
    } catch (err: unknown) {
      return { error: err as Error };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn("Sign out error:", err);
    }
    setUser(null);
    setProfile(null);
    setIsGuest(false);
    localStorage.removeItem("filmtracker_guest_mode");
  };

  const enableGuestMode = () => {
    setIsGuest(true);
    localStorage.setItem("filmtracker_guest_mode", "true");
    setProfile({
      id: "guest-user-123",
      username: "Invitado Cinéfilo",
      avatar_url: "https://ui-avatars.com/api/?name=Invitado&background=e50914&color=fff",
    });
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        isGuest,
        signIn,
        signUp,
        signOut,
        enableGuestMode,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
