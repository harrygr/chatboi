import { Channel, Presence } from "phoenix";
import React from "react";
import { useSocket } from "./SocketContext";

type ConnectionState = "connected" | "connecting" | "disconnected";
type PresenceItem = [string, Array<{ online_at: number }>];

export const useChannel = (
  name: string,
  params: Record<string, any> = {},
  onJoin: (payload: unknown) => void = () => null
) => {
  const socket = useSocket();
  const channel = React.useRef<Channel | null>(null);

  const [visitors, setVisitors] = React.useState<PresenceItem[]>([]);

  const [connectionState, setConnectionState] =
    React.useState<ConnectionState>("disconnected");

  React.useEffect(() => {
    setConnectionState("connecting");
    channel.current = socket.channel(name, params);
    if (!channel.current) {
      return;
    }
    const presence = new Presence(channel.current);

    presence.onSync(() => {
      const items: PresenceItem[] = [];

      presence.list((name, meta) => {
        items.push([name, meta]);
      });

      setVisitors(items);
    });

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

  return {
    connectionState,
    channel: channel.current,

    visitors,
  };
};
