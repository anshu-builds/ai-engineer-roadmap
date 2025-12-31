# 🧱 Python OOP — Layer 4 (Complete Notes)

> Focus: **Understanding through fundamentals + code behavior**

---

## 1️⃣ What is a Class?

- A **class** is a **template / blueprint**.
- It defines:

  - what data an object will store (attributes)
  - what actions it can perform (methods)

```python
class A:
    pass
```

✔ This creates a **new type** called `A`.

---

## 2️⃣ Are classes objects in Python?

✅ **Yes**

- In Python, **everything is an object**
- Classes are also objects
- Classes are created by a special class called `type`

```python
type(A)   # <class 'type'>
```

### Object chain:

```
type → Class → Object
```

---

## 3️⃣ What does `pass` do?

- `pass` is a **null statement**
- It does **nothing**
- Used as a **placeholder**

❌ `pass` is NOT `None`

```python
class A:
    pass
```

---

## 4️⃣ What is an Object?

- An **object** is an **instance of a class**

```python
a = A()
```

- `a` is an object
- `type(a)` is `A`

```python
type(a) == A
```

---

## 5️⃣ What is a Method?

> A **method** is a function defined inside a class that operates on an object’s data.

```python
class Person:
    def show(self):
        print("Hello")
```

- `show` is a **method**
- Called using an object

```python
p = Person()
p.show()
```

---

## 6️⃣ Difference between Function and Method

| Function        | Method             |
| --------------- | ------------------ |
| Standalone      | Belongs to a class |
| Called directly | Called via object  |
| No `self`       | Uses `self`        |

---

## 7️⃣ What is `self`?

### Best explanation (exam-ready):

> **`self` is a reference to the current object that is calling the method.**

- It allows methods to:

  - access object data
  - modify object data

```python
def deposit(self, amount):
    self.balance += amount
```

---

## 8️⃣ How method calls actually work

```python
acc.deposit(100)
```

Internally:

```python
Account.deposit(acc, 100)
```

✔ `self` becomes `acc`

---

## 9️⃣ What is an Object Attribute?

- An **object attribute** stores the \*\*

Below is the **FULL, CLEAN, CONTINUED MARKDOWN** covering **everything you asked**, written slowly, clearly, and **exam-safe**.
You can copy–paste this directly into a `.md` file.

---

# 🧱 Python OOP — Layer 4 (Complete Markdown Notes)

> These notes are based **exactly on the questions you asked**, explained step-by-step, with correct terminology and examples.

---

## 1️⃣ What is a Class?

- A **class** is a **template / blueprint**
- It defines:

  - what data an object will have (attributes)
  - what actions it can perform (methods)

```python
class A:
    pass
```

✔ Creates a new **class type** called `A`

---

## 2️⃣ Are classes objects in Python?

✅ **Yes**

- In Python, **everything is an object**
- Classes are also objects
- Classes are created by the metaclass `type`

```python
type(A)   # <class 'type'>
```

### Object relationship:

```
type → Class → Object
```

---

## 3️⃣ What does `pass` do?

- `pass` is a **null statement**
- It does **nothing**
- Used only to avoid syntax error

❌ `pass` is NOT `None`

```python
class A:
    pass
```

---

## 4️⃣ What is an Object?

- An **object** is an **instance of a class**

```python
a = A()
```

```python
type(a) == A
```

---

## 5️⃣ What is a Method?

> A **method** is a function defined inside a class that works on an object’s data.

```python
class Person:
    def show(self):
        print("Hello")
```

- `show` is a **method**
- Called using an object

```python
p = Person()
p.show()
```

---

## 6️⃣ Function vs Method

| Function        | Method             |
| --------------- | ------------------ |
| Standalone      | Belongs to a class |
| Called directly | Called via object  |
| No `self`       | Uses `self`        |

---

## 7️⃣ What is `self`?

### Correct definition (exam-ready):

> **`self` is a reference to the current object that is calling the method.**

- It allows a method to:

  - access object attributes
  - modify object state

```python
def deposit(self, amount):
    self.balance += amount
```

---

## 8️⃣ How method calls actually work

```python
acc.deposit(100)
```

Internally Python does:

```python
Account.deposit(acc, 100)
```

✔ `self` → `acc`

---

## 9️⃣ What is an Object Attribute?

- An **object attribute** stores the **current state/data of the object**

```python
self.balance = balance
```

- “Old data” → value before update
- “New data” → value after update

```python
self.balance += amount
```

---

## 🔟 What is `self.x += y`?

```python
self.x += y
```

### This is:

- an **assignment statement**
- specifically an **augmented assignment**

Equivalent to:

```python
self.x = self.x + y
```

✔ It **updates the object’s attribute**

---

## 1️⃣1️⃣ Parameter vs Argument

```python
def add(self, y):   # y → parameter
    self.x += y
```

```python
obj.add(5)         # 5 → argument
```

- **Parameter** → in definition
- **Argument** → in call

---

## 1️⃣2️⃣ Why use methods instead of normal functions?

Because methods:

- bundle **data + behavior**
- reduce repeated parameter passing
- make code readable and safe

Example:

```python
acc.deposit(500)
```

reads like:

> “Account deposits 500”

---

## 1️⃣3️⃣ Multiple methods on the same object

```python
class Account:
    def __init__(self, balance):
        self.balance = balance

    def deposit(self, amount):
        self.balance += amount

    def withdraw(self, amount):
        self.balance -= amount
```

✔ Both methods modify the **same object state**

---

## 1️⃣4️⃣ Instance Variables vs Class Variables

### Instance Variable (SAFE)

```python
class A:
    def __init__(self, x):
        self.x = x
```

- Belongs to each object
- Not shared

---

### Class Variable (SHARED)

```python
class B:
    x = 10
```

- Shared by all objects
- Dangerous if mutable

---

### Trap example

```python
b1.x = 50
```

✔ Creates **instance variable**, does NOT modify class variable

---

## 1️⃣5️⃣ What is `__init__`?

> **`__init__` is an initializer, not the constructor.**

- It runs **after** object creation
- Used to initialize object data

---

## 1️⃣6️⃣ What is `__new__`?

> **`__new__` creates the object**

- Called automatically
- Returns the new object
- Runs before `__init__`

---

## 1️⃣7️⃣ Object creation flow

```text
Class() call
   ↓
__new__ → creates object
   ↓
__init__ → initializes object
```

---

## 1️⃣8️⃣ Using `__new__`

```python
class A:
    def __new__(cls):
        obj = super().__new__(cls)
        return obj
```

### Rules:

- `return obj` → **MANDATORY**
- `super().__new__(cls)` → recommended & safe

---

## 1️⃣9️⃣ Can `__new__` replace `__init__`?

- Technically → yes
- Practically → ❌ no

Use `__new__` only for:

- Singleton
- Immutable objects
- Special creation control

---

## 2️⃣0️⃣ Why we usually use `__init__`

Because:

- `__new__` already runs automatically
- We only need to initialize data

> **Creation is automatic, initialization is our job.**

---

## 2️⃣1️⃣ Full working example (Account)

```python
class Account:
    def __init__(self, balance):
        self.balance = balance

    def deposit(self, amount):
        self.balance += amount

    def withdraw(self, amount):
        self.balance -= amount

acc = Account(1000)
acc.deposit(500)
acc.withdraw(200)

print(acc.balance)
```

Output:

```
1300
```

---

## 🔒 FINAL LOCKED SUMMARY

- Class → blueprint
- Object → instance
- Method → function bound to object
- `self` → reference to calling object
- Attribute → object state
- Assignment statement → updates state
- `__new__` → creates object
- `__init__` → initializes object

---

## 2️⃣2️⃣ What is an Instance?

> **An instance is a real object created from a class.**

---

### 🔍 Explanation

- A **class** is only a blueprint
- An **instance** is the actual usable object created from that blueprint

```python
class Car:
    pass

c1 = Car()
```

Here:

- `Car` → class
- `c1` → **instance of Car**

---

### 🧠 Why instances exist

- You can create **multiple instances** from the same class
- Each instance is **independent**

```python
c2 = Car()
```

- `c1` and `c2` are two **different instances**
- They do not share instance data unless explicitly coded

---

### 🔑 Properties of an Instance

An instance:

- Has its **own memory**
- Stores its **own attributes**
- Can call **methods** of the class

```python
c1.color = "red"
c2.color = "blue"
```

✔ Changes in one instance do not affect another

---

### 🧠 Instance vs Class (Quick Comparison)

| Class                | Instance        |
| -------------------- | --------------- |
| Template / blueprint | Actual object   |
| Defines structure    | Holds real data |
| Created once         | Can be many     |

---

### ⭐ Exam-ready one-liner (MEMORIZE)

> **An instance is a concrete object created from a class, representing a specific occurrence of that class.**

---

### 🔒 Mental lock

> **Class defines, instance lives.**
