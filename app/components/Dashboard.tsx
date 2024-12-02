import React, { useEffect, useState, forwardRef } from "react";
import { useOrganization, OrganizationSwitcher } from "@clerk/tanstack-start";
import DashboardHeader from "./DashboardHeader";
import { Container } from "./layout/Container";
import AnimatedCard from "./AnimatedCard";
import UserDetailsCard from "./UserDetailsCard";
import { useSession } from "@clerk/tanstack-start";
import DashboardNavigation from "./DashboardNavigation";
import { useDatabaseStore } from "@/store/supabaseCacheStore";
import { useCombinedStore } from "@/store";
import { formatTime } from "@/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation } from "@tanstack/react-router";
import {
  LayoutDashboard,
  MessageCircle,
  Bell,
  BarChart2,
  Eye,
  Users,
  AudioLines,
  MessageCircleMore,
  Pencil,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUser } from "@clerk/tanstack-start";
import { Button } from "./ui/button";
import { supabase } from "@/utils/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { SpotifyKeysDialog } from "@/components/SpotifyKeysDialog";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
  UserPlus as IconUserPlus,
  Star as IconStar,
  Diamond as IconDiamond,
  DollarSign as IconCurrencyDollar,
  Users as IconUsers,
  Headphones as IconHeadphones,
  Bell as IconBell,
  Circle as FaCircle,
} from "lucide-react";
import { navItems } from "@/config/navigation";
import { LiveStatusCard } from "@/components/widget-settings/visualizer/LiveStatusCard";
import type { Event, Alert } from "@/types/events";
import type { TrackData } from "@/types/visualizer";

const IconButton = forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    className?: string;
  }
>(({ children, className, ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      "flex h-8 w-8 items-center justify-center rounded-full",
      className
    )}
    {...props}
  >
    {children}
  </button>
));
IconButton.displayName = "IconButton";

const IconButtonWithRef = forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    className?: string;
    children: React.ReactNode;
  }
>(({ className, children, ...props }, ref) => (
  <Button
    ref={ref}
    variant="ghost"
    size="icon"
    className={cn("h-8 w-8 bg-white/10 hover:bg-white/20", className)}
    {...props}
  >
    {children}
  </Button>
));
IconButtonWithRef.displayName = "IconButtonWithRef";

const ConnectedAccountsCard = () => {
  const { session } = useSession();
  const { user } = useUser();
  const [spotifyCredentials, setSpotifyCredentials] = useState<{
    s_client_id: string | null;
    s_client_secret: string | null;
    s_refresh_token: string | null;
  } | null>(null);

  useEffect(() => {
    const fetchSpotifyCredentials = async () => {
      if (!user?.id) return;

      const { data, error } = await supabase
        .from("UserProfile")
        .select("s_client_id, s_client_secret, s_refresh_token")
        .eq("user_id", user.id)
        .single();

      if (error) {
        console.error("Error fetching Spotify credentials:", error);
        return;
      }

      setSpotifyCredentials(data);
    };

    fetchSpotifyCredentials();
  }, [user?.id]);

  const connectedAccounts = session?.user.externalAccounts || [];

  const getProviderIcon = (provider: string) => {
    switch (provider.toLowerCase()) {
      case "google":
        return (
          <img
            src="/app/icons/filled/brand-youtube.svg"
            className="h-5 w-5 invert"
            alt="Google"
          />
        );
      case "spotify":
        return (
          <img
            src="/app/icons/filled/brand-spotify.svg"
            className="h-5 w-5 invert"
            alt="Spotify"
          />
        );
      case "youtube":
        return (
          <img
            src="/app/icons/filled/brand-youtube.svg"
            className="h-5 w-5 invert"
            alt="YouTube"
          />
        );
      case "discord":
        return (
          <img
            src="/app/icons/filled/brand-discord.svg"
            className="h-5 w-5 invert"
            alt="Discord"
          />
        );
      case "tiktok":
        return (
          <img
            src="/app/icons/filled/brand-tiktok.svg"
            className="h-5 w-5 invert"
            alt="TikTok"
          />
        );
      case "twitch":
        return (
          <img
            src="/app/icons/outline/brand-twitch.svg"
            className="h-5 w-5 invert"
            alt="Twitch"
          />
        );
      case "facebook":
        return (
          <img
            src="/app/icons/filled/brand-facebook.svg"
            className="h-5 w-5 invert"
            alt="Facebook"
          />
        );
      case "twitter":
        return (
          <img
            src="/app/icons/filled/brand-twitter.svg"
            className="h-5 w-5 invert"
            alt="Twitter"
          />
        );
      default:
        return null;
    }
  };

  const hasSpotifyCredentials = !!(
    spotifyCredentials?.s_client_id &&
    spotifyCredentials?.s_client_secret &&
    spotifyCredentials?.s_refresh_token
  );

  return (
    <div className="">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="flex items-center text-lg font-bold">
          <svg
            className="mr-2 h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
          Connected Accounts
        </h2>
      </div>

      {connectedAccounts.length > 0 ? (
        <div className="space-y-2">
          {connectedAccounts.map((account) => (
            <div
              key={account.id}
              className="flex items-center justify-between rounded-md bg-white/5 p-2"
            >
              <div className="flex items-center space-x-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-600">
                  {getProviderIcon(account.provider)}
                </div>
                <div>
                  <p className="font-semibold text-blue-300">
                    {account.provider.replace("oauth_", "")}
                  </p>
                  <p className="text-sm text-purple-500">{account.username}</p>
                </div>
              </div>
              {account.provider === "spotify" && (
                <Dialog>
                  <DialogTrigger asChild>
                    <div className="flex items-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 bg-white/10 hover:bg-white/20 relative"
                        onMouseEnter={(e) => {
                          const tooltip = document.createElement("div");
                          tooltip.className =
                            "absolute -top-8 dark:bg-black/80 px-2 py-1 rounded text-xs";
                          tooltip.textContent = hasSpotifyCredentials
                            ? "Edit Spotify Keys"
                            : "Add Spotify Keys";
                          e.currentTarget.appendChild(tooltip);
                        }}
                        onMouseLeave={(e) => {
                          const tooltip = e.currentTarget.querySelector("div");
                          if (tooltip) tooltip.remove();
                        }}
                      >
                        {hasSpotifyCredentials ? (
                          <Pencil className="h-4 w-4" />
                        ) : (
                          <Plus className="h-4 w-4" />
                        )}
                        <span className="sr-only">
                          {hasSpotifyCredentials
                            ? "Edit Spotify Keys"
                            : "Add Spotify Keys"}
                        </span>
                      </Button>
                    </div>
                  </DialogTrigger>
                  <SpotifyKeysDialog />
                </Dialog>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-300">No connected accounts</p>
      )}
    </div>
  );
};

const NowPlayingCard = () => {
  const nowPlayingData = useDatabaseStore(
    (state) => state.VisualizerWidget?.[0]
  );

  return (
    <div className="relative overflow-hidden">
      {nowPlayingData?.track?.albumArt && (
        <div
          className="absolute inset-0 z-0"
          dangerouslySetInnerHTML={{ __html: nowPlayingData?.track?.albumArt }}
        />
      )}
      <div className="relative z-10">
        <h2 className="mb-2 flex items-center text-lg font-bold text-purple-400">
          <svg
            className="mr-2 h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
            />
          </svg>
          Now Playing
        </h2>
        {nowPlayingData?.track ? (
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              {nowPlayingData?.track?.albumArt && (
                <img
                  src={nowPlayingData?.track?.albumArt}
                  alt="Album Art"
                  className="h-20 w-20 rounded-md border-2 border-blue-400 shadow-md"
                />
              )}
              <div>
                <p className="text-2xl font-bold text-blue-300">
                  {nowPlayingData?.track?.title}
                </p>
                <p className="text-lg text-purple-500">
                  {nowPlayingData?.track?.artist}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-[auto,1fr] gap-x-4">
              <p className="text-gray-400">Album:</p>
              <p className="text-purple-500">{nowPlayingData?.track?.album}</p>
              <p className="text-gray-400">Status:</p>
              <p
                className={`font-semibold ${
                  nowPlayingData?.track?.isPlaying
                    ? "text-green-400"
                    : "text-yellow-400"
                }`}
              >
                {nowPlayingData?.track?.isPlaying ? "Playing" : "Paused"}
              </p>
              <p className="text-gray-400">Progress:</p>
              <p className="text-purple-500">
                {formatTime(nowPlayingData?.track?.elapsed)} /{" "}
                {formatTime(nowPlayingData?.track?.duration)}
              </p>
            </div>
          </div>
        ) : (
          <p className="text-gray-300">Waiting for track data...</p>
        )}
      </div>
    </div>
  );
};

const WebSocketConnectionsCard = () => {
  // const {
  //   isPrimaryConnected,
  //   isBackupConnected,
  //   isGameOverlayConnected,
  //   isStreamElementsConnected,
  //   isPrimaryConnecting,
  //   isBackupConnecting,
  //   isGameOverlayConnecting,
  //   isStreamElementsConnecting,
  //   initializeConnections,
  //   closeAllConnections,
  //   connectionAttempts,
  // } = useCombinedStore((state) => ({
  //   isPrimaryConnected: state.isPrimaryConnected,
  //   isBackupConnected: state.isBackupConnected,
  //   isGameOverlayConnected: state.isGameOverlayConnected,
  //   isStreamElementsConnected: state.isStreamElementsConnected,
  //   isPrimaryConnecting: state.isPrimaryConnecting,
  //   isBackupConnecting: state.isBackupConnecting,
  //   isGameOverlayConnecting: state.isGameOverlayConnecting,
  //   isStreamElementsConnecting: state.isStreamElementsConnecting,
  //   initializeConnections: state.initializeConnections,
  //   closeAllConnections: state.closeAllConnections,
  //   connectionAttempts: state.connectionAttempts,
  // }));

  const connections = [
    {
      name: "Elysia",
      status: false,
      connecting: false,
      attempts: 0,
    },
    // {
    //   name: "StreamElements",
    //   status: isStreamElementsConnected,
    //   connecting: isStreamElementsConnecting,
    //   attempts: connectionAttempts.streamElements,
    // },
    // {
    //   name: "Game Overlay",
    //   status: isGameOverlayConnected,
    //   connecting: isGameOverlayConnecting,
    //   attempts: connectionAttempts.gameOverlay,
    //   showGetApp: true,
    // },
    // {
    //   name: "Backup (FLYIO)",
    //   status: isBackupConnected,
    //   connecting: isBackupConnecting,
    //   attempts: connectionAttempts.backup,
    // },
  ];

  const getStatusColor = (status: boolean, connecting: boolean) => {
    if (connecting) return "text-yellow-500";
    return status ? "text-green-500" : "text-red-500";
  };

  const getStatusText = (
    status: boolean,
    connecting: boolean,
    attempts: number
  ) => {
    if (status) return "Connected";
    if (connecting) return `Connecting... (${attempts}/5)`;
    return "Disconnected";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className=""
    >
      <h2 className="mb-4 flex items-center text-xl font-bold text-purple-400">
        <svg
          className="mr-2 h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
        Connections
      </h2>
      <div className="space-y-3">
        <AnimatePresence>
          {connections.map(({ name, status, connecting, attempts }) => (
            <motion.div
              key={name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="flex items-center justify-between rounded-md bg-white/5 p-3"
            >
              <div className="flex items-center space-x-3">
                {status && (
                  <motion.div
                    animate={{
                      scale: [1, 1.2, 1],
                      transition: { repeat: Infinity, duration: 2 },
                    }}
                  >
                    <FaCircle
                      className={`h-3 w-3 ${getStatusColor(status, connecting)}`}
                    />
                  </motion.div>
                )}
                {!status && (
                  <FaCircle
                    className={`h-3 w-3 ${getStatusColor(status, connecting)}`}
                  />
                )}
                <div>
                  <p className="font-semibold text-blue-300">{name}</p>
                  <p
                    className={`text-sm ${getStatusColor(status, connecting)}`}
                  >
                    {getStatusText(status, connecting, attempts)}
                    {connecting && (
                      <span className="ml-2 text-slate-400">
                        Attempt {attempts}/5
                      </span>
                    )}
                  </p>
                </div>
              </div>
              {/* {showGetApp && (
                <a
                  href="https://github.com/yourusername/game-overlay-app/releases/latest"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full bg-purple-500 px-3 py-1 text-xs font-medium text-white transition-colors duration-200 hover:bg-purple-600"
                >
                  Get App
                </a>
              )} */}
            </motion.div>
          ))}
          show elysia connection status here
        </AnimatePresence>
      </div>
      {/* <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`mt-6 w-full rounded-full px-4 py-2 text-sm font-medium transition-colors duration-200 ${
          isPrimaryConnected ||
          isBackupConnected ||
          isGameOverlayConnected ||
          isStreamElementsConnected
            ? "bg-red-500 text-white hover:bg-red-600"
            : "bg-green-500 text-white hover:bg-green-600"
        }`}
      >
        {isPrimaryConnected ||
        isBackupConnected ||
        isGameOverlayConnected ||
        isStreamElementsConnected
          ? "Disconnect All"
          : "Connect All"}
      </motion.button> */}
    </motion.div>
  );
};

const ActivityBar = () => {
  const nowPlayingData = useDatabaseStore(
    (state) => state.VisualizerWidget?.[0]
  );

  const { currentAlert } = useCombinedStore((state) => ({
    currentAlert: state.currentAlert as Alert | null,
  }));

  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    const newEvent = (() => {
      if (nowPlayingData?.track) {
        return {
          id: `song-${nowPlayingData?.track.title}-${nowPlayingData?.track.artist}`,
          type: "Now Playing",
          data: {
            displayName: `${nowPlayingData?.track.title} - ${nowPlayingData?.track.artist}`,
          },
          timestamp: Date.now(),
        };
      }
      if (currentAlert) {
        return {
          id: `alert-${currentAlert.type}-${currentAlert.data.displayName}`,
          type: currentAlert.type,
          data: currentAlert.data,
          timestamp: Date.now(),
        };
      }
      return null;
    })();

    if (newEvent) {
      setEvents((prevEvents) => {
        const existingEventIndex = prevEvents.findIndex(
          (e) => e.id === newEvent.id
        );
        if (existingEventIndex !== -1) {
          const updatedEvents = [...prevEvents];
          updatedEvents[existingEventIndex] = {
            ...newEvent,
            timestamp: Date.now(),
          };
          return updatedEvents;
        }
        return [newEvent, ...prevEvents].slice(0, 5);
      });
    }
  }, [nowPlayingData, currentAlert]);

  const getEventIcon = (type: string, amount: number = 0) => {
    switch (type.toLowerCase()) {
      case "follow":
        return <IconUserPlus className="h-4 w-4 text-blue-400" />;
      case "subscription":
        return <IconStar className="h-4 w-4 text-yellow-400" />;
      case "cheer":
        const cheerClass = amount >= 1000 ? "text-red-500" : "text-purple-500";
        return <IconDiamond className={`h-4 w-4 ${cheerClass}`} />;
      case "tip":
        return <IconCurrencyDollar className="h-4 w-4 text-green-500" />;
      case "raid":
        return <IconUsers className="h-4 w-4 text-amber-500" />;
      case "now playing":
        return <IconHeadphones className="h-4 w-4 text-blue-400" />;
      default:
        return <IconBell className="h-4 w-4 text-gray-400" />;
    }
  };

  const getEventCount = (event: Event) => {
    switch (event.type.toLowerCase()) {
      case "tip":
        return (
          <span className="font-bold text-green-400">${event.data.amount}</span>
        );
      case "cheer":
        const cheerAmount = parseInt(event.data.amount);
        const cheerClass =
          cheerAmount >= 1000 ? "text-red-500" : "text-purple-400";
        return (
          <span className={`font-bold ${cheerClass}`}>
            {event.data.amount} bits
          </span>
        );
      case "raid":
        return (
          <span className="font-bold text-amber-500">
            {event.data.amount} viewers
          </span>
        );
      case "subscription":
        return event.data.gifted ? (
          <span className="font-bold text-yellow-400">
            {event.data.amount} gifted
          </span>
        ) : null;
      default:
        return null;
    }
  };

  return (
    <div className="">
      <h2 className="mb-2 flex items-center text-lg font-bold text-purple-400">
        <svg
          className="mr-2 h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
        Recent Activity
      </h2>
      <div className="space-y-2">
        <AnimatePresence>
          {events.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: -20, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: 20, height: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="overflow-hidden rounded-md bg-white/5 p-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-600">
                    {getEventIcon(
                      event.type,
                      event.type.toLowerCase() === "cheer"
                        ? parseInt(event.data.amount)
                        : 0
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-blue-300">{event.type}</p>
                    <p className="text-sm text-purple-500">
                      {event.data.displayName} {getEventCount(event)}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-gray-400">
                  {formatTimestamp(event.timestamp)}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

const formatTimestamp = (timestamp: number) => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

export function Dashboard() {
  const { organization } = useOrganization();

  return (
    <Container isDashboard maxWidth="full">
      <DashboardHeader
        category="Widgets"
        title="Dashboard"
        description=""
        keyModalText=""
        buttonUrl={``}
        buttonText=""
        backText=""
      />
      <div className="flex items-center justify-between mb-2">
        <OrganizationSwitcher
          appearance={{
            elements: {
              organizationPreviewAvatarBox: "size-6",
            },
          }}
        />
      </div>
      <div className="my-4">
        <div className="columns-1 gap-4 space-y-4 sm:columns-2 lg:columns-3">
          <AnimatedCard className="mb-4 break-inside-avoid">
            <LiveStatusCard />
          </AnimatedCard>

          <AnimatedCard className="mb-4 break-inside-avoid">
            <UserDetailsCard />
          </AnimatedCard>

          <AnimatedCard className="break-inside-avoid">
            <NowPlayingCard />
          </AnimatedCard>

          {organization && (
            <AnimatedCard className="mb-4 break-inside-avoid">
              <div className="break-inside-avoid">
                <h2 className="text-md mb-2 font-semibold text-purple-400">
                  Organization
                </h2>
                <p className="text-sm text-blue-300">{organization.name}</p>
                <p className="text-xs text-purple-500">{`${organization.membersCount} members`}</p>
              </div>
            </AnimatedCard>
          )}

          <AnimatedCard className="break-inside-avoid">
            <ConnectedAccountsCard />
          </AnimatedCard>
        </div>
      </div>
    </Container>
  );
}
