fts5(...col)

FTS5 is an SQLite virtual table module that provides full-text search functionality to database applications.

```
CREATE VIRTUAL TABLE movie_fts USING fts5(title, summary);
CREATE VIRTUAL TABLE name_fts USING fts5(name, tokenize='trigram');
```

**External Content Tables**

```
CREATE VIRTUAL TABLE student_fts USING fts5(
    name,
    tokenize='trigram',
    content='student',
    content_rowid='id'
);
```
