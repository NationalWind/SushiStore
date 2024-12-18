from faker import Faker
import csv
import random

# Initialize faker
fake = Faker()

# Number of records to generate
num_records = 100

# Function to generate unique MAMON values
def generate_mamon(index):
    return f"MON{index:07d}"

# Generate data
data = []
for i in range(1, num_records + 1):
    mamon = generate_mamon(i)
    tenmon = " ".join(fake.words(nb=3)).title()  # Simulate a Vietnamese dish name
    giahientai = round(random.uniform(10000, 500000), 2)  # Price in VND
    danhmuc = random.choice(["Khai vị", "Món chính", "Tráng miệng", "Đồ uống"])  # Categories
    trangthai = random.choice(["Có sẵn", "Hết món", "Ngừng phục vụ"])  # Status
    data.append([mamon, tenmon, giahientai, danhmuc, trangthai])

# File path for the CSV
csv_file_path = "1_MONAN_data.csv"

# Write to CSV
with open(csv_file_path, mode="w", encoding="utf-8", newline="") as file:
    writer = csv.writer(file)
    writer.writerow(["MAMON", "TENMON", "GIAHIENTAI", "DANHMUC", "TRANGTHAIPHUCVU"])
    writer.writerows(data)

print(f"Data has been generated into the file: {csv_file_path}")
