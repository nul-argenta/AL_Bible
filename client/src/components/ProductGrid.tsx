import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import lifestyleHoodie from "@/assets/lifestyle-hoodie.jpg";
import lifestyleBomber from "@/assets/lifestyle-bomber.jpg";
import lifestyleTee from "@/assets/lifestyle-tee.jpg";
import lifestyleDenimJacket from "@/assets/lifestyle-denim-jacket.jpg";
import lifestyleSportsBra from "@/assets/lifestyle-sports-bra.jpg";
import lifestyleTrackPants from "@/assets/lifestyle-track-pants.jpg";
import lifestyleBackpack from "@/assets/lifestyle-backpack.jpg";
import lifestyleDogTag from "@/assets/lifestyle-dog-tag.jpg";

interface Product {
  id: string;
  name: string;
  modName: string;
  price: string;
  image: string;
  category: string;
}

const products: Product[] = [
  {
    id: "1",
    name: "Stronghold Hoodie",
    modName: "MEN'S STREET",
    price: "$128.00",
    image: lifestyleHoodie,
    category: "STREET",
  },
  {
    id: "2",
    name: "Bomber Jacket",
    modName: "MEN'S STREET",
    price: "$168.00",
    image: lifestyleBomber,
    category: "STREET",
  },
  {
    id: "3",
    name: "Performance Tee",
    modName: "MEN'S ACTIVE",
    price: "$58.00",
    image: lifestyleTee,
    category: "ACTIVE",
  },
  {
    id: "4",
    name: "Denim Jacket",
    modName: "WOMEN'S STREET",
    price: "$148.00",
    image: lifestyleDenimJacket,
    category: "STREET",
  },
  {
    id: "5",
    name: "Sports Bra",
    modName: "FEMALE ACTIVE",
    price: "$58.00",
    image: lifestyleSportsBra,
    category: "ACTIVE",
  },
  {
    id: "6",
    name: "Track Pants",
    modName: "MEN'S ACTIVE",
    price: "$98.00",
    image: lifestyleTrackPants,
    category: "ACTIVE",
  },
  {
    id: "7",
    name: "Tactical Backpack",
    modName: "ACCESSORIES",
    price: "$148.00",
    image: lifestyleBackpack,
    category: "ACC",
  },
  {
    id: "8",
    name: "Dog Tag Pendant",
    modName: "ACCESSORIES",
    price: "$58.00",
    image: lifestyleDogTag,
    category: "ACC",
  },
];

const ProductCard = ({ product }: { product: Product }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="group relative cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image */}
      <div className="relative aspect-[3/4] overflow-hidden bg-secondary mb-4">
        <motion.img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover object-top"
          animate={{ scale: isHovered ? 1.05 : 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        />
        <span className="absolute top-3 left-3 font-tactical text-[9px] tracking-[0.2em] text-muted-foreground bg-background/70 px-2 py-1 uppercase">
          {product.category}
        </span>
      </div>

      {/* Info */}
      <div>
        <p className="font-tactical text-[10px] tracking-[0.3em] text-muted-foreground mb-1">
          {product.modName}
        </p>
        <div className="flex items-center justify-between">
          <h3 className="font-soul text-lg tracking-wide text-foreground">
            {product.name}
          </h3>
          <span className="font-tactical text-xs text-reflective">
            {product.price}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

const ProductGrid = () => {
  return (
    <section id="products" className="relative py-32 px-6 bg-background noise-overlay">
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-20"
        >
          <p className="font-tactical text-[10px] tracking-[0.5em] text-muted-foreground mb-3">
            COLLECTION 001
          </p>
          <h2 className="font-soul text-4xl md:text-5xl font-light tracking-[0.05em] text-foreground">
            The Collection
          </h2>
          <div className="w-16 h-px bg-foreground/20 mt-6" />
        </motion.div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* View All CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-16 text-center"
        >
          <Link
            to="/collection"
            className="inline-block font-tactical text-xs tracking-[0.3em] border border-foreground/30 hover:border-foreground px-10 py-4 text-foreground hover:bg-foreground hover:text-primary-foreground transition-all duration-500 uppercase"
          >
            View Full Collection
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default ProductGrid;
