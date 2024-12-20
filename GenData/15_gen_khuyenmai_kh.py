import csv
import random
from datetime import datetime, timedelta

# File path for the KHUYENMAIKHACHHANG CSV
khuyenmaikhachhang_csv_file = "15_KHUYENMAIKHACHHANG_data.csv"

# Number of records to generate (250 rows)
num_records = 250

# Generate data for KHUYENMAIKHACHHANG
khuyenmaikhachhang_data = []

# Function to generate a random date within a range
def random_date(start_date, end_date):
    return start_date + timedelta(days=random.randint(0, (end_date - start_date).days))

# Create the data
for i in range(1, num_records + 1):
    makhuyenmai = f"KM{i:08d}"  # MAKHUYENMAI from KM00000001 to KM00000250
    trangthaidung = random.choice([0, 1])  # TRANGTHAIDUNG randomly 0 or 1
    makhachhang = f"KH{random.randint(1, 500):08d}" if random.choice([True, False]) else None  # MAKHACHHANG from KH00000001 to KH00000500
    
    # Random NGAYBATDAU date
    ngaybatdau = random_date(datetime(2020, 1, 1), datetime(2023, 12, 31))
    
    # Generate NGAYKETTHUC to be after NGAYBATDAU
    ngayketthuc = random_date(ngaybatdau, datetime(2025, 12, 31)).strftime("%Y-%m-%d")
    ngaybatdau = ngaybatdau.strftime("%Y-%m-%d")
    
    # GIATRITOITHIEU and LUONGKMTIEN
    giatritoithieu = round(random.uniform(1000, 5000), 2)  # Random value between 1000 and 5000
    luongkmtien = round(random.uniform(50, 2000), 2)  # Random value between 50 and 2000
    
    # Append the row to the data list
    khuyenmaikhachhang_data.append([makhuyenmai, trangthaidung, makhachhang, ngaybatdau, ngayketthuc, giatritoithieu, luongkmtien])

# Write to CSV
with open(khuyenmaikhachhang_csv_file, mode="w", encoding="utf-8", newline="") as file:
    writer = csv.writer(file, quoting=csv.QUOTE_NONE)  # Avoid quoting
    # Write header
    writer.writerow(["MAKHUYENMAI", "TRANGTHAIDUNG", "MAKHACHHANG", "NGAYBATDAU", "NGAYKETTHUC", "GIATRITOITHIEU", "LUONGKMTIEN"])
    # Write rows
    writer.writerows(khuyenmaikhachhang_data)

print(f"KHUYENMAIKHACHHANG data has been generated into the file: {khuyenmaikhachhang_csv_file}")
