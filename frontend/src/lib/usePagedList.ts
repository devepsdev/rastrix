import type { PageResponse } from "@/types/dto";
import { useCallback, useEffect, useRef, useState } from "react";

interface PagedListState<T> {
  items: T[];
  /** Total de elementos según el servidor; null hasta la primera respuesta. */
  total: number | null;
  /** Cargando la primera página (o recargando desde cero). */
  loading: boolean;
  /** Cargando una página siguiente. */
  loadingMore: boolean;
  error: Error | null;
  hasMore: boolean;
  loadMore: () => void;
  reload: () => void;
}

interface PageState<T> {
  items: T[];
  total: number | null;
  page: number;
  hasMore: boolean;
  loading: boolean;
  loadingMore: boolean;
  error: Error | null;
}

/**
 * Lista paginada acumulativa: pide la página 0 y va añadiendo las siguientes con
 * `loadMore` (pensado para `onEndReached`). Al cambiar las dependencias vuelve a
 * empezar y descarta las respuestas de la búsqueda anterior que lleguen tarde.
 */
export function usePagedList<T>(
  load: (page: number) => Promise<PageResponse<T>>,
  deps: unknown[]
): PagedListState<T> {
  const [reloadToken, setReloadToken] = useState(0);
  const requestKey = `${JSON.stringify(deps)}|${reloadToken}`;

  const [state, setState] = useState<PageState<T>>({
    items: [],
    total: null,
    page: 0,
    hasMore: false,
    loading: true,
    loadingMore: false,
    error: null,
  });
  const [activeKey, setActiveKey] = useState(requestKey);

  // Igual que en useAsync: "cargando" se marca durante el render y no en el efecto.
  // Se conservan los elementos para que una recarga no vacíe la lista.
  if (requestKey !== activeKey) {
    setActiveKey(requestKey);
    setState((previous) => ({ ...previous, loading: true, loadingMore: false, error: null }));
  }

  // La función de carga cambia en cada render; el efecto usa siempre la última.
  const loadRef = useRef(load);
  useEffect(() => {
    loadRef.current = load;
  });

  // Identifica la búsqueda vigente para ignorar respuestas de las anteriores.
  const keyRef = useRef(requestKey);

  const fetchPage = useCallback((pageNumber: number, key: string) => {
    loadRef.current(pageNumber).then(
      (response) => {
        if (key !== keyRef.current) return;
        setState((previous) => ({
          items: pageNumber === 0 ? response.content : [...previous.items, ...response.content],
          total: response.totalElements,
          page: pageNumber,
          hasMore: !response.last,
          loading: false,
          loadingMore: false,
          error: null,
        }));
      },
      (cause: unknown) => {
        if (key !== keyRef.current) return;
        const error = cause instanceof Error ? cause : new Error(String(cause));
        setState((previous) =>
          pageNumber === 0
            ? // Si falla la primera página no se muestran los resultados de la búsqueda anterior.
              { items: [], total: null, page: 0, hasMore: false, loading: false, loadingMore: false, error }
            : { ...previous, loadingMore: false, error }
        );
      }
    );
  }, []);

  useEffect(() => {
    keyRef.current = requestKey;
    fetchPage(0, requestKey);
  }, [requestKey, fetchPage]);

  const { loading, loadingMore, hasMore, page } = state;
  const loadMore = useCallback(() => {
    if (loading || loadingMore || !hasMore) return;
    setState((previous) => ({ ...previous, loadingMore: true, error: null }));
    fetchPage(page + 1, keyRef.current);
  }, [loading, loadingMore, hasMore, page, fetchPage]);

  const reload = useCallback(() => setReloadToken((token) => token + 1), []);

  return {
    items: state.items,
    total: state.total,
    loading: state.loading,
    loadingMore: state.loadingMore,
    error: state.error,
    hasMore: state.hasMore,
    loadMore,
    reload,
  };
}
