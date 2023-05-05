import * as React from "react";
import * as t from "io-ts";
import { SubmitHandler, useForm } from "react-hook-form";
import { DateFromISOString } from "io-ts-types";

import { pipe } from "fp-ts/lib/function";
import * as E from "fp-ts/Either";
import * as A from "fp-ts/Array";
import { useChannel } from "../useChannel";
import { useChannelEvent } from "../useChannelEvent";

type ConnectionState = "connected" | "connecting" | "disconnected";

const ChatMessage = t.type({
  id: t.string,
  inserted_at: DateFromISOString,
  message: t.string,
  author: t.string,
});

const InitialPayload = t.type({ initial_chats: t.array(ChatMessage) });

type ChatMessage = t.TypeOf<typeof ChatMessage>;

interface Props {
  room: string;
  username: string;
  leaveChat: () => void;
}

interface Fields {
  message: string;
}

export const ChatRoom: React.FC<Props> = ({ room, leaveChat, username }) => {
  const id = React.useId();
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);

  const { register, handleSubmit, setValue } = useForm<Fields>();
  const { connectionState, channel } = useChannel(
    `room:${room}`,
    (joinPayload) => {
      pipe(
        joinPayload,
        InitialPayload.decode,
        E.fold(
          (error) => {
            console.error("Failed to parse chat message", error);
          },
          (payload) => setMessages(payload.initial_chats)
        )
      );
    }
  );

  const handler = React.useCallback(
    (payload: unknown) =>
      pipe(
        payload,
        ChatMessage.decode,
        E.fold(
          (error) => {
            console.error("Failed to parse chat message", error);
          },
          (newMessage) => setMessages(A.prepend(newMessage))
        )
      ),
    []
  );

  useChannelEvent(channel, "msg", handler);

  const onSubmit: SubmitHandler<Fields> = (data) => {
    if (channel) {
      channel.push("msg", { message: data.message, author: username });
      setValue("message", "");
    }
  };

  return (
    <div className="p-6">
      <h1 className=" text-teal-900 text-4xl mb-4 ">
        <div className="font-bold">Room:</div>
        <div className="font-mono text-xl">{room}</div>
      </h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor={`${id}-message`}>Message</label>
          <input
            type="text"
            id={`${id}-message`}
            className="block"
            autoComplete="off"
            {...register("message", { required: true })}
          />
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            className="bg-rose-400 px-6 py-2"
            onClick={leaveChat}
          >
            Leave chat
          </button>
          <button type="submit" className="bg-teal-900 text-white px-6 py-2">
            Send
          </button>
        </div>
      </form>
      <div className="flex gap-2 items-center">
        <div
          className={`w-3 h-3 inline-block rounded-full ${
            connectionState === "connected"
              ? "bg-green-600"
              : connectionState === "disconnected"
              ? "bg-red-600"
              : "bg-amber-600"
          }`}
        />
        {connectionState}
      </div>
      <div>
        {messages.map((m) => (
          <div key={m.id}>
            <span className="font-semibold">{m.author}:</span> {m.message}
          </div>
        ))}
      </div>
    </div>
  );
};
