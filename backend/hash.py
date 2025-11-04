# -*- coding: utf-8 -*-
import bcrypt

# Password to hash
password = "mypassword123".encode('utf-8')

# Generate salt and hash
salt = bcrypt.gensalt()
hashed_password = bcrypt.hashpw(password, salt)

print("Hashed Password:", hashed_password.decode())

# Verify password
check_password = "mypassword123".encode('utf-8')
if bcrypt.checkpw(check_password, hashed_password):
    print("Password is correct")
else:
    print("Password is incorrect")
