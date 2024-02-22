const express = require('express');
const sqlite3 = require('sqlite3').verbose();

const port = process.env.PORT || 3000;

const app = express();

// Database initilization - inserting JSON rows into hackers.db
const db = new sqlite3.Database('./hackers.db');

const jsonData = fs.readFileSync('./hackers.json');
const hackersData = JSON.parse(jsonData);

// Function to insert JSON data into the database
function insertData() {
    hackersData.forEach(hacker => {
        const { name, company, email, phone, skills } = hacker;

        // Insert hacker data into 'hackers' table
        db.run(`INSERT INTO hackers (name, company, email, phone) 
                VALUES (?, ?, ?, ?)`, [name, company, email, phone], function (err) {
            if (err) {
                console.error('Error inserting hacker:', err);
                return;
            }

            const hackerId = this.lastID;

            // Insert skills data into 'skills' table
            skills.forEach(skill => {
                const { skill: skillName, rating } = skill;
                db.run(`INSERT INTO skills (hacker_id, skill, rating) 
                        VALUES (?, ?, ?)`, [hackerId, skillName, rating], function (err) {
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


app.get("/", (req, res) => {
    res.send("Hello World!");
});


// All Users Endpoint
app.get('/all-users', (req, res) => {
    const query = `
      SELECT user_profiles.id, user_profiles.name, user_profiles.company, 
             user_profiles.email, user_profiles.phone,
             user_skills.skill, user_skills.rating
      FROM user_profiles
      INNER JOIN user_skills ON user_profiles.id = user_skills.user_id
    `;

    db.all(query, [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: 'Error' });
            return;
        }
        // Organize the data into a JSON response
        const users = {};
        rows.forEach(row => {
            const { id, name, company, email, phone, skill, rating } = row;
            if (!users[id]) {
                users[id] = {
                    id,
                    name,
                    company,
                    email,
                    phone,
                    skills: []
                };
            }
            users[id].skills.push({ skill, rating });
        });
        // Convert the object to an array of users
        const usersArray = Object.values(users);
        console.log(usersArray);
		let string = JSON.stringify(usersArray);
		res.send({ express: string });
        // res.json(usersArray);
    });
});

// User Information Endpoint
app.get('/user/:id', (req, res) => {
    const userId = req.params.id;

    const query = `
        SELECT user_profiles.id, user_profiles.name, user_profiles.company, 
               user_profiles.email, user_profiles.phone,
               user_skills.skill, user_skills.rating
        FROM user_profiles
        INNER JOIN user_skills ON user_profiles.id = user_skills.user_id
        WHERE user_profiles.id = ?
    `;

    db.all(query, [userId], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        // Check if user exists
        if (rows.length === 0) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        // Organize the data into a JSON response
        const user = {
            id: rows[0].id,
            name: rows[0].name,
            company: rows[0].company,
            email: rows[0].email,
            phone: rows[0].phone,
            skills: rows.map(row => ({ skill: row.skill, rating: row.rating }))
        };

        res.send(user);
    });
});

// Updating User Data Endpoint
app.put('/user/:id', (req, res) => {
    const userId = req.params.id;
    const userData = req.body;

    const query = `
    UPDATE user_profiles 
    SET name = ?, company = ?, email = ?, phone = ?
    WHERE id = ?
    `;

    db.run(query, [userData.name, userData.company, userData.email, userData.phone, userId],
            (err) => {
                if (err) {
                    res.status(500).json({ error: 'Error' });
                    return;
                }
                res.send({ message: 'User data updated' });
            });
});

// Skills Endpoint
app.get('/skills/frequency', (req, res) => {
    
    const query = `
        SELECT skill, COUNT(DISTINCT hacker_id) as frequency
        FROM skills
        GROUP BY skill
        HAVING frequency >= ? AND frequency <= ?
    `;

    db.all(query, [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: 'Error' });
            return;
        }
        console.log(rows);
		let string = JSON.stringify(rows);
		res.send({ express: rows });
    });
});

app.listen(port, () => {
    console.log(`Example REST Express app listening at http://localhost:3000`);
});

