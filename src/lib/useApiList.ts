// 统一的数据加载 hook：组件挂载时拉取后端数据
import { useEffect, useState } from 'react';

export interface AsyncList<T> {
  data: T[];
  loading: boolean;
  error: string | null;
}

export function useApiList<T>(loader: () => Promise<T[]>): AsyncList<T> {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    loader()
      .then((res) => { if (alive) setData(res); })
      .catch((e) => { if (alive) setError(e?.message ?? '加载失败'); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { data, loading, error };
}
