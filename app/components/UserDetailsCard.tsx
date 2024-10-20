import React from "react";
import { useAuth, useUser } from "@clerk/tanstack-start";
import { CircleUser, Copy, Handshake } from "lucide-react";
import { toast } from "@/utils/toast";

const UserDetailsCard = () => {
  const { user } = useUser();
  const { userId } = useAuth();

  if (!user || !userId) return null;

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success({ title: "Copied to clipboard" });
  };

  return (
    <div className="">
      <h2 className="relative mb-4 flex items-center gap-2 text-lg font-medium ">
        <CircleUser /> User Details
      </h2>
      <div className="flex items-center space-x-4">
        <img
          src={user.imageUrl}
          alt="User"
          className="h-16 w-16 rounded-full border-2 border-blue-400"
        />
        <div>
          <p className="text-xl font-bold text-blue-300">{`${user.username}`}</p>
          <div className="flex items-center">
            <div className="mr-2 h-2 w-2 animate-pulse rounded-full bg-green-400"></div>
            <p className="text-sm text-green-400">Active</p>
          </div>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
        <p className="text-gray-800 dark:text-gray-200">Last Sign In:</p>
        <p className="text-purple-200">{formatDate(user.lastSignInAt!)}</p>
        <p className="text-gray-800 dark:text-gray-200">Joined On:</p>
        <p className="text-purple-200">{formatDate(user.createdAt!)}</p>
        <p className="text-gray-800 dark:text-gray-200">User ID:</p>
        <div className="flex items-center justify-between rounded bg-gray-700 px-2 py-1">
          <p className="line-clamp-1 font-mono text-xs text-gray-300 blur-[1.8px]">
            {user.id}
          </p>
          <button
            onClick={() => {
              handleCopy(user.id);
              toast.success({
                title: "User ID copied to clipboard",
              });
            }}
            className="ml-2 text-blue-400 hover:text-blue-300"
          >
            <Copy className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserDetailsCard;
