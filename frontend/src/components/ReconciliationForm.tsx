import {
  useState,
  type ChangeEvent,
  type KeyboardEvent,
  type SubmitEvent,
} from "react";

import { POS_METHODS, CAT_PAYMENT_GROUPS } from "../constants/paymentMethods";
import {
  reconcilePayments,
  getCorrectionCombinations,
} from "../api/reconciliation";
import type {
  ComparisonResult,
  ReconcileRequest,
  CombinationResult,
  CorrectionRequest,
} from "../types/reconciliation";

const initialPosAmounts: Record<string, number> = Object.fromEntries(
  POS_METHODS.map((method) => [method, 0]),
);

const CAT_METHODS = Object.values(CAT_PAYMENT_GROUPS).flat();

const initialCatAmounts: Record<string, number> = Object.fromEntries(
  CAT_METHODS.flatMap((method) => [
    [`${method}_sales`, 0],
    [`${method}_cancel`, 0],
  ]),
);

const initialCancelEnabled: Record<string, boolean> = Object.fromEntries(
  CAT_METHODS.map((method) => [method, false]),
);

export default function ReconciliationForm() {
  const [posAmounts, setPosAmounts] =
    useState<Record<string, number>>(initialPosAmounts);

  const [catAmounts, setCatAmounts] =
    useState<Record<string, number>>(initialCatAmounts);

  const [cancelEnabled, setCancelEnabled] =
    useState<Record<string, boolean>>(initialCancelEnabled);

  const [comparisonResults, setComparisonResults] = useState<
    ComparisonResult[]
  >([]);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const [error, setError] = useState<string | null>(null);

  const [selectedMethod, setSelectedMethod] = useState<string>("");

  const [cancelledAmount, setCancelAmount] = useState<number>(0);

  const [combinationResults, setCombinationResults] = useState<
    CombinationResult[]
  >([]);

  const [hasSearchedCombinations, setHasSearchedCombinations] =
    useState<boolean>(false);

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
      }));
    }
  }

  function handleSelectedValueChange(e: ChangeEvent<HTMLSelectElement>) {
    setSelectedMethod(e.target.value);
    setCombinationResults([]);
    setHasSearchedCombinations(false);
    setCancelAmount(0);
  }

  function handleAmountKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key !== "Enter") {
      return;
    }

    e.preventDefault();

    const form = e.currentTarget.form;
    if (!form) {
      return;
    }

    const visibleAmountInputs = Array.from(
      form.querySelectorAll<HTMLInputElement>('input[type="number"]'),
    ).filter((input) => !input.disabled && input.offsetParent !== null);

    const currentIndex = visibleAmountInputs.indexOf(e.currentTarget);
    visibleAmountInputs[currentIndex + 1]?.focus();
  }

  function handleReset() {
    setPosAmounts({ ...initialPosAmounts });
    setCatAmounts({ ...initialCatAmounts });
    setCancelEnabled({ ...initialCancelEnabled });
    setComparisonResults([]);
    setSelectedMethod("");
    setCancelAmount(0);
    setCombinationResults([]);
    setHasSearchedCombinations(false);
    setError(null);
  }

  async function handleReconcileSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();

    const payload: ReconcileRequest = {
      pos_amounts: posAmounts,
      cat_amounts_temp: catAmounts,
    };

    setError(null);
    setSelectedMethod("");
    setCancelAmount(0);
    setCombinationResults([]);
    setHasSearchedCombinations(false);

    try {
      setIsSubmitting(true);

      const results = await reconcilePayments(payload);
      setComparisonResults(results);
    } catch (error) {
      setComparisonResults([]);

      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("照合に失敗しました");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleCorrectionSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();

    setError(null);
    setHasSearchedCombinations(false);

    if (!selectedResult) {
      return;
    }

    const payload: CorrectionRequest = {
      cancelled_amount: cancelledAmount,
      difference: selectedResult.difference,
      mode: selectedResult.mode,
    };

    try {
      setIsSubmitting(true);

      const results = await getCorrectionCombinations(payload);
      setCombinationResults(results);
      setHasSearchedCombinations(true);
    } catch (error) {
      setCombinationResults([]);

      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("候補なし");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  const mismatches = comparisonResults.filter(
    (result) => result.mode !== "MATCH",
  );

  const selectedResult = mismatches.find(
    (result) => result.method === selectedMethod,
  );

  return (
    <div>
      <details className="group mb-6 rounded-md border border-zinc-300 bg-white dark:border-zinc-700 dark:bg-zinc-900" open>
        <summary className="cursor-pointer rounded-md px-4 py-3 text-sm font-semibold text-zinc-900 marker:text-zinc-400 group-open:rounded-b-none dark:text-zinc-100 dark:marker:text-zinc-600">
          使い方・注意事項
        </summary>

        <div className="border-t border-zinc-200 p-4 sm:p-5 dark:border-zinc-700">
          <div className="grid gap-6 lg:grid-cols-2">
            <section>
              <h3 className="text-xs font-semibold text-zinc-500 uppercase dark:text-zinc-400">
                入力・照合
              </h3>
              <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm font-normal leading-6 text-zinc-700 marker:font-semibold marker:text-zinc-400 dark:text-zinc-300 dark:marker:text-zinc-500">
                <li>POS金額を入力してください。</li>
                <li>CAT端末の各決済金額を入力してください。</li>
                <li>
                  CAT端末で取消がある場合は、「取消あり」にチェックを入れて、取消金額を入力してください。
                </li>
                <li>「照合」を押して差額を確認します。</li>
                <li>照合結果を確認してください。</li>
              </ol>
            </section>

            <section>
              <h3 className="text-xs font-semibold text-zinc-500 uppercase dark:text-zinc-400">
                差額修正
              </h3>
              <ol
                className="mt-3 list-decimal space-y-2 pl-5 text-sm font-normal leading-6 text-zinc-700 marker:font-semibold marker:text-zinc-400 dark:text-zinc-300 dark:marker:text-zinc-500"
                start={6}
              >
                <li>
                  差額がある場合は、差額修正ツールで差額が出ている決済方法を選択してください。
                </li>
                <li>
                  POSの注文履歴から、取消したい取引の金額を入力してください。
                </li>
                <li>
                  CAT側が多い場合は、POS側に差額分を追加する候補を確認できます。
                </li>
                <li>
                  候補内容を確認し、問題なければ対象の注文履歴を印刷してください。
                </li>
                <li>
                  対象の注文を取消し、候補通りに新しい注文を作成してください。
                </li>
              </ol>
            </section>
          </div>

          <aside className="mt-5 border-l-4 border-amber-500 bg-amber-50 px-4 py-3 dark:bg-amber-950/30">
            <h3 className="text-sm font-semibold text-amber-900 dark:text-amber-300">
              注意
            </h3>
            <ul className="mt-1 list-disc space-y-1 pl-5 text-sm font-normal leading-6 text-amber-900 dark:text-amber-200">
              <li>まだテスト版です。</li>
              <li>
                実際に修正する前に、必ずPOS画面とCAT端末の金額を再確認してください。
              </li>
            </ul>
          </aside>
        </div>
      </details>

      <form className="space-y-8" onSubmit={handleReconcileSubmit}>
        <details className="group rounded-md border border-zinc-300 dark:border-zinc-700">
          <summary className="cursor-pointer rounded-md px-4 py-3 text-sm font-semibold group-open:rounded-b-none">
            POS 金額
          </summary>
          <div className="border-t border-zinc-200 p-4 dark:border-zinc-800">
            {POS_METHODS.map((method) => (
              <div key={method}>
                <label
                  htmlFor={`pos-${method}`}
                  className="mb-1.5 block text-sm text-zinc-700 dark:text-zinc-300"
                >
                  {method}
                </label>
                <input
                  className="h-10 w-full rounded-md border border-zinc-300 bg-white px-3 text-right tabular-nums outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:border-emerald-500 dark:focus:ring-emerald-950"
                  id={`pos-${method}`}
                  name={method}
                  min={0}
                  type="number"
                  value={posAmounts[method] === 0 ? "" : posAmounts[method]}
                  onChange={handlePosValueChange}
                  onKeyDown={handleAmountKeyDown}
                />
              </div>
            ))}
          </div>
        </details>
        <details className="group rounded-md border border-zinc-300 dark:border-zinc-700">
          <summary className="cursor-pointer rounded-md px-4 py-3 text-sm font-semibold group-open:rounded-b-none">
            CAT 金額
          </summary>
          <div className="border-t border-zinc-200 p-4 dark:border-zinc-800">
            {CAT_METHODS.map((method) => (
              <div
                key={method}
                className="min-h-36 border-b border-zinc-200 pb-4 dark:border-zinc-800"
              >
                <div className="mb-2 flex items-center justify-between gap-3">
                  <label
                    htmlFor={`cat-${method}-sales`}
                    className="text-sm font-medium text-zinc-800 dark:text-zinc-200"
                  >
                    {method}
                  </label>

                  <label className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400">
                    <input
                      className="size-4 accent-emerald-700"
                      type="checkbox"
                      name={method}
                      checked={cancelEnabled[method]}
                      onChange={handleCheckBoxValueChange}
                    />
                    取消あり
                  </label>
                </div>

                <input
                  id={`cat-${method}-sales`}
                  className="h-10 w-full rounded-md border border-zinc-300 bg-white px-3 text-right tabular-nums outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:border-emerald-500 dark:focus:ring-emerald-950"
                  name={`${method}_sales`}
                  min={0}
                  type="number"
                  value={
                    catAmounts[`${method}_sales`] === 0
                      ? ""
                      : catAmounts[`${method}_sales`]
                  }
                  onChange={handleCatSalesValueChange}
                  onKeyDown={handleAmountKeyDown}
                />

                {cancelEnabled[method] && (
                  <div className="mt-3">
                    <label
                      htmlFor={`cat-${method}-cancel`}
                      className="mb-1 block text-xs text-zinc-600 dark:text-zinc-400"
                    >
                      取消額
                    </label>

                    <input
                      id={`cat-${method}-cancel`}
                      className="h-10 w-full rounded-md border border-red-200 bg-red-50 px-3 text-right tabular-nums outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100 dark:border-red-900 dark:bg-red-950/40 dark:text-red-100 dark:focus:border-red-600 dark:focus:ring-red-950"
                      name={`${method}_cancel`}
                      min={0}
                      type="number"
                      value={
                        catAmounts[`${method}_cancel`] === 0
                          ? ""
                          : catAmounts[`${method}_cancel`]
                      }
                      onChange={handleCatCancelValueChange}
                      onKeyDown={handleAmountKeyDown}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </details>
        <div className="flex justify-end gap-3">
          <button
            className="h-10 rounded-md border border-zinc-300 bg-white px-5 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
            type="button"
            disabled={isSubmitting}
            onClick={handleReset}
          >
            リセット
          </button>
          <button
            className="h-10 min-w-32 rounded-md bg-emerald-700 px-5 text-sm font-semibold text-white transition hover:bg-emerald-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "照合中..." : "照合"}
          </button>
        </div>
      </form>

      {error && (
        <p
          className="mt-6 border-l-4 border-red-500 bg-red-50 px-4 py-3 text-sm text-red-800 dark:bg-red-950/40 dark:text-red-200"
          role="alert"
        >
          {error}
        </p>
      )}

      {comparisonResults.length > 0 && (
        <section
          className="mt-8 border-t border-zinc-200 pt-5 dark:border-zinc-800"
          aria-live="polite"
        >
          <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            照合結果
          </h2>

          <div className="divide-y divide-zinc-200 border-y border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
            {comparisonResults.map((result) => (
              <div className="py-3" key={result.method}>
                {result.mode === "MATCH" ? (
                  <div className="flex min-h-8 items-center justify-between gap-4">
                    <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                      {result.method}
                    </span>
                    <span className="text-sm font-semibold text-emerald-700">
                      OK
                    </span>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between gap-4">
                      <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                        {result.method}
                      </h3>
                      <span className="text-xs font-medium text-amber-800 dark:text-amber-400">
                        {result.mode === "POS_GT_CAT"
                          ? "POS側が多い"
                          : result.mode === "CAT_GT_POS"
                            ? "CAT側が多い"
                            : result.mode}
                      </span>
                    </div>

                    <dl className="mt-3 grid grid-cols-3 gap-3">
                      <div>
                        <dt className="text-xs text-zinc-500 dark:text-zinc-400">
                          POS
                        </dt>
                        <dd className="mt-1 text-sm font-medium tabular-nums text-zinc-900 dark:text-zinc-100">
                          ¥{result.pos_amount.toLocaleString()}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs text-zinc-500 dark:text-zinc-400">
                          CAT
                        </dt>
                        <dd className="mt-1 text-sm font-medium tabular-nums text-zinc-900 dark:text-zinc-100">
                          ¥{result.cat_amount.toLocaleString()}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs text-zinc-500 dark:text-zinc-400">
                          差額
                        </dt>
                        <dd className="mt-1 text-sm font-semibold tabular-nums text-red-700 dark:text-red-400">
                          ¥{result.difference.toLocaleString()}
                        </dd>
                      </div>
                    </dl>
                  </>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {mismatches.length > 0 && (
        <section className="mt-8 border-t border-zinc-200 pt-5 dark:border-zinc-800">
          <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            差額修正
          </h2>

          <div className="max-w-xl">
            <label
              className="mb-1.5 block text-sm text-zinc-700 dark:text-zinc-300"
              htmlFor="correction-method"
            >
              決済方法
            </label>
            <select
              id="correction-method"
              className="h-10 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:border-emerald-500 dark:focus:ring-emerald-950"
              value={selectedMethod}
              onChange={handleSelectedValueChange}
            >
              <option value="">決済方法を選択</option>
              {mismatches.map((result) => (
                <option key={result.method} value={result.method}>
                  {result.method}
                </option>
              ))}
            </select>
          </div>

          {selectedResult && (
            <form
              className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end"
              onSubmit={handleCorrectionSubmit}
            >
              <div className="w-full sm:max-w-sm">
                <label
                  className="mb-1.5 block text-sm text-zinc-700 dark:text-zinc-300"
                  htmlFor="cancelled-amount"
                >
                  取消取引金額
                </label>
                <input
                  id="cancelled-amount"
                  className="h-10 w-full rounded-md border border-zinc-300 bg-white px-3 text-right tabular-nums outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:border-emerald-500 dark:focus:ring-emerald-950"
                  type="number"
                  min={0}
                  value={cancelledAmount === 0 ? "" : cancelledAmount}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setCancelAmount(Number(e.target.value))
                  }
                />
              </div>

              <button
                className="h-10 rounded-md bg-zinc-900 px-5 text-sm font-semibold text-white transition hover:bg-zinc-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-white dark:focus-visible:outline-zinc-100"
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? "検索中..." : "検索"}
              </button>
            </form>
          )}
        </section>
      )}

      {hasSearchedCombinations &&
        (combinationResults.length > 0 ? (
          <section
            className="mt-8 border-t border-zinc-200 pt-5 dark:border-zinc-800"
            aria-live="polite"
          >
            <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              商品組合候補
            </h2>

            <div className="grid gap-4 lg:grid-cols-3">
              {combinationResults.map((combination) => (
                <article
                  className="rounded-md border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
                  key={combination.combination_number}
                >
                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    候補 {combination.combination_number}
                  </h3>

                  <ul className="mt-3 divide-y divide-zinc-100 border-y border-zinc-100 dark:divide-zinc-800 dark:border-zinc-800">
                    {combination.items.map((item) => (
                      <li
                        className="flex items-center justify-between gap-3 py-2 text-sm"
                        key={`${item.item_name}-${item.price}`}
                      >
                        <span className="min-w-0 text-zinc-700 dark:text-zinc-300">
                          {item.item_name}
                        </span>
                        <span className="shrink-0 tabular-nums text-zinc-900 dark:text-zinc-100">
                          ¥{item.price.toLocaleString()} × {item.quantity}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <p className="mt-3 flex items-center justify-between text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    <span>合計</span>
                    <span className="tabular-nums">
                      ¥{combination.total.toLocaleString()}
                    </span>
                  </p>
                </article>
              ))}
            </div>
          </section>
        ) : (
          <section
            className="mt-8 border-t border-zinc-200 pt-5 dark:border-zinc-800"
            aria-live="polite"
          >
            <h2 className="mb-4 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              商品組合候補
            </h2>
            <p className="border-y border-zinc-200 py-4 text-sm text-zinc-600 dark:border-zinc-800 dark:text-zinc-400">
              候補なし
            </p>
          </section>
        ))}
    </div>
  );
}
