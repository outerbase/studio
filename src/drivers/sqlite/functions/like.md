like(X,Y), like(X,Y,Z)

The like() function checks if the string Y matches the pattern X in the "Y LIKE X [ESCAPE Z]" expression.

```
select like('hel%', 'hello')
-> 1

select like('wor%', 'hello')
-> 0
```
