
# 🐍 Python Interview Notes (W3Schools-Oriented, Job Ready)

---

## 1️⃣ Why Python?
**Common Interview Answer:**
- Simple & readable syntax
- Interpreted & dynamically typed
- Large ecosystem (Web, AI/ML, Automation)
- Cross-platform

---

## 2️⃣ Python Execution Model
- Python is **interpreted**
- Code → Bytecode → Python Virtual Machine (PVM)

---

## 3️⃣ Variables & Dynamic Typing
- No explicit type declaration
```python
x = 10
x = "hello"
````

* Variables are **references to objects**

---

## 4️⃣ Mutable vs Immutable (Very Important)

| Mutable   | Immutable |
| --------- | --------- |
| list      | int       |
| dict      | float     |
| set       | string    |
| bytearray | tuple     |

```python
a = [1, 2]
a.append(3)

b = "hi"
b = b + "!"
```

---

## 5️⃣ Data Types

```python
type(10)      # int
type(10.5)    # float
type("10")    # str
type(True)    # bool
```

---

## 6️⃣ Input Handling

```python
x = input()        # string
x = int(input())  # converted
```

---

## 7️⃣ Strings

```python
s = "python"
```

* Reverse: `s[::-1]`
* Length: `len(s)`
* Uppercase: `s.upper()`
* Replace: `s.replace("p", "j")`

**Why immutable?**

* Memory efficiency
* Security

---

## 8️⃣ List vs Tuple

| List        | Tuple       |
| ----------- | ----------- |
| Mutable     | Immutable   |
| Slower      | Faster      |
| More memory | Less memory |

---

## 9️⃣ Dictionary

```python
d = {"a": 1, "b": 2}
```

* Keys must be immutable
* Lookup time: **O(1)** (hashing)

---

## 🔟 Loops

### for loop

```python
for i in range(5):
    print(i)
```

### while loop

```python
while x > 0:
    x -= 1
```

---

## 1️⃣1️⃣ Functions

```python
def add(a, b):
    return a + b
```

* Functions are **first-class objects**

---

## 1️⃣2️⃣ Lambda Functions

```python
square = lambda x: x * x
```

* One-line functions only

---

## 1️⃣3️⃣ *args and **kwargs

```python
def func(*args, **kwargs):
    print(args)
    print(kwargs)
```

* Used for dynamic arguments

---

## 1️⃣4️⃣ OOPS in Python

### Class & Object

```python
class Person:
    def __init__(self, name):
        self.name = name
```

### Inheritance

```python
class Student(Person):
    pass
```

### Encapsulation

* `_var` → protected
* `__var` → private

---

## 1️⃣5️⃣ Exception Handling

```python
try:
    x = int("abc")
except ValueError:
    print("Error")
finally:
    print("Done")
```

* `finally` always executes

---

## 1️⃣6️⃣ File Handling

```python
with open("file.txt", "r") as f:
    data = f.read()
```

* `with` auto-closes file

---

## 1️⃣7️⃣ Modules & Packages

```python
import math
from math import sqrt
```

* Module → single file
* Package → collection of modules

---

## 1️⃣8️⃣ Shallow vs Deep Copy

```python
import copy
copy.copy()
copy.deepcopy()
```

* Shallow → reference copy
* Deep → full object copy

---

## 1️⃣9️⃣ Memory Management

* Heap memory
* Garbage collection
* Reference counting

---

## 2️⃣0️⃣ Common Interview Traps

❌ Mutable default arguments

```python
def func(x=[]):
```

✔ Correct

```python
def func(x=None):
```

---

## 2️⃣1️⃣ Time Complexity Awareness

| Operation   | Complexity |
| ----------- | ---------- |
| list append | O(1)       |
| list search | O(n)       |
| dict lookup | O(1)       |
| set lookup  | O(1)       |

---

## 2️⃣2️⃣ One-Line Interview Facts

* Python is case-sensitive
* Indentation is mandatory
* Everything is an object
* No method overloading

---

## 🎯 Interview Strategy

* Explain with examples
* Mention time complexity
* Be clear with basics
* Avoid over-theory


