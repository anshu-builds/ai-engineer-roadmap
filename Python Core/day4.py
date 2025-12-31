#print numbers from 1 to n
"""n=int(input("Enter a number:"))
for i in range(1,n,+1):
    print(i)"""

#Print numbers from Nto 1
'''n=int(input("Enter a number:"))
for i in range(n,0,-1):
    print(i)'''

#Sum of first n natural numbers
'''n=int(input("Enter a number:"))
sum=0
for i in range(1,n,+1):
    sum +=i
print("Sum is:",sum)'''

#Factorial of a number
"""n=int(input("Enter a Number"))
fact=1
for i in range(1,n+1):
    fact=fact*i
    factorial=fact
print("Factorial is:",factorial)"""

# count digits in a number
'''n=int(input("Enter a number:"))
count = 0
while n>0:
    n=n//10
    count = count + 1
print("Number of digits:",count)
    '''
#check prime number
'''n=int(input("Enter a number:"))
if n>1:
    for i in range(2,n):
        if (n%i)==0:
            print(n,"is not a prime number")
            break
    else:
        print(n,"is a prime number")
else:
    print(n,"is not a prime number")
'''            
#Multiplication table
'''n=int(input("Enter a number:"))
for i in range(1,11,+1):
    print(n,"x",i,"=",n*i)'''

#Fibonacci series
'''n=int(input("Enter a number:"))
a,b=0,1
for i in range(n):
    print(a,end=" ")
    a,b=b,a+b'''
    
# Pattern Printing 
'''n=int(input("Enter number of rows:"))
for i in range(1,n+1):
    for j in range(i):
        print("*",end="")
    print()'''

# Pyramid Pattern
'''n=int(input("Enter number of rows:"))
for i in range(1,n+1):
    print(" "*(n-i)+"*"*(2*i-1))'''

