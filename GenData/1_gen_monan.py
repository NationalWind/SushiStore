import csv
from faker import Faker
import random

# Initialize faker
fake = Faker()

# File path
monan_csv_file = "1_MONAN_data.csv"

# Generate data for MONAN
monan_data = []
danhmuc_list = ["Sushi", "Sashimi", "Tempura", "Ramen", "Dessert", "Drinks"]
trangthai_list = ['Available', 'Out of stock', 'Discontinued']  # Valid values

for index in range(1, 201):  # Generate 200 dishes
    mamon = f"MON{index:07d}"  # MAMON is CHAR(10)
    tenmon = fake.word().capitalize() + " " + random.choice(danhmuc_list)  # Random dish name
    giahientai = round(random.uniform(50, 500) * 1000, 2)  # Price between 50,000 to 500,000
    danhmuc = random.choice(danhmuc_list)  # Random category
    trangthai = random.choice(trangthai_list)  # Random valid serving status

    monan_data.append([mamon, tenmon, giahientai, danhmuc, trangthai])

# Write to CSV
with open(monan_csv_file, mode="w", encoding="utf-8", newline="") as file:
    writer = csv.writer(file)
    # Write header
    writer.writerow(["MAMON", "TENMON", "GIAHIENTAI", "DANHMUC", "TRANGTHAIPHUCVU"])
    # Write rows
    writer.writerows(monan_data)

print(f"MONAN data has been generated into the file: {monan_csv_file}")
