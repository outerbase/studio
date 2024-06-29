octet_length(X)

The octet_length(X) function returns the number of bytes in the encoding of text string X. If X is NULL, it returns NULL. For BLOBs, it returns the same as length(X). For numeric values, it returns the byte count of the text representation.

```
select octet_length('វិសាល'); -> 15
select octet_length('visal'); -> 5
select octet_length(x'ff11ee');  -> 3
```
