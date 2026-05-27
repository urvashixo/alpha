'use client';

import Link from "next/link";
import dynamic from "next/dynamic";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Product, ProductsResponse } from "../types/product";
import AdminSidebar from "../components/admin-sidebar";
import TopNavbar from "../components/top-navbar";
import { loadSettings } from "../lib/settings-storage";

const AnalyticsPanel = dynamic(() => import("./analytics-panel"), {
  ssr: false,
});

const COLUMN_OPTIONS = ["image", "name", "category", "price", "stock", "rating"] as const;
const PUBLISHED_KEY = "alpha-published-products";

type SortOption = "name" | "price" | "rating";
type ColumnOption = (typeof COLUMN_OPTIONS)[number];

export default function ProductsScreen() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState(searchParams.get("query") ?? "");
  const [preferenceSort] = useState<SortOption>(() => loadSettings().preferences.defaultSorting);
  const [preferenceRows] = useState<10 | 25 | 50>(() => loadSettings().preferences.rowsPerPage);
  const [publishedList, setPublishedList] = useState<number[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem(PUBLISHED_KEY);
      return raw ? (JSON.parse(raw) as number[]) : [];
    } catch {
      return [];
    }
  });
  const isAdmin = typeof document !== "undefined" && document.cookie.includes("alpha-role=admin");

  const query = searchParams.get("query") ?? "";
  const selectedCategories = searchParams.getAll("category");
  const minRating = Number(searchParams.get("rating") ?? "0");
  const sortBy = (searchParams.get("sort") ?? preferenceSort) as SortOption;
  const page = Number(searchParams.get("page") ?? "1");
  const rowsPerPage = Number(searchParams.get("rows") ?? preferenceRows);
  const visibleColumns = searchParams.getAll("col") as ColumnOption[];
  const paramsSnapshot = searchParams.toString();

  useEffect(() => {
    let active = true;
    async function loadProducts() {
      setLoading(true);
      try {
        const response = await fetch("https://dummyjson.com/products?limit=194");
        const data = (await response.json()) as ProductsResponse;
        if (active) {
          setAllProducts(data.products ?? []);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }
    loadProducts();
    const interval = setInterval(loadProducts, 20000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  const publishedIds = useMemo(() => {
    if (publishedList.length > 0) {
      return new Set(publishedList);
    }
    return new Set(allProducts.map((item) => item.id));
  }, [allProducts, publishedList]);

  const updateParams = useCallback(
    (changes: Record<string, string | string[] | null>) => {
      const params = new URLSearchParams(paramsSnapshot);
      Object.entries(changes).forEach(([key, value]) => {
        params.delete(key);
        if (Array.isArray(value)) {
          value.forEach((item) => params.append(key, item));
        } else if (value !== null && value !== "") {
          params.set(key, value);
        }
      });
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [paramsSnapshot, pathname, router],
  );

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (searchInput !== query) {
        updateParams({ query: searchInput, page: "1" });
      }
    }, 350);
    return () => clearTimeout(timeout);
  }, [query, searchInput, updateParams]);

  const categories = useMemo(
    () => Array.from(new Set(allProducts.map((product) => product.category))).sort(),
    [allProducts],
  );

  const columns = useMemo<ColumnOption[]>(() => {
    if (visibleColumns.length > 0) {
      return visibleColumns;
    }
    return ["image", "name", "category", "price", "stock", "rating"];
  }, [visibleColumns]);

  const filteredProducts = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const productList = allProducts.filter((product) => {
      const publishedMatch = isAdmin || publishedIds.has(product.id);
      const searchMatch =
        normalized.length === 0 ||
        product.title.toLowerCase().includes(normalized) ||
        product.description.toLowerCase().includes(normalized);
      const categoryMatch =
        selectedCategories.length === 0 || selectedCategories.includes(product.category);
      const ratingMatch = product.rating >= minRating;
      return publishedMatch && searchMatch && categoryMatch && ratingMatch;
    });

    const sorted = [...productList];
    sorted.sort((a, b) => {
      if (sortBy === "price") return a.price - b.price;
      if (sortBy === "rating") return b.rating - a.rating;
      return a.title.localeCompare(b.title);
    });
    return sorted;
  }, [allProducts, isAdmin, minRating, publishedIds, query, selectedCategories, sortBy]);

  const togglePublished = useCallback(
    (id: number) => {
      setPublishedList((prev) => {
        const base = prev.length > 0 ? prev : allProducts.map((item) => item.id);
        const nextSet = new Set(base);
        if (nextSet.has(id)) {
          nextSet.delete(id);
        } else {
          nextSet.add(id);
        }
        const next = Array.from(nextSet);
        localStorage.setItem(PUBLISHED_KEY, JSON.stringify(next));
        return next;
      });
    },
    [allProducts],
  );

  const pageCount = Math.max(1, Math.ceil(filteredProducts.length / rowsPerPage));
  const currentPage = Math.min(pageCount, Math.max(1, page));
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredProducts.slice(start, start + rowsPerPage);
  }, [currentPage, filteredProducts, rowsPerPage]);

  const toggleCategory = useCallback(
    (category: string) => {
      const exists = selectedCategories.includes(category);
      const next = exists
        ? selectedCategories.filter((item) => item !== category)
        : [...selectedCategories, category];
      updateParams({ category: next, page: "1" });
    },
    [selectedCategories, updateParams],
  );

  const toggleColumn = useCallback(
    (column: ColumnOption) => {
      const base = columns;
      const next = base.includes(column)
        ? base.filter((item) => item !== column)
        : [...base, column];
      updateParams({ col: next });
    },
    [columns, updateParams],
  );

  const moveColumn = useCallback(
    (column: ColumnOption, direction: "left" | "right") => {
      const base = [...columns];
      const index = base.indexOf(column);
      if (index === -1) return;

      const targetIndex = direction === "left" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= base.length) return;

      const [item] = base.splice(index, 1);
      base.splice(targetIndex, 0, item);
      updateParams({ col: base });
    },
    [columns, updateParams],
  );

  return (
    <div className="dashboard-grid min-h-screen p-3 md:p-5">
      <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-4 lg:grid-cols-[250px_1fr]">
        <AdminSidebar currentPath={pathname} />

        <main className="space-y-4">
          <TopNavbar title="Product Dashboard" description="Responsive product management with URL-driven state." />

          {isAdmin && <AnalyticsPanel products={filteredProducts} />}

          <section className="glass rounded-2xl p-4">
            <div className="mb-3 grid grid-cols-1 gap-3 xl:grid-cols-[1fr_auto_auto_auto_auto]">
              <input
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Search products"
                className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--accent)]"
              />
              <select
                className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
                value={sortBy}
                onChange={(event) => updateParams({ sort: event.target.value, page: "1" })}
              >
                <option value="name">Sort by Name</option>
                <option value="price">Sort by Price</option>
                <option value="rating">Sort by Rating</option>
              </select>
              <select
                className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
                value={String(minRating)}
                onChange={(event) => updateParams({ rating: event.target.value, page: "1" })}
              >
                <option value="0">Rating 0+</option>
                <option value="2">Rating 2+</option>
                <option value="3">Rating 3+</option>
                <option value="4">Rating 4+</option>
              </select>
              <select
                className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
                value={String(rowsPerPage)}
                onChange={(event) => updateParams({ rows: event.target.value, page: "1" })}
              >
                <option value="10">10 rows</option>
                <option value="25">25 rows</option>
                <option value="50">50 rows</option>
              </select>
              <button
                onClick={() =>
                  updateParams({ query: null, category: null, rating: null, sort: null, rows: null, page: "1" })
                }
                className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
              >
                Reset
              </button>
            </div>

            <div className="mb-3">
              <details className="group relative">
                <summary className="flex cursor-pointer list-none items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm">
                  <span>
                    Categories
                    {selectedCategories.length > 0 ? ` (${selectedCategories.length} selected)` : " (All)"}
                  </span>
                  <span className="text-xs text-[var(--muted)] group-open:rotate-180 transition">v</span>
                </summary>
                <div className="absolute z-20 mt-2 max-h-64 w-full overflow-y-auto rounded-lg border border-[var(--border)] bg-[var(--surface)] p-2 shadow-lg">
                  {categories.map((category) => (
                    <label key={category} className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-[var(--surface-soft)]">
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(category)}
                        onChange={() => toggleCategory(category)}
                        className="h-4 w-4 accent-[var(--accent)]"
                      />
                      <span className="capitalize">{category}</span>
                    </label>
                  ))}
                </div>
              </details>
            </div>

            <div className="mb-4 flex flex-wrap gap-2 text-xs">
              {COLUMN_OPTIONS.map((column) => (
                <div
                  key={column}
                  className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 capitalize ${
                    columns.includes(column)
                      ? "border-[var(--accent)] bg-[var(--accent-soft)]"
                      : "border-[var(--border)] bg-[var(--surface)]"
                  }`}
                >
                  <button onClick={() => toggleColumn(column)}>{column}</button>
                  {columns.includes(column) && (
                    <>
                      <button
                        onClick={() => moveColumn(column, "left")}
                        className="rounded border border-[var(--border)] px-1"
                        aria-label={`Move ${column} left`}
                      >
                        {String.fromCharCode(8592)}
                      </button>
                      <button
                        onClick={() => moveColumn(column, "right")}
                        className="rounded border border-[var(--border)] px-1"
                        aria-label={`Move ${column} right`}
                      >
                        {String.fromCharCode(8594)}
                      </button>
                    </>
                  )}
                </div>
              ))}
            </div>

            <div className="overflow-x-auto rounded-xl border border-[var(--border)]">
              <table className="w-full min-w-[760px] bg-[var(--surface)] text-left text-sm">
                <thead className="bg-[var(--surface-soft)] text-xs uppercase tracking-wide text-[var(--muted)]">
                  <tr>
                    {columns.map((col) => (
                      <th key={col} className="px-3 py-2">
                        {col === "image" ? "Image" : col === "name" ? "Product Name" : col === "stock" ? "Stock Status" : col.charAt(0).toUpperCase() + col.slice(1)}
                      </th>
                    ))}
                    {isAdmin && <th className="px-3 py-2">Published</th>}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td className="px-3 py-6 text-center text-[var(--muted)]" colSpan={columns.length + (isAdmin ? 1 : 0)}>
                        Loading products...
                      </td>
                    </tr>
                  ) : paginatedProducts.length === 0 ? (
                    <tr>
                      <td className="px-3 py-6 text-center text-[var(--muted)]" colSpan={columns.length + (isAdmin ? 1 : 0)}>
                        No products match the current filters.
                      </td>
                    </tr>
                  ) : (
                    paginatedProducts.map((product) => (
                      <MemoProductRow
                        key={product.id}
                        product={product}
                        columns={columns}
                        isAdmin={isAdmin}
                        isPublished={publishedIds.has(product.id)}
                        onTogglePublished={togglePublished}
                      />
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <p className="text-xs text-[var(--muted)]">
                Showing {(currentPage - 1) * rowsPerPage + 1}-{Math.min(currentPage * rowsPerPage, filteredProducts.length)} of {filteredProducts.length}
              </p>
              <div className="flex items-center gap-2">
                <button
                  disabled={currentPage <= 1}
                  className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-1 text-sm disabled:opacity-45"
                  onClick={() => updateParams({ page: String(currentPage - 1) })}
                >
                  Prev
                </button>
                <span className="font-mono text-xs text-[var(--muted)]">
                  {currentPage}/{pageCount}
                </span>
                <button
                  disabled={currentPage >= pageCount}
                  className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-1 text-sm disabled:opacity-45"
                  onClick={() => updateParams({ page: String(currentPage + 1) })}
                >
                  Next
                </button>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

function ProductRow({
  product,
  columns,
  isAdmin,
  isPublished,
  onTogglePublished,
}: {
  product: Product;
  columns: ColumnOption[];
  isAdmin: boolean;
  isPublished: boolean;
  onTogglePublished: (id: number) => void;
}) {
  const stockStatus = product.stock > 20 ? "In Stock" : product.stock > 0 ? "Low Stock" : "Out of Stock";

  function renderCell(col: ColumnOption) {
    switch (col) {
      case "image":
        return <img src={product.thumbnail} alt={product.title} className="h-11 w-11 rounded-md object-cover" />;
      case "name":
        return (
          <Link href={`/products/${product.id}`} className="font-medium hover:underline">
            {product.title}
          </Link>
        );
      case "category":
        return <span className="capitalize">{product.category}</span>;
      case "price":
        return <>${product.price.toFixed(2)}</>;
      case "stock":
        return <span className="rounded-full bg-[var(--surface-soft)] px-2 py-1 text-xs">{stockStatus}</span>;
      case "rating":
        return <>{product.rating.toFixed(2)}</>;
    }
  }

  return (
    <tr className="border-t border-[var(--border)]">
      {columns.map((col) => (
        <td key={col} className="px-3 py-2">
          {renderCell(col)}
        </td>
      ))}
      {isAdmin && (
        <td className="px-3 py-2">
          <button
            onClick={() => onTogglePublished(product.id)}
            className={`rounded-full px-2 py-1 text-xs ${
              isPublished ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
            }`}
          >
            {isPublished ? "Published" : "Hidden"}
          </button>
        </td>
      )}
    </tr>
  );
}

const MemoProductRow = memo(ProductRow);
