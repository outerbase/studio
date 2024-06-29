ltrim(X,Y)

The ltrim(X, Y) function removes characters specified in Y from the left side of string X. Omitting Y removes spaces from the left side of X.

```
select ltrim(' hello');
-> 'hello'

select ltrim('0.005', '0.');
-> '5'
```
