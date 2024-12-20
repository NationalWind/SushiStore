import csv
import random
from faker import Faker
from datetime import datetime, timedelta

# Initialize faker
fake = Faker()

# File path for the CHITIETKHACHHANG CSV
chitietkhachhang_csv_file = "10_CHITIETKHACHHANG_data.csv"

# Number of records
num_records = 500

# Generate data for CHITIETKHACHHANG
chitietkhachhang_data = []

for index in range(1, num_records + 1):
    makhachhang = f"KH{index:08d}"  # Sequential MAKHACHHANG from 1 to 500
    mathe = random.choice(['M', 'S', 'G'])  # Random MATHE from 'M', 'S', 'G'
    ngaydk = fake.date_this_decade()  # Random date in the last decade
    diemticluy = random.randint(0, 1000)  # Random non-negative integer for DIEMTICHLUY
    ngaynanghang = fake.date_between(start_date=ngaydk)  # Random date after NGAYDK
    trangthaitaikhoan = random.choice(['Active', 'Deleted', 'Inactive'])  # Random TRANGTHAITAIKHOAN
    nhanvientaolap = f"NV{random.randint(1, 200):08d}"  # Random NHANVIENTAOLAP from 1 to 200

    chitietkhachhang_data.append([
        makhachhang, mathe, ngaydk, diemticluy, ngaynanghang, trangthaitaikhoan, nhanvientaolap
    ])

# Write to CSV
with open(chitietkhachhang_csv_file, mode="w", encoding="utf-8", newline="") as file:
    writer = csv.writer(file, quoting=csv.QUOTE_NONE)  # Avoid quoting
    # Write header
    writer.writerow([
        "MAKHACHHANG", "MATHE", "NGAYDK", "DIEMTICHLUY", "NGAYNANGHANG", "TRANGTHAITAIKHOAN", "NHANVIENTAOLAP"
    ])
    # Write rows
    writer.writerows(chitietkhachhang_data)

print(f"CHITIETKHACHHANG data has been generated into the file: {chitietkhachhang_csv_file}")
