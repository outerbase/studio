# Outerbase Studio

**Outerbase Studio** (aka LibSQL Studio) is a lightweight, browser-based GUI designed to simplify SQL database management with flexibility and ease. It supports a variety of databases, including SQLite-compatible options (D1, rqlite, Turso, Durable Object, etc.), as well as MySQL, Dolt, PostgreSQL, Worker Analytics Engine. Outerbase Studio is available in multiple formats to suit different needs:

- **[Hosted Web App](#hosted-web-app)**: Access it directly from your web browser.
- **[Desktop App](#desktop-app)**: Available for Mac, Windows, and Linux.
- **[Command Line](#command-line)**: Manage databases via CLI tools.
- **[Docker](#docker)**: Deploy using containerized environments.
- **Embed**: Integrate seamlessly into your own applications.

## Hosted Web App

Give it a try directly from your browser

[![LibSQL Studio, sqlite online editor](https://github.com/user-attachments/assets/5d92ce58-9ce6-4cd7-9c65-4763d2d3b231)](https://libsqlstudio.com)
[![Libsql studio playground](https://github.com/user-attachments/assets/dcf7e246-fe72-4351-ab10-ae2d1658087d)](https://libsqlstudio.com/playground/client?template=chinook)

Hosted it on your own on Cloudflare

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/outerbase/studio)

## Desktop App

You can download [Windows and Mac desktop app here](https://github.com/outerbase/studio-desktop/releases/).

Outerbase Studio Desktop is a lightweight Electron wrapper for the Outerbase Studio web version. It enables support for drivers that aren't feasible in a browser environment, such as MySQL and PostgreSQL.

## Command Line

@outerbase/studio lets you connect to databases and launch a web interface with a simple command. It can be used for explore your database or expose your database externally. [Learn more here](https://github.com/outerbase/studio-cli)

```bash
npx @outerbase/studio sqlite.db
npx @outerbase/studio mysql://root:123456@localhost:3306/my_db
```

## Docker

We currently do not provide an official Docker image. However, this repository includes a `Dockerfile` that you can use to build and self-host your own instance.

Some users have successfully utilized Docker Compose with the following configuration:

```yaml
db-admin:
  image: node:22-alpine
  command: npx -y @outerbase/studio /data/data.sqlite
```
