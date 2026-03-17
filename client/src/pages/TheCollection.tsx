import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";

// Men's Active
import maCompressionShorts from "@/assets/ma-compression-shorts.png";
import maLongsleeve from "@/assets/ma-longsleeve.png";
import maTank from "@/assets/ma-tank.png";
import maTee from "@/assets/ma-tee.png";
import maTrackPants from "@/assets/ma-track-pants.png";

// Men's Street
import msBomber from "@/assets/ms-bomber.png";
import msCrossbody from "@/assets/ms-crossbody.png";
import msDenimJacket from "@/assets/ms-denim-jacket.png";
import msHoodie from "@/assets/ms-hoodie.png";
import msLongsleeve from "@/assets/ms-longsleeve.png";

// Women's Street
import wsBomber from "@/assets/ws-bomber.png";
import wsCrossbody from "@/assets/ws-crossbody.png";
import wsDenimJacket from "@/assets/ws-denim-jacket.png";
import wsHoodie from "@/assets/ws-hoodie.png";
import wsLongsleeve from "@/assets/ws-longsleeve.png";

// Female Activewear
import femaleFullLeggings from "@/assets/female-full-leggings.png";
import femaleLeggings from "@/assets/female-leggings.png";
import femaleLongSleeve from "@/assets/female-long-sleeve.png";
import femaleShorts from "@/assets/female-shorts.png";
import femaleSportsBra from "@/assets/female-sports-bra.png";
import femaleTankTop from "@/assets/female-tank-top.png";

// Accessories
import accBracelet from "@/assets/acc-bracelet.png";
import accCap from "@/assets/acc-cap.png";
import accDogTag from "@/assets/acc-dog-tag.png";
import accLanyard from "@/assets/acc-lanyard.png";
import accTacticalBackpack from "@/assets/acc-tactical-backpack.png";
import accToteBag from "@/assets/acc-tote-bag.png";

// Collage headers
import collageMensActive from "@/assets/collage-mens-active.png";
import collageMensStreet from "@/assets/collage-mens-street.png";
import collageWomensStreet from "@/assets/collage-womens-street.png";
import collageAccessories from "@/assets/collage-accessories.png";
import femaleActivewearComposite from "@/assets/female-activewear-composite.png";

interface Product {
  id: string;
  name: string;
  image: string;
  price: string;
  tag?: string;
}

interface Category {
  id: string;
  label: string;
  sectionCode: string;
  collageImage: string;
  products: Product[];
}

const categories: Category[] = [
  {
    id: "mens-active",
    label: "Men's Active",
    sectionCode: "01 // MALE ACTIVE WEAR",
    collageImage: collageMensActive,
    products: [
      { id: "ma-1", name: "Compression Shorts", image: maCompressionShorts, price: "$58.00", tag: "ACTIVE" },
      { id: "ma-2", name: "Performance Long Sleeve", image: maLongsleeve, price: "$78.00", tag: "ACTIVE" },
      { id: "ma-3", name: "Training Tank", image: maTank, price: "$48.00", tag: "ACTIVE" },
      { id: "ma-4", name: "Performance Tee", image: maTee, price: "$58.00", tag: "ACTIVE" },
      { id: "ma-5", name: "Track Pants", image: maTrackPants, price: "$98.00", tag: "ACTIVE" },
    ],
  },
  {
    id: "mens-street",
    label: "Men's Street",
    sectionCode: "02 // MALE STREET WEAR",
    collageImage: collageMensStreet,
    products: [
      { id: "ms-1", name: "Bomber Jacket", image: msBomber, price: "$168.00", tag: "STREET" },
      { id: "ms-2", name: "Crossbody Bag", image: msCrossbody, price: "$78.00", tag: "STREET" },
      { id: "ms-3", name: "Denim Jacket", image: msDenimJacket, price: "$148.00", tag: "STREET" },
      { id: "ms-4", name: "Stronghold Hoodie", image: msHoodie, price: "$128.00", tag: "STREET" },
      { id: "ms-5", name: "Long Sleeve Tee", image: msLongsleeve, price: "$68.00", tag: "STREET" },
    ],
  },
  {
    id: "womens-street",
    label: "Women's Street",
    sectionCode: "03 // FEMALE STREET WEAR",
    collageImage: collageWomensStreet,
    products: [
      { id: "ws-1", name: "Bomber Jacket", image: wsBomber, price: "$168.00", tag: "STREET" },
      { id: "ws-2", name: "Crossbody Bag", image: wsCrossbody, price: "$78.00", tag: "STREET" },
      { id: "ws-3", name: "Denim Jacket", image: wsDenimJacket, price: "$148.00", tag: "STREET" },
      { id: "ws-4", name: "Stronghold Hoodie", image: wsHoodie, price: "$128.00", tag: "STREET" },
      { id: "ws-5", name: "Long Sleeve Tee", image: wsLongsleeve, price: "$68.00", tag: "STREET" },
    ],
  },
  {
    id: "female-active",
    label: "Female Activewear",
    sectionCode: "04 // FEMALE ACTIVE WEAR",
    collageImage: femaleActivewearComposite,
    products: [
      { id: "fa-1", name: "Full Length Leggings", image: femaleFullLeggings, price: "$88.00", tag: "ACTIVE" },
      { id: "fa-2", name: "Performance Leggings", image: femaleLeggings, price: "$78.00", tag: "ACTIVE" },
      { id: "fa-3", name: "Long Sleeve Top", image: femaleLongSleeve, price: "$68.00", tag: "ACTIVE" },
      { id: "fa-4", name: "Training Shorts", image: femaleShorts, price: "$58.00", tag: "ACTIVE" },
      { id: "fa-5", name: "Sports Bra", image: femaleSportsBra, price: "$58.00", tag: "ACTIVE" },
      { id: "fa-6", name: "Tank Top", image: femaleTankTop, price: "$48.00", tag: "ACTIVE" },
    ],
  },
  {
    id: "accessories",
    label: "Accessories",
    sectionCode: "05 // ACCESSORIES",
    collageImage: collageAccessories,
    products: [
      { id: "ac-1", name: "Σ+ Bracelet", image: accBracelet, price: "$38.00", tag: "ACC" },
      { id: "ac-2", name: "Tactical Cap", image: accCap, price: "$48.00", tag: "ACC" },
      { id: "ac-3", name: "Dog Tag Pendant", image: accDogTag, price: "$58.00", tag: "ACC" },
      { id: "ac-4", name: "Mission Lanyard", image: accLanyard, price: "$28.00", tag: "ACC" },
      { id: "ac-5", name: "Tactical Backpack", image: accTacticalBackpack, price: "$148.00", tag: "ACC" },
      { id: "ac-6", name: "Tote Bag", image: accToteBag, price: "$68.00", tag: "ACC" },
    ],
  },
];

const allCategoryIds = ["all", ...categories.map((c) => c.id)];
const allCategoryLabels: Record<string, string> = {
  all: "All",
  ...Object.fromEntries(categories.map((c) => [c.id, c.label])),
};

const ProductCard = ({ product }: { product: Product }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-black group relative flex flex-col cursor-pointer"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="aspect-[3/4] overflow-hidden bg-zinc-950 relative">
        <motion.img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover object-top opacity-90 group-hover:opacity-100 transition-opacity duration-500"
          animate={{ scale: hovered ? 1.03 : 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        />
        {product.tag && (
          <span className="absolute top-3 left-3 font-clean text-[9px] tracking-[0.2em] text-zinc-400 bg-black/70 px-2 py-1 uppercase">
            {product.tag}
          </span>
        )}
      </div>
      <div className="p-4 flex flex-col justify-between flex-1 border-x border-b border-zinc-900">
        <h3 className="font-clean text-sm text-white">{product.name}</h3>
        <div className="mt-3 pt-3 border-t border-zinc-900 flex justify-between items-center">
          <span className="font-clean text-[10px] text-zinc-500 uppercase tracking-wider">Σ+ Gear</span>
          <span className="font-clean text-sm text-white">{product.price}</span>
        </div>
      </div>
    </motion.div>
  );
};

const CategorySection = ({ category }: { category: Category }) => (
  <div className="mb-20">
    {/* Section header with collage */}
    <div className="flex items-center gap-4 mb-8">
      <span className="font-clean text-[10px] tracking-[0.25em] text-zinc-500 uppercase whitespace-nowrap">
        {category.sectionCode}
      </span>
      <div className="flex-1 h-px bg-zinc-800" />
    </div>

    <div className="mb-10 overflow-hidden rounded-none">
      <img
        src={category.collageImage}
        alt={category.label}
        className="w-full h-48 md:h-64 object-cover opacity-80"
      />
    </div>

    {/* Product grid */}
    <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-px bg-zinc-800">
      <AnimatePresence>
        {category.products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </AnimatePresence>
    </motion.div>
  </div>
);

const TheCollection = () => {
  const [activeFilter, setActiveFilter] = useState("all");

  const filteredCategories =
    activeFilter === "all" ? categories : categories.filter((c) => c.id === activeFilter);

  const totalProducts = filteredCategories.reduce((sum, c) => sum + c.products.length, 0);

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />

      <header className="pt-32 pb-10 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="font-clean text-5xl md:text-7xl font-light tracking-tight text-white"
          >
            THE COLLECTION
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-clean text-sm tracking-[0.15em] text-zinc-500 mt-4 uppercase"
          >
            Equipped for the Pursuit // Built for the Mission
          </motion.p>
        </div>
      </header>

      {/* Category filter tabs */}
      <nav className="px-6 mb-10">
        <div className="max-w-7xl mx-auto flex flex-wrap gap-2">
          {allCategoryIds.map((id) => (
            <button
              key={id}
              onClick={() => setActiveFilter(id)}
              className={`font-clean text-[10px] tracking-[0.2em] uppercase px-4 py-2 border transition-colors duration-200 ${
                activeFilter === id
                  ? "border-white text-white bg-white/5"
                  : "border-zinc-800 text-zinc-500 hover:text-zinc-300 hover:border-zinc-600"
              }`}
            >
              {allCategoryLabels[id]}
            </button>
          ))}
        </div>
      </nav>

      <section className="px-6 pb-24">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-10">
            <span className="font-clean text-xs tracking-[0.2em] text-zinc-500 uppercase">
              {activeFilter === "all" ? "All Products" : allCategoryLabels[activeFilter]}{" "}
              <span className="text-zinc-700">({totalProducts})</span>
            </span>
            <div className="flex-1 h-px bg-zinc-800" />
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeFilter}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {filteredCategories.map((category) => (
                <CategorySection key={category.id} category={category} />
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      <footer className="px-6 pb-20">
        <div className="max-w-7xl mx-auto">
          <div className="h-px bg-zinc-800 mb-10" />
          <p className="font-clean text-xs text-zinc-600 text-center tracking-[0.1em] leading-relaxed max-w-xl mx-auto">
            One Brand. Every Denomination. No Divide.
            <br />
            All gear proceeds fuel our active Mission Logs.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default TheCollection;
