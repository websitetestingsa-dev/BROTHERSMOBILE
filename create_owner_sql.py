import getpass
import hashlib
import secrets
import re
import pathlib

email = input("Owner email: ").strip().lower()

if not re.fullmatch(r"[^\s@]+@[^\s@]+\.[^\s@]+", email):
    raise SystemExit("Invalid email")

pw = getpass.getpass("New owner password (8-16 characters): ")

if not 8 <= len(pw) <= 16:
    raise SystemExit("Password must be between 8 and 16 characters")

salt = secrets.token_hex(16)

h = hashlib.pbkdf2_hmac(
    "sha256",
    pw.encode("utf-8"),
    salt.encode("utf-8"),
    210000
).hex()

e = email.replace("'", "''")

sql = (
    f"INSERT INTO staff(email,role,revoked,password_salt,password_hash) "
    f"VALUES('{e}','owner',0,'{salt}','{h}') "
    f"ON CONFLICT(email) DO UPDATE SET "
    f"role='owner',revoked=0,"
    f"password_salt=excluded.password_salt,"
    f"password_hash=excluded.password_hash;"
)

pathlib.Path("owner_setup.sql").write_text(sql + "\n", encoding="utf-8")

print("Created owner_setup.sql.")
print("Execute it in Cloudflare D1 Console, then delete the file.")