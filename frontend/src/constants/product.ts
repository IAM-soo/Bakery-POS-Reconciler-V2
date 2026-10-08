import type { ProductCategory } from "../types/product"

export const PRODUCT_CATEGORY: {
  value: ProductCategory
  label: string
}[] = [
  { value: "salt_bread", label: "塩パン" },
  { value: "danish", label: "デニッシュ" },
  { value: "donut", label: "ドーナツ" },
  { value: "vegetable_bread", label: "惣菜パン" },
  { value: "sweet_bread", label: "菓子パン" },
  { value: "bag", label: "袋" },
]