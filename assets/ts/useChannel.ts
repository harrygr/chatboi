import { Channel } from "phoenix";
import React from "react";
import { useSocket } from "./SocketContext";

type ConnectionState = "connected" | "connecting" | "disconnected";

export const useChannel = (
  name: string,
  onJoin: (payload: unknown) => void = () => null
) => {
  const socket = useSocket();
  const channel = React.useRef<Channel | null>(null);
  const [connectionState, setConnectionState] =
    React.useState<ConnectionState>("disconnected");

  React.useEffect(() => {
    setConnectionState("connecting");
    channel.current = socket.channel(name);
    if (!channel.current) {
      return;
    }
    channel.current
      .join()
      .receive("ok", (resp) => {
        console.info(`Successfully joined channel: ${name}`, resp);
        onJoin(resp);
        setConnectionState("connected");
      })
      .receive("error", (resp) => {
        setConnectionState("disconnected");
        console.warn(`Unable to join channel: ${name}`, resp);
      });

    return () => {
      console.info(`Leaving channel: ${name}`);
      channel.current?.leave();
    };
  }, [name]);

  return { connectionState, channel: channel.current };
};
