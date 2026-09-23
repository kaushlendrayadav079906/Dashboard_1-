import jsPDF from "jspdf";

interface ReceiptItem {
  product_name: string;
  quantity: number;
  price: number;
  size?: string | null;
  item_code?: string | null;
}

interface ReceiptData {
  orderId: string;
  createdAt: string;
  status: string;
  total: number;
  items: ReceiptItem[];
  shipping: any;
}

export const generateReceiptPDF = (data: ReceiptData) => {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 48;
  let y = 60;

  // Brand header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(40, 40, 40);
  doc.text("Ela", margin, y);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(120, 120, 120);
  doc.text("by KOOL LIFESTYLE", margin + 38, y);

  // Right: Receipt label
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(40, 40, 40);
  doc.text("ORDER RECEIPT", pageWidth - margin, y, { align: "right" });

  y += 12;
  doc.setDrawColor(214, 51, 132);
  doc.setLineWidth(1.2);
  doc.line(margin, y, pageWidth - margin, y);

  y += 28;

  // Order meta
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text("Order Number", margin, y);
  doc.text("Date", pageWidth / 2, y);

  y += 14;
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 30, 30);
  doc.text(`#${data.orderId.slice(0, 8).toUpperCase()}`, margin, y);
  doc.text(new Date(data.createdAt).toLocaleString("en-IN"), pageWidth / 2, y);

  y += 22;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text("Status", margin, y);
  y += 14;
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 30, 30);
  doc.text(data.status.toUpperCase(), margin, y);

  y += 32;

  // Shipping
  if (data.shipping) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("Shipping Address", margin, y);
    y += 16;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(70, 70, 70);
    const lines = [
      `${data.shipping.firstName ?? ""} ${data.shipping.lastName ?? ""}`.trim(),
      data.shipping.address ?? "",
      `${data.shipping.city ?? ""}, ${data.shipping.state ?? ""} - ${data.shipping.pincode ?? ""}`,
      `Phone: ${data.shipping.phone ?? ""}`,
      `Email: ${data.shipping.email ?? ""}`,
    ];
    lines.forEach((l) => {
      doc.text(l, margin, y);
      y += 13;
    });
    y += 14;
  }

  // Items table header
  doc.setFillColor(245, 240, 235);
  doc.rect(margin, y, pageWidth - margin * 2, 22, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(60, 60, 60);
  doc.text("ITEM", margin + 8, y + 14);
  doc.text("SIZE", margin + 260, y + 14);
  doc.text("QTY", margin + 320, y + 14);
  doc.text("PRICE", margin + 370, y + 14);
  doc.text("TOTAL", pageWidth - margin - 8, y + 14, { align: "right" });
  y += 30;

  // Items rows
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(40, 40, 40);
  data.items.forEach((item) => {
    if (y > 720) {
      doc.addPage();
      y = 60;
    }
    const name = item.product_name.length > 38 ? item.product_name.slice(0, 36) + "…" : item.product_name;
    doc.text(name, margin + 8, y);
    if (item.item_code) {
      doc.setFontSize(8);
      doc.setTextColor(140, 140, 140);
      doc.text(item.item_code, margin + 8, y + 11);
      doc.setFontSize(10);
      doc.setTextColor(40, 40, 40);
    }
    doc.text(item.size ?? "-", margin + 260, y);
    doc.text(String(item.quantity), margin + 320, y);
    doc.text(`Rs. ${Number(item.price).toFixed(0)}`, margin + 370, y);
    doc.text(`Rs. ${(Number(item.price) * item.quantity).toFixed(0)}`, pageWidth - margin - 8, y, { align: "right" });
    y += item.item_code ? 26 : 18;
  });

  y += 8;
  doc.setDrawColor(220, 220, 220);
  doc.line(margin, y, pageWidth - margin, y);
  y += 22;

  // Totals
  const subtotal = data.items.reduce((s, i) => s + Number(i.price) * i.quantity, 0);
  const shippingCost = data.total - subtotal;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text("Subtotal", pageWidth - margin - 120, y);
  doc.setTextColor(30, 30, 30);
  doc.text(`Rs. ${subtotal.toFixed(0)}`, pageWidth - margin - 8, y, { align: "right" });
  y += 16;
  doc.setTextColor(100, 100, 100);
  doc.text("Shipping", pageWidth - margin - 120, y);
  doc.setTextColor(30, 30, 30);
  doc.text(shippingCost > 0 ? `Rs. ${shippingCost.toFixed(0)}` : "Free", pageWidth - margin - 8, y, { align: "right" });
  y += 22;

  doc.setDrawColor(214, 51, 132);
  doc.line(pageWidth - margin - 200, y - 6, pageWidth - margin, y - 6);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(30, 30, 30);
  doc.text("Total Paid", pageWidth - margin - 120, y + 8);
  doc.text(`Rs. ${data.total.toFixed(0)}`, pageWidth - margin - 8, y + 8, { align: "right" });

  // Footer
  const footerY = doc.internal.pageSize.getHeight() - 60;
  doc.setDrawColor(220, 220, 220);
  doc.line(margin, footerY - 10, pageWidth - margin, footerY - 10);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(120, 120, 120);
  doc.text("Thank you for shopping with Ela.", margin, footerY);
  doc.text("3rd Floor, Bharat Insurance Building, Horniman Circle, Fort, Mumbai - 400001", margin, footerY + 12);
  doc.text("accounts@koollife.in  |  +91 98695 23955", margin, footerY + 24);

  doc.save(`Ela-Receipt-${data.orderId.slice(0, 8).toUpperCase()}.pdf`);
};
