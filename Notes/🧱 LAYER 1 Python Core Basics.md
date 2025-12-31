🧱 LAYER 1: Python Core Basics (COMPLETE)

## 1️⃣ What Python REALLY Is (Interview-level clarity)

* Python is a **high-level**, **interpreted**, **dynamically typed** language.
* Designed with **readability > performance** philosophy.
* Everything in Python is an **object**.

### Interview one-liner ✅

> Python focuses on developer productivity and clean syntax rather than low-level control.

---

## 2️⃣ How Python Code Executes (VERY IMPORTANT)

### Flow:

```
.py file
 ↓
Bytecode (.pyc)
 ↓
Python Virtual Machine (PVM)
```

* Python is **not purely interpreted**.
* No manual compilation like C.
* Bytecode is platform-independent.

### Interview trap ❗

> Python compiles code internally but execution is interpreted.

---

## 3️⃣ Python Syntax Rules (STRICT)

### ✅ Indentation = structure

```python
if 5 > 2:
    print("Correct")
```

❌ This fails:

```python
if 5 > 2:
print("Wrong")
```

* Indentation replaces `{}` from C
* Usually **4 spaces** (PEP 8)

---

## 4️⃣ Keywords & Identifiers

### Keywords

* Reserved words
* Cannot be used as variable names

Examples:

```python
if, else, while, for, def, return, True, False, None
```

### Identifiers

Rules:

* Start with letter or `_`
* Cannot start with digit
* Case-sensitive

```python
valid_name = 10
_invalid = 20
# 1name ❌
```

---

## 5️⃣ Variables in Python (CRITICAL CONCEPT)

### No declaration like C

```python
x = 10
x = "hello"
```

* Type decided at **runtime**
* Variable = **reference to object**, not memory box

```python
a = 10
b = a
```

Both `a` and `b` point to **same object**

### Check memory

```python
id(a)
id(b)
```

---

## 6️⃣ Data Types (Core)

### Built-in basic types

```python
int        # 10
float      # 10.5
complex    # 2+3j
bool       # True / False
str        # "python"
NoneType   # None
```

### Type checking

```python
type(x)
isinstance(x, int)
```

### Interview clarity

> `type()` tells exact type, `isinstance()` supports inheritance.

---

## 7️⃣ Boolean Logic (Truthy & Falsy)

### Falsy values

```python
False
0
0.0
""
[]
{}
None
```

Everything else = **Truthy**

```python
if []:
    print("won't run")
```

---

## 8️⃣ Operators (Layer-1 Complete)

### Arithmetic

```python
+  -  *  /  %  **  //
```

### Comparison

```python
==  !=  >  <  >=  <=
```

### Logical

```python
and  or  not
```

### Identity (INTERVIEW FAV)

```python
is
is not
```

### Membership

```python
in
not in
```

---

## 9️⃣ Input & Output (Trap Area)

### Input

```python
x = input()
```

⚠️ Always returns **string**

```python
x = int(input())
```

### Output (Modern way)

```python
name = "Anshu"
age = 23
print(f"My name is {name} and age is {age}")
```

* f-strings are **fast + readable**
* Preferred in interviews

---

## 🔟 Type Casting (Explicit)

```python
int("10")
float("10.5")
str(100)
bool(1)
```

❌ Invalid

```python
int("abc")  # ValueError
```

---

## 1️⃣1️⃣ Comments

### Single-line

```python
# This is a comment
```

### Multi-line (docstring style)

```python
"""
This is
a multi-line
comment
"""
```

---

## 1️⃣2️⃣ Python Philosophy (Why it matters)

Python follows:

* **Readability counts**
* **Explicit > implicit**
* **Simple > complex**

This is why:

* No `;`
* No `{}`
* Clean indentation

---

## ✅ LAYER 1 — COMPLETED ✔️

### What you now FULLY understand:

* How Python executes
* Syntax & indentation
* Variables & memory reference
* Core data types
* Operators
* Input/Output
* Type casting
* Python mindset

You are now **ready for LAYER 2 (Data Structures)** — where Python becomes powerful.

---

## 🎯 Quick Self-Test (Answer honestly)

1. Why Python doesn’t need variable declaration?
2. Difference between `type()` and `isinstance()`?
3. Why indentation is mandatory?
4. Is Python compiled or interpreted?
5. Why `input()` always returns string?

If you can answer these → **Layer 1 is DONE properly** 💪