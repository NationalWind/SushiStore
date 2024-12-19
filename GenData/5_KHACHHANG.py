import csv
from faker import Faker
import random

# Initialize faker
fake = Faker()

# File paths
dondatmon_csv_file = "4_DONDATMON_data_corrected.csv"
khachhang_csv_file = "5_KHACHHANG_data.csv"

# Load KHACHHANGDAT from DONDATMON
with open(dondatmon_csv_file, mode="r", encoding="utf-8") as file:
    dondatmon_data = [row for row in csv.reader(file)][1:]  # Skip the header row

# Extract unique KHACHHANGDAT values
khachhangdat_values = list(set(row[6] for row in dondatmon_data))  # KHACHHANGDAT is at index 6

# Ensure unique MAKHACHHANG
unique_makhachhang = set()
khachhang_data = []

for khachhangdat in khachhangdat_values:
    while khachhangdat in unique_makhachhang:
        # If duplicate, append random digits to make it unique
        khachhangdat = f"{khachhangdat[:6]}{random.randint(1000, 9999):04d}"
    unique_makhachhang.add(khachhangdat)

    hoten = fake.name()
    sdt = f"0{random.randint(100000000, 999999999)}"  # Random 10-digit phone number starting with 0
    email = fake.email()
    cccd = f"{random.randint(100000000000, 999999999999)}"  # Random 12-digit number for CCCD

    khachhang_data.append([khachhangdat, hoten, sdt, email, cccd])

# Write to CSV
with open(khachhang_csv_file, mode="w", encoding="utf-8", newline="") as file:
    writer = csv.writer(file)
    # Write header
    writer.writerow(["MAKHACHHANG", "HOTEN", "SDT", "EMAIL", "CCCD"])
    # Write rows
    writer.writerows(khachhang_data)

print(f"KHACHHANG data has been generated into the file: {khachhang_csv_file}")
