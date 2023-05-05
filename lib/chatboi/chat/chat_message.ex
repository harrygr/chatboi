defmodule Chatboi.Chat.ChatMessage do
  use Ecto.Schema
  import Ecto.Changeset

  schema "chat_messages" do
    field :author, :string
    field :room, :string
    field :message, :string

    timestamps()
  end

  @doc false
  def changeset(chat_message, attrs) do
    chat_message
    |> cast(attrs, [:message, :author, :room])
    |> validate_required([:message, :author, :room])
    |> validate_length(:message, min: 2, max: 800)
    |> validate_length(:author, min: 2, max: 250)
    |> validate_length(:room, min: 2, max: 250)
  end
end
