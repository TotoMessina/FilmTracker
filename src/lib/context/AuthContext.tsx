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
  signUp: (
    email: string,
    password: string,
    username: string
  ) => Promise<{ error: Error | null; needsEmailConfirmation?: boolean }>;
  signOut: () => Promise<void>;
  enableGuestMode: () => void;
  refreshProfile: () => Promise<void>;
  resendConfirmationEmail: (email: string) => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);

  const fetchProfile = async (userId: string, currentUser?: User | null) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (!error && data) {
        setProfile(data as Profile);
      } else {
        const u = currentUser || user;
        const meta = u?.user_metadata;
        const fallbackUsername = meta?.username || (u?.email ? u.email.split("@")[0] : "Cinéfilo");
        const fallbackAvatar = meta?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(fallbackUsername)}&background=e50914&color=fff`;

        const fallback = {
          id: userId,
          username: fallbackUsername,
          avatar_url: fallbackAvatar,
        };
        setProfile(fallback);

        // If authenticated session exists, ensure profile row is saved in Supabase
        await supabase.from("profiles").upsert(fallback);
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
            await fetchProfile(userData.user.id, userData.user);
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
          await fetchProfile(session.user.id, session.user);
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
        await fetchProfile(data.user.id, data.user);
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

      if (error) return { error, needsEmailConfirmation: false };

      // In Supabase, if email confirmation is enabled, data.session is null
      const needsEmailConfirmation = !data.session;

      if (!needsEmailConfirmation && data.user) {
        // Immediate login if email confirmation is disabled in Supabase project
        setUser(data.user);
        setIsGuest(false);
        localStorage.removeItem("filmtracker_guest_mode");
        await supabase.from("profiles").upsert({
          id: data.user.id,
          username: username || email.split("@")[0],
          avatar_url: defaultAvatar,
        });
        await fetchProfile(data.user.id, data.user);
      } else {
        // Confirmation required: Do NOT treat as logged in
        setUser(null);
        setProfile(null);
        setIsGuest(false);
        localStorage.removeItem("filmtracker_guest_mode");
      }

      return { error: null, needsEmailConfirmation };
    } catch (err: unknown) {
      return { error: err as Error, needsEmailConfirmation: false };
    }
  };

  const resendConfirmationEmail = async (email: string) => {
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email,
      });
      if (error) return { error };
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
      await fetchProfile(user.id, user);
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
        resendConfirmationEmail,
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
