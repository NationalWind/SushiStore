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

for index in range(1, 51):  # Generate 200 dishes
    mamon = f"MON{index:07d}"  # MAMON is CHAR(10)
    tenmon = fake.word().capitalize() + " " + random.choice(danhmuc_list)  # Random dish name
    danhmuc = random.choice(danhmuc_list)  # Random category

    monan_data.append([mamon, tenmon, danhmuc])

# Write to CSV
with open(monan_csv_file, mode="w", encoding="utf-8", newline="") as file:
    writer = csv.writer(file)
    # Write header
    writer.writerow(["MAMON", "TENMON", "DANHMUC"])
    # Write rows
    writer.writerows(monan_data)

print(f"MONAN data has been generated into the file: {monan_csv_file}")
