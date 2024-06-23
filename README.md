# LibSQL Studio

LibSQL Studio is a lightweight LibSQL graphical client on your browser written using NextJS.

Try [LibSQL Studio](https://libsqlstudio.com/) online here.

![LibSQL Studo Screenshot](https://github.com/invisal/libsql-web-viewer/assets/4539653/82014129-2ea3-4619-9287-2dc756baba6c)

**Features**

- Optimize table result to view large query result
- Edit your table data in spreadsheet-like editor
- Query editor with basic syntax highlighting and basic auto complete
- Basic connection management

## How to contribute

To run the project

```
pnpm install
cd studio
pnpm run dev
```

**Folder structure**

| Folder    | Description                                                                                                                                                                   |
| --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/gui`    | This is standalone database GUI React component. It is not tied to any specific database driver, allowing users to extend and integrate it into their own projects with ease. |
| `/studio` | It is complete database GUI client as seen in https://libsqlstudio.com. Come with database drivers and many other features                                                    |
