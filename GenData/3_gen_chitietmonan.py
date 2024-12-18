import csv
import random
from faker import Faker

# Initialize faker
fake = Faker()

# File paths for existing MONAN and COMBOMONAN CSV files
monan_csv_file = "1_MONAN_data.csv"
combo_csv_file = "2_COMBOMONAN_data.csv"
chitiet_csv_file = "3_CHITIETMONAN_data.csv"

# Load MONAN data
with open(monan_csv_file, mode="r", encoding="utf-8") as file:
    monan_data = [row for row in csv.reader(file)][1:]  # Skip the header row

# Load COMBOMONAN data
with open(combo_csv_file, mode="r", encoding="utf-8") as file:
    combo_data = [row for row in csv.reader(file)][1:]  # Skip the header row

# Extract valid prices for MONAN and COMBOMONAN
monan_prices = {row[0]: float(row[2]) for row in monan_data}  # MAMON -> GIAHIENTAI
combo_prices = {row[0]: float(row[3]) for row in combo_data}  # MACOMBO -> DONGIACOMBO

# Generate data for CHITIETMONAN
num_chitiet = 200  # Number of records to generate
chitiet_data = []

for i in range(1, num_chitiet + 1):
    mactmon = f"CTMON{i:05d}"  # Unique MACTMON
    mamon = random.choice(list(monan_prices.keys()))  # Random MAMON from MONAN table
    macombo = random.choice(list(combo_prices.keys()))  # Random MACOMBO from COMBOMONAN table
    soluong = random.randint(1, 10)  # Random quantity
    ghichu = fake.sentence()  # Random note
    # Calculate DONGIATONG using SOLUONG and price from MONAN or COMBOMONAN
    if random.choice([True, False]):  # Randomly choose between MONAN and COMBOMONAN
        dongiatong = round(soluong * monan_prices[mamon], 2)
    else:
        dongiatong = round(soluong * combo_prices[macombo], 2)
    madondatmon = f"DONDAT{i:04d}"  # Unique MADONDATMON
    chitiet_data.append([mactmon, mamon, macombo, soluong, ghichu, dongiatong, madondatmon])

# Write CHITIETMONAN data to CSV
with open(chitiet_csv_file, mode="w", encoding="utf-8", newline="") as file:
    writer = csv.writer(file)
    # Write header
    writer.writerow(["MACTMON", "MAMON", "MACOMBO", "SOLUONG", "GHICHU", "DONGIATONG", "MADONDATMON"])
    # Write rows
    writer.writerows(chitiet_data)

print(f"CHITIETMONAN data has been generated into the file: {chitiet_csv_file}")


