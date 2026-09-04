import logging
import traceback
from typing import List, Any
from sqlalchemy.orm import Session
from uuid import UUID

from app.models.upload import FileUpload
from app.models.staging import StagedRecord
from app.services.storage import storage_service
from app.services.parsers import parse_file

# Import Phase 3 models for mapping
from app.models.factory import Factory
from app.models.product import Product
from app.models.customer import Customer
from app.models.vendor import Vendor
from app.models.inventory_item import InventoryItem
from app.models.financial_transaction import FinancialTransaction
from app.models.kpi_snapshot import KpiSnapshot

logger = logging.getLogger(__name__)

class IngestionError(Exception):
    pass

def process_upload(db: Session, upload_id: UUID, company_id: UUID):
    """
    Background task to process an uploaded file.
    Validates company context, parses file, stages data, and imports transactionally.
    """
    upload = db.query(FileUpload).filter(FileUpload.id == upload_id, FileUpload.company_id == company_id).first()
    if not upload:
        logger.error(f"Upload {upload_id} not found or tenant mismatch")
        return

    if upload.status != "uploaded":
        return

    upload.status = "processing"
    db.commit()

    try:
        # 1. Parse file
        file_path = storage_service.get_file_path(upload.stored_filename)
        raw_records = parse_file(file_path, upload.file_type)
        
        # 2. Convert to StagedRecord
        staged_items = []
        for raw in raw_records:
            staged = StagedRecord(
                company_id=company_id,
                upload_id=upload_id,
                target_entity=target_entity,
                raw_data=raw,
                status="pending"
            )
            staged_items.append(staged)
            
        db.add_all(staged_items)
        db.flush() # flush to get staged IDs
        
        # 3. Transactional mapping (if target_entity is supported)
        if target_entity:
            # We map to business entities
            _map_to_business_entities(db, company_id, target_entity, staged_items)
            
        upload.status = "completed"
        db.commit()

    except Exception as e:
        db.rollback()
        upload.status = "failed"
        upload.error_message = str(e)
        
        # If it was a mapping error, the StagedRecords might have been flushed. 
        # But we rolled back, so they are gone. We need to save the failure status on the upload.
        db.add(upload)
        db.commit()

def _map_to_business_entities(db: Session, company_id: UUID, target_entity: str, staged_items: List[StagedRecord]):
    """
    Validates and maps staged items to target Phase 3 entities.
    Raises exception if validation fails to rollback transaction.
    """
    mapped_objects = []
    
    for item in staged_items:
        data = item.raw_data
        
        if target_entity == "Factory":
            # Map basic factory fields
            if "name" not in data or "code" not in data:
                raise IngestionError(f"Missing required fields for Factory in row: {data}")
            
            obj = Factory(
                company_id=company_id,
                name=str(data["name"]),
                code=str(data["code"]),
                location=str(data.get("location", ""))
            )
            mapped_objects.append(obj)
            item.status = "imported"
            
        elif target_entity == "FinancialTransaction":
            # Map transaction
            if "amount" not in data or "transaction_date" not in data or "type" not in data:
                raise IngestionError(f"Missing required fields for FinancialTransaction in row: {data}")
                
            # Requires parsing amounts securely
            try:
                amount = float(data["amount"])
            except ValueError:
                raise IngestionError(f"Invalid amount format: {data['amount']}")
                
            from datetime import datetime
            try:
                # expecting YYYY-MM-DD
                t_date = datetime.strptime(str(data["transaction_date"]).split("T")[0], "%Y-%m-%d").date()
            except ValueError:
                raise IngestionError(f"Invalid date format: {data['transaction_date']}")
            
            # Map factory_id safely if present
            factory_id = data.get("factory_id")
            if factory_id:
                try:
                    factory_uuid = UUID(str(factory_id))
                    # verify factory belongs to company
                    fac = db.query(Factory).filter(Factory.id == factory_uuid, Factory.company_id == company_id).first()
                    if not fac:
                        raise IngestionError(f"Factory {factory_id} not found or doesn't belong to company.")
                except ValueError:
                    raise IngestionError(f"Invalid factory_id UUID: {factory_id}")
            else:
                factory_uuid = None
                
            obj = FinancialTransaction(
                company_id=company_id,
                factory_id=factory_uuid,
                amount=amount,
                transaction_type=str(data["type"]),
                currency_code=str(data.get("currency_code", "USD")),
                description=str(data.get("description", "")),
                transaction_date=t_date
            )
            mapped_objects.append(obj)
            item.status = "imported"
            
        else:
            # We don't fail the upload if it's an unsupported entity to map, we just stage it
            # But prompt says: "Only implement mappings that are explicitly supported... Unknown columns must not silently overwrite data."
            # So if target_entity is provided but not supported for mapping, we raise an error.
            raise IngestionError(f"Unsupported target_entity mapping: {target_entity}")
            
    if mapped_objects:
        db.add_all(mapped_objects)
