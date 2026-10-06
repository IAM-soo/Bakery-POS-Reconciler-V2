export type ReconciliationMode =
  | 'POS_GT_CAT'
  | 'CAT_GT_POS'
  | 'MATCH'

export interface ReconcileRequest {
  pos_amounts: Record<string, number>
  cat_amounts_temp: Record<string, number>
}

export interface ComparisonResult {
  method: string
  pos_amount: number
  cat_amount: number
  difference: number
  mode: ReconciliationMode
}

export interface CorrectionRequest {
  cancelled_amount: number
  difference: number
  mode: ReconciliationMode
}

export interface CombinationItem {
  item_name: string
  price: number
  quantity: number
}

export interface CombinationResult {
  combination_number: number
  items: CombinationItem[]
  total: number
}