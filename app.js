// import express from "express";
const express = require('express');
// import sqlite3 from "sqlite3";
const sqlite3 = require('sqlite3').verbose();

const port = process.env.PORT || 3000;

const app = express();

// Create a database if none exists
// const database = new sqlite3.Database("./hackers.db");

app.get("/", (req, res) => {
    res.send("Hello World!");
});

app.listen(port, () => {
    console.log(`Example REST Express app listening at http://localhost:3000`);
});