# Mission: Record my 2026 Career Goal permanently in a file.

print("--- 2026 CAREER LOCKER ---")
my_goal = input("What is your ultimate goal for 2026? > ")

filename = "my_goal.txt"
with open(filename, "w") as file:
    file.write(my_goal)

print("\n...Saving to disk...")
print("-" * 30)

with open(filename, "r") as file:
    saved_content = file.read()
    print(f"✅ CONFIRMED. Saved Goal: {saved_content}")
    print("-" * 30)