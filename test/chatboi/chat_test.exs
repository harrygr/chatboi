defmodule Chatboi.ChatTest do
  use Chatboi.DataCase

  alias Chatboi.Chat

  describe "chats" do
    alias Chatboi.Chat.ChatMessage

    import Chatboi.ChatFixtures

    @invalid_attrs %{message: nil}

    test "list_chats/0 returns all chats" do
      chat_message = chat_message_fixture()
      assert Chat.list_chats() == [chat_message]
    end

    test "get_chat_message!/1 returns the chat_message with given id" do
      chat_message = chat_message_fixture()
      assert Chat.get_chat_message!(chat_message.id) == chat_message
    end

    test "create_chat_message/1 with valid data creates a chat_message" do
      valid_attrs = %{message: "some message"}

      assert {:ok, %ChatMessage{} = chat_message} = Chat.create_chat_message(valid_attrs)
      assert chat_message.message == "some message"
    end

    test "create_chat_message/1 with invalid data returns error changeset" do
      assert {:error, %Ecto.Changeset{}} = Chat.create_chat_message(@invalid_attrs)
    end

    test "update_chat_message/2 with valid data updates the chat_message" do
      chat_message = chat_message_fixture()
      update_attrs = %{message: "some updated message"}

      assert {:ok, %ChatMessage{} = chat_message} = Chat.update_chat_message(chat_message, update_attrs)
      assert chat_message.message == "some updated message"
    end

    test "update_chat_message/2 with invalid data returns error changeset" do
      chat_message = chat_message_fixture()
      assert {:error, %Ecto.Changeset{}} = Chat.update_chat_message(chat_message, @invalid_attrs)
      assert chat_message == Chat.get_chat_message!(chat_message.id)
    end

    test "delete_chat_message/1 deletes the chat_message" do
      chat_message = chat_message_fixture()
      assert {:ok, %ChatMessage{}} = Chat.delete_chat_message(chat_message)
      assert_raise Ecto.NoResultsError, fn -> Chat.get_chat_message!(chat_message.id) end
    end

    test "change_chat_message/1 returns a chat_message changeset" do
      chat_message = chat_message_fixture()
      assert %Ecto.Changeset{} = Chat.change_chat_message(chat_message)
    end
  end
end
