import pytest
import os
import json
from app.services.parsers import parse_csv, parse_json, parse_xml, parse_txt, parse_xlsx, parse_file

def test_parse_csv(tmp_path):
    p = tmp_path / "test.csv"
    p.write_text("name,amount\nFactory1,1000\nFactory2,2000")
    records = parse_csv(str(p))
    assert len(records) == 2
    assert records[0]["name"] == "Factory1"
    assert records[0]["amount"] == "1000"

def test_parse_json(tmp_path):
    p = tmp_path / "test.json"
    p.write_text(json.dumps([{"name": "Factory1"}, {"name": "Factory2"}]))
    records = parse_json(str(p))
    assert len(records) == 2
    assert records[1]["name"] == "Factory2"

def test_parse_xml(tmp_path):
    p = tmp_path / "test.xml"
    p.write_text("""<?xml version="1.0"?>
    <root>
        <record><name>Factory1</name><amount>1000</amount></record>
        <record><name>Factory2</name><amount>2000</amount></record>
    </root>""")
    records = parse_xml(str(p))
    assert len(records) == 2
    assert records[0]["name"] == "Factory1"
    assert records[0]["amount"] == "1000"

def test_parse_txt(tmp_path):
    p = tmp_path / "test.txt"
    p.write_text("Line 1\nLine 2\n\nLine 3")
    records = parse_txt(str(p))
    assert len(records) == 3
    assert records[0]["raw_line"] == "Line 1"

def test_parse_xlsx(tmp_path):
    from openpyxl import Workbook
    p = tmp_path / "test.xlsx"
    wb = Workbook()
    ws = wb.active
    ws.append(["name", "amount"])
    ws.append(["Factory1", 1000])
    ws.append(["Factory2", 2000])
    wb.save(str(p))
    
    records = parse_xlsx(str(p))
    assert len(records) == 2
    assert records[0]["name"] == "Factory1"
    assert records[0]["amount"] == 1000
    
def test_parse_file_factory(tmp_path):
    p = tmp_path / "test.json"
    p.write_text(json.dumps([{"test": 1}]))
    res = parse_file(str(p), "json")
    assert len(res) == 1
    assert res[0]["test"] == 1
