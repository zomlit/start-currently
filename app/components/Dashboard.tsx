import React, { useState } from "react";
import { useOrganization, OrganizationSwitcher } from "@clerk/tanstack-start";
import DashboardHeader from "./DashboardHeader";
import { Container } from "./layout/Container";
import AnimatedCard from "./AnimatedCard";
import UserDetailsCard from "./UserDetailsCard";
import { useSession } from "@clerk/tanstack-start";
import DashboardNavigation from "./DashboardNavigation";

const ConnectedAccountsCard = () => {
  const { session } = useSession();

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

  return (
    <div className="">
      <h2 className="mb-2 flex items-center text-lg font-bold text-primary">
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
                  <p className="text-sm text-purple-200">{account.username}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-300">No connected accounts</p>
      )}
    </div>
  );
};

export function Dashboard() {
  const { organization } = useOrganization();
  const [latestAlert, setLatestAlert] = useState(null);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [isTogglingSession, setIsTogglingSession] = useState(false);
  const [sessionError, setSessionError] = useState("");

  return (
    <>
      <DashboardNavigation />
      <Container isDashboard maxWidth="7xl">
        <DashboardHeader
          category="Widgets"
          title="Dashboard"
          description=""
          keyModalText=""
          buttonUrl={``}
          buttonText=""
          backText=""
        />
        <div className="my-6">
          <div className="my-2 text-right">
            <OrganizationSwitcher
              appearance={{
                elements: {
                  organizationPreviewAvatarBox: "size-6",
                },
              }}
            />
          </div>

          <div className="columns-1 gap-4 space-y-4 sm:columns-2 lg:columns-3">
            <AnimatedCard className="mb-4 break-inside-avoid">
              <UserDetailsCard />
            </AnimatedCard>
            {organization && (
              <AnimatedCard className="mb-4 break-inside-avoid">
                <div className="break-inside-avoid">
                  <h2 className="text-md mb-2 font-semibold text-purple-400">
                    Organization
                  </h2>
                  <p className="text-sm text-blue-300">{organization.name}</p>
                  <p className="text-xs text-purple-200">{`${organization.membersCount} members`}</p>
                </div>
              </AnimatedCard>
            )}

            <AnimatedCard className="break-inside-avoid">
              <ConnectedAccountsCard />
            </AnimatedCard>
          </div>
        </div>
      </Container>
    </>
  );
}
