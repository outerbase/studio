nullif(X,Y)

The nullif(X, Y) function returns X if X and Y are different, and NULL if they are the same.

```
select nullif(6, 6)
-> NULL

select nullif(7, 6)
-> 7
```
