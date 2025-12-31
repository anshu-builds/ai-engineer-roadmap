#Find the sum of first n natural numbers using a function.
'''def calculate_sum(n):
    total=0
    global total
    for i in range(1, n + 1):
        total+= i
    return total

n = int(input("Enter a number: "))
result = calculate_sum(n)
print("Sum of first", n, "natural numbers is:", result)'''

#Calculator using functions
'''def add(a, b):
    return a + b
def subtract(a, b):
    return a - b
def multiply(a, b):
    return a * b
def divide(a, b):   
    if b != 0:
        return a / b
    else:
        return "Error! Division by zero."   
num1 = float(input("Enter first number: "))
num2 = float(input("Enter second number: "))    
operation = input("Enter operation (+, -, *, /): ")
if operation == '+':
    print("Result:", add(num1, num2))
elif operation == '-':
    print("Result:", subtract(num1, num2))
elif operation == '*':
    print("Result:", multiply(num1, num2))  
elif operation == '/':
    print("Result:", divide(num1, num2))
else:
    print("Invalid operation!")

cont=input("Do you want to perform another calculation? (yes/no): ")
if cont.lower() !="yes":
    break'''

d={"a":1,"b":2,"c":3}
for x,y in d.items():
    print(x,y)