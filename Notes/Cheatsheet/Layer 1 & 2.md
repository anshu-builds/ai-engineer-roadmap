# 🧠 PYTHON — LAYER 1 RECAP (BASICS)

## 🔹 1. Python Fundamentals

- Python is **dynamically typed**
- Variables are **references**, not memory boxes (unlike C)
- No variable declaration needed

```python
x = 10
x = "hi"
```

---

## 🔹 2. Compiled or Interpreted?

> Python is **both compiled and interpreted**

Flow:

```
.py → bytecode (.pyc) → executed by PVM
```

- Compilation → bytecode
- Interpretation → by **Python Virtual Machine (PVM)**

---

## 🔹 3. PVM (Python Virtual Machine)

- Executes Python bytecode
- Enables:

  - Platform independence
  - Dynamic typing
  - Memory management

---

## 🔹 4. Input / Output

```python
x = input()
```

- `input()` always returns **string**
- Keyboard input is text
- Type conversion is explicit

```python
x = int(input())
```

---

## 🔹 5. `type()` vs `isinstance()`

| Feature     | `type()` | `isinstance()` |
| ----------- | -------- | -------------- |
| Exact type  | ✅       | ❌             |
| Inheritance | ❌       | ✅             |
| Recommended | ❌       | ✅             |

---

## 🔹 6. `=` vs `==`

- `=` → assignment
- `==` → value comparison

---

## 🔹 7. `is` vs `==`

- `==` → compares values
- `is` → compares memory identity

```python
a == b   # value
a is b   # same object?
```

📌 Use `is` only with `None`.

---

## 🔹 8. `id()`

- Returns **identity (memory address)** of object

---

## 🔹 9. `None`

- Represents **absence of value**
- Type: `NoneType`

```python
x is None   # correct check
```

---

## 🔹 10. Keywords

- Reserved words
- Cannot be used as identifiers

```python
if, else, for, while, def, return, None
```

---

## 🔹 11. Comments vs Docstrings

| Comment           | Docstring         |
| ----------------- | ----------------- |
| `#`               | `""" """`         |
| Ignored by Python | Stored in memory  |
| For devs          | For documentation |

---

## ⭐ Layer 1 One-liners (MEMORIZE)

- Python is dynamically typed
- Variables are references
- PVM executes bytecode
- `input()` returns string
- `is` ≠ `==`

---

# 🧱 PYTHON — LAYER 2 RECAP (DATA STRUCTURES)

## 🔹 1. Strings

- **Immutable**
- Sequence of Unicode characters
- Any modification → new object

```python
s = "hi"
s = s + "!"
```

---

### String comparison

- Lexicographical (dictionary order)
- Based on **Unicode values**

```python
"10" < "2"   # True
```

---

### `+` vs `join()`

- `+` → creates many temporary strings → O(n²)
- `join()` → one allocation → O(n)

```python
"".join(list_of_strings)
```

---

## 🔹 2. Lists

- **Ordered, mutable**
- Stores **references**

```python
lst = [1, 2, 3]
lst[0] = 10
```

---

### List assignment trap

```python
a = [1, 2]
b = a
```

- No copy created
- Both refer to same list

---

### `==` vs `is` (lists)

```python
a == b   # value
a is b   # identity
```

---

### Important methods

- `append()` → one element
- `extend()` → multiple elements
- `insert()` → at index
- `pop()` / `remove()`

---

### Shallow copy trap

```python
a = [[1, 2], [3, 4]]
b = a.copy()
```

- Inner lists still shared

---

## 🔹 3. Tuples

- Ordered, **immutable**
- Faster than lists
- Can be dict keys

```python
t = (1, 2)
```

⚠️ Single element tuple:

```python
t = (5,)
```

---

## 🔹 4. Sets

- Unordered
- Unique elements
- Implemented using **hashing**

```python
s = {1, 2, 3}
```

- Fast lookup → O(1)
- Cannot contain mutable elements

---

## 🔹 5. Dictionaries

- Key-value pairs
- Keys must be **immutable**

```python
d = {"a": 1}
```

- Lookup → O(1)
- Uses hashing

---

## ⭐ Layer 2 One-liners (MEMORIZE)

- Strings are immutable
- Lists are mutable
- Assignment copies reference
- Tuples are immutable
- Sets store unique values
- Dict keys must be immutable
