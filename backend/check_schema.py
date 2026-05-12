from sqlalchemy import create_engine, text

e = create_engine("postgresql://tester:secret@localhost:7432/bugtracker")
with e.connect() as conn:
    rows = conn.execute(text("SELECT id, height_cm, weight_kg, bmi FROM health_profiles LIMIT 5"))
    for r in rows:
        print(f"id={r[0]}, height={r[1]}, weight={r[2]}, bmi={r[3]}")
    if rows.rowcount == 0:
        print("No rows found")
