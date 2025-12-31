 # Input N number into a list 
 # #Print all elements of the list 
'''n=int(input("Enter number of elements:"))
number=[]
for i in range(n):
    num=int(input("Enter number:"))
    number.append(num)
print(number)'''

#Find sum of elements 
'''n=int(input("Enter number of elements:"))
arr=[]
for i in range(n):
    num=int(input("Enter number:"))
    arr.append(num)
sum=0
for i in range(n):
    sum+=arr[i]
print("Sum of elements:", sum)'''

#Find largest/maximum element
'''n=int(input("Enter number of elements:"))
arr=[]
for i in range(n):
    num=int(input("Enter number:"))
    arr.append(num)
max=arr[0]
for i in range(i,n):
    if arr[i]>max:
        max=arr[i]
print("Largest element is:",max)
'''

#Find smallest/minimum element
'''n=int(input("Enter number of elements:"))
arr=[]
for i in range(n):
    num=int(input("Enter number:"))
    arr.append(num)
min=arr[0]
for i in range(1,n):
    if arr[i]<min:
        min=arr[i]
print("Smallest element is:",min)'''

#Count even and odd numbers
'''n=int(input("Enter number of elements:"))
arr=[]
for i in range(n):
    num=int(input("Enter number:"))
    arr.append(num)
even_count=0
odd_count=0
for i in range(n):
    if arr[i]%2==0:
        even_count+=1
    else:
        odd_count+=1
print("Even numbers count:",even_count)
print("Odd numbers Count:",odd_count)'''

#Reverse the list (without using inbuilt functions)
'''n=int(input("Enter number of elements:"))
arr=[]
for i in range(n):
    num=int(input("Enter Number:"))
    arr.append(num)
reversed_arr=[]
for i in range(n-1,-1,-1):
    reversed_arr.append(arr[i])
print("Reversed List:",reversed_arr)'''

#search an element in list
'''n=int(input("Enter number of elements:"))
arr=[]
for i in range(n):
    num=int(input("Enter number:"))
    arr.append(num)
search=int(input("Enter element to search:"))
for i in range(n):
    if arr[i]==search:
        print("Found at position",i)
        break
else:
    print("Not Found")'''

# Copy one list into another 
'''n=int(input("Enter number of elements:"))
arr=[]
for i in range(n):
    num=int(input("Enter Number:"))
    arr.append(num)
copy_arr=[]
for i in range(n):
    copy_arr.append(arr[i])
print("Copied List:",copy_arr)'''

#Remove duplicates from list
n=int(input("Enter number of elements:"))
arr=[]
for i in range(n):
    num=int(input("Enter Number:"))
    arr.append(num)
unique_arr=[]
for i in arr:
    if i not in unique_arr:
        unique_arr.append(i)
print("List after removing duplicates:",unique_arr)