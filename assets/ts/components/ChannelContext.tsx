import { Channel } from "phoenix";
import * as React from "react";
import { socket } from "../socket";

interface Props {
  name: string;
  children: React.ReactNode;
}
type ConnectionState = "connected" | "connecting" | "disconnected";

const ChannelContext = React.createContext<{
  channel: Channel;
  connectionState: ConnectionState;
} | null>(null);

export const ChannelProvider: React.FC<Props> = ({ name, children }) => {
  const channel = React.useRef<Channel>(socket.channel(name));
  const [connectionState, setConnectionState] =
    React.useState<ConnectionState>("disconnected");

  React.useEffect(() => {
    setConnectionState("connecting");

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

    return () => {
      console.log("closing channel");
      channel.current?.leave();
    };
  }, [name]);

  return (
    <ChannelContext.Provider
      value={{ channel: channel.current, connectionState }}
    >
      {children}
    </ChannelContext.Provider>
  );
};

export const useChannel = () => {
  const context = React.useContext(ChannelContext);
  if (!context) {
    throw new Error("useChannelContext must be used inside a ChannelProvider");
  }

  return context;
};
