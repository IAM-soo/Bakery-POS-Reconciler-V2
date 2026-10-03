import type { ProductCreate, ProductRead } from "../types/product"

const API_URL = "http://127.0.0.1:8000"

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

export async function createProduct(product_data: ProductCreate): Promise<ProductRead> {
  const res = await fetch(`${API_URL}/products/`, {
    method:"POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(product_data)
  })
  
  if (!res.ok){
    throw new Error("Failed to create product")
  }

  const products = await res.json()

  return products

}