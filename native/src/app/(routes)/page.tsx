"use client";
import Checkbox from "@/components/checkbox";
import { useWebSocketStatus } from "@/components/providers/websocket-status-provider";
import {
  IconCheck,
  IconCheckbox,
  IconCircleArrowDown,
  IconSquare,
} from "@tabler/icons-react";
import React from "react";

type Props = {};

const Status = (props: Props) => {
  const status = useWebSocketStatus();
  if (!status) return <div>Waiting on websocket server...</div>;

  const { on, disable, enable, connected, waitingToReconnect, reconnecting } =
    status;

  const toggleWebSocketServer = (
    on: boolean,
    disable: Function,
    enable: Function
  ) => {
    on ? disable() : enable();
  };

  return (
    <>
      <p className="text-gray-200 p-4">
        When shutting down the server, please refresh the browser source to
        re-establish the connection and configure the teams. Disconnecting will
        terminate the connection between this application and the site.
      </p>
      {/* <Checkbox
        checked={on}
        label={on ? "Turn Off" : "Turn On"}
        classes={{
          root: "flex justify-start items-center gap-3",
          checked: `cursor-pointer ${
            reconnecting ? "text-yellow-400" : "text-green-400"
          }`,
          unchecked: `cursor-pointer ${
            waitingToReconnect ? "text-yellow-400" : "text-red-400"
          }`,
        }}
        toggleChecked={() => toggleWebSocketServer(on, disable, enable)}
      /> */}

      {waitingToReconnect && (
        <span className="w-full p-6 rounded-sm bg-yellow-400 flex gap-3">
          Waiting to {on ? "Reconnect" : "Disconnect"}{" "}
          <IconCircleArrowDown className="animate-spin" />
        </span>
      )}

      {reconnecting && (
        <span className="w-full p-6 rounded-sm bg-yellow-400 flex gap-3">
          Reconnecting <IconCircleArrowDown className="animate-spin" />
        </span>
      )}

      {connected && (
        <div className="w-full p-6 rounded-sm bg-green-400">
          Websocket Server is Connected (please refresh your browser source)
          {status.on}
        </div>
      )}
      {!connected && !reconnecting && !waitingToReconnect && (
        <div className="w-full p-6 rounded-sm bg-red-400">
          Websocket Server is Disconnected
        </div>
      )}
    </>
  );
};

export default Status;
