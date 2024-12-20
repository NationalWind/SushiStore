import csv

# File path for the BOPHAN CSV
bophan_csv_file = "12_BOPHAN_data.csv"

# Number of records to generate (40 rows)
num_records = 40

# Generate data for BOPHAN
bophan_data = []

# Unique counter for QUANLYBOPHAN
quanlybophan_counter = 1

# Create the data
for j in range(1, 5):
    for i in range(1, 11):
        mabophan = f"BOPHAN{j:04d}"  # MABOPHAN from BOPHAN0001 to BOPHAN0004
        machinhanh = f"CN{i:08d}"  # MACHINHANH from CN00000001 to CN00000010
        tenbophan = f"Department {j} - Branch {i}"  # Department names: Department 1, Department 2, etc.
        luong = round(5000 + i * 50, 2)  # LUONG increases incrementally (for example)
        quanlybophan = f"NV{quanlybophan_counter:08d}"  # QUANLYBOPHAN with unique NV00000001, NV00000002, etc.
        
        bophan_data.append([mabophan, machinhanh, tenbophan, luong, quanlybophan])
        
        # Increment the counter to ensure each QUANLYBOPHAN is unique
        quanlybophan_counter += 1

# Write to CSV
with open(bophan_csv_file, mode="w", encoding="utf-8", newline="") as file:
    writer = csv.writer(file, quoting=csv.QUOTE_NONE)  # Avoid quoting
    # Write header
    writer.writerow(["MABOPHAN", "MACHINHANH", "TENBOPHAN", "LUONG", "QUANLYBOPHAN"])
    # Write rows
    writer.writerows(bophan_data)

print(f"BOPHAN data has been generated into the file: {bophan_csv_file}")
