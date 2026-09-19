import { SAPProductsService } from "../_shared/sap-products.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const productsService = new SAPProductsService();
    
    // Test login explicitly to isolate auth failures
    try {
      await (productsService as any).sapClient.login();
    } catch (e) {
      return new Response(
        JSON.stringify({
          connected: false,
          error: "SAP Service Layer unavailable or authentication failed.",
        }),
        {
          status: 502,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Perform READ-ONLY request to /Items
    let items;
    try {
      items = await productsService.getProducts(1); // Only get 1 record
    } catch (e) {
      return new Response(
        JSON.stringify({
          connected: true,
          error: "Connected, but /Items request failed.",
        }),
        {
          status: 502,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    let sampleProduct = null;
    let actualFieldsFound: any = {};

    if (items && items.length > 0) {
      sampleProduct = items[0];
      
      // Determine what fields are present based on the mapped product
      const fieldsToCheck = [
        "itemCode",
        "name",
        "price",
        "stock",
        "warehouse",
        "category",
        "size",
        "color",
        "image"
      ];
      
      fieldsToCheck.forEach(field => {
        actualFieldsFound[field] = (sampleProduct as any)[field] !== undefined && (sampleProduct as any)[field] !== "" ? "FOUND" : "NOT FOUND (or empty)";
      });
    }

    return new Response(
      JSON.stringify({
        connected: true,
        sap: "reachable",
        sampleProduct,
        actualFieldsFound
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Test function error");
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
