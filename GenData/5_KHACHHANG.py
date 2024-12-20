import csv
from faker import Faker

# Initialize faker
fake = Faker()

# File path for the KHACHHANG CSV
khachhang_csv_file = "5_KHACHHANG_data.csv"

# Number of customers
num_customers = 500

# Generate data for KHACHHANG
khachhang_data = []

for index in range(1, num_customers + 1):
    makhachhang = f"KH{index:08d}"  # Sequential MAKHACHHANG from 1 to 500
    hoten = fake.name()  # Random full name
    sdt = fake.msisdn()[0:10]  # Random 10-digit phone number
    email = fake.email()  # Random email
    cccd = ''.join(fake.random_choices(elements=('0123456789'), length=12))  # Random 12-digit number for CCCD
    
    khachhang_data.append([makhachhang, hoten, sdt, email, cccd])

# Write to CSV
with open(khachhang_csv_file, mode="w", encoding="utf-8", newline="") as file:
    writer = csv.writer(file)
    # Write header
    writer.writerow(["MAKHACHHANG", "HOTEN", "SDT", "EMAIL", "CCCD"])
    # Write rows
    writer.writerows(khachhang_data)

print(f"KHACHHANG data has been generated into the file: {khachhang_csv_file}")
