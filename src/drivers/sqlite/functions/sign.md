sign(X)

The sign(X) function returns -1, 0, or 1 if X is negative, zero, or positive, respectively. If X is NULL or not a number, it returns NULL.

```
select sign(-5);  -> -1
select sign(0);   -> 0
select sign(5);   -> 1
```
