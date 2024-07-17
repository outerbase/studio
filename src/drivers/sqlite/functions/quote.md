quote(X)

The quote(X) function returns the SQL literal for X, suitable for inclusion in an SQL statement. Strings are single-quoted with escaped interior quotes. BLOBs are encoded as hex literals.

```
select quote('hello '' world')
-> 'hello '' world'

select quote(x'ffee00')
-> X'FFEE00'
```
