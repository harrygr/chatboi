import * as React from "react";
import * as t from "io-ts";
import { SubmitHandler, useForm } from "react-hook-form";

import { pipe } from "fp-ts/lib/function";
import * as E from "fp-ts/Either";
import * as A from "fp-ts/Array";
import { useChannel } from "./ChannelContext";

type ConnectionState = "connected" | "connecting" | "disconnected";

const ChatMessage = t.type({
  id: t.string,
  sent_at: t.string,
  body: t.string,
  author: t.string,
});

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
  const { connectionState, channel } = useChannel();

  React.useEffect(() => {
    const handler = (payload: unknown) => {
      pipe(
        payload,
        ChatMessage.decode,
        E.map((newMessage) => setMessages(A.concat([newMessage])))
      );
    };

    const ref = channel.on("msg", handler);

    return () => channel.off("msg", ref);
  });

  const onSubmit: SubmitHandler<Fields> = (data) => {
    if (channel) {
      channel.push("msg", { body: data.message, author: username });
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
            <span className="font-semibold">{m.author}:</span> {m.body}
          </div>
        ))}
      </div>
    </div>
  );
};
