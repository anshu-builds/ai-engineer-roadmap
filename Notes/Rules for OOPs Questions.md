Here are **3 CLASSIC OOP TRAP QUESTIONS** (exam + interview favorites).

## 🧨 TRAP 1 — Mutable Class Variable (MOST COMMON)

```python
class A:
    items = []

a1 = A()
a2 = A()

a1.items.append(10)

print(a1.items)
print(a2.items)
```

### ❓ Predict the output

---

### ✅ Answer

```
[10]
[10]
```

### 🧠 Why?

- `items` is a **class variable**
- Both objects point to the **same list**
- `append()` mutates the shared list

### 🔒 Rule

> **Mutating a mutable class variable affects all instances.**

---

## 🧨 TRAP 2 — Instance Assignment vs Class Variable

```python
class B:
    x = 5

b1 = B()
b2 = B()

b1.x += 5

print(b1.x)
print(b2.x)
```

### ❓ Predict the output

---

### ✅ Answer

```
10
5
```

### 🧠 Why?

- `b1.x += 5` → creates **instance variable** `b1.x`
- Class variable `B.x` remains `5`
- `b2` still reads the class variable

### 🔒 Rule

> **Assignment via object creates an instance variable.**

---

## 🧨 TRAP 3 — Method Modifying Class Variable (SUBTLE)

```python
class C:
    count = 0

    def inc(self):
        self.count += 1

c1 = C()
c2 = C()

c1.inc()
c2.inc()

print(c1.count)
print(c2.count)
print(C.count)
```

### ❓ Predict the output

---

### ✅ Answer

```
1
1
0
```

### 🧠 Why?

- `self.count += 1` becomes:

  ```python
  self.count = self.count + 1
  ```

- This **creates instance variables** in `c1` and `c2`
- The **class variable `C.count` is never modified**

### 🔒 Correct way (if you wanted shared count):

```python
C.count += 1
```

or

```python
type(self).count += 1
```

---

## 🧠 FINAL LOCK (MEMORIZE THESE 3 RULES)

1️⃣ **Mutable class variables are shared**
2️⃣ **Object assignment creates instance variables**
3️⃣ **`self.x += 1` does NOT modify class variables**

If these 3 rules are clear,
👉 **90% OOP traps are handled**.
