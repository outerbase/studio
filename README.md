# Outerbase Studio

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/outerbase/studio)

**Outerbase Studio** is a lightweight, browser-based GUI designed to simplify SQL database management with flexibility and ease. It supports a variety of databases, including SQLite-compatible options (D1, rqlite, Turso, etc.), as well as MySQL, Dolt, and PostgreSQL. Outerbase Studio is available in multiple formats to suit different needs:

- **Hosted Browser**: Access it directly from your web browser.
- **[Desktop App](#desktop-app)**: Available for Mac, Windows, and Linux.
- **Command Line**: Manage databases via CLI tools.
- **[Docker](#docker)**: Deploy using containerized environments.
- **Embed**: Integrate seamlessly into your own applications.

---

Give it a try directly from your browser

[![LibSQL Studio, sqlite online editor](https://github.com/user-attachments/assets/5d92ce58-9ce6-4cd7-9c65-4763d2d3b231)](https://libsqlstudio.com)
[![Libsql studio playground](https://github.com/user-attachments/assets/dcf7e246-fe72-4351-ab10-ae2d1658087d)](https://libsqlstudio.com/playground/client?template=chinook)

## Desktop App

You can download [Windows and Mac desktop app here](https://github.com/outerbase/studio-desktop/releases/).

Outerbase Studio Desktop is a lightweight Electron wrapper for the Outerbase Studio web version. It enables support for drivers that aren't feasible in a browser environment, such as MySQL and PostgreSQL.

## Docker

We currently do not provide an official Docker image. However, this repository includes a `Dockerfile` that you can use to build and self-host your own instance.

Some users have successfully utilized Docker Compose with the following configuration:

```yaml
db-admin:
  image: node:22-alpine
  command: npx -y @outerbase/studio /data/data.sqlite
```

## Features

![libsqlstudio-git-preview (7)](https://github.com/user-attachments/assets/1d7a3d90-61e3-4a77-83a5-4bb096bbfb4b)

- **Query Editor**: It features a user-friendly query editor equipped with auto-completion and function hint tooltips. It allows you to execute multiple queries simultaneously and view their results efficiently.
- **Data Editor**: It comes with a powerful data editor, allowing you to stage all your changes and preview them before committing. The data table is highly optimized and lightweight, capable of rendering thousands of rows and columns efficiently.
- **Schema Editor**: It allows you to quickly create, modify, and remove table columns with just a few clicks without writing any SQL.
- **Connection Manager**: It includes a flexible connection manager, allowing you to store your connections locally in your browser. You can also store them on a server and share your connections across multiple devices.

The features mentioned above are just a few of the many we offer. Give it a try to explore everything we have in store
