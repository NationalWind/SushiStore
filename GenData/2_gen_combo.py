import csv
import random
from faker import Faker

# Initialize faker
fake = Faker()

# Function to generate unique MACOMBO values
def generate_macombo(index):
    return f"COMBO{index:05d}"

# Predefined list of food-related words for combo names
food_adjectives = ["Delicious", "Spicy", "Savory", "Sweet", "Crispy", "Golden", "Hearty", "Flavorful"]
food_items = ["Sushi", "Tempura", "Ramen", "Sashimi", "Bento", "Teriyaki", "Udon", "Mochi"]

# Number of records to generate
num_combos = 10

# Generate data
data = []
for i in range(1, num_combos + 1):
    macombo = generate_macombo(i)
    # Generate a combo name using food-related words
    tencombo = f"{random.choice(food_adjectives)} {random.choice(food_items)} Combo"
    # Generate a food-related description without commas or double quotes
    motacombo = (
        f"A perfect combination of {fake.word()} and {random.choice(food_items).lower()}, "
        f"served with {random.choice(food_items).lower()} and a side of {fake.word()}."
    ).replace(",", "").replace('"', "").strip()
    data.append([macombo, tencombo, motacombo])

# File path for the CSV
csv_file_path = "2_COMBOMONAN_data.csv"

# Write to CSV
with open(csv_file_path, mode="w", encoding="utf-8", newline="") as file:
    writer = csv.writer(file)
    # Write header
    writer.writerow(["MACOMBO", "TENCOMBO", "MOTACOMBO"])
    # Write rows
    writer.writerows(data)

print(f"Data has been generated into the file: {csv_file_path}")
