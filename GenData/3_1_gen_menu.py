import csv
import random

# File paths for existing MONAN and COMBOMONAN CSV files
monan_csv_file = "1_MONAN_data.csv"
combo_csv_file = "2_COMBOMONAN_data.csv"
menu_csv_file = "3_1_MENU_data.csv"

# Load MONAN data
with open(monan_csv_file, mode="r", encoding="utf-8") as file:
    monan_data = [row for row in csv.reader(file)][1:]  # Skip the header row
    monan_ids = [row[0] for row in monan_data]  # Extract MAMON values
    monan_prices = {row[0]: random.uniform(150000, 500000) for row in monan_data}  # MAMON -> GIAHIENTAI

# Load COMBOMONAN data
with open(combo_csv_file, mode="r", encoding="utf-8") as file:
    combo_data = [row for row in csv.reader(file)][1:]  # Skip the header row
    combo_ids = [row[0] for row in combo_data]  # Extract MACOMBO values
    combo_prices = {row[0]: random.uniform(150000, 500000) for row in combo_data}  # Random prices for combos

# Generate data for MENU
num_menu = 600  # Number of records to generate
menu_data = []

trangthai_list = ['Available', 'Out of stock', 'Discontinued']  # Valid serving statuses

for i in range(1, num_menu + 1):
    mamenu = f"MENU{i:06d}"  # Unique MAMENU
    machinhanh = f"CN{random.randint(1, 3):08d}"  # Random MACHINHANH (branches CN001-CN010)

    # Decide whether MAMON or MACOMBO will be NULL
    if random.choice([True, False]):
        mamon = random.choice(monan_ids)  # Random MAMON
        macombo = None  # Null MACOMBO
        giahientai = monan_prices[mamon]  # Price from MONAN table
    else:
        mamon = None  # Null MAMON
        macombo = random.choice(combo_ids)  # Random MACOMBO
        giahientai = combo_prices[macombo]  # Price from COMBOMONAN table

    trangthai = random.choice(trangthai_list)  # Random serving status
    menu_data.append([mamenu, machinhanh, mamon, macombo, round(giahientai, 2), trangthai])

# Write MENU data to CSV
with open(menu_csv_file, mode="w", encoding="utf-8", newline="") as file:
    writer = csv.writer(file)
    # Write header
    writer.writerow(["MAMENU", "MACHINHANH", "MAMON", "MACOMBO", "GIAHIENTAI", "TRANGTHAIPHUCVU"])
    # Write rows
    writer.writerows(menu_data)

print(f"MENU data has been generated into the file: {menu_csv_file}")
