max(X,Y,...)

The multi-argument min() function returns the minimum value among its arguments, utilizing the collating function of the first argument for string comparisons or defaulting to BINARY. When given a single argument, min() acts as an aggregate function.

```
select min(5, 6, 1);
-> 1

select min(age) from users;
```
