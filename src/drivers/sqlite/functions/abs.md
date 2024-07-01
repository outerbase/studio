abs(X)

Returns the absolute value of X. If X is a string or blob, it returns 0.

```
SELECT abs(-5);  --> 5
SELECT abs("-3");  --> 3
SELECT abs("libsql");  --> 0
```
