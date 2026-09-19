import encircle_bra_black from "@/assets/sku/encircle-bra-black.webp";
import encircle_bra_white from "@/assets/sku/encircle-bra-white.webp";
import encircle_bra_nude from "@/assets/sku/encircle-bra-nude.webp";
import encircle_bra_paradise_pink from "@/assets/sku/encircle-bra-paradise-pink.webp";
import encircle_bra_sun_dried_tomato from "@/assets/sku/encircle-bra-sun-dried-tomato.webp";
import support_bra_black from "@/assets/sku/support-bra-black.webp";
import support_bra_white from "@/assets/sku/support-bra-white.webp";
import support_bra_grey from "@/assets/sku/support-bra-grey.webp";
import support_bra_paradise_pink from "@/assets/sku/support-bra-paradise-pink.webp";
import support_bra_ela_magenta from "@/assets/sku/support-bra-ela-magenta.png";
import tshirt_bra_black from "@/assets/sku/tshirt-bra-black.webp";
import tshirt_bra_navy from "@/assets/sku/tshirt-bra-navy.webp";
import tshirt_bra_nude from "@/assets/sku/tshirt-bra-nude.webp";
import tshirt_bra_lilac from "@/assets/sku/tshirt-bra-lilac.webp";
import tshirt_bra_sundried_tomato from "@/assets/sku/tshirt-bra-sundried-tomato.webp";
import sports_bra_black from "@/assets/sku/sports-bra-black.webp";
import sports_bra_navy from "@/assets/sku/sports-bra-navy.webp";
import sports_bra_grey from "@/assets/sku/sports-bra-grey.webp";
import sports_bra_paradise_pink from "@/assets/sku/sports-bra-paradise-pink.webp";
import sports_bra_ela_magenta from "@/assets/sku/sports-bra-ela-magenta.webp";
import sports_bra_lilac_1 from "@/assets/sports-bra-lilac-1.webp";
import sports_bra_lilac_2 from "@/assets/sports-bra-lilac-2.webp";
import sports_bra_lilac_3 from "@/assets/sports-bra-lilac-3.webp";
import sports_bra_lilac_4 from "@/assets/sports-bra-lilac-4.webp";
import sports_bra_lilac_5 from "@/assets/sports-bra-lilac-5.webp";
import boyshorts_black_magenta from "@/assets/sku/boyshorts-black-magenta.png";
import boyshorts_grey_pink from "@/assets/sku/boyshorts-grey-pink.png";
import boyshorts_navy_nude from "@/assets/sku/boyshorts-navy-nude.png";
import highrise_black_pink_nude from "@/assets/sku/highrise-black-pink-nude.jpg";
import highrise_magenta_grey_navy from "@/assets/sku/highrise-magenta-grey-navy.jpg";
import midrise_black_pink_nude from "@/assets/sku/midrise-black-pink-nude.jpg";
import midrise_magenta_grey_navy from "@/assets/sku/midrise-magenta-grey-navy.jpg";
import camisole_padded_black from "@/assets/sku/camisole-padded-black.webp";
import camisole_padded_white from "@/assets/sku/camisole-padded-white.png";
import camisole_padded_grey from "@/assets/sku/camisole-padded-grey.webp";
import camisole_padded_nude from "@/assets/sku/camisole-padded-nude.webp";
import lace_camisole_black from "@/assets/sku/lace-camisole-black.webp";
import lace_camisole_white from "@/assets/sku/lace-camisole-white.png";
import lace_camisole_grey from "@/assets/sku/lace-camisole-grey.webp";
import lace_camisole_nude from "@/assets/sku/lace-camisole-nude.webp";

export interface Product {
  // SAP SOURCE: ItemCode
  // Temporary fallback until SAP product integration is live.
  id: string;
  
  // SAP SOURCE: ItemName
  // Temporary fallback until SAP product integration is live.
  name: string;
  
  // SAP SOURCE: ItemPrices
  // Temporary fallback until SAP product integration is live.
  price: number;
  
  // UNKNOWN / REQUIRES VERIFICATION: Verify if SAP handles original/discounted price
  originalPrice?: number;
  
  // SAP SOURCE: U_Category / U_SUBG / ItemsGroupCode
  // Temporary fallback until SAP product integration is live.
  category: "bras" | "panties" | "camisoles" | "sports";
  
  // SAP SOURCE: U_Size
  // Temporary fallback until SAP product integration is live.
  sizes: string[];
  
  // SAP SOURCE: U_Colour
  // Temporary fallback until SAP product integration is live.
  colors: string[];
  
  // SAP SOURCE: Picture / AttachmentEntry
  // Temporary fallback until SAP product integration is live.
  image: string;
  
  // UNKNOWN / REQUIRES VERIFICATION: Verify if SAP supports multiple images
  images: string[];
  
  // UNKNOWN / REQUIRES VERIFICATION: Verify if SAP supports color-image mapping
  colorImages?: Record<string, string[]>;
  
  // UNKNOWN / REQUIRES VERIFICATION: Verify if SAP handles description
  description: string;
  
  // UNKNOWN / REQUIRES VERIFICATION: Verify if SAP handles fabric details
  fabric: string;
  
  // UNKNOWN / REQUIRES VERIFICATION: Verify if SAP handles care instructions
  care: string;
  
  // UNKNOWN / REQUIRES VERIFICATION: Verify if SAP handles bestseller status
  isBestseller?: boolean;
  
  // UNKNOWN / REQUIRES VERIFICATION: Verify if SAP handles new arrival status
  isNew?: boolean;
  
  // SAP SOURCE: QuantityOnStock / ItemWarehouseInfoCollection
  // Temporary fallback until SAP product integration is live.
  stock?: number;
  
  // FRONTEND OWNED: Cart quantity (Not SAP owned)
  quantity?: number;
}

export const products: Product[] = [
  {
    // SAP SOURCE: ItemCode
    // Temporary fallback until SAP product integration is live.
    id: "1",
    // SAP SOURCE: ItemName
    // Temporary fallback until SAP product integration is live.
    name: "Non Padded Encircle Bra",
    // SAP SOURCE: ItemPrices
    // Temporary fallback until SAP product integration is live.
    price: 599,
    // SAP SOURCE: U_Category / U_SUBG / ItemsGroupCode
    // Temporary fallback until SAP product integration is live.
    category: "bras",
    // SAP SOURCE: U_Size
    // Temporary fallback until SAP product integration is live.
    sizes: ['30B', '32B', '34B', '36B', '38B', '40B', '30C', '32C', '34C', '36C', '38C', '40C', '30D', '32D', '34D', '36D', '38D', '40D'],
    // SAP SOURCE: U_Colour
    // Temporary fallback until SAP product integration is live.
    colors: ['Black', 'White', 'Nude', 'Paradise Pink', 'Sun Dried Tomato'],
    // SAP SOURCE: Picture / AttachmentEntry
    // Temporary fallback until SAP product integration is live.
    image: encircle_bra_black,
    images: [encircle_bra_black, encircle_bra_white, encircle_bra_nude, encircle_bra_paradise_pink, encircle_bra_sun_dried_tomato],
    colorImages: {
      "Black": [encircle_bra_black],
      "White": [encircle_bra_white],
      "Nude": [encircle_bra_nude],
      "Paradise Pink": [encircle_bra_paradise_pink],
      "Sun Dried Tomato": [encircle_bra_sun_dried_tomato],
    },
    description: "Full-coverage non-padded comfort bra with encircle support design. Wire structure provides natural shaping and all-day comfort. Available in 5 colours across B, C and D cups.",
    fabric: "90% Nylon, 10% Elastane",
    care: "Hand wash cold. Do not bleach. Lay flat to dry.",
    isBestseller: true,
    // SAP SOURCE: QuantityOnStock / ItemWarehouseInfoCollection
    // Temporary fallback until SAP product integration is live.
    stock: 24,
  },
  {
    id: "2",
    name: "Non Padded Super Support Bra",
    price: 699,
    category: "bras",
    sizes: ['34B', '36B', '38B', '40B', '42B', '34C', '36C', '38C', '40C', '42C', '34D', '36D', '38D', '40D', '42D', '34DD', '36DD', '38DD', '40DD', '42DD', '34E', '36E', '38E', '40E', '42E'],
    colors: ['Black', 'White', 'Grey', 'Paradise Pink', 'Ela Mangenta', 'Nude'],
    image: support_bra_black,
    images: [support_bra_black, support_bra_white, support_bra_grey, support_bra_paradise_pink, support_bra_ela_magenta],
    colorImages: {
      "Black": [support_bra_black],
      "White": [support_bra_white],
      "Grey": [support_bra_grey],
      "Paradise Pink": [support_bra_paradise_pink],
      "Ela Mangenta": [support_bra_ela_magenta],
      "Nude": [support_bra_ela_magenta],
    },
    description: "Engineered for maximum support without padding. Wide straps and reinforced side panels for all-day lift and comfort. Available in 6 colours across B, C, D, DD and E cups.",
    fabric: "85% Nylon, 15% Spandex",
    care: "Hand wash cold. Do not bleach. Lay flat to dry.",
    isBestseller: true,
    stock: 18,
  },
  {
    id: "3",
    name: "Padded T-Shirt Bra",
    price: 699,
    category: "bras",
    sizes: ['30B', '32B', '34B', '36B', '38B', '40B', '30C', '32C', '34C', '36C', '38C', '40C', '30D', '32D', '34D', '36D', '38D', '40D'],
    colors: ['Black', 'Navy', 'Nude', 'Lilac', 'Sundried Tomato'],
    image: tshirt_bra_black,
    images: [tshirt_bra_black, tshirt_bra_navy, tshirt_bra_nude, tshirt_bra_lilac, tshirt_bra_sundried_tomato],
    colorImages: {
      "Black": [tshirt_bra_black],
      "Navy": [tshirt_bra_navy],
      "Nude": [tshirt_bra_nude],
      "Lilac": [tshirt_bra_lilac],
      "Sundried Tomato": [tshirt_bra_sundried_tomato],
    },
    description: "Seamless padded bra designed to be invisible under t-shirts. Smooth moulded cups with a natural rounded shape. Available in 5 colours across B, C and D cups.",
    fabric: "92% Nylon, 8% Spandex",
    care: "Machine wash cold. Do not bleach. Tumble dry low.",
    isBestseller: true,
    stock: 31,
  },
  {
    id: "4",
    name: "Sports Bra",
    price: 699,
    category: "sports",
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['Black', 'Navy', 'Grey', 'Paradise Pink', 'Ela Mangeta', 'Lilac'],
    image: sports_bra_black,
    images: [sports_bra_black, sports_bra_navy, sports_bra_grey, sports_bra_paradise_pink, sports_bra_ela_magenta],
    colorImages: {
      "Black": [sports_bra_black],
      "Navy": [sports_bra_navy],
      "Grey": [sports_bra_grey],
      "Paradise Pink": [sports_bra_paradise_pink],
      "Ela Mangeta": [sports_bra_ela_magenta],
      "Lilac": [sports_bra_lilac_1, sports_bra_lilac_2, sports_bra_lilac_3, sports_bra_lilac_4, sports_bra_lilac_5],
    },
    description: "High-impact racerback sports bra with removable cups and breathable construction. Moisture-wicking fabric for intense workouts. Available in 6 colours.",
    fabric: "80% Polyester, 20% Spandex",
    care: "Machine wash cold. Do not bleach. Tumble dry low.",
    isNew: true,
    stock: 45,
  },
  {
    id: "5",
    name: "Boy Shorts Pack of 2 - Black & Magenta",
    price: 499,
    category: "panties",
    sizes: ['S', 'M', 'L', 'XL', 'XXL', 'XXXL'],
    colors: ['All Combined'],
    image: boyshorts_black_magenta,
    images: [boyshorts_black_magenta],
    description: "Value pack of 2 ultra-soft boy shorts in Black and Magenta. No-ride-up design with seamless everyday comfort.",
    fabric: "95% Cotton, 5% Elastane",
    care: "Machine wash cold. Tumble dry low.",
    isNew: true,
    stock: 12,
  },
  {
    id: "6",
    name: "Boy Shorts Pack of 2 - Grey & Pink",
    price: 499,
    category: "panties",
    sizes: ['S', 'M', 'L', 'XL', 'XXL', 'XXXL'],
    colors: ['All Combined'],
    image: boyshorts_grey_pink,
    images: [boyshorts_grey_pink],
    description: "Value pack of 2 ultra-soft boy shorts in Grey and Pink. No-ride-up design with seamless everyday comfort.",
    fabric: "95% Cotton, 5% Elastane",
    care: "Machine wash cold. Tumble dry low.",
    isNew: true,
    stock: 9,
  },
  {
    id: "7",
    name: "Boy Shorts Pack of 2 - Navy & Nude",
    price: 499,
    category: "panties",
    sizes: ['S', 'M', 'L', 'XL', 'XXL', 'XXXL'],
    colors: ['All Combined'],
    image: boyshorts_navy_nude,
    images: [boyshorts_navy_nude],
    description: "Value pack of 2 ultra-soft boy shorts in Navy and Nude. No-ride-up design with seamless everyday comfort.",
    fabric: "95% Cotton, 5% Elastane",
    care: "Machine wash cold. Tumble dry low.",
    isNew: true,
    stock: 15,
  },
  {
    id: "8",
    name: "Full Brief High Rise Pack of 3 - Black, Pink & Nude",
    price: 599,
    category: "panties",
    sizes: ['S', 'M', 'L', 'XL', 'XXL', 'XXXL'],
    colors: ['All Combined'],
    image: highrise_black_pink_nude,
    images: [highrise_black_pink_nude],
    description: "Value pack of 3 classic high-rise full briefs in Black, Pink and Nude. Full coverage with comfortable elastic waistband. More Suitable for Maternity Usage.",
    fabric: "95% Cotton, 5% Spandex",
    care: "Machine wash cold. Tumble dry low.",
    isBestseller: true,
    stock: 20,
  },
  {
    id: "9",
    name: "Full Brief High Rise Pack of 3 - Magenta, Grey & Navy",
    price: 599,
    category: "panties",
    sizes: ['S', 'M', 'L', 'XL', 'XXL', 'XXXL'],
    colors: ['All Combined'],
    image: highrise_magenta_grey_navy,
    images: [highrise_magenta_grey_navy],
    description: "Value pack of 3 classic high-rise full briefs in Magenta, Grey and Navy. Full coverage with comfortable elastic waistband. More Suitable for Maternity Usage.",
    fabric: "95% Cotton, 5% Spandex",
    care: "Machine wash cold. Tumble dry low.",
    stock: 7,
  },
  {
    id: "10",
    name: "Mid-Rise Panty Pack of 3 - Black, Pink & Nude",
    price: 599,
    category: "panties",
    sizes: ['S', 'M', 'L', 'XL', 'XXL', 'XXXL'],
    colors: ['All Combined'],
    image: midrise_black_pink_nude,
    images: [midrise_black_pink_nude],
    description: "Value pack of 3 comfortable mid-rise hipster panties in Black, Pink and Nude. Soft bonded edges for an invisible finish under clothing.",
    fabric: "90% Nylon, 10% Elastane",
    care: "Hand wash cold. Lay flat to dry.",
    isBestseller: true,
    stock: 33,
  },
  {
    id: "11",
    name: "Mid-Rise Panty Pack of 3 - Magenta, Grey & Navy",
    price: 599,
    category: "panties",
    sizes: ['S', 'M', 'L', 'XL', 'XXL', 'XXXL'],
    colors: ['All Combined'],
    image: midrise_magenta_grey_navy,
    images: [midrise_magenta_grey_navy],
    description: "Value pack of 3 comfortable mid-rise hipster panties in Magenta, Grey and Navy. Soft bonded edges for an invisible finish under clothing.",
    fabric: "90% Nylon, 10% Elastane",
    care: "Hand wash cold. Lay flat to dry.",
    stock: 11,
  },
  {
    id: "12",
    name: "Camisole Padded Without Lace",
    price: 799,
    category: "camisoles",
    sizes: ['S', 'M', 'L', 'XL', 'XXL', 'XXXL'],
    colors: ['Black', 'White', 'Grey', 'Nude'],
    image: camisole_padded_black,
    images: [camisole_padded_black, camisole_padded_white, camisole_padded_grey, camisole_padded_nude],
    colorImages: {
      "Black": [camisole_padded_black],
      "White": [camisole_padded_white],
      "Grey": [camisole_padded_grey],
      "Nude": [camisole_padded_nude],
    },
    description: "Clean and minimal padded camisole without lace. Built-in shelf bra with removable pads for versatile styling. Available in 4 colours.",
    fabric: "92% Nylon, 8% Spandex",
    care: "Hand wash cold. Lay flat to dry.",
    isBestseller: true,
    stock: 27,
  },
  {
    id: "13",
    name: "Non Padded Lace Camisole",
    price: 699,
    category: "camisoles",
    sizes: ['S', 'M', 'L', 'XL', 'XXL', 'XXXL'],
    colors: ['Black', 'White', 'Grey', 'Nude'],
    image: lace_camisole_black,
    images: [lace_camisole_black, lace_camisole_white, lace_camisole_grey, lace_camisole_nude],
    colorImages: {
      "Black": [lace_camisole_black],
      "White": [lace_camisole_white],
      "Grey": [lace_camisole_grey],
      "Nude": [lace_camisole_nude],
    },
    description: "Delicate lace-trimmed camisole with a non-padded, natural silhouette. Perfect as an inner layer or lounging piece. Available in 4 colours.",
    fabric: "85% Nylon, 15% Polyester",
    care: "Hand wash cold. Do not bleach. Lay flat to dry.",
    isNew: true,
    stock: 5,
  },
];

export const getProductById = (id: string): Product | undefined => {
  return products.find((product) => product.id === id);
};

export const getProductsByCategory = (category: string): Product[] => {
  if (category === "all") return products;
  return products.filter((product) => product.category === category);
};

export const getBestsellers = (): Product[] => {
  return products.filter((product) => product.isBestseller);
};

export const getNewArrivals = (): Product[] => {
  return products.filter((product) => product.isNew);
};

export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);
};
