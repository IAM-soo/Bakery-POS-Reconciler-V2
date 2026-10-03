import { useEffect, useState } from "react"
import type { ProductRead } from "../types/product"
import { getProducts } from "../api/products"

const API_URL = import.meta.env.VITE_API_URL

export default function productForm(){

  const [products, setProducts] = useState<ProductRead[]>([]);
  
  useEffect(() => {
    try {
      const data = getProducts()
      console.log(data)
      setProducts(data)
    } catch (error) {
      console.error('Failed to load products', error)
    }
    
  })

  return{

  }
}
