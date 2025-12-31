
🔥 Top 50 Python Interview Questions & Answers

---

## 1️⃣ What is Python?
Python is a **high-level, interpreted, dynamically typed** programming language known for simplicity and readability.

---

## 2️⃣ Is Python compiled or interpreted?
Python is **interpreted**, but internally it is first compiled to **bytecode**, then executed by the **Python Virtual Machine (PVM)**.

---

## 3️⃣ What are Python’s key features?
- Simple syntax
- Platform independent
- Large standard library
- Object-oriented
- Automatic memory management

---

## 4️⃣ What is dynamic typing?
Variable type is decided **at runtime**, not at declaration.
```python
x = 10
x = "hello"
````

---

## 5️⃣ What are mutable and immutable objects?

* **Mutable:** list, dict, set
* **Immutable:** int, float, str, tuple

---

## 6️⃣ Why are strings immutable?

* Memory efficiency
* Thread safety
* Faster performance via reuse

---

## 7️⃣ What is a list?

An **ordered, mutable** collection.

```python
lst = [1, 2, 3]
```

---

## 8️⃣ Difference between list and tuple?

| List        | Tuple       |
| ----------- | ----------- |
| Mutable     | Immutable   |
| Slower      | Faster      |
| More memory | Less memory |

---

## 9️⃣ What is a dictionary?

A **key-value** data structure using hashing.

```python
d = {"a": 1}
```

---

## 🔟 Can dictionary keys be mutable?

❌ No. Keys must be **immutable** (int, str, tuple).

---

## 1️⃣1️⃣ What is slicing?

Extracting part of a sequence.

```python
s = "python"
s[1:4]
```

---

## 1️⃣2️⃣ What is `*args`?

Used to pass **variable number of positional arguments**.

```python
def f(*args):
    print(args)
```

---

## 1️⃣3️⃣ What is `**kwargs`?

Used to pass **variable number of keyword arguments**.

```python
def f(**kwargs):
    print(kwargs)
```

---

## 1️⃣4️⃣ What are lambda functions?

Anonymous one-line functions.

```python
square = lambda x: x*x
```

---

## 1️⃣5️⃣ Difference between `==` and `is`?

* `==` → value comparison
* `is` → reference comparison

---

## 1️⃣6️⃣ What is PEP 8?

Python’s **official style guide**.

---

## 1️⃣7️⃣ What is indentation in Python?

Indentation defines code blocks. It is **mandatory**.

---

## 1️⃣8️⃣ What is a module?

A **single Python file** containing code.

---

## 1️⃣9️⃣ What is a package?

A **collection of modules** inside a folder.

---

## 2️⃣0️⃣ What is exception handling?

Handling runtime errors safely.

```python
try:
    x = int("abc")
except ValueError:
    print("Error")
```

---

## 2️⃣1️⃣ What is `finally`?

A block that **always executes**, error or not.

---

## 2️⃣2️⃣ What is garbage collection?

Automatic removal of unused objects from memory.

---

## 2️⃣3️⃣ What is reference counting?

Python tracks how many references an object has to manage memory.

---

## 2️⃣4️⃣ What is shallow copy?

Copies object reference.

```python
import copy
copy.copy(obj)
```

---

## 2️⃣5️⃣ What is deep copy?

Copies entire object structure.

```python
copy.deepcopy(obj)
```

---

## 2️⃣6️⃣ What is OOPS?

Object-Oriented Programming System.

---

## 2️⃣7️⃣ Pillars of OOPS?

* Encapsulation
* Inheritance
* Polymorphism
* Abstraction

---

## 2️⃣8️⃣ What is `__init__`?

Constructor method, runs when object is created.

---

## 2️⃣9️⃣ What is inheritance?

Child class acquiring parent class properties.

---

## 3️⃣0️⃣ What is encapsulation?

Hiding internal data using access modifiers.

---

## 3️⃣1️⃣ What is polymorphism?

Same function name, different behavior.

---

## 3️⃣2️⃣ Does Python support method overloading?

❌ No (last method definition is used).

---

## 3️⃣3️⃣ What is a decorator?

Function that modifies another function.

```python
@decorator
def func():
    pass
```

---

## 3️⃣4️⃣ What is `with` statement?

Used for resource management (files).

```python
with open("a.txt") as f:
    data = f.read()
```

---

## 3️⃣5️⃣ What is `range()`?

Generates a sequence of numbers.

---

## 3️⃣6️⃣ Difference between `for` and `while` loop?

* `for` → known iterations
* `while` → condition-based

---

## 3️⃣7️⃣ What is recursion?

Function calling itself.

---

## 3️⃣8️⃣ What is default argument?

Parameter with default value.

```python
def f(x=10):
```

---

## 3️⃣9️⃣ Why mutable default arguments are dangerous?

Same object reused across calls.

---

## 4️⃣0️⃣ Correct way to use default mutable?

```python
def f(x=None):
```

---

## 4️⃣1️⃣ What is a generator?

Function that returns values one by one using `yield`.

---

## 4️⃣2️⃣ Difference between `return` and `yield`?

* `return` → ends function
* `yield` → pauses function

---

## 4️⃣3️⃣ What is `map()`?

Applies function to all items.

---

## 4️⃣4️⃣ What is `filter()`?

Filters items based on condition.

---

## 4️⃣5️⃣ What is `zip()`?

Combines multiple iterables.

---

## 4️⃣6️⃣ What is time complexity?

Measures efficiency of algorithm.

---

## 4️⃣7️⃣ Time complexity of list search?

**O(n)**

---

## 4️⃣8️⃣ Time complexity of dictionary lookup?

**O(1)** average

---

## 4️⃣9️⃣ Is Python case-sensitive?

✅ Yes

---

## 5️⃣0️⃣ Why Python for AI/ML?

* Easy syntax
* Huge ML libraries
* Strong community support

---

