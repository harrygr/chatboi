import { Channel } from "phoenix";
import React from "react";
import { socket } from "./socket";

type ConnectionState = "connected" | "connecting" | "disconnected";

export const useChannel = (
  name: string,
  topic: string,
  cb: (payload: unknown) => void
) => {
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
        console.log("Joined successfully", resp);
        setConnectionState("connected");
      })
      .receive("error", (resp) => {
        setConnectionState("disconnected");
        console.log("Unable to join", resp);
      });
    channel.current.on(topic, cb);
    return () => {
      console.log("closing channel");
      channel.current?.leave();
    };
  }, [name]);

  return { connectionState, channel: channel.current };
};
