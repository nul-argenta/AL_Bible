import { motion, AnimatePresence } from "framer-motion";
import { X, Minus, Plus, ShoppingBag, Trash2, ExternalLink, Loader2 } from "lucide-react";
import { useCartStore } from "@/stores/cartStore";
import { useEffect } from "react";

const CartDrawer = () => {
  const items = useCartStore((s) => s.items);
  const isCartOpen = useCartStore((s) => s.isCartOpen);
  const closeCart = useCartStore((s) => s.closeCart);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const isLoading = useCartStore((s) => s.isLoading);
  const isSyncing = useCartStore((s) => s.isSyncing);
  const getCheckoutUrl = useCartStore((s) => s.getCheckoutUrl);
  const syncCart = useCartStore((s) => s.syncCart);

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const total = items.reduce((sum, i) => sum + parseFloat(i.price.amount) * i.quantity, 0);
  const currencyCode = items[0]?.price.currencyCode || 'USD';

  useEffect(() => {
    if (isCartOpen) syncCart();
  }, [isCartOpen, syncCart]);

  const handleCheckout = () => {
    const checkoutUrl = getCheckoutUrl();
    if (checkoutUrl) {
      window.open(checkoutUrl, '_blank');
      closeCart();
    }
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm"
          />

          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 bottom-0 z-[61] w-full max-w-md bg-zinc-950 border-l border-zinc-800 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-zinc-800">
              <div className="flex items-center gap-3">
                <ShoppingBag size={18} className="text-zinc-400" />
                <h2 className="font-clean text-sm tracking-[0.15em] uppercase text-white">
                  Mission Log
                </h2>
                <span className="font-clean text-[10px] bg-white text-black px-2 py-0.5">{itemCount}</span>
              </div>
              <button onClick={closeCart} className="text-zinc-500 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <ShoppingBag size={40} className="text-zinc-700 mb-4" />
                  <p className="font-clean text-sm text-zinc-500 uppercase tracking-wider">No gear loaded</p>
                  <p className="font-clean text-[10px] text-zinc-700 mt-2">Add items from the collection to begin.</p>
                </div>
              ) : (
                items.map((item) => {
                  const imageUrl = item.product.node.images?.edges?.[0]?.node?.url;
                  return (
                    <div key={item.variantId} className="flex gap-3 group">
                      <div className="w-14 h-18 bg-zinc-900 shrink-0 overflow-hidden">
                        {imageUrl && <img src={imageUrl} alt={item.product.node.title} className="w-full h-full object-cover opacity-80" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-clean text-xs text-white truncate">{item.product.node.title}</h4>
                        <p className="font-clean text-[10px] text-zinc-600 mt-0.5">
                          {item.selectedOptions.map(o => o.value).join(' / ')}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                            className="w-6 h-6 border border-zinc-800 flex items-center justify-center text-zinc-500 hover:text-white hover:border-zinc-600 transition-colors"
                          >
                            <Minus size={10} />
                          </button>
                          <span className="font-clean text-xs text-white w-6 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                            className="w-6 h-6 border border-zinc-800 flex items-center justify-center text-zinc-500 hover:text-white hover:border-zinc-600 transition-colors"
                          >
                            <Plus size={10} />
                          </button>
                        </div>
                      </div>
                      <div className="flex flex-col items-end justify-between">
                        <span className="font-clean text-xs text-white">
                          {currencyCode} {(parseFloat(item.price.amount) * item.quantity).toFixed(2)}
                        </span>
                        <button
                          onClick={() => removeItem(item.variantId)}
                          className="text-zinc-700 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-zinc-800 p-6 space-y-4">
                <div className="flex justify-between font-clean text-sm text-white">
                  <span className="uppercase tracking-wider">Total</span>
                  <span className="text-lg">{currencyCode} {total.toFixed(2)}</span>
                </div>

                <button
                  onClick={handleCheckout}
                  disabled={isLoading || isSyncing}
                  className="w-full h-12 bg-white text-black font-clean text-xs tracking-[0.15em] uppercase hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isLoading || isSyncing ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <>
                      <ExternalLink size={14} /> Checkout with Shopify
                    </>
                  )}
                </button>
                <button
                  onClick={closeCart}
                  className="w-full h-10 bg-transparent border border-zinc-800 text-zinc-400 font-clean text-[10px] tracking-[0.15em] uppercase hover:border-zinc-600 hover:text-white transition-colors"
                >
                  Continue Shopping
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartDrawer;
