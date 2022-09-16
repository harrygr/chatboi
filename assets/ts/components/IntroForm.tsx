import * as React from "react";
import { SubmitHandler, useForm } from "react-hook-form";

interface Props {
  initialFields: Partial<Fields>;
  enterChat: (fields: Fields) => void;
}

interface Fields {
  username: string;
  room: string;
}

export const IntroForm: React.FC<Props> = ({ enterChat, initialFields }) => {
  const {
    handleSubmit,
    register,
    setValue,
    formState: { errors },
  } = useForm<Fields>({ defaultValues: initialFields });
  const id = React.useId();

  const onSubmit: SubmitHandler<Fields> = (data) => {
    enterChat(data);
  };

  const generateRandom = () => {
    try {
      const randomId = window.crypto.randomUUID().slice(0, 8);
      setValue("room", randomId);
    } catch {
      alert("You're not secure enough for this");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor={`${id}-username`} className="text-sm block">
          Your username
        </label>
        <input
          type="text"
          {...register("username", {
            required: "Enter your name",
            minLength: 3,
          })}
          id={`${id}-username`}
          className="block"
        />
        {errors.username?.message ? (
          <p className="text-xs text-rose-600">{errors.username.message}</p>
        ) : null}
      </div>
      <div>
        <label htmlFor={`${id}-room`} className="text-sm block">
          Room ID
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            {...register("room", {
              required: "Enter a room ID",
              minLength: 3,
            })}
            id={`${id}-room`}
            className="block"
          />
          <button
            type="button"
            onClick={generateRandom}
            className="inline-block bg-sky-300 px-4 py-2"
          >
            Random
          </button>
        </div>
        {errors.room?.message ? (
          <p className="text-xs text-rose-600">{errors.room.message}</p>
        ) : null}
      </div>
      <button type="submit" className="bg-teal-900 text-white px-6 py-2">
        Enter the chat
      </button>
    </form>
  );
};
