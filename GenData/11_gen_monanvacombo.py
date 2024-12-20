import csv
import random

# File path for the MONAN_COMBOMONAN CSV
monan_combomonan_csv_file = "11_MONAN_COMBOMONAN_data.csv"

# Number of records to generate (for this example, we generate 50 records)
num_records = 50

# Generate data for MONAN_COMBOMONAN
monan_combomonan_data = []

# Track unique pairs of MAMON and MACOMBO
generated_pairs = set()

for i in range(num_records):
    # Generate MACOMBO from COMBO1 to COMBO10 (1 to 10)
    macombo = f"COMBO{((i) % 10) + 1:05d}"
    
    # Generate MAMON from MON0000001 to MON0000050 (1 to 50)
    mamon = f"MON{random.randint(1, 50):07d}"
    
    # Ensure that the pair is unique (no duplicates)
    while (mamon, macombo) in generated_pairs:
        mamon = f"MON{random.randint(1, 50):07d}"  # Regenerate MAMON if it's a duplicate
    generated_pairs.add((mamon, macombo))

    # Random quantity from 1 to 10
    soluong = random.randint(1, 10)

    monan_combomonan_data.append([macombo, mamon, soluong])

# Write to CSV
with open(monan_combomonan_csv_file, mode="w", encoding="utf-8", newline="") as file:
    writer = csv.writer(file, quoting=csv.QUOTE_NONE)  # Avoid quoting
    # Write header
    writer.writerow(["MACOMBO", "MAMON", "SOLUONG"])
    # Write rows
    writer.writerows(monan_combomonan_data)

print(f"MONAN_COMBOMONAN data has been generated into the file: {monan_combomonan_csv_file}")
