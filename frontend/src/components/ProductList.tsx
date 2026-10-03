import { useEffect, useState } from "react"
import type { ProductRead } from "../types/product"
import { getProducts } from "../api/products"

export default function ProductList(){

  const [products, setProducts] = useState<ProductRead[]>([]);
  
  useEffect(() => {
    async function loadProducts(){
      try {
        const data = await getProducts()
        console.log(data)
        setProducts(data)
      } catch (error) {
        console.error("Failed to load products", error)
      }
    }
    loadProducts()
    
  },[])


  return(
    <ul>
    {products.map((product) => (
      <li key={product.id}>
        {product.item_name} - ¥{product.price}
      </li>
    ))}
  </ul>
  )
}
