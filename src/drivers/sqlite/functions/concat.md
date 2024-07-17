concat(X,...)

The concat function returns a string formed by concatenating all its non-NULL arguments. If all arguments are NULL, it returns an empty string.

```
select concat('hello', ' ', 'world')
-> 'hello world'
```
