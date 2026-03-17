import { motion, AnimatePresence } from "framer-motion";
import { X, Minus, Plus, ShoppingBag, Loader2 } from "lucide-react";
import { useState } from "react";
import type { ShopifyProduct } from "@/lib/shopify";
import { useCartStore } from "@/stores/cartStore";

interface Props {
  product: ShopifyProduct | null;
  onClose: () => void;
}

const ShopifyProductDetailModal = ({ product, onClose }: Props) => {
  const addItem = useCartStore((s) => s.addItem);
  const isLoading = useCartStore((s) => s.isLoading);
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  if (!product) return null;

  const { node } = product;
  const variants = node.variants.edges;
  const selectedVariant = variants[selectedVariantIndex]?.node;
  const imageUrl = node.images.edges[0]?.node?.url;

  const handleAdd = async () => {
    if (!selectedVariant) return;
    await addItem({
      product,
      variantId: selectedVariant.id,
      variantTitle: selectedVariant.title,
      price: selectedVariant.price,
      quantity,
      selectedOptions: selectedVariant.selectedOptions || [],
    });
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      setQuantity(1);
      onClose();
    }, 1200);
  };

  return (
    <AnimatePresence>
      {product && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/90 backdrop-blur-sm"
          />
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="relative w-full max-w-3xl bg-zinc-950 border border-zinc-800 overflow-hidden grid grid-cols-1 md:grid-cols-2"
          >
            {/* Image */}
            <div className="aspect-[3/4] md:aspect-auto bg-zinc-900 overflow-hidden">
              {imageUrl ? (
                <img src={imageUrl} alt={node.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-zinc-700 font-clean text-xs">No Image</div>
              )}
            </div>

            {/* Details */}
            <div className="p-6 md:p-8 flex flex-col justify-between">
              <div>
                <button onClick={onClose} className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors">
                  <X size={20} />
                </button>

                <h2 className="font-clean text-2xl text-white mb-2">{node.title}</h2>
                <p className="font-clean text-xl text-white mb-6">
                  {selectedVariant?.price.currencyCode} {parseFloat(selectedVariant?.price.amount || "0").toFixed(2)}
                </p>
                <p className="font-clean text-xs text-zinc-400 leading-relaxed mb-8">
                  {node.description}
                </p>

                {/* Variant Selection */}
                {node.options.map((option) => (
                  <div key={option.name} className="mb-6">
                    <p className="font-clean text-[10px] tracking-[0.15em] text-zinc-500 uppercase mb-3">{option.name}</p>
                    <div className="flex flex-wrap gap-2">
                      {variants.map((v, idx) => {
                        const optValue = v.node.selectedOptions.find(o => o.name === option.name)?.value;
                        // Deduplicate: only show first variant with this option value
                        const firstIdx = variants.findIndex(vv =>
                          vv.node.selectedOptions.find(o => o.name === option.name)?.value === optValue
                        );
                        if (firstIdx !== idx) return null;

                        return (
                          <button
                            key={optValue}
                            onClick={() => setSelectedVariantIndex(idx)}
                            className={`font-clean text-xs px-4 py-2 border transition-colors ${
                              selectedVariantIndex === idx
                                ? "border-white text-white bg-zinc-800"
                                : "border-zinc-800 text-zinc-500 hover:border-zinc-600"
                            } ${!v.node.availableForSale ? "opacity-40 line-through" : ""}`}
                            disabled={!v.node.availableForSale}
                          >
                            {optValue}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}

                {/* Quantity */}
                <div className="mb-8">
                  <p className="font-clean text-[10px] tracking-[0.15em] text-zinc-500 uppercase mb-3">Quantity</p>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-8 h-8 border border-zinc-800 flex items-center justify-center text-zinc-500 hover:text-white hover:border-zinc-600 transition-colors"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="font-clean text-sm text-white w-8 text-center">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-8 h-8 border border-zinc-800 flex items-center justify-center text-zinc-500 hover:text-white hover:border-zinc-600 transition-colors"
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Add to Cart */}
              <button
                onClick={handleAdd}
                disabled={added || isLoading || !selectedVariant?.availableForSale}
                className="w-full h-12 bg-white text-black font-clean text-xs tracking-[0.15em] uppercase hover:bg-zinc-200 transition-all flex items-center justify-center gap-2 disabled:bg-zinc-700 disabled:text-zinc-400"
              >
                {added ? (
                  "✓ Added to Mission Log"
                ) : isLoading ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : !selectedVariant?.availableForSale ? (
                  "Sold Out"
                ) : (
                  <>
                    <ShoppingBag size={14} /> Add to Cart
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ShopifyProductDetailModal;
