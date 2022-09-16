defmodule ChatboiWeb.RoomChannel do
  use ChatboiWeb, :channel

  @impl true
  def join("room:" <> _room_id, _payload, socket) do
    {:ok, socket}
  end

  def handle_in("msg", %{"body" => body, "author" => author}, socket) do
    id = Ecto.UUID.generate()
    sent_at = DateTime.now!("Etc/UTC") |> DateTime.to_iso8601()
    broadcast!(socket, "msg", %{body: body, id: id, author: author, sent_at: sent_at})
    {:noreply, socket}
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
end
