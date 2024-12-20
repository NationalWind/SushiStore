import csv
import random
from datetime import datetime, timedelta

# File path for the LICHSULAMVIEC CSV
lichsulamviec_csv_file = "13_LICHSULAMVIEC_data.csv"

# Number of records to generate (5000 rows)
num_records = 5000

# Generate data for LICHSULAMVIEC
lichsulamviec_data = []

# Function to generate a random date within a given range
def generate_random_date(start_date, end_date):
    return start_date + timedelta(days=random.randint(0, (end_date - start_date).days))

# Generate unique (MANHANVIEN, MABOPHAN, MACHINHANH) tuples
unique_tuples = set()

# Create the data
for _ in range(num_records):
    # Ensure the tuple (MANHANVIEN, MABOPHAN, MACHINHANH) is unique
    while True:
        manhanvien = f"NV{random.randint(1, 200):08d}"  # MANHANVIEN from NV00000001 to NV00000200
        mabophan = f"BOPHAN{random.randint(1, 4):04d}"  # MABOPHAN from BOPHAN0001 to BOPHAN0004
        machinhanh = f"CN{random.randint(1, 10):08d}"  # MACHINHANH from CN00000001 to CN00000010
        
        # Check if the tuple is unique
        if (manhanvien, mabophan, machinhanh) not in unique_tuples:
            unique_tuples.add((manhanvien, mabophan, machinhanh))
            break
    
    # Generate random dates
    ngayvaolam = datetime(2010, 1, 1) + timedelta(days=random.randint(0, 3650))  # Random NGAYVAOLAM within the last 10 years
    ngaynghiviec = None
    if random.random() > 0.5:  # 50% chance to have NGAYNGHIVIEC
        ngaynghiviec = ngayvaolam + timedelta(days=random.randint(1, 1000))  # NGAYNGHIVIEC is at least 1 day after NGAYVAOLAM
    
    # HESOLUONG is random between 1 and 2
    hesoluong = round(random.uniform(1, 2), 2)

    # Append the data for LICHSULAMVIEC
    lichsulamviec_data.append([
        manhanvien, mabophan, machinhanh, ngayvaolam.strftime("%Y-%m-%d"), 
        ngaynghiviec.strftime("%Y-%m-%d") if ngaynghiviec else None, hesoluong
    ])

# Write to CSV
with open(lichsulamviec_csv_file, mode="w", encoding="utf-8", newline="") as file:
    writer = csv.writer(file, quoting=csv.QUOTE_NONE)  # Avoid quoting
    # Write header
    writer.writerow(["MANHANVIEN", "MABOPHAN", "MACHINHANH", "NGAYVAOLAM", "NGAYNGHIVIEC", "HESOLUONG"])
    # Write rows
    writer.writerows(lichsulamviec_data)

print(f"LICHSULAMVIEC data has been generated into the file: {lichsulamviec_csv_file}")
