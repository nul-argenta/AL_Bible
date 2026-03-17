import { motion, AnimatePresence } from "framer-motion";
import { Heart, ArrowLeft, ShoppingBag } from "lucide-react";
import { useWishlist } from "@/contexts/WishlistContext";
import { useCartStore } from "@/stores/cartStore";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import ShopifyProductCard from "@/components/collection/ShopifyProductCard";
import ShopifyProductDetailModal from "@/components/collection/ShopifyProductDetailModal";
import type { ShopifyProduct } from "@/lib/shopify";
import { useState } from "react";

const Wishlist = () => {
  const { items, itemCount } = useWishlist();
  const addItem = useCartStore((s) => s.addItem);
  const navigate = useNavigate();
  const [selectedProduct, setSelectedProduct] = useState<ShopifyProduct | null>(null);

  const handleAddAllToCart = async () => {
    for (const item of items) {
      const variant = item.node.variants.edges[0]?.node;
      if (variant) {
        await addItem({
          product: item,
          variantId: variant.id,
          variantTitle: variant.title,
          price: variant.price,
          quantity: 1,
          selectedOptions: variant.selectedOptions || [],
        });
      }
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <ShopifyProductDetailModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />

      <div className="pt-28 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-12">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 font-clean text-xs text-zinc-500 hover:text-white transition-colors"
            >
              <ArrowLeft size={14} /> Back
            </button>
            <div className="flex-1">
              <h1 className="font-clean text-5xl md:text-7xl font-light tracking-tight text-white">
                WISHLIST
              </h1>
              <p className="font-clean text-xs tracking-[0.15em] text-zinc-500 mt-4 uppercase">
                {itemCount} Item{itemCount !== 1 ? "s" : ""} Saved
              </p>
            </div>
          </div>

          {itemCount === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
              <Heart size={48} className="text-zinc-700 mb-4" />
              <h2 className="font-clean text-xl text-white mb-2">Your wishlist is empty</h2>
              <p className="font-clean text-xs text-zinc-500 mb-8">
                Save items to view them here later.
              </p>
              <button
                onClick={() => navigate("/collection")}
                className="font-clean text-xs tracking-[0.15em] uppercase bg-white text-black px-8 py-3 hover:bg-zinc-200 transition-colors"
              >
                Browse Collection
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-10 pb-6 border-b border-zinc-800">
                <span className="font-clean text-xs tracking-[0.2em] text-zinc-500 uppercase">
                  Saved Gear
                </span>
                <button
                  onClick={handleAddAllToCart}
                  className="flex items-center gap-2 font-clean text-xs tracking-[0.15em] uppercase bg-white text-black px-6 py-3 hover:bg-zinc-200 transition-colors"
                >
                  <ShoppingBag size={14} /> Add All to Cart
                </button>
              </div>

              <motion.div
                layout
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-px bg-zinc-800"
              >
                <AnimatePresence>
                  {items.map((product) => (
                    <ShopifyProductCard
                      key={product.node.id}
                      product={product}
                      onQuickView={setSelectedProduct}
                    />
                  ))}
                </AnimatePresence>
              </motion.div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Wishlist;
