# 🧱 Layer 5 — Advanced Python OOP (Interview Cheat Sheet)

> Focus: **Magic Methods, Composition, Duck Typing, Callable & Iterable Objects**  
> Level: **Interview / Exam Ready**

---

## 1️⃣ Magic / Dunder Methods (`__method__`)

### 🔹 What are Magic Methods?

Magic (dunder) methods are **special methods** that Python calls automatically to give objects built-in behavior.

They allow custom objects to behave like:

- strings
- numbers
- lists
- functions
- iterables

---

### 🔑 Common Magic Methods

| Python Syntax  | Magic Method           | Purpose                  |
| -------------- | ---------------------- | ------------------------ |
| `print(obj)`   | `__str__`              | Human-readable output    |
| `repr(obj)`    | `__repr__`             | Debug / developer output |
| `len(obj)`     | `__len__`              | Length of object         |
| `obj1 + obj2`  | `__add__`              | Operator overloading     |
| `obj()`        | `__call__`             | Make object callable     |
| `obj[i]`       | `__getitem__`          | Indexing support         |
| `for x in obj` | `__iter__`, `__next__` | Iteration support        |

---

### ⭐ Interview Line

> Magic methods allow user-defined objects to integrate seamlessly with Python’s built-in syntax.

---

## 2️⃣ `__str__` vs `__repr__`

| `__str__`         | `__repr__`        |
| ----------------- | ----------------- |
| For users         | For developers    |
| Readable          | Unambiguous       |
| Used by `print()` | Used in debugging |

🔹 If `__str__` is not defined, Python falls back to `__repr__`.

---

## 3️⃣ Operator Overloading

### 🔹 What is it?

Operator overloading allows objects to respond to operators like `+`, `-`, `*` using magic methods.

```python
def __add__(self, other):
    ...
⭐ Interview Line
Operator overloading enables custom behavior for operators using magic methods.

4️⃣ Composition vs Inheritance (VERY IMPORTANT)
🔹 Inheritance — IS-A relationship
python
Copy code
class Dog(Animal):
    pass
🔹 Composition — HAS-A relationship
python
Copy code
class Car:
    def __init__(self):
        self.engine = Engine()
🔑 Comparison
Inheritance	Composition
IS-A	HAS-A
Tight coupling	Loose coupling
Can cause MRO issues	Flexible & safe

⭐ Interview GOLD Line
Prefer composition over inheritance because it provides better flexibility and lower coupling.

5️⃣ Duck Typing (Python Polymorphism)
🔹 Meaning
Python focuses on behavior, not class type.

“If it walks like a duck and quacks like a duck, it’s a duck.”

🧪 Example
python
Copy code
class File:
    def read(self):
        print("Reading file")

class Socket:
    def read(self):
        print("Reading socket")

def process(obj):
    obj.read()
✔ No inheritance required
✔ Same method name, different behavior

⭐ Interview Line
Duck typing allows objects to be used interchangeably based on behavior rather than inheritance.

6️⃣ __call__ — Callable Objects
🔹 Purpose
Allows an object to be called like a function.

python
Copy code
obj()
Calls:

python
Copy code
obj.__call__()
⭐ Interview Line
__call__ allows instances to behave like functions.

7️⃣ __getitem__ — Indexing Support
🔹 Enables:
python
Copy code
obj[index]
Used to mimic:

lists

tuples

dictionaries

8️⃣ Iterables — __iter__ & __next__
🔹 Enables:
python
Copy code
for x in obj:
    ...
🔑 Internal Working
scss
Copy code
iter(obj)   → __iter__()
next(obj)   → __next__()
Raise StopIteration to end iteration.

9️⃣ Core Python OOP Philosophy
Python favors behavior-based design over rigid class hierarchies.

That’s why:

Duck typing exists

Composition is preferred

Magic methods are powerful

🔒 FINAL LOCK — Layer 5 Summary
Magic methods integrate custom objects with Python syntax

Composition is safer than inheritance

Duck typing enables flexible polymorphism

Objects can behave like functions, lists, and iterables

Python OOP is practical, flexible, and dynamic

⭐ ONE PERFECT INTERVIEW ANSWER
Layer 5 focuses on advanced Python OOP concepts such as magic methods, composition over inheritance, duck typing, and making objects callable or iterable, allowing custom classes to integrate seamlessly with Python’s syntax.

```
