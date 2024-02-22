# htn-backend-challenge

## app.js contains all endpoints for the API!

## Tables in hackers.db
`CREATE TABLE hackers ( id INTEGER PRIMARY KEY, name TEXT, company TEXT, email TEXT, phone TEXT )`

`CREATE TABLE skills ( hacker_id INTEGER, skill TEXT, rating INTEGER, FOREIGN KEY (hacker_id) REFERENCES hackers(id) );`


