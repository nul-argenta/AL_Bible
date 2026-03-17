import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import logoLongWhite from "@/assets/logo-long-white.png";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, Heart } from "lucide-react";
import { useCartStore } from "@/stores/cartStore";
import { useWishlist } from "@/contexts/WishlistContext";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const toggleCart = useCartStore((s) => s.toggleCart);
  const items = useCartStore((s) => s.items);
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const { itemCount: wishlistCount } = useWishlist();

  const links = [
    { label: "THE COLLECTION", href: "/collection", type: "route" as const },
    { label: "THE WORD", href: "/the-word", type: "route" as const },
    { label: "THE WALK", href: "/the-walk", type: "route" as const },
    { label: "THE COVENANT", href: "/the-covenant", type: "route" as const },
    { label: "MISSION MAP", href: "/mission-map", type: "route" as const },
    { label: "THE STORY", href: "/origin", type: "route" as const },
  ];

  const handleClick = (link: (typeof links)[0]) => {
    setIsOpen(false);
    if (link.type === "route") {
      navigate(link.href);
    } else {
      if (location.pathname !== "/") {
        navigate("/" + link.href);
      } else {
        const el = document.querySelector(link.href);
        el?.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <a href="/" onClick={(e) => { e.preventDefault(); navigate("/"); }} className="flex items-center">
          <img src={logoLongWhite} alt="Armor // Light" className="h-8 object-contain" />
        </a>

        <div className="hidden md:flex items-center gap-10">
          {links.map((link) => (
            <button
              key={link.label}
              onClick={() => handleClick(link)}
              className="font-tactical text-xs tracking-[0.2em] text-muted-foreground hover:text-foreground transition-colors duration-300 bg-transparent border-none cursor-pointer"
            >
              {link.label}
            </button>
          ))}

          <button onClick={() => navigate("/wishlist")} className="relative text-muted-foreground hover:text-foreground transition-colors">
            <Heart size={18} />
            {wishlistCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-600 text-white font-clean text-[9px] flex items-center justify-center">
                {wishlistCount}
              </span>
            )}
          </button>

          <button onClick={toggleCart} className="relative text-muted-foreground hover:text-foreground transition-colors">
            <ShoppingBag size={18} />
            {itemCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-white text-black font-clean text-[9px] flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </button>
        </div>

        <div className="md:hidden flex items-center gap-4">
          <button onClick={() => navigate("/wishlist")} className="relative text-foreground">
            <Heart size={18} />
            {wishlistCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-600 text-white font-clean text-[9px] flex items-center justify-center">
                {wishlistCount}
              </span>
            )}
          </button>
          <button onClick={toggleCart} className="relative text-foreground">
            <ShoppingBag size={18} />
            {itemCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-white text-black font-clean text-[9px] flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex flex-col gap-1.5 p-2"
            aria-label="Toggle menu"
          >
            <motion.span animate={isOpen ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }} className="block w-6 h-px bg-foreground" />
            <motion.span animate={isOpen ? { opacity: 0 } : { opacity: 1 }} className="block w-6 h-px bg-foreground" />
            <motion.span animate={isOpen ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }} className="block w-6 h-px bg-foreground" />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="md:hidden overflow-hidden border-t border-border"
          >
            <div className="px-6 py-8 flex flex-col gap-6">
              {links.map((link) => (
                <button
                  key={link.label}
                  onClick={() => handleClick(link)}
                  className="font-tactical text-xs tracking-[0.3em] text-muted-foreground hover:text-foreground transition-colors text-left bg-transparent border-none cursor-pointer"
                >
                  {link.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
