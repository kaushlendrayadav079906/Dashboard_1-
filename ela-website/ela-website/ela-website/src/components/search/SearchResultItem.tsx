  const stockValue = product.stock ?? product.quantity;
  const hasStock = stockValue !== undefined && stockValue !== null;

  return (