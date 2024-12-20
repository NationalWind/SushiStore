import csv

import random



# File path for the DANHGIAMONAN CSV

danhgiamonan_csv_file = "21_DANHGIAMONAN_data.csv"



# Number of records to generate (500 rows)

num_records = 500



# Generate data for DANHGIAMONAN

unique_pairs = set()  # To ensure uniqueness of (MADANHGIA, MAMON)

danhgiamonan_data = []



# Create the data ensuring unique combinations of (MADANHGIA, MAMON)

for _ in range(num_records):

    while True:

        madanhgia = f"DG{random.randint(1, 1000):08d}"  # MADANHGIA from DG00000001 to DG00001000

        mamon = f"MON{random.randint(1, 50):07d}"  # MAMON from MN01 to MN50

        if (madanhgia, mamon) not in unique_pairs:

            unique_pairs.add((madanhgia, mamon))

            break



    diemchatluongmonan = random.randint(1, 5)  # DIEMCHATLUONGMONAN between 1 and 5

    diemgiaca = random.randint(1, 5)  # DIEMGIACA between 1 and 5



    danhgiamonan_data.append((madanhgia, mamon, diemchatluongmonan, diemgiaca))



# Write to CSV

with open(danhgiamonan_csv_file, mode="w", encoding="utf-8", newline="") as file:

    writer = csv.writer(file, quoting=csv.QUOTE_NONE)  # Avoid quoting

    # Write header

    writer.writerow(["MADANHGIA", "MAMON", "DIEMCHATLUONGMONAN", "DIEMGIACA"])

    # Write rows

    writer.writerows(danhgiamonan_data)
