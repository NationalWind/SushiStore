import csv
import random
from faker import Faker
from datetime import datetime, timedelta

# Initialize faker
fake = Faker()

# File path for the NHANVIEN CSV
nhanvien_csv_file = "8_NHANVIEN_data.csv"

# Number of employees
num_employees = 200

# Generate data for NHANVIEN
nhanvien_data = []

for index in range(1, num_employees + 1):
    manhanvien = f"NV{index:08d}"  # Sequential MANHANVIEN from 1 to 200
    hoten = fake.name().replace(",", "")  # Remove commas from name
    ngaysinh = fake.date_of_birth(minimum_age=18, maximum_age=60)  # Random date of birth for ages 18-60
    gioitinh = random.choice(["MALE", "FEMALE"])  # Random gender
    sdt = f"0{random.randint(100000000, 999999999)}"  # Random phone number
    email = fake.email().replace(",", "")  # Remove commas from email
    diachi = fake.address().replace("\n", ", ").replace(",", "")  # Remove commas from address
    chinhanhlamviec = f"CN{random.randint(1, 10):08d}"  # Random branch ID from 1 to 10
    luonghientai = round(random.uniform(5000, 50000), 2)  # Random salary between 5,000 and 50,000

    nhanvien_data.append([
        manhanvien, hoten, ngaysinh, gioitinh, sdt, email, diachi, chinhanhlamviec, luonghientai
    ])

# Write to CSV
with open(nhanvien_csv_file, mode="w", encoding="utf-8", newline="") as file:
    writer = csv.writer(file, quoting=csv.QUOTE_NONE)  # Avoid quoting
    # Write header
    writer.writerow([
        "MANHANVIEN", "HOTEN", "NGAYSINH", "GIOITINH", "SDT", "EMAIL", 
        "DIACHI", "CHINHANHLAMVIEC", "LUONGHIENTAI"
    ])
    # Write rows
    writer.writerows(nhanvien_data)

print(f"NHANVIEN data has been generated into the file: {nhanvien_csv_file}")
