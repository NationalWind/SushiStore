import csv
import random

# File path for the CHITIETDATCHO CSV
chitietdatcho_csv_file = "20_CHITIETDATCHO_data.csv"

# Number of records to generate (1000 rows)
num_records = 1000
unique_tuples = set()
# Generate data for CHITIETDATCHO
chitietdatcho_data = []

# Create the data ensuring unique combinations of (SOBAN, MADATCHO, MACHINHANH)
for _ in range(num_records):
    while True:
        soban = f"{random.randint(1, 30):03d}"  # SOBAN from 001 to 030
        machinhanh = f"CN{random.randint(1, 10):08d}"  # MACHINHANH from CN01 to CN10
        madatcho = f"DC{random.randint(1, 350):08d}"  # MADATCHO from DC001 to DC350
        soluongkhach = random.randint(1, 12)  # SOLUONGKHACH between 1 and 12

        if (soban, machinhanh, madatcho) not in unique_tuples:
            unique_tuples.add((soban, machinhanh, madatcho))
            break

    chitietdatcho_data.append((soban, machinhanh, madatcho, soluongkhach))

# Write to CSV
with open(chitietdatcho_csv_file, mode="w", encoding="utf-8", newline="") as file:
    writer = csv.writer(file, quoting=csv.QUOTE_NONE)  # Avoid quoting
    # Write header
    writer.writerow(["SOBAN", "MACHINHANH", "MADATCHO", "SOLUONGKHACH"])
    # Write rows
    writer.writerows(chitietdatcho_data)

print(f"CHITIETDATCHO data has been generated into the file: {chitietdatcho_csv_file}")
