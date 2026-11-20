// Tiny data hooks with a shared cache, so moving between pages doesn't refetch or flash.
import { useEffect, useState } from "react";
import { getCollection, getKit } from "./backend";
import type { Kit } from "./types";

const cache = new Map<string, Promise<unknown>>();
function once<T>(key: string, load: () => Promise<T>): Promise<T> {
  if (!cache.has(key)) cache.set(key, load().catch((e) => { cache.delete(key); throw e; }));
  return cache.get(key) as Promise<T>;
}

type State<T> = { data: T | undefined; error: Error | null; loading: boolean };

function useAsync<T>(key: string, load: () => Promise<T>): State<T> {
  const [state, setState] = useState<State<T>>({ data: undefined, error: null, loading: true });
  useEffect(() => {
    let live = true;
    setState((s) => ({ ...s, loading: true, error: null }));
    once(key, load).then(
      (data) => live && setState({ data, error: null, loading: false }),
      (error: Error) => live && setState({ data: undefined, error, loading: false }),
    );
    return () => { live = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return state;
}

export const useCollection = (handle = "kits") => useAsync<Kit[]>(`c:${handle}`, () => getCollection(handle));
export const useKit = (handle: string) => useAsync<Kit | null>(`k:${handle}`, () => getKit(handle));
