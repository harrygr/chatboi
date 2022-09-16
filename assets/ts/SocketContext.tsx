import { Socket } from "phoenix";
import React from "react";

export const SocketContext = React.createContext<Socket | null>(null);

interface Props {
  children: React.ReactNode;
}

export const SocketProvider: React.FC<Props> = ({ children }) => {
  const [socket, setSocket] = React.useState<Socket | null>(null);

  React.useEffect(() => {
    const socket = new Socket("/socket");
    socket.connect();
    setSocket(socket);

    return () => {
      socket.disconnect();
    };
  }, []);

  if (!socket) {
    return null;
  }
  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};

export const useSocket = () => {
  const socket = React.useContext(SocketContext);

  if (!socket) {
    throw new Error("useSocket must be used inside a SocketProvider");
  }
  return socket;
};
