const express = require('express');
const cors = require('cors');
const fs = require('fs');
const app = express();
const PORT = 5001;

// API Key ficticia
const API_KEY = '12345ABCDEF';

// Middleware
app.use(cors());
app.use(express.json());

// Archivos de datos
const STUDENTS_FILE = './students.json';
const CAREERS_FILE = './careers.json';
const CATEGORIES_FILE = './categories.json';

// Funciones utilitarias
function loadData(file) {
    if (!fs.existsSync(file)) return [];
    return JSON.parse(fs.readFileSync(file, 'utf8'));
}
function saveData(file, data) {
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

// Autenticación simple por API Key
app.use((req, res, next) => {
    if (
        req.method === "OPTIONS" ||
        req.headers.authorization === `Bearer ${API_KEY}`
    ) {
        next();
    } else {
        res.status(401).json({ error: "Unauthorized" });
    }
});

// ================== CATEGORÍAS ==================
app.get('/api/categories', (req, res) => {
    const categories = loadData(CATEGORIES_FILE);
    res.json(categories);
});

app.post('/api/categories', (req, res) => {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: "Name is required" });

    const categories = loadData(CATEGORIES_FILE);
    if (categories.find(c => c.name.toLowerCase() === name.toLowerCase())) {
        return res.status(409).json({ error: "Category already exists" });
    }
    const newId = categories.length ? categories[categories.length - 1].id + 1 : 1;
    const newCategory = { id: newId, name };
    categories.push(newCategory);
    saveData(CATEGORIES_FILE, categories);
    res.status(201).json(newCategory);
});

// ================== CARRERAS ==================
app.get('/api/careers', (req, res) => {
    const careers = loadData(CAREERS_FILE);
    res.json(careers);
});

app.post('/api/careers', (req, res) => {
    const { name, category, categoryName } = req.body;
    if (!name || !category || !categoryName) {
        return res.status(400).json({ error: "Missing required fields: name, category, categoryName." });
    }
    const careers = loadData(CAREERS_FILE);
    if (careers.find(c => c.name.toLowerCase() === name.toLowerCase())) {
        return res.status(409).json({ error: "Career already exists." });
    }
    const newId = careers.length ? careers[careers.length - 1].id + 1 : 1;
    const newCareer = {
        id: newId,
        name,
        category,
        categoryName
    };
    careers.push(newCareer);
    saveData(CAREERS_FILE, careers);
    res.status(201).json(newCareer);
});

app.delete('/api/careers/:id', (req, res) => {
    const id = parseInt(req.params.id);
    let careers = loadData(CAREERS_FILE);
    const initialLength = careers.length;
    careers = careers.filter(c => c.id !== id);
    if (careers.length === initialLength) {
        return res.status(404).json({ error: "Career not found" });
    }
    saveData(CAREERS_FILE, careers);
    res.json({ message: "Career deleted" });
});

// ================== ESTUDIANTES ==================
app.get('/api/students', (req, res) => {
    const students = loadData(STUDENTS_FILE);
    res.json(students);
});

app.post('/api/students', (req, res) => {
    const { name, career } = req.body;
    if (!name || !career) {
        return res.status(400).json({ error: "Missing required fields: name, career." });
    }
    const students = loadData(STUDENTS_FILE);
    const newId = students.length ? students[students.length - 1].id + 1 : 1;
    const newStudent = { id: newId, name, career };
    students.push(newStudent);
    saveData(STUDENTS_FILE, students);
    res.status(201).json(newStudent);
});

app.delete('/api/students/:id', (req, res) => {
    const id = parseInt(req.params.id);
    let students = loadData(STUDENTS_FILE);
    const initialLength = students.length;
    students = students.filter(s => s.id !== id);
    if (students.length === initialLength) {
        return res.status(404).json({ error: "Student not found" });
    }
    saveData(STUDENTS_FILE, students);
    res.json({ message: "Student deleted" });
});

app.listen(PORT, () => {
    console.log(`API running on http://localhost:${PORT}`);
});
