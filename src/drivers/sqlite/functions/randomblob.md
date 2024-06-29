randomblob(N)

The randomblob(N) function returns an N-byte blob of pseudo-random bytes. If N is less than 1, it returns a 1-byte random blob.

```
select hex(randomblob(3))
-> 35DD3E
```
