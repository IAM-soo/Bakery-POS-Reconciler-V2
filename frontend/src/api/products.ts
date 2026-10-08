import type { ProductCreate, ProductRead } from "../types/product"

const API_URL = import.meta.env.VITE_API_URL

export async function getProducts(): Promise<ProductRead[]> {

  const res = await fetch(`${API_URL}/products/`, {
    method:"GET"
  })

  if (!res.ok){
    throw new Error("Failed to load products")
  }
  
  const products = await res.json()

  return products

}

export async function createProduct(payload: ProductCreate): Promise<ProductRead> {
  const res = await fetch(`${API_URL}/products/`, {
    method:"POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload)
  })
  
  if (!res.ok){
    throw new Error("Failed to create product")
  }

  const products = await res.json()

  return products

}
