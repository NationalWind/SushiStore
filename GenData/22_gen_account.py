import csv

# File paths for source data and the output file
nhanvien_csv_file = "8_2_NHANVIEN_data.csv"
chinhanh_csv_file = "7_2_CHINHANH_data.csv"
bophan_csv_file = "12_BOPHAN_data.csv"
account_csv_file = "22_ACCOUNT_data.csv"

# Initialize sets for branch and department managers
branch_managers = set()
department_managers = set()

# Read CHINHANH to identify branch managers
with open(chinhanh_csv_file, mode="r", encoding="utf-8") as chinhanh_file:
    chinhanh_reader = csv.DictReader(chinhanh_file)
    for row in chinhanh_reader:
        branch_managers.add(row["NHANVIENQUANLY"])

# Read BOPHAN to identify department managers
with open(bophan_csv_file, mode="r", encoding="utf-8") as bophan_file:
    bophan_reader = csv.DictReader(bophan_file)
    for row in bophan_reader:
        department_managers.add(row["QUANLYBOPHAN"])

# Generate ACCOUNT data
account_data = []

# Add the admin account
account_data.append([1, "admin", "admin", "Admin"])

# Read NHANVIEN to generate user accounts
id_counter = 2  # Start ID from 2 because admin uses ID 1
with open(nhanvien_csv_file, mode="r", encoding="utf-8") as nhanvien_file:
    nhanvien_reader = csv.DictReader(nhanvien_file)
    for row in nhanvien_reader:
        username = row["SDT"]
        password = row["NGAYSINH"]
        manhanvien = row["MANHANVIEN"]

        # Determine the role
        if manhanvien in branch_managers:
            role = "Branch Manager"
        elif manhanvien in department_managers:
            role = "Department Manager"
        else:
            role = "Staff"

        # Add the account record
        account_data.append([id_counter, username, password, role])
        id_counter += 1

# Write ACCOUNT data to CSV
with open(account_csv_file, mode="w", encoding="utf-8", newline="") as file:
    writer = csv.writer(file, quoting=csv.QUOTE_NONE)
    # Write header
    writer.writerow(["ID", "USERNAME", "PASSWORD", "ROLE"])
    # Write rows
    writer.writerows(account_data)

print(f"ACCOUNT data has been generated into the file: {account_csv_file}")
