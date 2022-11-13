## Installation

```
# 1. Run:
$ npm install
# 2. Install mySQL and set the environment for it
# 3. Install Redis and set the environment for it
# 4. Add .env file to the root directory
```

## .env example

```
APP_PORT = 80
DB_HOST = 'localhost'
DB_USER = 'root'
DB_PASSWORD = 'password'
DB_PORT = 3306
DB_DATABASE = 'database'
DB_CONNECTION_LIMIT = 4
REDIS_HOST = 'localhost'
REDIS_PORT = 6379
ACCESS_TOKEN_SECRET='accesskey'
REFRESH_TOKEN_SECRET='refreshkey'
```

## Running the app

```bash
# development
$ npm run dev

# production mode
$ npm run start
```

## Build the app

```bash
$ npm run build
```
