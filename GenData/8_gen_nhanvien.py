import csv
from faker import Faker
import random
from datetime import datetime

# Initialize faker
fake = Faker()

# File paths
nhanvien_csv_file = "8_NHANVIEN_data.csv"
chinhanh_csv_file = "7_CHINHANH_data.csv"
dondatmon_csv_file = "4_DONDATMON_data.csv"

# Load CHINHANH data
with open(chinhanh_csv_file, mode="r", encoding="utf-8") as file:
    chinhanh_data = [row for row in csv.reader(file)][1:]  # Skip header row

# Load DONDATMON data
with open(dondatmon_csv_file, mode="r", encoding="utf-8") as file:
    dondatmon_data = [row for row in csv.reader(file)][1:]  # Skip header row

# Extract CHINHANHLAMVIEC (branch IDs) from CHINHANH
chinhanh_set = set(row[0] for row in chinhanh_data)  # MACHINHANH column (index 0)

# Extract MANHANVIEN (employee IDs) from DONDATMON
manhanvien_set = set(row[6] for row in dondatmon_data)  # NHANVIENQUANLY column (index 6)

# Generate NHANVIEN data
nhanvien_data = []

for index in range(1, 101):  # Generate 100 employees for example
    manhanvien = f"NV{index:08d}"  # Generate unique MANHANVIEN
    hoten = fake.name()  # Random name
    ngaysinh = fake.date_of_birth(minimum_age=18, maximum_age=60).strftime("%Y-%m-%d")  # Random date of birth (18-60 years old)
    gioitinh = random.choice(['MALE', 'FEMALE'])  # Random gender
    sdt = fake.phone_number()[:10]  # Random phone number (ensure 10 digits)
    email = fake.email()  # Random email
    # Random address without commas
    diachi = fake.address().replace("\n", " ").replace(",", "")  # Remove commas from address
    chinhanhlamviec = random.choice(list(chinhanh_set))  # Random CHINHANHLAMVIEC (branch ID)
    luonghientai = round(random.uniform(5000000, 20000000), 2)  # Random salary between 5,000,000 and 20,000,000

    nhanvien_data.append([
        manhanvien, hoten, ngaysinh, gioitinh, sdt, email, diachi, chinhanhlamviec, luonghientai
    ])

# Write to CSV
with open(nhanvien_csv_file, mode="w", encoding="utf-8", newline="") as file:
    writer = csv.writer(file)
    # Write header
    writer.writerow([
        "MANHANVIEN", "HOTEN", "NGAYSINH", "GIOITINH", "SDT", "EMAIL", "DIACHI", 
        "CHINHANHLAMVIEC", "LUONGHIENTAI"
    ])
    # Write rows
    writer.writerows(nhanvien_data)

print(f"NHANVIEN data has been generated into the file: {nhanvien_csv_file}")
