libsql_vector_idx(X)

Use the **libsql_vector_idx** expression in the CREATE INDEX statement to create an ANN index.

```
CREATE INDEX movies_idx ON movies (libsql_vector_idx(embedding));
```
