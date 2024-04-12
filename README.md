# ThePollAPI

A poll API using Node.js with websockets.

Create polls, vote on the options and see the number of votes of each option in realtime.

## Pre-requirements

You need to have Docker and docker-compose installed or provide mongodb and redis locally.

## Installing

Create a new .env file and change the values as needed:

```yml
COOKIE_SECRET="LSNJADLAIJSDILAJSIx"
PORT=3333

DATABASE_URL="mongodb+srv://<mongobduser>:<mongodbserver>/polls?retryWrites=true&w=majority"
```

After cloning this repository, open a console/terminal and type the following to install the API dependencies:

```bash
docker compose up -d
yarn install # or 'npm i' if you prefer npm
npx prisma generate
npx prisma db push
```

## Running the application

To run the application, type:

```bash
yarn dev # or use 'npm run dev' if you prefer npm
```

## Next steps

- [ ] Add documentation
- [ ] Add tests
- [ ] Add authentication