const fs = require('fs');
const path = require('path');

const databasePath = path.join(__dirname, 'companyDatabase.json');

// Load companies or initialize if not present
const loadCompanies = () => {
    try {
        const dataBuffer = fs.readFileSync(databasePath);
        const dataJSON = dataBuffer.toString();
        return JSON.parse(dataJSON);
    } catch (e) {
        return [];
    }
};

// Save companies to the file
const saveCompanies = (companies) => {
    const dataJSON = JSON.stringify(companies);
    fs.writeFileSync(databasePath, dataJSON);
};

// Add a new company
const addCompany = (companyName, companyCategory) => {
    const companies = loadCompanies();
    const duplicateCompany = companies.find((company) => company.name === companyName);

    if (!duplicateCompany) {
        companies.push({ name: companyName, category: companyCategory });
        saveCompanies(companies);
        console.log('New company added.');
    } else {
        console.log('Company already exists.');
    }
};

// Update a company's category
const updateCompanyCategory = (companyName, newCategory) => {
    const companies = loadCompanies();
    const company = companies.find((company) => company.name === companyName);

    if (company) {
        company.category = newCategory;
        saveCompanies(companies);
        console.log('Company category updated.');
    } else {
        console.log('Company not found.');
    }
};

const deleteCompany = (companyName) => {
    const companies = loadCompanies();
    const index = companies.findIndex(company => company.name === companyName);
    if (index !== -1) {
        companies.splice(index, 1); // Remove the company from the array
        saveCompanies(companies); // Save the updated list back to your JSON
        return { success: true };
    } else {
        return { success: false };
    }
};  

// Update a company's status
const updateCompanyStatus = (companyName, newStatus) => {
    const companies = loadCompanies();
    const company = companies.find((company) => company.name === companyName);

    if (company) {
        company.status = newStatus;
        saveCompanies(companies);
        console.log('Company status updated.');
    } else {
        console.log('Company not found.');
    }
};
const sortCompanies = (companies, sortBy) => {
    if (sortBy === 'status') {
        return companies.sort((a, b) => statusOrder.indexOf(a.category) - statusOrder.indexOf(b.category));
    } else if (sortBy === 'alphabetical') {
        return companies.sort((a, b) => a.name.localeCompare(b.name));
    } else {
        console.log('Invalid sort option.');
        return companies;
    }
};


const getCompanies = () => {
    return loadCompanies(); // Using the loadCompanies function you already have
};

// Export all functions at the end of the file
module.exports = { addCompany, updateCompanyCategory, getCompanies, deleteCompany };
