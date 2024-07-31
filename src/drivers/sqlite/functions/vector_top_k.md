vector_top_k(idx_name, q_vector, k)

Use **vector_top_k** with the **idx_name** index to efficiently find the top k most similar vectors to **q_vector**

```
SELECT title, year
FROM vector_top_k('movies_idx', vector('[4,5,6]'), 3)
JOIN movies ON movies.rowid = id
```
