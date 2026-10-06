import { useState, type ChangeEvent, type SubmitEvent } from "react"

import { POS_METHODS, CAT_PAYMENT_GROUPS } from "../constants/paymentMethods"
import { reconcilePayments, getCorrectionCombinations } from "../api/reconciliation"
import type { ComparisonResult,  ReconcileRequest, CombinationResult, CorrectionRequest } from "../types/reconciliation";


const initialPosAmounts: Record<string, number> = Object.fromEntries(
  POS_METHODS.map((method) => [method, 0]),
)

const CAT_METHODS = Object.values(CAT_PAYMENT_GROUPS).flat()

const initialCatAmounts: Record<string, number> = Object.fromEntries(
  CAT_METHODS.flatMap((method) => [
    [`${method}_sales`, 0],
    [`${method}_cancel`, 0],
  ]),
)

const initialCancelEnabled: Record<string, boolean> =
  Object.fromEntries(
    CAT_METHODS.map((method) => [method, false]),
  )

export default function ReconciliationForm() {
  const [posAmounts, setPosAmounts] =
    useState<Record<string, number>>(initialPosAmounts)

  const [catAmounts, setCatAmounts] =
    useState<Record<string, number>>(initialCatAmounts)

  const [cancelEnabled, setCancelEnabled] = 
    useState<Record<string, boolean>>(initialCancelEnabled)

  const [comparisonResults, setComparisonResults] = 
    useState<ComparisonResult[]>([])

  const [isSubmitting, setIsSubmitting] = 
    useState<boolean>(false)
  
  const [error, setError] =
    useState<string | null>(null)
  
  const [selectedMethod, setSelectedMethod] = 
    useState<string>("")

  const [cancelledAmount, setCancelAmount] = 
    useState<number>(0)

  const [combinationResults, setCombinationResults] =
    useState<CombinationResult[]>([])
    

  function handlePosValueChange(e: ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setPosAmounts((prev) => ({
      ...prev,
      [name]: Number(value),
    }));
  }

  function handleCatSalesValueChange(e: ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setCatAmounts((prev) => ({
      ...prev,
      [name]: Number(value),
    }));
  }

  function handleCatCancelValueChange(e: ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setCatAmounts((prev) => ({
      ...prev,
      [name]: Number(value),
    }));
  }
  
  function handleCheckBoxValueChange(e: ChangeEvent<HTMLInputElement>) {
    const { name, checked } = e.target;
    setCancelEnabled((current) => ({
      ...current,
      [name]: checked,
    }));
    if (!checked) {
      setCatAmounts((current) => ({
      ...current,
      [`${name}_cancel`]: 0,
    }))
    }
  }
  

  async function handleReconcileSubmit(e: SubmitEvent<HTMLFormElement>) {

    e.preventDefault()

    const payload: ReconcileRequest = {
      pos_amounts: posAmounts,
      cat_amounts_temp: catAmounts,
    }

    setError(null)

    try {
      setIsSubmitting(true)

      const results = await reconcilePayments(payload)
      setComparisonResults(results)

    } catch (error) {

      setComparisonResults([])

      if (error instanceof Error) {
        setError(error.message)

      } else {

        setError("照合に失敗しました")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleCorrectionSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault()

    setError(null)

    if (!selectedResult) {
      return
    }

    const payload: CorrectionRequest = {
      cancelled_amount: cancelledAmount, 
      difference: selectedResult.difference, 
      mode: selectedResult.mode
    }

    try {
      setIsSubmitting(true)

      const results = await getCorrectionCombinations(payload)
      setCombinationResults(results)

    } catch (error) {
      setCombinationResults([])

      if (error instanceof Error) {
        setError(error.message)
      } else {
        setError("候補なし")
      }
    } finally {
      setIsSubmitting(false)
    }

  }


  const mismatches = comparisonResults.filter(
    (result) => result.mode !== "MATCH"
  )

  const selectedResult = mismatches.find(
    (result) => result.method === selectedMethod
  )
  

  return (
    <div>
    <form onSubmit={handleReconcileSubmit}>
    <section>
      <h2>POS 金額</h2>
      {POS_METHODS.map((method) => (
        <div key={method}>
          <label>{method}</label>
          <input 
            name={method} 
            min={0} type="number" 
            value={posAmounts[method]} 
            onChange={handlePosValueChange}
          />
        </div>
      ))}
    </section>
    <section>
      <h2>CAT 金額</h2>
      {CAT_METHODS.map((method) => (
        <div key={method}>
          <label>{method}</label>
          <input 
            name={`${method}_sales`} 
            min={0} 
            type="number" 
            value={catAmounts[`${method}_sales`]} 
            onChange={handleCatSalesValueChange}
          />
          <input
            type="checkbox"
            name={method}
            checked={cancelEnabled[method]}
            onChange={handleCheckBoxValueChange}
          />
          {cancelEnabled[method] && (
            <input
              name={`${method}_cancel`}
              min={0}
              type="number"
              value={catAmounts[`${method}_cancel`]}
              onChange={handleCatCancelValueChange}
            />
            )}
        </div>
      ))}
    </section>
    <div>
      <button 
        type="submit" 
        disabled={isSubmitting}
        >
        {isSubmitting ? "照合中..." : "照合"}
      </button>
    </div>
    </form>

    {error && (
      <p role="alert">{error}</p>
    )}

    {comparisonResults.length > 0 && (
      <section>
        <h2>照合結果</h2>
        {comparisonResults.map((result) => (
          <div key={result.method}>
            {result.mode === "MATCH" ? (
              <p>{result.method}: OK</p>
            ) : (
              <>
                <h3>{result.method}</h3>
                <p>POS: {result.pos_amount}</p>
                <p>CAT: {result.cat_amount}</p>
                <p>差額: {result.difference}</p>
                <p>結果: {result.mode}</p>
              </>
            )}
          </div>
        ))}
      </section>
    )}

    {mismatches.length > 0 && (
      <section>
        <h2>差額修正</h2>
        <select
          value={selectedMethod}
          onChange={(e) => setSelectedMethod(e.target.value)}
        >
          <option value="">決済方法を選択</option>
          {mismatches.map((result) => (
            <option key={result.method} value={result.method}>
              {result.method}
            </option>
          ))}
        </select>
      </section>
    )}

    {selectedResult && (
      <form onSubmit={handleCorrectionSubmit}>
        <section>
          <input 
            type="number"
            min={0}
            value={cancelledAmount} 
            onChange={
              (e: ChangeEvent<HTMLInputElement>) => 
                setCancelAmount(Number(e.target.value))
            }
          />
        </section>
        <div>
          <button 
            type="submit" 
            disabled={isSubmitting}
            >
            {isSubmitting ? "検索中..." : "検索"}
          </button>
        
        </div>
      </form>
    )}

    {combinationResults.length > 0 && (
      <pre>{JSON.stringify(combinationResults, null, 2)}</pre>
    )}

    </div>
    
    
  )
}
