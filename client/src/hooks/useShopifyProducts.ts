import { useState, useEffect } from 'react';
import { fetchShopifyProducts, type ShopifyProduct } from '@/lib/shopify';

export function useShopifyProducts(first = 50, query?: string) {
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    fetchShopifyProducts(first, query)
      .then((data) => {
        if (!cancelled) setProducts(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => { cancelled = true; };
  }, [first, query]);

  return { products, isLoading, error };
}
