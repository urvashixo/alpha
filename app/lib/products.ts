import { ProductsResponse } from "../types/product";

export async function getAllProducts() {
  const response = await fetch("https://dummyjson.com/products?limit=194", {
    next: { revalidate: 60 },
  });
  const data = (await response.json()) as ProductsResponse;
  return data.products ?? [];
}
