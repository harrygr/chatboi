export const createStore = (
  name: string,
  initialState: string | null = null
) => {
  const getState = () => localStorage.getItem(name);
  const listeners = new Set<() => void>();

  const setState = (newState: string | null) => {
    if (newState) {
      localStorage.setItem(name, newState);
    } else {
      localStorage.removeItem(name);
    }

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
