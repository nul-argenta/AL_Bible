import { motion } from "framer-motion";
import type { ShopifyProduct } from "@/lib/shopify";

interface ShopifyProductCardProps {
  product: ShopifyProduct;
  onQuickView?: (product: ShopifyProduct) => void;
}

const ShopifyProductCard = ({ product, onQuickView }: ShopifyProductCardProps) => {
  const { node } = product;
  const imageUrl = node.images.edges[0]?.node?.url;
  const price = node.priceRange.minVariantPrice;

  return (
    <motion.div
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-black group relative h-full flex flex-col cursor-pointer"
      onClick={() => onQuickView?.(product)}
    >
      <div className="aspect-[3/4] overflow-hidden bg-zinc-950 relative">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={node.images.edges[0]?.node?.altText || node.title}
            className="w-full h-full object-cover opacity-85 group-hover:opacity-100 transition-opacity duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-zinc-700 font-clean text-xs">
            No Image
          </div>
        )}
      </div>
      <div className="p-4 flex flex-col justify-between flex-1 border-x border-b border-zinc-900">
        <div>
          <h3 className="font-clean text-sm text-white">{node.title}</h3>
          <p className="font-clean text-[10px] text-zinc-500 mt-1 line-clamp-2 min-h-[2.5em]">
            {node.description || "Premium tactical gear."}
          </p>
        </div>
        <div className="mt-4 pt-4 border-t border-zinc-900 flex justify-between items-center">
          <span className="font-clean text-xs text-zinc-400 uppercase tracking-wider">
            {node.options?.[0]?.values?.length > 1 ? `${node.options[0].values.length} options` : ""}
          </span>
          <span className="font-clean text-sm text-white">
            {price.currencyCode} {parseFloat(price.amount).toFixed(2)}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default ShopifyProductCard;
