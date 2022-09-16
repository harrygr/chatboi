export const createQueryStore = (
  name: string,
  initialState: string | null = null
) => {
  const getState = () => {
    const params = new URLSearchParams(location.search);
    return params.get(name);
  };
  const listeners = new Set<() => void>();

  const setState = (newState: string | null) => {
    const params = new URLSearchParams(location.search);
    if (newState) {
      params.set(name, newState);
    } else {
      params.delete(name);
    }
    window.history.replaceState(
      {},
      "",
      `${location.pathname}?${params.toString()}`
    );
    listeners.forEach((l) => l());
  };

  if (initialState) {
    setState(initialState);
  }
  const subscribe = (listener: () => void) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };
  return { getState, setState, subscribe };
};
