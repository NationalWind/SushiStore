import csv
import random
from faker import Faker
from datetime import datetime, timedelta

# Initialize faker
fake = Faker()

# File paths
chitietmonan_csv_file = "3_CHITIETMONAN_data.csv"
dondatmon_csv_file = "4_DONDATMON_data.csv"

# Load MADONDATMON from CHITIETMONAN
with open(chitietmonan_csv_file, mode="r", encoding="utf-8") as file:
    chitietmonan_data = [row for row in csv.reader(file)][1:]  # Skip the header row

# Extract unique MADON values
madon_values = list(set(row[6] for row in chitietmonan_data))  # MADONDATMON is at index 6

# Generate data for DONDATMON
dondatmon_data = []

def generate_random_time(start_hour=9, end_hour=21):
    """Generate a random time between start_hour and end_hour."""
    start_time = datetime.strptime(f"{start_hour}:00", "%H:%M")
    end_time = datetime.strptime(f"{end_hour}:00", "%H:%M")
    random_time = start_time + timedelta(minutes=random.randint(0, int((end_time - start_time).total_seconds() / 60)))
    return random_time.strftime("%H:%M:%S")

# Generate 3000 DONDATMON records
for index in range(1, 3001):
    madon = f"DONDAT{index:04d}"  # Random MADON
    giodat = generate_random_time()  # Random order time
    ngaydat = fake.date_this_year()  # Random order date in the current year
    trangthai = "Processing" if index % 3 == 0 else "Successful"  # Alternating status
    loaidondatmon = "Online order" if index % 2 == 0 else "In-store order"  # Alternating order type
    hoadonlienquan = f"HD{random.randint(1, 1000):08d}"  # Random HOADONLIENQUAN
    khachhangdat = None if random.choice([True, False]) else f"KH{random.randint(1, 500):08d}"  # Random KHACHHANGDAT or NULL
    madatcho = None if random.choice([True, False]) else f"DC{random.randint(1, 350):08d}"  # Random MADATCHO or NULL
    chinhanhdat = f"CN{random.randint(1, 10):08d}"  # Random CHINHANHDAT
    nhanvientaolap = f"NV{random.randint(1, 200):08d}"  # Random NHANVIENTAOLAP
    thanhtien = sum(float(row[5]) for row in chitietmonan_data if row[6] == madon)  # Calculate THANHTIEN from CHITIETMONAN

    dondatmon_data.append([
        madon, giodat, ngaydat, trangthai, loaidondatmon, hoadonlienquan, khachhangdat,
        madatcho, chinhanhdat, nhanvientaolap, round(thanhtien, 2)
    ])

# Write to CSV
with open(dondatmon_csv_file, mode="w", encoding="utf-8", newline="") as file:
    writer = csv.writer(file)
    # Write header
    writer.writerow([
        "MADON", "GIODAT", "NGAYDAT", "TRANGTHAI", "LOAIDONDATMON",
        "HOADONLIENQUAN", "KHACHHANGDAT", "MADATCHO", "CHINHANHDAT",
        "NHANVIENTAOLAP", "THANHTIEN"
    ])
    # Write rows
    writer.writerows(dondatmon_data)

print(f"DONDATMON data has been generated into the file: {dondatmon_csv_file}")
