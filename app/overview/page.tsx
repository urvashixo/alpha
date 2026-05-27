import Link from "next/link";
import AdminSidebar from "../components/admin-sidebar";
import TopNavbar from "../components/top-navbar";
import { getAllProducts } from "../lib/products";

export default async function OverviewPage() {
  const products = await getAllProducts();
  const totalProducts = products.length;
  const totalValue = products.reduce((sum, item) => sum + item.price * item.stock, 0);
  const avgRating =
    products.reduce((sum, item) => sum + item.rating, 0) / (products.length || 1);

  return (
    <div className="dashboard-grid min-h-screen p-3 md:p-5">
      <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-4 lg:grid-cols-[250px_1fr]">
        <AdminSidebar currentPath="/overview" />
        <main className="space-y-4">
          <TopNavbar title="Overview" description="Quick snapshot of the product ecosystem." />

          <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <article className="glass rounded-xl p-4">
              <p className="text-xs text-[var(--muted)]">Total Products</p>
              <p className="mt-1 text-2xl font-semibold">{totalProducts}</p>
            </article>
            <article className="glass rounded-xl p-4">
              <p className="text-xs text-[var(--muted)]">Avg Rating</p>
              <p className="mt-1 text-2xl font-semibold">{avgRating.toFixed(2)}</p>
            </article>
            <article className="glass rounded-xl p-4">
              <p className="text-xs text-[var(--muted)]">Inventory Value</p>
              <p className="mt-1 text-2xl font-semibold">${Math.round(totalValue).toLocaleString()}</p>
            </article>
          </section>

          <section className="glass rounded-2xl p-4">
            <p className="text-sm text-[var(--muted)]">Navigate to module</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Link href="/products" className="rounded-lg bg-[var(--accent)] px-3 py-2 text-sm font-medium text-white">
                Open Products
              </Link>
              <Link href="/analytics" className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm">
                Open Analytics
              </Link>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
