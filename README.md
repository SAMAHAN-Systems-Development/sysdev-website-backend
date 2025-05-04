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

6. Change important `.env` variables

- `service role key` and set the value of `supabase_key` in your .env file to the value of the service role key. ( You can get this later after starting supabase docker container)
<!-- - Generate JWT Secret, run this line on the terminal:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
``` -->

7. Update the datebase by the drizzle migrations with these commands:

```bash
npm run db:migrate:reset
```
this will add the current migration + seed new data to database.

### Running Application

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
npm run db:start
```

4. Run the NestJS backend

```bash
npm run start
```

- 📌 After you finish programming, run this command to stop the docker containers:

  ```bash
  npm run db:stop
  ```
