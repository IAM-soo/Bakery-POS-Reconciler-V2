import { useState, useRef, type SubmitEvent, type ChangeEvent } from "react";

import { createProduct } from "../api/products";
import type {
  ProductCategory,
  ProductCreate,
  ProductRead,
} from "../types/product";
import { PRODUCT_CATEGORY } from "../constants/product";

export default function ProductForm() {
  const [itemName, setItemName] = useState<string>("");

  const [price, setPrice] = useState<number>(0);

  const [selectedProductCategory, setSelectedProductCategory] = useState<
    ProductCategory | ""
  >("");

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const [error, setError] = useState<string | null>(null);

  const [pendingProduct, setPendingProduct] = useState<ProductCreate | null>(
    null,
  );

  const [products, setProducts] = useState<ProductRead|null>();

  const dialogRef = useRef<HTMLDialogElement | null>(null);

  function handleReset(){
    setItemName("")
    setPrice(0)
    setSelectedProductCategory("")
    setError(null)
    setPendingProduct(null)
    setProducts(null)
  }

  function handlePreview(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();

    setError(null);

    if (!selectedProductCategory || !price || !itemName.trim()) {
      setError("空欄がある");
      return;
    }

    setPendingProduct({
      item_name: itemName.trim(),
      price: price,
      category: selectedProductCategory,
    });

    dialogRef.current?.showModal();
  }

  async function handleProductCreate() {
    setError(null);

    if (!pendingProduct) {
      return;
    }

    try {
      setIsSubmitting(true);

      const res = await createProduct(pendingProduct);
      setProducts(res);

      setPendingProduct(null);

      setItemName("");
      setPrice(0);
      setSelectedProductCategory("");

      dialogRef.current?.close();
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("商品登録失敗");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div>
      <div>
        <form className="space-y-8 max-w-xl" onSubmit={handlePreview}>
          <div className=" border-zinc-200 p-4 dark:border-zinc-800">
            <div className="mt-4">
              <label
                htmlFor="item-name"
                className="mb-1.5 block text-sm text-zinc-800 dark:text-zinc-200"
              >
                商品名
              </label>
              <input
                className="mt-1 h-10 w-full rounded-md border border-zinc-300 bg-white px-3 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:border-emerald-500 dark:focus:ring-emerald-950"
                id="item-name"
                type="text"
                value={itemName}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setItemName(e.target.value)
                }
                maxLength={100}
                required
              />
            </div>
            <div className="mt-4">
              <label
                htmlFor="price"
                className="mb-1.5 block text-sm text-zinc-800 dark:text-zinc-200"
              >
                価格
              </label>
              <input
                className="mt-1 h-10 w-full rounded-md border border-zinc-300 bg-white px-3 tabular-nums outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:border-emerald-500 dark:focus:ring-emerald-950"
                id="price"
                type="number"
                value={price === 0 ? "" : price}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setPrice(Number(e.target.value))
                }
                min={1}
                step={1}
                required
              />
            </div>
            <div className="mt-4">
              <label
                htmlFor="product-category"
                className="mb-1.5 block text-sm text-zinc-800 dark:text-zinc-200"
              >
                商品分類
              </label>
              <select
                className="h-10 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:border-emerald-500 dark:focus:ring-emerald-950"
                id="product-category"
                value={selectedProductCategory}
                onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                  setSelectedProductCategory(e.target.value as ProductCategory)
                }
                required
              >
                <option value="">商品分類を選択</option>
                {PRODUCT_CATEGORY.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
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
            >
              登録確認
            </button>
          </div>
        </form>
        <div>{error && <p>{error}</p>}</div>
      </div>
      {products && (
        <div>
          <div>
            <p>商品登録しました。</p>
          </div>
          <div>
            <p>商品ID：{products.id}</p>
          </div>
          <div>
            <p>商品名：{products.item_name}</p>
          </div>
          <div>
            <p>価格：{products.price}</p>
          </div>
          <div>
            <p>状態：{products.is_active ? "販売中" : "休み"}</p>
          </div>
        </div>
      )}

      <dialog ref={dialogRef}>
        <h2>商品登録確認</h2>
        {pendingProduct && (
          <div>
            <p>商品名：{pendingProduct.item_name}</p>
            <p>価格：{pendingProduct.price.toLocaleString()}</p>
            <p>
              カテゴリ：
              {
                PRODUCT_CATEGORY.find(
                  (item) => item.value === pendingProduct?.category,
                )?.label
              }
            </p>
          </div>
        )}
        <div>{error && <p>{error}</p>}</div>
        <div>
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            disabled={isSubmitting}
          >
            戻る
          </button>
          <button
            type="button"
            onClick={handleProductCreate}
            disabled={isSubmitting}
          >
            {isSubmitting ? "登録中" : "登録"}
          </button>
        </div>
      </dialog>
    </div>
  );
}
