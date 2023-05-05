defmodule Chatboi.Repo.Migrations.CreateChats do
  use Ecto.Migration

  def change do
    create table(:chat_messages) do
      add :author, :string, null: false
      add :room, :string, null: false
      add :message, :string, null: false

      timestamps()
    end

    create index(:chat_messages, :room)
  end
end
