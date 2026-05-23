import { Suspense } from "react";
import ProductsScreen from "./products-screen";

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-sm text-slate-600">Loading dashboard...</div>}>
      <ProductsScreen />
    </Suspense>
  );
}
