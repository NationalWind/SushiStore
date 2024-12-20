import csv
import random
from datetime import datetime, timedelta

# File path for the DATHANGTRUCTUYEN CSV
dathangtructuyen_csv_file = "18_DATHANGTRUCTUYEN_data.csv"

# Number of records to generate (1500 rows)
num_records = 1500

# Generate data for DATHANGTRUCTUYEN
dathangtructuyen_data = []

# Function to generate a random time
def random_time():
    return (datetime.min + timedelta(minutes=random.randint(0, 1440))).time()  # Random time in 24 hours

# List of possible delivery status
trangthaigiao_status = ['Processing', 'Delivered', 'Cancelled']

# Create the data
for i in range(1501, 3001):
    madhtructuyen = f"DONDAT{i:04d}"  # MADHTRUCTUYEN from DHTRUCTUYEN1501 to DHTRUCTUYEN3000
    thoigiangiao = random_time().strftime('%H:%M:%S')  # THOIGIANGIAO as a time string
    diachigiao = f"Address {random.randint(1, 500)}"  # DIACHIGIAO as a placeholder address
    trangthaigiao = random.choice(trangthaigiao_status)  # Randomly choose status

    dathangtructuyen_data.append([madhtructuyen, thoigiangiao, diachigiao, trangthaigiao])

# Write to CSV
with open(dathangtructuyen_csv_file, mode="w", encoding="utf-8", newline="") as file:
    writer = csv.writer(file, quoting=csv.QUOTE_NONE)  # Avoid quoting
    # Write header
    writer.writerow(["MADHTRUCTUYEN", "THOIGIANGIAO", "DIACHIGIAO", "TRANGTHAIGIAO"])
    # Write rows
    writer.writerows(dathangtructuyen_data)

print(f"DATHANGTRUCTUYEN data has been generated into the file: {dathangtructuyen_csv_file}")
