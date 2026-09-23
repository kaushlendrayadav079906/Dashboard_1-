from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


class SAPProductItem(BaseModel):
    ItemCode: Optional[str] = None
    ItemName: Optional[str] = None
    BarCode: Optional[str] = None
    ItemPrices: Optional[List[Dict[str, Any]]] = None
    ItemWarehouseInfoCollection: Optional[List[Dict[str, Any]]] = None
    ItemsGroupCode: Optional[int] = None
    U_Category: Optional[str] = None
    U_SUBG: Optional[str] = None
    U_Size: Optional[str] = None
    U_Colour: Optional[str] = None


class ProductRead(BaseModel):
    id: str
    name: str
    item_code: Optional[str] = None
    barcode: Optional[str] = None
    price: float
    original_price: Optional[float] = None
    category: str
    sizes: List[str] = Field(default_factory=list)
    colors: List[str] = Field(default_factory=list)
    image: Optional[str] = None
    images: List[str] = Field(default_factory=list)
    description: Optional[str] = None
    fabric: Optional[str] = None
    care: Optional[str] = None
    stock: Optional[int] = None
    item_group_code: Optional[int] = None

    class Config:
        orm_mode = True
