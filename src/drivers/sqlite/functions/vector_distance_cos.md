vector_distance_cos(X, Y)

Function to calculate cosine distance between two vectors.
It computes the distance as 1 minus the cosine similarity,
meaning a smaller distance indicates closer vectors.

```
SELECT * FROM movie
ORDER BY vector_distance_cos(embedding, '[3,1,2]')
```
