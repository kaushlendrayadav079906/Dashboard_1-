// This file contains the minimal trusted catalog for server-side price validation.
// IMPORTANT: This must remain synchronized with src/data/products.ts
// until a proper database-backed product catalog is introduced.

export const trustedProducts: Record<string, { price: number }> = {
  "1": { price: 599 },
  "2": { price: 699 },
  "3": { price: 699 },
  "4": { price: 699 },
  "5": { price: 499 },
  "6": { price: 499 },
  "7": { price: 499 },
  "8": { price: 599 },
  "9": { price: 599 },
  "10": { price: 599 },
  "11": { price: 599 },
  "12": { price: 799 },
  "13": { price: 699 },
};

export function calculateOrderTotal(items: { id: string; quantity: number }[]): { subtotal: number; shipping: number; total: number } {
  let subtotal = 0;
  
  for (const item of items) {
    const product = trustedProducts[item.id];
    if (!product) {
      throw new Error(`Invalid product ID: ${item.id}`);
    }
    if (item.quantity <= 0) {
      throw new Error(`Invalid quantity for product ID: ${item.id}`);
    }
    subtotal += product.price * item.quantity;
  }
  
  const shipping = subtotal >= 1999 ? 0 : 99;
  const total = subtotal + shipping;
  
  return { subtotal, shipping, total };
}
