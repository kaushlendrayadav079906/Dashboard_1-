import csv
import json
import defusedxml.ElementTree as ET
import openpyxl

def parse_csv(file_path: str) -> list[dict]:
    with open(file_path, mode='r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        return [row for row in reader]

def parse_json(file_path: str) -> list[dict]:
    with open(file_path, mode='r', encoding='utf-8') as f:
        data = json.load(f)
        if isinstance(data, dict):
            return [data]
        elif isinstance(data, list):
            return data
        else:
            raise ValueError("JSON root must be object or array")

def parse_xml(file_path: str) -> list[dict]:
    tree = ET.parse(file_path)
    root = tree.getroot()
    records = []
    for child in root:
        record = {}
        for elem in child:
            record[elem.tag] = elem.text
        records.append(record)
    return records

def parse_txt(file_path: str) -> list[dict]:
    # Roadmap requirement says TXT must follow predefined structure.
    # We will assume a simple tab-separated or structured lines.
    # For now, if undefined, we stage as raw lines.
    records = []
    with open(file_path, mode='r', encoding='utf-8') as f:
        for line in f:
            stripped = line.strip()
            if stripped:
                records.append({"raw_line": stripped})
    return records

def parse_xlsx(file_path: str) -> list[dict]:
    wb = openpyxl.load_workbook(file_path, read_only=True, data_only=True)
    sheet = wb.active
    rows = sheet.iter_rows(values_only=True)
    
    headers = next(rows, None)
    if not headers:
        return []
        
    records = []
    for row in rows:
        record = dict(zip(headers, row))
        records.append(record)
    
    wb.close()
    return records

def parse_file(file_path: str, file_type: str) -> list[dict]:
    parsers = {
        "csv": parse_csv,
        "json": parse_json,
        "xml": parse_xml,
        "txt": parse_txt,
        "xlsx": parse_xlsx
    }
    
    parser = parsers.get(file_type.lower())
    if not parser:
        raise ValueError(f"Unsupported file type: {file_type}")
        
    return parser(file_path)
