import csv
from faker import Faker
import random
from datetime import datetime, timedelta

# Initialize faker
fake = Faker()

# File paths
hoadon_csv_file = "6_HOADON_data.csv"
dondatmon_csv_file = "4_DONDATMON_data.csv"
khachhang_csv_file = "5_KHACHHANG_data.csv"

# Load KHACHHANG and DONDATMON data
with open(dondatmon_csv_file, mode="r", encoding="utf-8") as file:
    dondatmon_data = [row for row in csv.reader(file)][1:]  # Skip the header row

with open(khachhang_csv_file, mode="r", encoding="utf-8") as file:
    khachhang_data = [row for row in csv.reader(file)][1:]  # Skip the header row

khachhang_ids = [row[0] for row in khachhang_data]  # Extract MAKHACHHANG
machinhanh_set = set(row[8] for row in dondatmon_data)  # Extract MACHINHANH from DONDATMON data
dondatmon_by_hoadon = {}

# Group DONDATMON by MAHOADON
for row in dondatmon_data:
    hoadon_id = row[5]  # HOADONLIENQUAN
    thanhtien = float(row[10])  # THANHTIEN
    trangthai = row[3]  # TRANGTHAI
    if trangthai == "Successful":  # Include only successful orders
        if hoadon_id not in dondatmon_by_hoadon:
            dondatmon_by_hoadon[hoadon_id] = []
        dondatmon_by_hoadon[hoadon_id].append(thanhtien)

# Generate data for HOADON
hoadon_data = []

for index, (mahoadon, thanhtien_list) in enumerate(dondatmon_by_hoadon.items(), 1):
    giolap = (datetime.now() - timedelta(hours=index % 24, minutes=index % 60)).strftime("%H:%M:%S")
    ngaylap = fake.date_this_year()
    vat = random.choice([0.05, 0.10])  # Random VAT: 5% or 10%
    tienkhachdua = sum(thanhtien_list) * (1 + vat) + random.uniform(5000, 20000)  # Ensure payment > total
    trangthai = random.choice(['Unpaid', 'Paid', 'Cancelled'])
    phuongthuc = random.choice(['Bank transfer', 'Cash', 'Credit card'])
    
    # Ensure valid MAKHACHHANG (it must exist in KHACHHANG data)
    makhachhang = random.choice(khachhang_ids)
    
    # Ensure valid MACHINHANH (it must exist in DONDATMON data)
    machinhanh = random.choice(list(machinhanh_set))  # Random MACHINHANH that exists in DONDATMON
    
    tongtientruockm = round(sum(thanhtien_list) * (1 + vat), 2)

    # Assume discounts: random percent (0–20%) and fixed amount (0–5000)
    discount_percent = random.uniform(0, 0.20)  # 0% to 20%
    discount_fixed = random.uniform(0, 5000)  # 0 to 5000
    tongtiensaukm = round(tongtientruockm * (1 - discount_percent) - discount_fixed, 2)

    # Ensure TONGTIENSAUKM is not negative
    tongtiensaukm = max(tongtiensaukm, 0)

    hoadon_data.append([
        mahoadon, giolap, ngaylap, vat, round(tienkhachdua, 2), trangthai, phuongthuc,
        makhachhang, machinhanh, tongtientruockm, tongtiensaukm
    ])

# Write to CSV
with open(hoadon_csv_file, mode="w", encoding="utf-8", newline="") as file:
    writer = csv.writer(file)
    # Write header
    writer.writerow([
        "MAHOADON", "GIOLAP", "NGAYLAP", "VAT", "TIENKHACHDUA", "TRANGTHAI", "PHUONGTHUC",
        "MAKHACHHANG", "MACHINHANH", "TONGTIENTRUOCKM", "TONGTIENSAUKM"
    ])
    # Write rows
    writer.writerows(hoadon_data)

print(f"HOADON data has been generated into the file: {hoadon_csv_file}")
