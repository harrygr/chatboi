defmodule ChatboiWeb.PageController do
  use ChatboiWeb, :controller

  def index(conn, _params) do
    render(conn, "index.html")
  end
end
