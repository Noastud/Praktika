const express = require('express');
// Import deleteCompany along with other functions
const { addCompany, updateCompanyCategory, getCompanies, deleteCompany, updateCompanyStatus } = require('./CompanyController');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

// Middleware for parsing JSON bodies
app.use(bodyParser.json());

// Serve static files from the public directory
app.use(express.static('public'));

// POST endpoint to add a new company
app.post('/api/companies', (req, res) => {
    const { companyName, companyCategory } = req.body;
    addCompany(companyName, companyCategory);
    res.status(201).send({ message: 'Company added successfully' });
});

// PUT endpoint to update a company's category
app.put('/api/companies/:companyName/category', (req, res) => {
    const { companyName } = req.params;
    const { newCategory } = req.body;
    updateCompanyCategory(companyName, newCategory);
    res.status(200).send({ message: 'Company category updated successfully' });
});
// GET endpoint to fetch all companies
app.get('/api/companies', (req, res) => {
    const companies = getCompanies(); // Fetch all companies
    res.json(companies); // Send the companies back as JSON
});
// DELETE endpoint to delete a company
app.delete('/api/companies/:companyName', (req, res) => {
    const { companyName } = req.params;
    const result = deleteCompany(companyName); // Implement this function in CompanyController
    if (result.success) {
        res.status(200).send({ message: 'Company deleted successfully' });
    } else {
        res.status(404).send({ message: 'Company not found' });
    }
});
app.put('/api/companies/:companyName/status', (req, res) => {
    const { companyName } = req.params;
    const { newStatus } = req.body;
    updateCompanyStatus(companyName, newStatus);
    res.status(200).send({ message: 'Company status updated successfully' });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
