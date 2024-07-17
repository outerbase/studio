ifnull(X,Y)

The ifnull() function returns the first non-NULL argument, or NULL if both are NULL. It requires exactly 2 arguments and is equivalent to coalesce() with two arguments.

```
select ifnull(null, 5);
-> 5
```
