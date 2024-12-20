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
    monan_ids = [row[0] for row in monan_data]  # Extract MAMON values

# Load COMBOMONAN data
with open(combo_csv_file, mode="r", encoding="utf-8") as file:
    combo_data = [row for row in csv.reader(file)][1:]  # Skip the header row
    combo_ids = [row[0] for row in combo_data]  # Extract MACOMBO values

# Generate data for CHITIETMONAN
num_chitiet = 6000  # Number of records to generate
chitiet_data = []

for i in range(1, num_chitiet + 1):
    mactmon = f"CTMON{i:05d}"  # Unique MACTMON
    mamenu = f"MENU{random.randint(1, 600):06d}"    
    soluong = random.randint(1, 10)  # Random quantity
    ghichu = fake.sentence().replace(",", "").replace('"', "").strip()  # Cleaned note
    dongiatong = 0  # Placeholder for total price
    madondatmon = f"DONDAT{random.randint(1, 3000):04d}"  # Random MADONDATMON in range 1–100
    chitiet_data.append([mactmon, mamenu, soluong, ghichu, dongiatong, madondatmon])

# Write CHITIETMONAN data to CSV
with open(chitiet_csv_file, mode="w", encoding="utf-8", newline="") as file:
    writer = csv.writer(file)
    # Write header
    writer.writerow(["MACTMON", "MAMENU", "SOLUONG", "GHICHU", "DONGIATONG", "MADONDATMON"])
    # Write rows
    writer.writerows(chitiet_data)

print(f"CHITIETMONAN data has been generated into the file: {chitiet_csv_file}")
