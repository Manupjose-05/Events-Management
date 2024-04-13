const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt'); 
const saltRounds = 10; 
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/login', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Error connecting to MongoDB:', err));

// Schema and Models
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});

const contactSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    number: { type: String },
    subject: { type: String },
    message: { type: String, required: true }
});

const invitationSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    venue: { type: String, required: true },
    date: { type: Date, required: true },
    time: { type: String, required: true },
    subject: { type: String, required: true }
});

const Invitation = mongoose.model('Invitation', invitationSchema);
const User = mongoose.model('User', userSchema);
const Contact = mongoose.model('Contact', contactSchema);

// Routes
app.post('/submitContactForm', async (req, res) => {
    try {
        const { name, email, number, subject, message } = req.body;
        const newContact = new Contact({ name, email, number, subject, message });
        await newContact.save();
        console.log('Contact form data saved successfully');
        res.redirect('/');
    } catch (error) {
        console.error('Error saving contact form data:', error);
        res.status(500).send('Error saving contact form data');
    }
});

app.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const newUser = new User({ username, email, password: hashedPassword });
        await newUser.save();
        console.log('User registered successfully');
        res.redirect('/index.html');
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).send('Error registering user');
    }
});

app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            res.status(401).send('Invalid username or password');
            return;
        }
        res.redirect('/index.html');
    } catch (error) {
        console.error('Error logging in user:', error);
        res.status(500).send('Error logging in user');
    }
});

app.post('/invi', async (req, res) => {
    try {
        const { name, email, venue, date, time, subject } = req.body;
        const newInvitation = new Invitation({ name, email, venue, date, time, subject });
        await newInvitation.save();
        console.log('Invitation form data saved successfully');
        res.redirect('/');
    } catch (error) {
        console.error('Error saving invitation form data:', error);
        res.status(500).send('Error saving invitation form data');
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is listening at http://localhost:${port}`);
});
