import csv
import random

# File path for the DATHANGTAICHO CSV
dathangtaicho_csv_file = "17_DATHANGTAICHO_data.csv"

# Number of records to generate (175 rows)
num_records = 1500

# Generate data for DATHANGTAICHO
dathangtaicho_data = []

# Create the data
for i in range(1, num_records + 1):
    madhtaicho = f"DONDAT{i:04d}"  # MADHTAICHO from DHTAICHO000001 to DHTAICHO000175
    machinhanh = f"CN{random.randint(1, 10):08d}"  # MACHINHANH from CN1 to CN10
    soban = f"{random.randint(1, 30):03d}"  # SOBAN from 001 to 010
    
    dathangtaicho_data.append([madhtaicho, machinhanh, soban])

# Write to CSV
with open(dathangtaicho_csv_file, mode="w", encoding="utf-8", newline="") as file:
    writer = csv.writer(file, quoting=csv.QUOTE_NONE)  # Avoid quoting
    # Write header
    writer.writerow(["MADHTAICHO", "MACHINHANH", "SOBAN"])
    # Write rows
    writer.writerows(dathangtaicho_data)

print(f"DATHANGTAICHO data has been generated into the file: {dathangtaicho_csv_file}")
