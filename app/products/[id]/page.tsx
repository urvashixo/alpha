'use client';

import Link from "next/link";
import { useEffect, useState } from "react";
import { Product } from "../../types/product";

type ProductDetailsPageProps = {
  params: Promise<{ id: string }>;
};

export default function ProductDetailsPage({ params }: ProductDetailsPageProps) {
  const [id, setId] = useState<string>("");
  const [product, setProduct] = useState<Product | null>(null);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    params.then((resolved) => setId(resolved.id));
  }, [params]);

  useEffect(() => {
    if (!id) return;
    let active = true;
    async function loadProduct() {
      setLoading(true);
      try {
        const response = await fetch(`https://dummyjson.com/products/${id}`);
        const data = (await response.json()) as Product;
        if (active) {
          setProduct(data);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }
    loadProduct();
    return () => {
      active = false;
    };
  }, [id]);

  if (loading) {
    return <div className="p-8 text-sm text-[var(--muted)]">Loading product details...</div>;
  }

  if (!product) {
    return <div className="p-8 text-sm text-[var(--muted)]">Product not found.</div>;
  }

  const image = product.images[index] ?? product.thumbnail;

  return (
    <main className="dashboard-grid min-h-screen p-4 md:p-6">
      <div className="mx-auto max-w-5xl">
        <Link href="/products" className="mb-4 inline-block text-sm text-[var(--muted)] hover:underline">
          Back to products
        </Link>
        <section className="glass grid gap-4 rounded-2xl p-4 md:grid-cols-[1.1fr_1fr] md:p-6">
          <div>
            <img src={image} alt={product.title} className="h-[320px] w-full rounded-xl object-cover md:h-[420px]" />
            <div className="mt-3 flex flex-wrap gap-2">
              {(product.images.length > 0 ? product.images : [product.thumbnail]).map((src, idx) => (
                <button
                  key={src}
                  onClick={() => setIndex(idx)}
                  className={`overflow-hidden rounded-md border ${idx === index ? "border-[var(--accent)]" : "border-[var(--border)]"}`}
                >
                  <img src={src} alt={`${product.title} ${idx + 1}`} className="h-14 w-14 object-cover" />
                </button>
              ))}
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-semibold">{product.title}</h1>
            <p className="mt-2 text-sm text-[var(--muted)] capitalize">Category: {product.category}</p>
            <p className="mt-4 text-sm leading-6">{product.description}</p>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <Info label="Price" value={`$${product.price.toFixed(2)}`} />
              <Info label="Rating" value={product.rating.toFixed(2)} />
              <Info label="Stock" value={String(product.stock)} />
              <Info label="Product ID" value={String(product.id)} />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <article className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3">
      <p className="text-xs text-[var(--muted)]">{label}</p>
      <p className="mt-1 text-lg font-semibold">{value}</p>
    </article>
  );
}
