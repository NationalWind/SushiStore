import csv
import random
from faker import Faker
from datetime import datetime, timedelta

# Initialize faker
fake = Faker()

# File path for the HOADON CSV
hoadon_csv_file = "6_HOADON_data.csv"

# Number of invoices
num_invoices = 1000

# Generate data for HOADON
hoadon_data = []

for index in range(1, num_invoices + 1):
    mahoadon = f"HD{index:08d}"  # Sequential MAHOADON from 1 to 1000
    giolap = (datetime.now() - timedelta(hours=random.randint(1, 48))).time().strftime("%H:%M:%S")  # Random time in the past 48 hours
    ngaylap = fake.date_this_year()  # Random date in the current year
    vat = 0.08  # Default VAT
    tienkhachdua = round(random.uniform(100000, 5000000), 2)  # Random amount between 100,000 and 5,000,000
    trangthai = random.choice(["Unpaid", "Paid", "Cancelled"])  # Random status
    phuongthuc = random.choice(["Bank transfer", "Cash", "Credit card"])  # Random payment method
    makhachhang = f"KH{random.randint(1, 500):08d}" if random.random() > 0.6 else None  # 20% chance to be NULL
    machinhanh = f"CN{random.randint(1, 10):08d}"  # Random branch ID
    tongtientruockm = round(random.uniform(100000, 5000000), 2)  # Random total amount before discount
    tongtiensaukm = round(tongtientruockm * random.uniform(0.7, 1.0), 2)  # Random total after discount (30% to no discount)

    hoadon_data.append([
        mahoadon, giolap, ngaylap, vat, tienkhachdua, trangthai, phuongthuc,
        makhachhang, machinhanh, tongtientruockm, tongtiensaukm
    ])

# Write to CSV
with open(hoadon_csv_file, mode="w", encoding="utf-8", newline="") as file:
    writer = csv.writer(file)
    # Write header
    writer.writerow([
        "MAHOADON", "GIOLAP", "NGAYLAP", "VAT", "TIENKHACHDUA", "TRANGTHAI", 
        "PHUONGTHUC", "MAKHACHHANG", "MACHINHANH", "TONGTIENTRUOCKM", "TONGTIENSAUKM"
    ])
    # Write rows
    writer.writerows(hoadon_data)

print(f"HOADON data has been generated into the file: {hoadon_csv_file}")
