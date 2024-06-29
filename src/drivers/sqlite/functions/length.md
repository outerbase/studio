length(X)

The length(X) function returns the character count of string X, excluding any NUL characters for strings (which SQLite typically lacks), or the byte count for blobs. If X is NULL, length(X) is also NULL. For numeric X, it returns the length of its string representation.

```
select length('hello');
-> 5

select length(x'ff00ee');
-> 3

select length(NULL);
-> NULL
```
