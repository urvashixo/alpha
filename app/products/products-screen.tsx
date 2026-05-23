'use client';

import Link from "next/link";
import dynamic from "next/dynamic";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Product, ProductsResponse } from "../types/product";

const AnalyticsPanel = dynamic(() => import("./analytics-panel"), {
  ssr: false,
});

const PAGE_SIZE = 10;
const COLUMN_OPTIONS = ["image", "name", "category", "price", "stock", "rating"] as const;

type SortOption = "name" | "price" | "rating";
type ColumnOption = (typeof COLUMN_OPTIONS)[number];

export default function ProductsScreen() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState(searchParams.get("query") ?? "");

  const query = searchParams.get("query") ?? "";
  const selectedCategories = searchParams.getAll("category");
  const minRating = Number(searchParams.get("rating") ?? "0");
  const sortBy = (searchParams.get("sort") ?? "name") as SortOption;
  const page = Number(searchParams.get("page") ?? "1");
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
      const searchMatch =
        normalized.length === 0 ||
        product.title.toLowerCase().includes(normalized) ||
        product.description.toLowerCase().includes(normalized);
      const categoryMatch =
        selectedCategories.length === 0 || selectedCategories.includes(product.category);
      const ratingMatch = product.rating >= minRating;
      return searchMatch && categoryMatch && ratingMatch;
    });

    const sorted = [...productList];
    sorted.sort((a, b) => {
      if (sortBy === "price") return a.price - b.price;
      if (sortBy === "rating") return b.rating - a.rating;
      return a.title.localeCompare(b.title);
    });
    return sorted;
  }, [allProducts, minRating, query, selectedCategories, sortBy]);

  const pageCount = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE));
  const currentPage = Math.min(pageCount, Math.max(1, page));
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredProducts.slice(start, start + PAGE_SIZE);
  }, [currentPage, filteredProducts]);

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

  const navItems: Array<{ label: string; active: boolean }> = [
    { label: "Overview", active: true },
    { label: "Products", active: true },
    { label: "Analytics", active: false },
    { label: "Reports", active: false },
    { label: "Settings", active: false },
  ];

  return (
    <div className="dashboard-grid min-h-screen p-3 md:p-5">
      <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-4 lg:grid-cols-[250px_1fr]">
        <aside className="glass rounded-2xl p-4 lg:sticky lg:top-5 lg:h-[calc(100vh-2.5rem)]">
          <div className="mb-8 flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-[var(--accent)]" />
            <div>
              <p className="text-sm text-[var(--muted)]">Project</p>
              <h1 className="text-lg font-semibold">Alpha Console</h1>
            </div>
          </div>
          <nav className="space-y-2 text-sm">
            {navItems.map(({ label, active }) => (
              <div
                key={label}
                className={`rounded-lg px-3 py-2 ${active ? "bg-[var(--accent-soft)] font-medium" : "text-[var(--muted)]"}`}
              >
                {label}
              </div>
            ))}
          </nav>
          <section className="mt-8 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3">
            <p className="text-xs text-[var(--muted)]">User profile</p>
            <p className="mt-1 font-semibold">Jane Diaz</p>
            <p className="font-mono text-xs text-[var(--muted)]">jane.diaz@example.com</p>
          </section>
        </aside>

        <main className="space-y-4">
          <header className="glass rounded-2xl p-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold">Product Dashboard</h2>
                <p className="text-sm text-[var(--muted)]">
                  Responsive product management with URL-driven state.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm">
                  Feedback
                </button>
                <button className="rounded-lg bg-[var(--accent)] px-3 py-2 text-sm font-medium text-white">
                  Actions
                </button>
              </div>
            </div>
          </header>

          <AnalyticsPanel products={filteredProducts} />

          <section className="glass rounded-2xl p-4">
            <div className="mb-3 grid grid-cols-1 gap-3 xl:grid-cols-[1fr_auto_auto_auto]">
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
              <button
                onClick={() =>
                  updateParams({ query: null, category: null, rating: null, sort: "name", page: "1" })
                }
                className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
              >
                Reset
              </button>
            </div>

            <div className="mb-3 flex flex-wrap gap-2">
              {categories.map((category) => {
                const selected = selectedCategories.includes(category);
                return (
                  <button
                    key={category}
                    onClick={() => toggleCategory(category)}
                    className={`rounded-full border px-3 py-1 text-xs capitalize transition ${
                      selected
                        ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]"
                        : "border-[var(--border)] bg-[var(--surface)]"
                    }`}
                  >
                    {category}
                  </button>
                );
              })}
            </div>

            <div className="mb-4 flex flex-wrap gap-2 text-xs">
              {COLUMN_OPTIONS.map((column) => (
                <button
                  key={column}
                  onClick={() => toggleColumn(column)}
                  className={`rounded-md border px-2 py-1 capitalize ${
                    columns.includes(column)
                      ? "border-[var(--accent)] bg-[var(--accent-soft)]"
                      : "border-[var(--border)] bg-[var(--surface)]"
                  }`}
                >
                  {column}
                </button>
              ))}
            </div>

            <div className="overflow-x-auto rounded-xl border border-[var(--border)]">
              <table className="w-full min-w-[760px] bg-[var(--surface)] text-left text-sm">
                <thead className="bg-[var(--surface-soft)] text-xs uppercase tracking-wide text-[var(--muted)]">
                  <tr>
                    {columns.includes("image") && <th className="px-3 py-2">Image</th>}
                    {columns.includes("name") && <th className="px-3 py-2">Product Name</th>}
                    {columns.includes("category") && <th className="px-3 py-2">Category</th>}
                    {columns.includes("price") && <th className="px-3 py-2">Price</th>}
                    {columns.includes("stock") && <th className="px-3 py-2">Stock Status</th>}
                    {columns.includes("rating") && <th className="px-3 py-2">Rating</th>}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td className="px-3 py-6 text-center text-[var(--muted)]" colSpan={6}>
                        Loading products...
                      </td>
                    </tr>
                  ) : paginatedProducts.length === 0 ? (
                    <tr>
                      <td className="px-3 py-6 text-center text-[var(--muted)]" colSpan={6}>
                        No products match the current filters.
                      </td>
                    </tr>
                  ) : (
                    paginatedProducts.map((product) => (
                      <MemoProductRow key={product.id} product={product} columns={columns} />
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <p className="text-xs text-[var(--muted)]">
                Showing {(currentPage - 1) * PAGE_SIZE + 1}-{Math.min(currentPage * PAGE_SIZE, filteredProducts.length)} of {filteredProducts.length}
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

function ProductRow({ product, columns }: { product: Product; columns: ColumnOption[] }) {
  const stockStatus = product.stock > 20 ? "In Stock" : product.stock > 0 ? "Low Stock" : "Out of Stock";
  return (
    <tr className="border-t border-[var(--border)]">
      {columns.includes("image") && (
        <td className="px-3 py-2">
          <img src={product.thumbnail} alt={product.title} className="h-11 w-11 rounded-md object-cover" />
        </td>
      )}
      {columns.includes("name") && (
        <td className="px-3 py-2 font-medium">
          <Link href={`/products/${product.id}`} className="hover:underline">
            {product.title}
          </Link>
        </td>
      )}
      {columns.includes("category") && <td className="px-3 py-2 capitalize">{product.category}</td>}
      {columns.includes("price") && <td className="px-3 py-2">${product.price.toFixed(2)}</td>}
      {columns.includes("stock") && (
        <td className="px-3 py-2">
          <span className="rounded-full bg-[var(--surface-soft)] px-2 py-1 text-xs">{stockStatus}</span>
        </td>
      )}
      {columns.includes("rating") && <td className="px-3 py-2">{product.rating.toFixed(2)}</td>}
    </tr>
  );
}

const MemoProductRow = memo(ProductRow);
