iif(X,Y,Z)

The iif(X,Y,Z) function returns the value Y if X is true, and Z otherwise

```
select iif(age >= 18, 'adult', 'underage');
-> 'underage'
```
