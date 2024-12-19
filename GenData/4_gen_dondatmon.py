import csv
from faker import Faker
import random  # Importing random module
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

# Iterative approach for deterministic data generation
for index, madon in enumerate(madon_values, 1):
    giodat = (datetime.now() - timedelta(hours=index % 24, minutes=index % 60)).time()  # Deterministic time
    ngaydat = fake.date_this_year()  # Random date in the current year
    trangthai = "Processing" if index % 3 == 0 else "Successful"  # Alternating status
    loaidondatmon = "Online order" if index % 2 == 0 else "In-store order"  # Alternating order type
    hoadonlienquan = f"HD{index:08d}"  # Sequential HOADONLIENQUAN
    khachhangdat = f"KH{index:08d}"  # Sequential customer ID
    madatcho = f"DC{index:08d}"  # Sequential reservation ID
    chinhanhdat = f"CN{(index % 50) + 1:08d}"  # Sequential branch ID, wrapping around 50 branches
    nhanvientaolap = f"NV{(index % 100) + 1:08d}"  # Sequential employee ID, wrapping around 100 employees

    # Calculate THANHTIEN as the sum of DONGIATONG for the same MADON in CHITIETMONAN
    thanhtien = sum(float(row[5]) for row in chitietmonan_data if row[6] == madon)  # DONGIATONG is at index 5

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

# Function to generate a random time within a specific range (e.g., between 9 AM and 9 PM)
def generate_random_time(start_hour=9, end_hour=21):
    start_time = datetime.strptime(f"{start_hour}:00", "%H:%M")
    end_time = datetime.strptime(f"{end_hour}:00", "%H:%M")
    random_time = start_time + timedelta(minutes=random.randint(0, int((end_time - start_time).total_seconds() / 60)))
    return random_time.strftime("%H:%M:%S")

# Function to generate a random time within a specific range (e.g., between 9 AM and 9 PM)
def generate_random_time(start_hour=9, end_hour=21):
    start_time = datetime.strptime(f"{start_hour}:00", "%H:%M")
    end_time = datetime.strptime(f"{end_hour}:00", "%H:%M")
    random_time = start_time + timedelta(minutes=random.randint(0, int((end_time - start_time).total_seconds() / 60)))
    return random_time.strftime("%H:%M:%S")

# Read the original CSV
with open("4_DONDATMON_data.csv", mode="r", encoding="utf-8") as infile:
    reader = csv.reader(infile)
    data = list(reader)

# Apply random times to the GIODAT column (assuming it's in column index 1)
for row in data[1:]:  # Skip the header row
    # Generate random time for GIODAT column
    row[1] = generate_random_time()

# Write the updated CSV
with open("4_DONDATMON_data_corrected.csv", mode="w", encoding="utf-8", newline="") as outfile:
    writer = csv.writer(outfile)
    writer.writerows(data)

print("CSV file has been updated with random time values and saved as DONDATMON_data_corrected.csv")