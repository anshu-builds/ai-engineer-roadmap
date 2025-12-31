"""#Print array elements
n=input("Enter elements separated by space:").split()
print("Array elements are:")
for i in n:
    print(i)    
"""
# sum of array elements
n=list(map(int,input("Enter elements").split()))
sum=0
for i in n:
    sum+=i
print("sum of array elements is:",sum)