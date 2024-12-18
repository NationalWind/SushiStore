import csv
import random
from faker import Faker

# Initialize faker
fake = Faker()

# Function to generate unique MACOMBO values
def generate_macombo(index):
    return f"COMBO{index:05d}"

# Number of records to generate
num_combos = 50

# Generate data
data = []
for i in range(1, num_combos + 1):
    macombo = generate_macombo(i)
    tencombo = "Combo " + " ".join(fake.words(nb=2)).title()  # Simulate a combo name
    motacombo = fake.text(max_nb_chars=200)  # Description of the combo
    dongiacombo = round(random.uniform(50000, 1000000), 2)  # Price in VND
    data.append([macombo, tencombo, motacombo, dongiacombo])

# File path for the CSV
csv_file_path = "2_COMBOMONAN_data.csv"

# Write to CSV
with open(csv_file_path, mode="w", encoding="utf-8", newline="") as file:
    writer = csv.writer(file)
    # Write header
    writer.writerow(["MACOMBO", "TENCOMBO", "MOTACOMBO", "DONGIACOMBO"])
    # Write rows
    writer.writerows(data)

print(f"Data has been generated into the file: {csv_file_path}")
