import csv
from faker import Faker
import random

# Initialize faker
fake = Faker()

# File path
chinhanh_csv_file = "7_CHINHANH_data.csv"

# Generate MACHINHANH and NHANVIENQUANLY data
chinhanh_data = []

# Generate MACHINHANH values from CN00000001 to CN00000200
for index in range(1, 201):
    machinhanh = f"CN{index:08d}"  # MACHINHANH in the format CN00000001 to CN00000200
    
    # Generate branch name and ensure it doesn't contain commas
    tenchinhanh = fake.company().replace(",", "")  # Remove any commas in the branch name
    
    # Generate address and ensure it doesn't contain commas
    diachi = fake.address().replace("\n", ", ").replace(",", "")  # Remove any commas in the address
    
    khuvi = random.choice([
        'District 1', 'District 2', 'District 3', 'District 4', 'District 5', 'District 6', 
        'District 7', 'District 8', 'District 9', 'District 10', 'District 11', 'District 12', 
        'Go Vap District', 'Phu Nhuan District', 'Binh Thanh District', 'Tan Binh District', 
        'Tan Phu District', 'Binh Tan District', 'Binh Chanh District', 'Cu Chi District', 
        'Hoc Mon District', 'Nha Be District', 'Can Gio District'
    ])  # Random area name
    
    thogiancm = '08:00:00'  # Random opening time
    thogiandc = '20:00:00'  # Random closing time
    sdt = fake.phone_number()[:10]  # Random phone number (ensure 10 digits)
    email = fake.email()  # Random email
    cobai = random.choice([1, 0])  # Random choice for COBAIDOXE (Bit value)
    
    # Ensure NHANVIENQUANLY exists from 1 to 100
    nhanvienql = f"NV{random.randint(1, 100):08d}"  # NHANVIENQUANLY in the format NV0000001 to NV0000100

    chinhanh_data.append([
        machinhanh, 
        tenchinhanh, 
        diachi, 
        khuvi, 
        thogiancm, 
        thogiandc, 
        sdt, 
        email, 
        cobai, 
        nhanvienql
    ])

# Write to CSV with ',' delimiter
with open(chinhanh_csv_file, mode="w", encoding="utf-8", newline="") as file:
    writer = csv.writer(file, delimiter=',', quotechar='"', quoting=csv.QUOTE_MINIMAL)  # Use ',' delimiter
    # Write header
    writer.writerow([
        "MACHINHANH", "TENCHINHANH", "DIACHI", "KHUVUC", "THOIGIANMOCUA", "THOIGIANDONGCUA", 
        "SDT", "EMAIL", "COBAIDOXE", "NHANVIENQUANLY"
    ])
    # Write rows
    writer.writerows(chinhanh_data)

print(f"CHINHANH data has been generated into the file: {chinhanh_csv_file}")
