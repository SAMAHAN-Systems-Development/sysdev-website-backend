# Samahan Official Website Backend

Samahan Official Website Backend is the server-side component powering the Samahan organization's official website. Built with Node.js and NestJS, it provides RESTful APIs, manages authentication, handles data storage, and integrates with services like PostgreSQL and MinIO. This backend is designed for scalability, security, and ease of deployment using Docker, supporting both production and local development environments.

## Table of Contents

- [Tech Stack](#tech-stack)
- [Web GUIs and Credentials](#web-guis-and-credentials)
- [Production and Frontend Use setup](#production-and-frontend-use-setup)
- [Setting up your application -- In case you want to use the backend codebase](#setting-up-your-application----in-case-you-want-to-use-the-backend-codebase)
- [(Backend Developer) Running Application](#backend-developer-running-application)
- [Potential Issues and Fixes](#potential-issues-and-fixes)

## Tech Stack
- **Node.js**: JavaScript runtime for building scalable server-side applications.
- **NestJS**: Progressive Node.js framework for efficient and reliable backend development.
- **Swagger (OpenAPI)**: Integrated with NestJS for automatic API documentation and testing.
- **PostgreSQL**: Open-source relational database for data storage.
- **MinIO**: High-performance object storage compatible with Amazon S3.
- **Docker**: Containerization platform for consistent deployment across environments.
- **Drizzle ORM**: TypeScript-first ORM for SQL databases, providing type-safe queries and migrations.
- **JWT**: JSON Web Tokens for secure authentication.
- **dotenv**: Environment variable management.
- **Other Utilities**: npm scripts for migration, seeding, and development tasks.

## Web GUIs and Credentials

| Service       | URL             | Description        | Default Credentials         |
|---------------|------------------|--------------------|-----------------------------|
| MinIO         | `http://localhost:9001` | Object storage GUI | `minioadmin` / `minioadmin123`     |
| pgAdmin       | `http://localhost:8080` | PostgreSQL GUI     | `admin@admin.com` / `admin`     |
| Swagger (OpenAPI) | `http://localhost:3000/api` | Api Documentation (Application must be running) | Api's are locked so use the `/auth/login` to get the token

*Just make sure that you have already executed the docker-compose*

---

### Production and Frontend Use setup

1. Clone the repository

```bash
git clone
```

2. Fetch the updates

```bash
git fetch
```

3. Run Docker app and run this comand in the root folder of the project

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

- 📌 After you finish using the service, run this command to stop the docker containers:

  ```bash
  docker compose -f docker-compose.prod.yml down
  ```

You have now successfully deployed a working production server! You can access it at `localhost:3000`. For more information about web GUIs and credentials, see the [Web GUIs and Credentials](#web-guis-and-credentials) section.

----

### Setting up your application -- In case you want to use the backend codebase

1. Clone the repository

```bash
git clone
```

2. Fetch the updates

```bash
git fetch
```

3. Switch to the branch of your ticket --- this only applies if you are a **Backend Developer**, if not just stick to `main`

```bash
git checkout 2-2-get-project
```

###

4. Install the libraries with this command:

```bash
npm install
```

5. Duplicate `.env.sample` file and rename it to `.env`

You can accomplish this manually or run this command:

```markdown
For Windows:
copy .env.sample .env

For Linux:
cp .env.sample .env
```

*Or just `ctrl + c` `ctrl + v` the file.*

6. Generation of Jwt secret:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

*This will print a code, and put this code in AUTH_SECRET.*

After that you now have finally setup the backend and ready to start to run the application.

---------

### (Backend Developer) Running Application

After you finish setting up the backend, you can now follow this step to get things running

1. Pull from the main

```bash
git pull origin main
```

2. Install the libraries

```bash
npm install
```

3. Run the docker containers (make sure that you already started your docker application)

```bash
docker compose -f docker-compose.local.yml up -d
```

4. Migrate database

```bash
npm run db:migrate
```

5. Generate Dummy Data (optional)

```bash
npm run db:seed
```

4. Run the NestJS backend

```bash
npm run start
```

- 📌 After you finish programming, run this command to stop the docker containers:

  ```bash
  docker compose -f docker-compose.local.yml down
  ```

-------

### Potential Issues and Fixes

**Sync Issue, and no changes reflected**

**(Production)** In some cases, if error persists after updating the codebase work. Run this following command:

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

*This will sync the current code and the build in docker*

**Resetting the database**

Requirements: docker compose should be running --- then execute this following command:

```
docker compose -f docker-compose.prod.yml down -v
```
You can also is remove the volume by manually using `docker volume rm <volume_name>`

⚠️ *This will reset Minio, Postgress*

**Production: Throwing 500 Internal request error**


Assuming you have all records correct and data is provided.

Please create a ticket with a tag issue with a detail instruction on how to replicate the error and announce it to the gc.

Thank you.
