instr(X, Y)

The instr(X, Y) function returns the position of the first occurrence of string Y within string X plus 1, or 0 if Y is not found in X.

```
select instr('hello world', 'wo');
-> 7
```
