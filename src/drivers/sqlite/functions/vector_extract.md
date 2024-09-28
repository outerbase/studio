vector_extract(X)

Function to extract string from binary vector

```
SELECT title,
  vector_extract(embedding),
  vector_distance_cos(embedding, vector('[5,6,7]'))
FROM movies;
```
