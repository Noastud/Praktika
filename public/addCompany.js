document.getElementById('addCompanyForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const formData = {
        companyName: document.getElementById('companyName').value,
        companyCategory: document.getElementById('companyCategory').value,
    };

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
            const searchInput = document.getElementById('searchInput').value.toLowerCase();
            const filteredCompanies = data.filter(company => company.name.toLowerCase().includes(searchInput));
            filteredCompanies.sort((a, b) => statusOrder.indexOf(a.category) - statusOrder.indexOf(b.category));

            const grid = document.getElementById('companiesGrid');
            grid.innerHTML = '';

            const statusCounts = calculateStatusCounts(filteredCompanies);
            displayStatusCounts(statusCounts);

            filteredCompanies.forEach(company => {
                const companyDiv = document.createElement('div');
                companyDiv.className = `company ${company.category}`;

                const nameDiv = document.createElement('div');
                nameDiv.textContent = company.name;

                const companyContentDiv = document.createElement('div');
                companyContentDiv.classList.add('company-content');

                const statusSelect = document.createElement('select');
                statusSelect.classList.add('status-select');
                statusSelect.addEventListener('change', function() {
                    const newStatus = this.value;
                    company.category = newStatus;
                    const statusCounts = calculateStatusCounts(filteredCompanies);
                    displayStatusCounts(statusCounts);
                });

                statusOrder.forEach(status => {
                    const option = document.createElement('option');
                    option.value = status;
                    option.textContent = status;
                    statusSelect.appendChild(option);
                });

                statusSelect.value = company.category;

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
                companyDiv.appendChild(companyContentDiv);

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
    countsContainer.innerHTML = '';

    Object.entries(statusCounts).forEach(([status, count]) => {
        const countButton = document.createElement('button');
        countButton.textContent = status;
        countButton.classList.add('status-button');
        countButton.addEventListener('click', () => {
            filterAndDisplayByStatus(status);
        });

        const countSpan = document.createElement('span');
        countSpan.textContent = count;
        countButton.appendChild(countSpan);

        countsContainer.appendChild(countButton);
    });
}

function deleteCompany(companyName) {
    fetch(`/api/companies/${companyName}`, {
        method: 'DELETE',
    })
    .then(response => {
        if (response.ok) {
            console.log('Company deleted successfully');
            fetchAndDisplayCompanies();
        } else {
            console.error('Failed to delete company');
        }
    })
    .catch(error => {
        console.error('Error deleting company:', error);
    });
}

function saveChanges() {
    const companyRows = document.querySelectorAll('.company');
    companyRows.forEach(row => {
        const companyName = row.querySelector('div').textContent;
        const newStatus = row.querySelector('.status-select').value;
        saveCompanyChanges(companyName, newStatus);
    });
}

function saveCompanyChanges(companyName, newStatus) {
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

function filterAndDisplayByStatus(status) {
    fetch('/api/companies')
        .then(response => response.json())
        .then(data => {
            const filteredCompanies = data.filter(company => company.category === status);
            displayCompanies(filteredCompanies);
        })
        .catch(error => console.error('Error fetching companies:', error));
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

    document.querySelectorAll('.status-counts .status-button').forEach(statusButton => {
        statusButton.addEventListener('click', () => {
            const status = statusButton.textContent.split(': ')[0];
            filterAndDisplayByStatus(status);
        });
    });
});
