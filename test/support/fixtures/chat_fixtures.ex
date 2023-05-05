defmodule Chatboi.ChatFixtures do
  @moduledoc """
  This module defines test helpers for creating
  entities via the `Chatboi.Chat` context.
  """

  @doc """
  Generate a chat_message.
  """
  def chat_message_fixture(attrs \\ %{}) do
    {:ok, chat_message} =
      attrs
      |> Enum.into(%{
        message: "some message"
      })
      |> Chatboi.Chat.create_chat_message()

    chat_message
  end
end
