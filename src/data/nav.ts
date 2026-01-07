// data/nav.ts
import { 
  ShoppingBag, BookOpen, 
  Repeat, Search, Bike, Watch, 
  Shirt, Scissors, Smartphone, Sofa, 
  Layers, type LucideIcon 
} from "lucide-react";

export interface NavSubItem {
  title: string;
  href: string;
  description: string;
  featured?: boolean;
  icon?: LucideIcon;
  className?: string;
}

export interface NavItem {
  title: string;
  href?: string;
  items?: NavSubItem[];
}

export const NAV_ITEMS: NavItem[] = [
  {
    title: "Marketplace",
    items: [
      {
        title: "Sell & Buy",
        href: "/market/sell-buy",
        description: "Direct person-to-person marketplace for used goods.",
        icon: ShoppingBag,
        className: "text-blue-500",
        featured: true,
      },
      {
        title: "Renting",
        href: "/market/renting",
        description: "Borrow or lend items within the community.",
        icon: Repeat,
        className: "text-emerald-500",
      },
      {
        title: "Lost Property",
        href: "/market/lost-found",
        description: "Help return lost items to their owners.",
        icon: Search,
        className: "text-amber-500",
      },
    ],
  },
  {
    title: "Categories",
    items: [
      { title: "Electronics", href: "/cat/electronics", description: "Laptops, phones, and gadgets.", icon: Smartphone },
      { title: "Books", href: "/cat/books", description: "Textbooks and novels.", icon: BookOpen },
      { title: "Cycles", href: "/cat/cycles", description: "Bicycles and accessories.", icon: Bike },
      { title: "Drafters & Tools", href: "/cat/tools", description: "Engineering tools.", icon: Layers },
      { title: "Clothing", href: "/cat/clothing", description: "Fashion and lab coats.", icon: Shirt },
      { title: "Furniture", href: "/cat/furniture", description: "Chairs, desks, and lamps.", icon: Sofa },
      { title: "Accessories", href: "/cat/accessories", description: "Watches and jewelry.", icon: Watch },
      { title: "Beauty", href: "/cat/beauty", description: "Skincare and grooming.", icon: Scissors },
    ],
  },
];