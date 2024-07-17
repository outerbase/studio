format(FORMAT,...)

The FORMAT() function, similar to C's printf(), uses a format string (first argument) to construct the output with values from subsequent arguments.

```
select format('i am %d years old', 50);
-> 'i am 50 years old'
```
