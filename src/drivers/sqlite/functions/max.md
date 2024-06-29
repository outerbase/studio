max(X,Y,...)

The multi-argument max() function returns the maximum value among its arguments, or NULL if any argument is NULL. It uses the collating function of the first argument for string comparisons, defaulting to the BINARY collating function if none is specified. When given a single argument, max() acts as an aggregate function.

```
select max(5, 6, 1);
-> 6

select max(age) from users;
```
