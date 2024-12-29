import pandas as pd
import random

# Load the CSV file
file_path = "5_KHACHHANG_data.csv"  # Replace with your CSV file path
df = pd.read_csv(file_path)

# Generate new SDT values in the required format and update the DataFrame
def generate_random_sdt():
    return f"0{random.randint(100000000, 999999999)}"

df['SDT'] = df.apply(lambda row: generate_random_sdt(), axis=1)

# Generate SQL update statements
sql_statements = []
for index, row in df.iterrows():
    sql = f"UPDATE KhachHang SET SDT = '{row['SDT']}' WHERE MAKHACHHANG = '{row['MAKHACHHANG']}';"
    sql_statements.append(sql)

# Write the SQL statements to a file
output_file = "5_1_update_khachhang_sdt.sql"
with open(output_file, "w") as f:
    f.write("\n".join(sql_statements))

print(f"SQL update statements saved to {output_file}")
