import pandas as pd
import random

# Load the CSV file
file_path = "8_NHANVIEN_data.csv"  # Replace with your CSV file path
df = pd.read_csv(file_path)

# Generate unique phone numbers
used_numbers = set()

def generate_unique_sdt():
    while True:
        sdt = f"0{random.randint(100000000, 999999999)}"
        if sdt not in used_numbers:
            used_numbers.add(sdt)
            return sdt

df['SDT'] = df.apply(lambda row: generate_unique_sdt(), axis=1)

# Generate SQL update statements
sql_statements = []
for index, row in df.iterrows():
    sql = f"UPDATE NhanVien SET SDT = '{row['SDT']}' WHERE MANHANVIEN = '{row['MANHANVIEN']}';"
    sql_statements.append(sql)

# Write the SQL statements to a file
output_file = "8_1_update_nhanvien_sdt.sql"
with open(output_file, "w") as f:
    f.write("\n".join(sql_statements))

print(f"SQL update statements saved to {output_file}")
