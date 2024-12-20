import csv
import random

# File path for the BOPHAN CSV
bophan_csv_file = "16_BANAN_data.csv"

# Number of records to generate (40 rows)
num_records = 300

# Generate data for BOPHAN
bophan_data = []
vitri_list = ['left', 'right', 'middle']
trangthai_list =['Available', 'Reserved', 'In use', 'Unavailable']
songuoi_list = [4, 8, 12]

# Unique counter for QUANLYBOPHAN
quanlybophan_counter = 1

# Create the data
for j in range(1, 31):
    for i in range(1, 11):
        soban = f"{j:03d}"  # MABOPHAN from BOPHAN0001 to BOPHAN0004
        machinhanh = f"CN{i:08d}"  # MACHINHANH from CN00000001 to CN00000010
        vitri = f"Table {j} - Branch {i} - " + random.choice(vitri_list) # Department names: Department 1, Department 2, etc.
        trangthai = random.choice(trangthai_list)
        songuoitoida = random.choice(songuoi_list)
        bophan_data.append([soban, machinhanh, vitri, trangthai, songuoitoida])


# Write to CSV
with open(bophan_csv_file, mode="w", encoding="utf-8", newline="") as file:
    writer = csv.writer(file, quoting=csv.QUOTE_NONE)  # Avoid quoting
    # Write header
    writer.writerow(["SOBAN", "MACHINHANH", "VITRI", "TRANGTHAI", "SONGUOITOIDA"])
    # Write rows
    writer.writerows(bophan_data)

print(f"BOPHAN data has been generated into the file: {bophan_csv_file}")
