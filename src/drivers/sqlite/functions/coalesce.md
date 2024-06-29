coalesce(X,Y,...)

The coalesce() function returns a copy of its first non-NULL argument, or NULL if all arguments are NULL. Coalesce() must have at least 2 arguments.

```
select coalesce(null, 50);
-> 50
```
