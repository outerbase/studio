glob(X,Y)

The GLOB operator is like LIKE but uses Unix file globbing syntax and is case-sensitive.

```
select glob('*hello*', 'hello world');
-> 1
```
