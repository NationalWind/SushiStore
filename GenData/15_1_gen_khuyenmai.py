import csv
import random
from datetime import datetime, timedelta

# File path for the KHUYENMAIKHACHHANG CSV
khuyenmaikhachhang_csv_file = "15_1_KHUYENMAI_data.csv"

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
    thongtinkhuyenmai = f"Info {i}"
    loaikhuyenmai = 'Customer'
    # Append the row to the data list
    khuyenmaikhachhang_data.append([makhuyenmai, thongtinkhuyenmai, loaikhuyenmai])

# Write to CSV
with open(khuyenmaikhachhang_csv_file, mode="w", encoding="utf-8", newline="") as file:
    writer = csv.writer(file, quoting=csv.QUOTE_NONE)  # Avoid quoting
    # Write header
    writer.writerow(["MAKHUYENMAI", "THONGTINKHUYENMAI", "LOAIKHUYENMAI"])
    # Write rows
    writer.writerows(khuyenmaikhachhang_data)

print(f"KHUYENMAIKHACHHANG data has been generated into the file: {khuyenmaikhachhang_csv_file}")
