import pandas as pd
import random

# Load the CSV file
file_path = "9_DATCHO_data.csv"  # Replace with your CSV file path
df = pd.read_csv(file_path)

# Generate new SDT values in the required format
def generate_random_sdt():
    return f"0{random.randint(100000000, 999999999)}"

# Update SDT column with new phone numbers
df['SDT'] = df.apply(lambda row: generate_random_sdt(), axis=1)

# Generate SQL update statements
sql_statements = []
for index, row in df.iterrows():
    sql = f"UPDATE DatCho SET SDT = '{row['SDT']}' WHERE MADATCHO = '{row['MADATCHO']}';"
    sql_statements.append(sql)

# Write the SQL statements to a file
output_file = "9_1_update_datcho_sdt.sql"
with open(output_file, "w") as f:
    f.write("\n".join(sql_statements))

print(f"SQL update statements saved to {output_file}")
