import csv
import random

# File path for the DANHGIA CSV
danhgia_csv_file = "14_DANHGIA_data.csv"

# Number of records to generate (1000 rows)
num_records = 1000

# Generate data for DANHGIA
danhgia_data = []

# Create the data
for i in range(1, num_records + 1):
    madanhgia = f"DG{i:08d}"  # MADANHGIA from DG00000001 to DG00001000
    diemphucvu = random.randint(1, 5)  # DIEMPHUCVU between 1 and 5
    diemvitrichinhanh = random.randint(1, 5)  # DIEMVITRICHINHANH between 1 and 5
    diemkhonggian = random.randint(1, 5)  # DIEMKHONGGIAN between 1 and 5
    binhluan = f"Comment {i}" if random.choice([True, False]) else None  # Randomly choose to make BINHLUAN NULL
    khachhangdanhgia = f"KH{random.randint(1, 500):08d}" if random.choice([True, False]) else None  # Randomly choose to make KHACHHANGDANHGIA NULL
    chinhanh = f"CN{random.randint(1, 10):08d}"  # CHINHANH from CN01 to CN10
    nhanvien = f"NV{random.randint(1, 200):08d}" if random.choice([True, False]) else None  # Randomly choose to make NHANVIEN NULL
    madon = f"DONDAT{random.randint(1, 3000):04d}" if random.choice([True, False]) else None  # Randomly choose to make MADON NULL
    
    # Append the row to the list
    danhgia_data.append([madanhgia, diemphucvu, diemvitrichinhanh, diemkhonggian, binhluan, khachhangdanhgia, chinhanh, nhanvien, madon])

# Write to CSV
with open(danhgia_csv_file, mode="w", encoding="utf-8", newline="") as file:
    writer = csv.writer(file, quoting=csv.QUOTE_NONE)  # Avoid quoting
    # Write header
    writer.writerow(["MADANHGIA", "DIEMPHUCVU", "DIEMVITRICHINHANH", "DIEMKHONGGIAN", "BINHLUAN", "KHACHHANGDANHGIA", "CHINHANH", "NHANVIEN", "MADON"])
    # Write rows
    writer.writerows(danhgia_data)

print(f"DANHGIA data has been generated into the file: {danhgia_csv_file}")
