# htn-backend-challenge

## Notes:

### REST API is made using Express, and database using Sqlite3

### app.js contains all endpoints for the API!

### Tables in hackers.db

1. `CREATE TABLE hackers ( id INTEGER PRIMARY KEY, name TEXT, company TEXT, email TEXT, phone TEXT )`

2. `CREATE TABLE skills ( hacker_id INTEGER, skill TEXT, rating INTEGER, FOREIGN KEY (hacker_id) REFERENCES hackers(id) );`


