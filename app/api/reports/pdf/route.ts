import { NextResponse } from "next/server";
import { getAllProducts } from "@/app/lib/products";

function escapePdfText(text: string) {
  return text.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function createSimplePdf(lines: string[]) {
  const pageHeight = 792;
  const top = 740;
  const step = 18;
  const textCommands = lines
    .map((line, index) => {
      const y = top - index * step;
      return `BT /F1 12 Tf 50 ${y} Td (${escapePdfText(line)}) Tj ET`;
    })
    .join("\n");

  const streamContent = `${textCommands}\n`;
  const streamLength = Buffer.byteLength(streamContent, "utf8");

  const objects = [
    "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n",
    "2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n",
    "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n",
    `4 0 obj\n<< /Length ${streamLength} >>\nstream\n${streamContent}endstream\nendobj\n`,
    "5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n",
  ];

  const header = "%PDF-1.4\n";
  const chunks = [header, ...objects];

  const offsets: number[] = [0];
  let currentOffset = Buffer.byteLength(header, "utf8");

  for (const object of objects) {
    offsets.push(currentOffset);
    currentOffset += Buffer.byteLength(object, "utf8");
  }

  const xrefStart = currentOffset;
  const xrefLines = [
    "xref",
    `0 ${objects.length + 1}`,
    "0000000000 65535 f ",
    ...offsets.slice(1).map((offset) => `${offset.toString().padStart(10, "0")} 00000 n `),
    "trailer",
    `<< /Size ${objects.length + 1} /Root 1 0 R >>`,
    "startxref",
    String(xrefStart),
    "%%EOF",
  ];

  const pdf = chunks.join("") + xrefLines.join("\n");
  return Buffer.from(pdf, "utf8");
}

export async function GET() {
  const products = await getAllProducts();
  const inventoryValue = products.reduce((sum, item) => sum + item.price * item.stock, 0);
  const estimatedRevenue = inventoryValue * 0.59;

  const topProducts = [...products]
    .sort((a, b) => (b.rating === a.rating ? b.stock - a.stock : b.rating - a.rating))
    .slice(0, 5);

  const lines = [
    "Alpha Business Report",
    `Generated: ${new Date().toLocaleString()}`,
    "",
    `Revenue: $${Math.round(estimatedRevenue).toLocaleString()}`,
    `Products: ${products.length}`,
    `Inventory Value: $${Math.round(inventoryValue).toLocaleString()}`,
    "",
    "Top Products:",
    ...topProducts.map(
      (product, index) =>
        `${index + 1}. ${product.title} | Rating ${product.rating.toFixed(1)} | Stock ${product.stock}`,
    ),
  ];

  const pdfBuffer = createSimplePdf(lines);

  return new NextResponse(pdfBuffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="alpha-report.pdf"',
      "Cache-Control": "no-store",
    },
  });
}
