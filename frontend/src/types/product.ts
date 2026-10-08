export type ProductCategory =
  | "salt_bread"
  | "danish"
  | "donut"
  | "vegetable_bread"
  | "sweet_bread"
  | "bag"

export interface ProductCreate {
  item_name: string
  price: number
  category: ProductCategory
}

export interface ProductRead extends ProductCreate {
  id: number
  is_active: boolean
}