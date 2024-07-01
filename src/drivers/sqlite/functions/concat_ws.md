concat_ws(SEP,X,...)

The concat_ws concatenates all non-null arguments beyond the first, using the first argument as a separator. If the first argument is NULL, it returns NULL. If all other arguments are NULL, it returns an empty string.

```
select concat_ws(', ', 'hello', 'world')
-> 'hello world'
```
