import React, {
  createContext,
  startTransition,
  useContext,
  useEffect,
  useState,
} from "react";
import { ClerkProvider, useClerk } from "@clerk/tanstack-start";
import { dark } from "@clerk/themes";

type ClerkContextType = {
  isLoaded: boolean;
  isSignedIn: boolean | null;
  userId: string | null;
};

const ClerkContext = createContext<ClerkContextType | undefined>(undefined);

export const CustomClerkProvider: React.FC<{
  children: React.ReactNode;
  navigate: (to: { to: string }) => void;
}> = ({ children, navigate }) => {
  const [clerkState, setClerkState] = useState<ClerkContextType>({
    isLoaded: false,
    isSignedIn: null,
    userId: null,
  });

  return (
    <ClerkProvider
      appearance={{
        baseTheme: dark,
        elements: {
          avatarBox:
            "w-10 h-10 hover:scale-110 transition-all duration-300 border-violet-500 border-[2px]",
          modalContent: "!bg-black/25",
          modalBackdrop: "!bg-black/25 !backdrop-blur-md",
          impersonationFabTitle: "text-black",
          tagInputContainer: "bg-transparent border-white/10",
          input: "bg-white/10 text-white border-white/10",
          navbar: "text-violet-500 bg-black/25",
          navbarButton: "text-violet-500",
          navbarButtonIcon: "text-violet-500",
        },
        variables: {
          colorPrimary: "#8b5cf6",
          colorText: "white",
          colorNeutral: "white",
          colorInputText: "black",
        },
      }}
    >
      <ClerkContext.Provider value={clerkState}>
        <ClerkStateUpdater setClerkState={setClerkState} />
        {children}
      </ClerkContext.Provider>
    </ClerkProvider>
  );
};

const ClerkStateUpdater: React.FC<{
  setClerkState: React.Dispatch<React.SetStateAction<ClerkContextType>>;
}> = ({ setClerkState }) => {
  const clerk = useClerk();

  useEffect(() => {
    const updateClerkState = () => {
      startTransition(() => {
        setClerkState({
          isLoaded: clerk.loaded,
          isSignedIn: clerk.session !== null,
          userId: clerk.user?.id ?? null,
        });
      });
    };

    updateClerkState();

    clerk.addListener((event) => {
      if (event.type === "session" || event.type === "user") {
        updateClerkState();
      }
    });
  }, [clerk, setClerkState]);

  return null;
};

export const useCustomClerk = () => {
  const context = useContext(ClerkContext);
  if (context === undefined) {
    throw new Error("useCustomClerk must be used within a CustomClerkProvider");
  }
  return context;
};
