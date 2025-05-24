# Samahan Official Website Backend
### Setting up your application

1. Clone the repository

```bash
git clone
```

2. Fetch the updates

```bash
git fetch
```

3. Switch to the branch of your ticket, for example:

```bash
git checkout 2-2-get-project
```

###

4. Install the libraries with this command:

```bash
npm i
```

5. Duplicate `.env.sample` file and rename it to `.env`

You can accomplish this manually or run this command:

```markdown
For Windows:
copy .env.sample .env

For Linux:
cp .env.sample .env
```

6. Generation of Jwt secret:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```
*This will print a code, and put this code in AUTH_SECRET*

7. Update the datebase by the drizzle migrations with these commands:

```bash
npm run db:migrate
```

8. Generate Data 
```bash
npm run db:seed
```

### Running Application -- Backend Dev

If you just turned your pc on and you want to start the application, run the following commands:

1. Pull from the main

```bash
git pull origin main
```

2. Install the libraries

```bash
npm i
```

3. Run the docker containers (make sure that you already started your docker application)

```bash
docker compose -f docker-compose.local.yml up -d
```

4. Run the NestJS backend

```bash
npm run start
```

- 📌 After you finish programming, run this command to stop the docker containers:

  ```bash
  docker compose -f docker-compose.local.yml down
  ```


### Running Application -- Production / Frontend

On the root folder just follow the instruction below: 

1. Pull from the main

```bash
git pull origin main
```

3. Run the docker containers (make sure that you already started your docker application)

```bash
docker compose -f docker-compose.prod.yml up -d
```

4. Run the NestJS backend

```bash
npm run start
```

- 📌 In some cases you want to shutdown, run this command to stop the docker containers:

  ```bash
  docker compose -f docker-compose.prod.yml down
  ```

### Potential Issues and Fixes
In some cases, if backend and the current code doesnt work run this following command:

```bash
docker compose -f docker-compose.prod.yml up -d --build
```
*This will sync the current code and the build in docker*

****
Resetting the database

Requirements: docker compose should be running --- then execute this following command:
```
docker compose -f docker-compose.prod.yml down -v
```
*This will reset Minio, Postgress*
