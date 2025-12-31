# 🧠 PYTHON LAYER 3 — CONTROL FLOW & FUNCTIONS (RECAP SHEET)

---

## 🔹 1. Control Flow

### ✅ `if / elif / else`

- Executes based on **truthy / falsy** values
- Only **one block** executes

### 🔸 Falsy values

```python
False, 0, 0.0, "", [], {}, None
```

---

## 🔹 2. Loops

### `for` loop

```python
for i in range(3):
    print(i)
```

- `range()` is **lazy**
- Cleaner than C-style loops

---

### `while` loop

```python
while condition:
    ...
```

- Used when iterations are **unknown**

---

### `break` vs `continue`

- `break` → exits loop completely
- `continue` → skips current iteration

---

### 🔥 Loop `else` (INTERVIEW FAVORITE)

- Executes **only if loop finishes without `break`**

```python
for i in range(3):
    print(i)
else:
    print("Done")
```

---

## 🔹 3. Functions Basics

### `def`

- Defines a function
- Function runs **only when called**

```python
def f():
    pass
```

---

### `return` vs `print`

- `return` → sends value back
- `print` → only displays
- No `return` → returns `None`

---

## 🔹 4. Function Arguments

### Positional

```python
f(1, 2)
```

### Keyword

```python
f(a=1, b=2)
```

### Default

```python
def f(a=10):
    ...
```

---

### ⚠️ Mutable Default Argument Trap

```python
def f(lst=[]):  # ❌ dangerous
```

✅ Correct way:

```python
def f(lst=None):
    if lst is None:
        lst = []
```

📌 Default arguments evaluated **once**.

---

## 🔹 5. `*args` and `**kwargs`

### `*args`

- Variable positional arguments
- Stored as **tuple**

```python
def f(*args):
    print(args)
```

---

### `**kwargs`

- Variable keyword arguments
- Stored as **dictionary**

```python
def f(**kwargs):
    print(kwargs)
```

---

### Order of parameters

```python
def f(a, b, *args, c=10, **kwargs):
    pass
```

---

## 🔹 6. Scope & LEGB Rule (VERY IMPORTANT)

### LEGB order:

1. **Local**
2. **Enclosing**
3. **Global**
4. **Built-in**

---

### Key rule 🔒

> LEGB is used when a variable is **read**,
> not when it is **assigned**.

---

## 🔹 7. `global` vs `nonlocal`

### `global`

- Modifies **global variable**

```python
global x
```

---

### `nonlocal`

- Modifies **enclosing function variable**

```python
nonlocal x
```

---

### Golden rule (MEMORIZE)

> **Reading is implicit, modifying must be explicit.**

---

## 🔹 8. Shadowing

```python
def outer():
    x = 10
    def inner():
        x = 20
```

- Inner `x` **shadows** outer `x`
- Shadowing is **local only**
- Does NOT affect outer/global unless `nonlocal/global` is used

---

## 🔹 9. Function vs Loop (KEY DIFFERENCE)

| Feature             | Loop | Function          |
| ------------------- | ---- | ----------------- |
| Scope               | Same | New scope         |
| Inner affects outer | Yes  | ❌ No             |
| Needs keyword       | No   | `nonlocal/global` |

---

## ⭐ INTERVIEW ONE-LINERS (VERY IMPORTANT)

- Python uses **truthy/falsy**, not strict booleans
- Loop `else` runs only if no `break`
- Default arguments evaluated once
- `*args` → tuple, `**kwargs` → dict
- LEGB decides variable lookup
- Assignment creates local variable
- Use `nonlocal` / `global` to modify outer variables

---

## ✅ LAYER 3 STATUS

✔ Control flow
✔ Functions
✔ Arguments
✔ Scope & LEGB
✔ Traps & edge cases

**Layer 3 = DONE & INTERVIEW-READY** 🎯
