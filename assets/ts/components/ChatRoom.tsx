import * as React from "react";
import * as t from "io-ts";
import { SubmitHandler, useForm } from "react-hook-form";
import { DateFromISOString } from "io-ts-types";

import { pipe } from "fp-ts/lib/function";
import * as E from "fp-ts/Either";
import * as A from "fp-ts/Array";
import { useChannel } from "../useChannel";
import { useChannelEvent } from "../useChannelEvent";
import { roomStore } from "../App";

type ConnectionState = "connected" | "connecting" | "disconnected";

const ChatMessage = t.type({
  id: t.string,
  inserted_at: DateFromISOString,
  message: t.string,
  author: t.string,
});

const InitialPayload = t.type({ initial_chats: t.array(ChatMessage) });

const ErrorResponse = t.type({ errors: t.array(t.string) });

type ChatMessage = t.TypeOf<typeof ChatMessage>;

interface Props {
  room: string;
  username: string;
  leaveChat: () => void;
}

interface Fields {
  message: string;
}

const formatChatTime = (timestamp: Date) => {
  const now = new Date();

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "short",
    timeStyle: "medium",
  }).format(timestamp);
};

export const ChatRoom: React.FC<Props> = ({ room, leaveChat, username }) => {
  const id = React.useId();
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [errors, setErrors] = React.useState<Array<string>>([]);

  React.useEffect(() => {
    if (room.length < 3 || room.length > 250) {
      roomStore.setState(null);
    }
  }, []);
  const chatForm = React.useRef<HTMLFormElement | null>(null);

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
    setErrors([]);
    if (channel) {
      channel
        .push("msg", { message: data.message, author: username })
        .receive("ok", (res) => {
          pipe(
            res,
            ErrorResponse.decode,
            E.map(({ errors }) => setErrors(errors))
          );
        });
      setValue("message", "");
    }
  };

  return (
    <div className="p-6">
      <h1 className=" text-teal-900 text-4xl mb-4 ">
        <div className="font-bold">Room:</div>
        <div className="font-mono text-xl">{room}</div>
      </h1>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4"
        ref={chatForm}
      >
        <div>
          <label htmlFor={`${id}-message`}>Message</label>
          <textarea
            id={`${id}-message`}
            className="block w-full max-w-lg h-auto"
            autoComplete="off"
            {...register("message", { required: true })}
            onKeyDown={(event) => {
              if (
                event.key === "Enter" &&
                (event.metaKey || event.shiftKey) &&
                chatForm.current
              ) {
                chatForm.current.dispatchEvent(
                  new Event("submit", { bubbles: true, cancelable: true })
                );
              }
            }}
          />
          <p className="text-xs text-gray-400">
            Hint: Press Cmd+Enter to submit
          </p>
        </div>
        <div className="flex gap-2">
          <button type="submit" className="bg-teal-900 text-white px-6 py-2">
            Send
          </button>
          <button
            type="button"
            className="bg-rose-400 px-6 py-2"
            onClick={leaveChat}
          >
            Leave chat
          </button>
        </div>
        <div className="text-red-700">
          {errors.map((error) => (
            <p key={error}>{error}</p>
          ))}
        </div>
      </form>
      <div className="flex gap-2 items-center mb-3">
        <div
          className={`w-4 h-4 inline-block rounded-full ${
            connectionState === "connected"
              ? "bg-green-600"
              : connectionState === "disconnected"
              ? "bg-red-600"
              : "bg-amber-600"
          }`}
        />
        <div className="mt-[-2px]">{connectionState}</div>
      </div>
      <div>
        {messages.map((m) => (
          <div key={m.id} className="grid grid-cols-8 gap-4 mb-2">
            <div className="col-span-6">
              <h3 className="font-semibold">{m.author}</h3>
              <div className="font-light">{m.message}</div>
            </div>
            <time
              dateTime={m.inserted_at.toISOString()}
              className="font-light text-gray-400 col-span-2 text-right font-mono text-xs"
            >
              {formatChatTime(m.inserted_at)}
            </time>
          </div>
        ))}
      </div>
    </div>
  );
};
