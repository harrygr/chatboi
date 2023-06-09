import * as React from "react";

import { ChatRoom } from "./components/ChatRoom";
import { IntroForm } from "./components/IntroForm";
import { createQueryStore } from "./queryStorage";
import { SocketProvider } from "./SocketContext";
import { createStore } from "./storage";

const nameStore = createStore("chatboi_username");
export const roomStore = createQueryStore("room");

interface Props {}

export const App: React.FC<Props> = ({}) => {
  const username = React.useSyncExternalStore(
    nameStore.subscribe,
    nameStore.getState
  );
  const room = React.useSyncExternalStore(
    roomStore.subscribe,
    roomStore.getState
  );

  const [inRoom, setInRoom] = React.useState(() => !!username && !!room);

  const enterChat = ({
    username,
    room,
  }: {
    room: string;
    username: string;
  }) => {
    nameStore.setState(username);
    roomStore.setState(room);
    setInRoom(true);
  };

  const leaveChat = () => {
    setInRoom(false);
  };

  return (
    <div className="p-6">
      {username && room && inRoom ? (
        <SocketProvider>
          <ChatRoom room={room} username={username} leaveChat={leaveChat} />
        </SocketProvider>
      ) : (
        <IntroForm
          enterChat={enterChat}
          initialFields={{
            username: username || undefined,
            room: room || undefined,
          }}
        />
      )}
    </div>
  );
};
