import { SAPServiceLayerClient } from "./sap.ts";

export interface ELASAPProduct {
  id: string; // ELA product ID, maps from ItemCode
  itemCode: string;
  name: string;
  price: number;
  stock: number;
  warehouse: string;
  category: string;
  size: string;
  color: string;
  image: string;
}

export class SAPProductsService {
  private sapClient: SAPServiceLayerClient;

  constructor() {
    this.sapClient = new SAPServiceLayerClient();
  }

  /**
   * Fetches products from SAP and maps them to the ELA product format.
   * This handles the core SAP -> ELA mapping logic.
   */
  public async getProducts(top = 100): Promise<ELASAPProduct[]> {
    const response = await this.sapClient.get("Items", {
      $top: top,
      $filter: "Valid eq 'tYES' and Frozen eq 'tNO'",
      $select:
        "ItemCode,ItemName,ItemPrices,ItemWarehouseInfoCollection,BarCode,U_Category,U_SUBG,U_Size,U_Colour,Picture,AttachmentEntry",
    });

    const items = response?.value || [];
    return items.map((rawItem: any) => this.mapSAPItemToELA(rawItem));
  }

  /**
   * Maps a raw SAP Item object to the ELA product format.
   * Based on the confirmed POS implementation.
   */
  private mapSAPItemToELA(rawItem: any): ELASAPProduct {
    // 1. Price Mapping
    const defaultPriceList = Number(Deno.env.get("SAP_DEFAULT_PRICE_LIST") || 1);
    let price = 0;
    const prices = rawItem.ItemPrices || rawItem.ItemPricesCollection || [];
    for (const p of prices) {
      if (p.PriceList === defaultPriceList && p.Price !== undefined) {
        price = p.Price;
        break;
      }
    }
    if (!price && rawItem.AvgStdPrice) price = rawItem.AvgStdPrice;

    // 2. Stock and Warehouse Mapping
    let stock = 0;
    let warehouse = "";
    const warehouses = rawItem.ItemWarehouseInfoCollection || [];
    if (warehouses.length > 0) {
      // Sum all warehouses for total stock, or take the first as the primary
      let totalStock = 0;
      warehouses.forEach((w: any) => {
        totalStock += w.InStock || 0;
      });
      stock = totalStock;
      warehouse = warehouses[0].WarehouseCode || "";
    } else {
      stock = rawItem.QuantityOnStock || 0;
    }

    // 3. Category Mapping
    // SAP UDFs vary, check U_Category first, then U_SUBG, fallback to ItemsGroupCode
    let category = rawItem.U_Category || rawItem.U_SUBG || rawItem.ItemsGroupCode || "";
    if (typeof category === "number") {
      category = String(category);
    }

    return {
      id: rawItem.ItemCode || "", // Using ItemCode as ELA ID for now
      itemCode: rawItem.ItemCode || "",
      name: rawItem.ItemName || "",
      price: price,
      stock: stock,
      warehouse: warehouse,
      category: category,
      size: rawItem.U_Size || "",
      color: rawItem.U_Colour || "",
      image: rawItem.Picture || "", // Advanced attachment mapping (Attachments2) requires separate endpoint/logic
    };
  }
}
