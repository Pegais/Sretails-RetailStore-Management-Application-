# app.py (Flask microservice to convert PDF to SmartStore JSON)
from flask import Flask, request, jsonify
import os
import tabula
import pandas as pd
from datetime import datetime
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

UPLOAD_DIR = "uploads"
EXCEL_DIR = "excel_files"
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(EXCEL_DIR, exist_ok=True)


# Helper: Save file and return its path
def save_uploaded_file(file):
    timestamp = int(datetime.now().timestamp() * 1000)
    filename = f"{timestamp}-{file.filename}"
    file_path = os.path.join(UPLOAD_DIR, filename)
    file.save(file_path)
    return file_path, filename


# Helper: Convert PDF to Excel
def convert_pdf_to_excel(pdf_path, excel_filename):
    try:
        dfs = tabula.read_pdf(pdf_path, pages='all', multiple_tables=True, stream=True)
        excel_path = os.path.join(EXCEL_DIR, excel_filename)

        with pd.ExcelWriter(excel_path, engine='openpyxl') as writer:
            for i, df in enumerate(dfs):
                df.to_excel(writer, sheet_name=f"Sheet{i+1}", index=False)

        return dfs, excel_path
    except Exception as e:
        return None, str(e)


# Helper: Convert tabular data to SmartStore-compatible JSON
def parse_tables_to_smartstore_json(tables):
    items = []
    for df in tables:
        if df.empty or 'Description' not in df.columns[1]:
            continue

        for _, row in df.iterrows():
            try:
                item = {
                    "itemName": str(row.get("Description of Goods", "")).strip(),
                    "hsn": str(row.get("HSN/SAC", "")).strip(),
                    "quantity": str(row.get("Quantity", "")).strip(),
                    "rate": float(str(row.get("Rate", "")).replace(',', '').strip() or 0),
                    "amount": float(str(row.get("Amount", "")).replace(',', '').strip() or 0),
                    "unit": str(row.get("per", "")).strip()
                }
                if item['itemName']:
                    items.append(item)
            except Exception:
                continue
    return items


@app.route('/parse-pdf', methods=['POST'])
def parse_pdf():
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    pdf_path, filename = save_uploaded_file(file)
    excel_name = filename.replace(".pdf", ".xlsx")
    tables, excel_path_or_error = convert_pdf_to_excel(pdf_path, excel_name)

    if not tables:
        return jsonify({"error": "Failed to extract tables", "details": excel_path_or_error}), 500

    json_data = parse_tables_to_smartstore_json(tables)
    return jsonify({
        "message": "Parsed successfully",
        "itemCount": len(json_data),
        "fileName": filename,
        "excelPath": excel_path_or_error,
        "items": json_data
    })


@app.route('/parse-excel', methods=['POST'])
def parse_excel():
    try:
        file_path = request.json.get('filePath')

        if not file_path or not os.path.exists(file_path):
            return jsonify({'error': 'Excel file path not found or invalid'}), 400

        df = pd.read_excel(file_path)
        df.fillna("", inplace=True)

        # Basic logic to extract item rows (you'll improve later)
        items = []
        for _, row in df.iterrows():
            item = {
                "itemName": str(row.get("Description of Goods", "")).strip(),
                "hsn": str(row.get("HSN/SAC", "")).strip(),
                "quantity": str(row.get("Quantity", "")).strip(),
                "rate": float(row.get("Rate", 0)),
                "amount": float(row.get("Amount", 0)),
                "unit": str(row.get("per", "")).strip()
            }
            if item["itemName"]:  # Avoid blank rows
                items.append(item)

        # You can expand logic to detect dealer info if present in other sheets or rows
        result = {
            "dealer": {
                "dealerName": "UNKNOWN",
                "dealerGSTIN": "UNKNOWN"
            },
            "items": items
        }

        return jsonify(result), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500
if __name__ == '__main__':
    app.run(debug=True, port=5001)
