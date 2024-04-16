document.getElementById('addCompanyForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const formData = {
        companyName: document.getElementById('companyName').value,
        companyCategory: document.getElementById('companyCategory').value,
    };
document.getElementById('sortSelect').addEventListener('change', function() {
    const sortBy = this.value;
    const sortedCompanies = sortCompanies(companies, sortBy);
    displayCompanies(sortedCompanies);
    });
    
    function fetchAndDisplayCompanies() {
        console.log("Fetching and displaying companies...");
        fetch('/api/companies')
            .then(response => response.json())
            .then(data => {
                // Sort companies by status
                data.sort((a, b) => statusOrder.indexOf(a.category) - statusOrder.indexOf(b.category));

                // Filter companies based on search query
                const searchQuery = document.getElementById('searchInput').value.toLowerCase();
                const matchingCompanies = data.filter(company => company.name.toLowerCase().includes(searchQuery));

                // Separate matching and non-matching companies
                const nonMatchingCompanies = data.filter(company => !company.name.toLowerCase().includes(searchQuery));

                // Combine matching and non-matching companies with matching ones at the top
                const combinedCompanies = matchingCompanies.concat(nonMatchingCompanies);

                const grid = document.getElementById('companiesGrid');
                grid.innerHTML = ''; // Clear the grid before displaying the sorted companies

                const statusCounts = calculateStatusCounts(combinedCompanies);
                displayStatusCounts(statusCounts);

                combinedCompanies.forEach(company => {
                    const companyDiv = document.createElement('div');
                    companyDiv.className = `company ${company.category}`;

                    const nameDiv = document.createElement('div');
                    nameDiv.textContent = company.name;

                    const companyContentDiv = document.createElement('div');
                    companyContentDiv.classList.add('company-content');

                    const statusSelect = document.createElement('select');
                    statusSelect.classList.add('status-select'); // Add a class for styling
                    statusSelect.addEventListener('change', function() {
                        // Update the company status when the dropdown value changes
                        const newStatus = this.value;
                        company.category = newStatus; // Update the category in the data array
                        const statusCounts = calculateStatusCounts(combinedCompanies);
                        displayStatusCounts(statusCounts);
                    });
                
                    // Populate dropdown options based on the statusOrder array
                    statusOrder.forEach(status => {
                        const option = document.createElement('option');
                        option.value = status;
                        option.textContent = status;
                        statusSelect.appendChild(option);
                    });
                
                    // Set the selected option to the current company status
                    statusSelect.value = company.category;

                    // Create delete button
                    const deleteButton = document.createElement('button');
                    deleteButton.textContent = 'Delete';
                    deleteButton.classList.add('delete-button');
                    deleteButton.addEventListener('click', function() {
                        deleteCompany(company.name);
                        const statusCounts = calculateStatusCounts(combinedCompanies);
                        displayStatusCounts(statusCounts);
                    });
                
                    companyContentDiv.appendChild(statusSelect);
                    companyContentDiv.appendChild(deleteButton);

                    companyDiv.appendChild(nameDiv);
                    companyDiv.appendChild(companyContentDiv); // Append the company content div
                
                    grid.appendChild(companyDiv);
                });
            }).catch(error => console.error('Error fetching companies:', error));
    }
    
    

    fetch('/api/companies', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
    })
    .then(response => response.json())
    .then(data => {
        alert('Company added!');
        console.log('Success:', data);
        // Refresh the companies list after adding a new company
        fetchAndDisplayCompanies();
    })
    .catch((error) => {
        console.error('Error:', error);
    });
});

const statusOrder = ['Zusage', 'Bewerbungsgespräch', 'Offen', 'Neutral', 'Absage'];

function fetchAndDisplayCompanies() {
    console.log("Fetching and displaying companies...");
    fetch('/api/companies')
        .then(response => response.json())
        .then(data => {
            // Get search input and convert it to lowercase
            const searchInput = document.getElementById('searchInput').value.toLowerCase();

            // Filter companies based on search input (case-insensitive)
            const filteredCompanies = data.filter(company => company.name.toLowerCase().includes(searchInput));

            // Sort filtered companies by status
            filteredCompanies.sort((a, b) => statusOrder.indexOf(a.category) - statusOrder.indexOf(b.category));

            const grid = document.getElementById('companiesGrid');
            grid.innerHTML = ''; // Clear the grid before displaying the sorted companies

            const statusCounts = calculateStatusCounts(filteredCompanies);
            displayStatusCounts(statusCounts);

            // Display filtered and sorted companies
            filteredCompanies.forEach(company => {
                const companyDiv = document.createElement('div');
                companyDiv.className = `company ${company.category}`;

                const nameDiv = document.createElement('div');
                nameDiv.textContent = company.name;

                const companyContentDiv = document.createElement('div');
                companyContentDiv.classList.add('company-content');

                const statusSelect = document.createElement('select');
                statusSelect.classList.add('status-select'); // Add a class for styling
                statusSelect.addEventListener('change', function() {
                    // Update the company status when the dropdown value changes
                    const newStatus = this.value;
                    company.category = newStatus; // Update the category in the data array
                    const statusCounts = calculateStatusCounts(filteredCompanies);
                    displayStatusCounts(statusCounts);
                });

                // Populate dropdown options based on the statusOrder array
                statusOrder.forEach(status => {
                    const option = document.createElement('option');
                    option.value = status;
                    option.textContent = status;
                    statusSelect.appendChild(option);
                });

                // Set the selected option to the current company status
                statusSelect.value = company.category;

                // Create delete button
                const deleteButton = document.createElement('button');
                deleteButton.textContent = 'Delete';
                deleteButton.classList.add('delete-button');
                deleteButton.addEventListener('click', function() {
                    deleteCompany(company.name);
                    const statusCounts = calculateStatusCounts(filteredCompanies);
                    displayStatusCounts(statusCounts);
                });

                companyContentDiv.appendChild(statusSelect);
                companyContentDiv.appendChild(deleteButton);

                companyDiv.appendChild(nameDiv);
                companyDiv.appendChild(companyContentDiv); // Append the company content div

                grid.appendChild(companyDiv);
            });
        }).catch(error => console.error('Error fetching companies:', error));
}



function calculateStatusCounts(companies) {
    const statusCounts = {};
    statusOrder.forEach(status => {
        statusCounts[status] = companies.filter(company => company.category === status).length;
    });
    return statusCounts;
}

function displayStatusCounts(statusCounts) {
    const countsContainer = document.getElementById('statusCounts');
    countsContainer.innerHTML = ''; // Clear previous counts

    Object.entries(statusCounts).forEach(([status, count]) => {
        const countDiv = document.createElement('div');
        countDiv.textContent = `${status}: ${count}`;
        countsContainer.appendChild(countDiv);
    });
}


function deleteCompany(companyName) {
    // Call your backend API to delete the company
    fetch(`/api/companies/${companyName}`, {
        method: 'DELETE',
    })
    .then(response => {
        if (response.ok) {
            console.log('Company deleted successfully');
            fetchAndDisplayCompanies(); // Refresh the companies list after deletion
        } else {
            console.error('Failed to delete company');
        }
    })
    .catch(error => {
        console.error('Error deleting company:', error);
    });
}

function saveChanges() {
    console.log("Save Changes button clicked!");

    const companyRows = document.querySelectorAll('.company');
    companyRows.forEach(row => {
        const companyName = row.querySelector('div').textContent;
        const newStatus = row.querySelector('.status-select').value;

        // Call a function to save the changes for this company
        saveCompanyChanges(companyName, newStatus);
    });
}

function saveCompanyChanges(companyName, newStatus) {
    // Call your backend API to save the changes to the company status
    fetch(`/api/companies/${companyName}/category`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ newCategory: newStatus }),
    })
    .then(response => {
        if (response.ok) {
            console.log('Changes saved successfully');
        } else {
            console.error('Failed to save changes');
        }
    })
    .catch(error => {
        console.error('Error saving changes:', error);
    });
}
function sortCompaniesByStatus(companies) {
    const statusOrder = ['Zusage', 'Bewerbungsgespräch', 'Offen', 'Neutral', 'Absage'];
    return companies.sort((a, b) => {
        return statusOrder.indexOf(a.category) - statusOrder.indexOf(b.category);
    });
}

function handleSearch() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const filteredCompanies = companies.filter(company => company.name.toLowerCase().includes(searchTerm));
    displayCompanies(filteredCompanies);
}


document.addEventListener('DOMContentLoaded', () => {
    fetchAndDisplayCompanies();
    document.getElementById('refreshCompanies').addEventListener('click', fetchAndDisplayCompanies);
    document.getElementById('saveChanges').addEventListener('click', saveChanges);
    document.getElementById('searchInput').addEventListener('input', handleSearch);

    // Add click event listeners to status buttons
    document.querySelectorAll('.status-button').forEach(statusButton => {
        statusButton.addEventListener('click', () => {
            const status = statusButton.textContent.split(': ')[0]; // Extract status from the button text content
            filterAndDisplayByStatus(status);
        });
    });
});

function filterAndDisplayByStatus(status) {
    fetch('/api/companies')
        .then(response => response.json())
        .then(data => {
            const filteredCompanies = data.filter(company => company.category === status);
            displayCompanies(filteredCompanies);
        })
        .catch(error => console.error('Error fetching companies:', error));
}
