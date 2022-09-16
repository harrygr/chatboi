defmodule Chatboi.Repo do
  use Ecto.Repo,
    otp_app: :chatboi,
    adapter: Ecto.Adapters.Postgres
end
