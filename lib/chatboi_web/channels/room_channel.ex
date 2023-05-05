defmodule ChatboiWeb.RoomChannel do
  use ChatboiWeb, :channel

  @impl true
  def join("room:" <> room_id, _payload, socket) do
    initial_chats = Chatboi.Chat.list_for_room(room_id) |> Enum.map(&encode_chat/1)
    {:ok, %{initial_chats: initial_chats}, socket}
  end

  def handle_in(
        "msg",
        %{"message" => body, "author" => author},
        %Phoenix.Socket{topic: "room:" <> room_id} = socket
      ) do
    case Chatboi.Chat.create_chat_message(%{message: body, author: author, room: room_id}) do
      {:ok, chat_message} ->
        broadcast!(socket, "msg", encode_chat(chat_message))
        {:noreply, socket}

      {:error, changeset} ->
        errors =
          Ecto.Changeset.traverse_errors(changeset, fn {msg, opts} ->
            Enum.reduce(opts, msg, fn {key, value}, acc ->
              String.replace(acc, "%{#{key}}", to_string(value))
            end)
          end)
          |> Enum.map(fn {key, errors} -> "#{key} #{Enum.join(errors, ", ")}" end)

        {:reply, {:ok, %{errors: errors}}, socket}
    end
  end

  # Channels can be used in a request/response fashion
  # by sending replies to requests from the client
  @impl true
  def handle_in("ping", payload, socket) do
    {:reply, {:ok, payload}, socket}
  end

  # It is also common to receive messages from the client and
  # broadcast to everyone in the current topic (room:lobby).
  @impl true
  def handle_in("shout", payload, socket) do
    broadcast(socket, "shout", payload)
    {:noreply, socket}
  end

  defp encode_chat(%Chatboi.Chat.ChatMessage{
         id: id,
         message: message,
         author: author,
         inserted_at: inserted_at
       }) do
    %{
      id: "#{id}",
      message: message,
      author: author,
      inserted_at: DateTime.from_naive!(inserted_at, "Etc/UTC")
    }
  end
end
