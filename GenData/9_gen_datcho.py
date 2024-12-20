import csv
from faker import Faker
from datetime import datetime, timedelta
import random

# Initialize Faker
fake = Faker()

# File path
datcho_csv_file = "9_DATCHO_data.csv"

# Generate DATCHO data
datcho_data = []

for index in range(1, 351):  # MADATCHO goes from DC00000001 to DC00000200
    madatcho = f"DC{index:08d}"
    ngayden = fake.date_this_year()  # Random date this year
    gioden = (datetime.now() - timedelta(hours=index % 24, minutes=index % 60)).strftime("%H:%M:%S")
    soluongkhach = random.randint(1, 20)  # Random number of guests between 1 and 20
    ghichu = fake.sentence().replace(",", "")  # Random note avoiding commas
    sdt = fake.phone_number()[:10]  # Random 10-digit phone number

    datcho_data.append([madatcho, ngayden, gioden, soluongkhach, ghichu, sdt])

# Write to CSV
with open(datcho_csv_file, mode="w", encoding="utf-8", newline="") as file:
    writer = csv.writer(file)
    # Write header
    writer.writerow(["MADATCHO", "NGAYDEN", "GIODEN", "SOLUONGKHACH", "GHICHU", "SDT"])
    # Write rows
    writer.writerows(datcho_data)

print(f"DATCHO data has been generated into the file: {datcho_csv_file}")
