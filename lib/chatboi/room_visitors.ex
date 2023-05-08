defmodule Chatboi.RoomVisitors do
  use GenServer

  def start_link(default) do
    GenServer.start_link(__MODULE__, default, name: Chatboi.RoomVisitors)
  end

  def get_visitors(room) do
    GenServer.call(__MODULE__, {:get_visitors, room})
  end

  def add_visitor(room, username) do
    GenServer.call(__MODULE__, {:add_visitor, room, username})
  end

  def remove_visitor(room, username) do
    GenServer.call(__MODULE__, {:remove_visitor, room, username})
  end

  @impl true
  def init(_arg) do
    {:ok, %{}}
  end

  @impl true
  def handle_call({:get_visitors, room}, _from, state) do
    {:reply, Map.get(state, room, MapSet.new([])), state}
  end

  @impl true
  def handle_call({:add_visitor, room, username}, _from, state) do
    new_visitors =
      case Map.get(state, room) do
        %MapSet{} = visitors -> MapSet.put(visitors, username)
        _ -> MapSet.new([username])
      end

    {:reply, new_visitors, Map.put(state, room, new_visitors)}
  end

  @impl true
  def handle_call({:remove_visitor, room, username}, _from, state) do
    new_visitors =
      case Map.get(state, room) do
        %MapSet{} = visitors -> MapSet.delete(visitors, username)
        _ -> MapSet.new([])
      end

    new_state =
      if MapSet.size(new_visitors) == 0,
        do: Map.delete(state, room),
        else: Map.put(state, room, new_visitors)

    {:reply, new_visitors, new_state}
  end
end
