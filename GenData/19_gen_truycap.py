import csv
import random
from datetime import datetime, timedelta

# File path for the TRUYCAP CSV
truycap_csv_file = "19_TRUYCAP_data.csv"

# Number of records to generate (500 rows)
num_records = 500

# Function to generate a random date within a range
def random_date(start_date, end_date):
    return start_date + timedelta(days=random.randint(0, (end_date - start_date).days))

# Create the data
truycap_data = []

for i in range(1, num_records + 1):
    matruycap = f"TRUYCAP{i:03d}"  # MATRAYCAP from TRUYCAP0001 to TRUYCAP0500
    madhtructuyen = f"DONDAT{random.randint(1501, 3000):04d}"  # MADHTRUCTUYEN from DHTRUCTUYEN1501 to DHTRUCTUYEN3000
    
    # Random dates for THOIDIEMBATDAU and THOIDIEMKETTHUC
    thoidiembatdau = random_date(datetime(2020, 1, 1), datetime(2023, 12, 31)).strftime("%Y-%m-%d")
    thoidiemketthuc = random_date(datetime(2024, 1, 1), datetime(2025, 12, 31)).strftime("%Y-%m-%d")
    
    # Ensure THOIDIEMKETTHUC is after THOIDIEMBATDAU
    while datetime.strptime(thoidiemketthuc, "%Y-%m-%d") <= datetime.strptime(thoidiembatdau, "%Y-%m-%d"):
        thoidiemketthuc = random_date(datetime(2024, 1, 1), datetime(2025, 12, 31)).strftime("%Y-%m-%d")
    
    truycap_data.append([matruycap, madhtructuyen, thoidiembatdau, thoidiemketthuc])

# Write to CSV
with open(truycap_csv_file, mode="w", encoding="utf-8", newline="") as file:
    writer = csv.writer(file, quoting=csv.QUOTE_NONE)  # Avoid quoting
    # Write header
    writer.writerow(["MATRUYCAP", "MADHTRUCTUYEN", "THOIDIEMBATDAU", "THOIDIEMKETTHUC"])
    # Write rows
    writer.writerows(truycap_data)

print(f"TRUYCAP data has been generated into the file: {truycap_csv_file}")
