import fs from "node:fs/promises";
import path from "node:path";

export const dynamic = "force-static";

export async function GET() {
  const file = path.join(process.cwd(), "scripts", "broker-csv-template.csv");
  const content = await fs.readFile(file, "utf8").catch(() => "symbol,quantity,avgCost,assetType,sector,geography,currency\n");
  return new Response(content, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="broker-csv-template.csv"',
    },
  });
}
