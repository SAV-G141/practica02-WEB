const express = require('express');
const app = express();
const port = 3000;

const userRoutes = require('./routes/users');
const roleRoutes = require('./routes/roles');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static folder for uploaded images
app.use('/uploads', express.static('uploads'));

// Static folder for frontend files
app.use(express.static('public'));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/roles', roleRoutes);

app.listen(port, () => {
  console.log('Server running on http://localhost:' + port);
});
