# knowitforward

- clone git repo
- npm i 
- create the db by running `\i db/schema.sql` in your postgress prompt.
- set the .env file and populate the fields: `DB_NAME, DB_USER, DB_PW, JWT_SECRET`
- to start the server: `npm run start`

## API calls

- register: `POST /api/user`
- login: `POST /api/login1
- get user details: `GET /api/user/:id`
