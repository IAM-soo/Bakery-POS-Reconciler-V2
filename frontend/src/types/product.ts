export type ProductCategory =
  | 'salt_bread'
  | 'danish'
  | 'donut'
  | 'vegetable_bread'
  | 'sweet_bread'
  | 'bag'

export interface ProductCreate {
  item_name: string
  price: number
  category: ProductCategory
  is_active: boolean
}

export interface ProductRead extends ProductCreate {
  id: number
}