rtrim(X,Y)

The rtrim(X, Y) function removes all characters in Y from the right side of X. If Y is omitted, it removes spaces.

```
select rtrim('hello ');
-> 'hello'

select rtrim('5,000', '0,');
-> '5'
```
