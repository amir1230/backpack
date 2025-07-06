import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
  onboardingCompleted?: boolean;
  registrationCompleted?: boolean;
  interests?: string[];
  travelStyles?: string[];
  budgetRange?: string;
  experienceLevel?: string;
  groupSize?: string;
  preferredDuration?: string;
  accommodationType?: string[];
  activities?: string[];
  personalityTraits?: string[];
}

export function useAuth() {
  // Check for logout parameter in URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('logout') === 'true') {
      // Clear URL parameter
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const { data: user, isLoading, error } = useQuery<User | null>({
    queryKey: ["/api/auth/user"],
    retry: false,
    refetchOnWindowFocus: true,
    staleTime: 0, // Always check for fresh auth status
    cacheTime: 0, // Don't cache authentication data
    queryFn: async () => {
      try {
        const res = await fetch("/api/auth/user", {
          credentials: "include",
          cache: "no-cache", // Force fresh request
          headers: {
            "Cache-Control": "no-cache",
            "Pragma": "no-cache"
          }
        });
        
        if (res.status === 401) {
          return null; // Not authenticated
        }
        
        if (!res.ok) {
          throw new Error(`${res.status}: ${res.statusText}`);
        }
        
        return await res.json();
      } catch (err) {
        console.error("Auth error:", err);
        return null; // Return null instead of throwing to prevent unhandled rejections
      }
    },
  });

  // If there's an error fetching user (401 or server error), assume not authenticated
  if (error) {
    return {
      user: null,
      isLoading: false,
      isAuthenticated: false,
    };
  }

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
  };
}
