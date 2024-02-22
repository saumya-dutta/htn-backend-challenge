const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

const app = express();
const port = 3000;

// Create a connection to the SQLite database
const db = new sqlite3.Database('./hackers.db');

// Read the JSON data file
const jsonData = fs.readFileSync('./hackers.json');
const hackersData = JSON.parse(jsonData);

// Function to insert JSON data into the database
function insertData() {
    hackersData.forEach(hacker => {
        const { name, company, email, phone, skills } = hacker;

        // Insert hacker data into 'hackers' table
        db.run(`INSERT INTO hackers (name, company, email, phone) 
                VALUES (?, ?, ?, ?)`, [name, company, email, phone], function(err) {
            if (err) {
                console.error('Error inserting hacker:', err);
                return;
            }

            const hackerId = this.lastID;

            // Insert skills data into 'skills' table
            skills.forEach(skill => {
                const { skill: skillName, rating } = skill;
                db.run(`INSERT INTO skills (hacker_id, skill, rating) 
                        VALUES (?, ?, ?)`, [hackerId, skillName, rating], function(err) {
                    if (err) {
                        console.error('Error inserting skill:', err);
                        return;
                    }
                });
            });
        });
    });
}

// Call the insertData function to insert the data when the server starts
db.serialize(() => {
    db.run('CREATE TABLE IF NOT EXISTS hackers (id INTEGER PRIMARY KEY, name TEXT, company TEXT, email TEXT, phone TEXT)');
    db.run('CREATE TABLE IF NOT EXISTS skills (hacker_id INTEGER, skill TEXT, rating INTEGER, FOREIGN KEY (hacker_id) REFERENCES hackers(id))');
    insertData();
});

// Start the Express server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
