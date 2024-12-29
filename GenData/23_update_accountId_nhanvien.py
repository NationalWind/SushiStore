import csv

def generate_update_statements_from_csv(csv_file, table_name, output_sql_file):
    # Open the CSV file and read the MANHANVIEN values
    with open(csv_file, mode='r') as file:
        reader = csv.DictReader(file)
        
        # Create the list of UPDATE statements
        update_statements = []
        n = 2
        
        for row in reader:
            manhanvien = row['MANHANVIEN']
            account_id = n  # Assuming the account_id corresponds to MANHANVIEN
            n = n+1
            
            # Create the UPDATE statement
            update_statements.append(
                f"UPDATE {table_name} SET ACCOUNT_ID = {account_id} WHERE MANHANVIEN = '{manhanvien}';"
            )

    # Write the UPDATE statements to an output SQL file
    with open(output_sql_file, mode='w') as output_file:
        for statement in update_statements:
            output_file.write(statement + "\n")
    
    print(f"SQL UPDATE statements saved to {output_sql_file}")

# Example usage
csv_file = '8_2_NHANVIEN_data.csv'  # Path to the CSV file
table_name = 'NHANVIEN'     # Table name
output_sql_file = '23_update_nv.sql'  # Output SQL file

# Generate the SQL UPDATE statements
generate_update_statements_from_csv(csv_file, table_name, output_sql_file)
