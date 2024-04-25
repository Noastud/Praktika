document.getElementById('addCompanyForm').addEventListener('submit', function (e) {
    e.preventDefault();

    // Get form data
    const formData = {
        companyName: document.getElementById('companyName').value,
        companyWebsite: document.getElementById('companyWebsite').value,
        companyCategory: document.getElementById('companyCategory').value,
    };

    // Send POST request to add a new company
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

// Define the order of status categories
const statusOrder = ['Zusage', 'Bewerbungsgespräch', 'Offen', 'Neutral', 'Absage'];

function fetchAndDisplayCompanies(searchTerm = '') {
    console.log("Fetching and displaying companies...");
    fetch('/api/companies')
        .then(response => response.json())
        .then(data => {
            // Filter companies based on the search term
            const filteredCompanies = data.filter(company => company.name.toLowerCase().includes(searchTerm.toLowerCase()));

            // Separate favorite companies and other categories
            const favorites = filteredCompanies.filter(company => company.favorite);
            const neutralCompanies = filteredCompanies.filter(company => !company.favorite && company.category === 'Neutral');
            const otherCompanies = filteredCompanies.filter(company => !company.favorite && company.category !== 'Neutral');

            // Sort other companies based on the status order
            otherCompanies.sort((a, b) => statusOrder.indexOf(a.category) - statusOrder.indexOf(b.category));

            // Concatenate favorites, neutral, and other companies
            const sortedCompanies = favorites.concat(neutralCompanies, otherCompanies);

            // Get the grid container
            const grid = document.getElementById('companiesGrid');
            grid.innerHTML = '';

            // Calculate and display status counts
            const statusCounts = calculateStatusCounts(sortedCompanies);
            displayStatusCounts(statusCounts);

            // Display each company in the grid
            sortedCompanies.forEach(company => {
                const companyDiv = document.createElement('div');
                companyDiv.className = `company ${company.category}`;
                if (company.favorite) {
                    companyDiv.classList.add('favorite');
                }

                const nameDiv = document.createElement('div');
                nameDiv.textContent = company.name;

                const companyContentDiv = document.createElement('div');
                companyContentDiv.classList.add('company-content');

                // Create website link
                const websiteLink = document.createElement('a');
                websiteLink.href = company.website; // Set href attribute to the company's website URL
                websiteLink.textContent = 'Website'; // Display text for the link
                websiteLink.target = '_blank'; // Open link in a new tab
                companyContentDiv.appendChild(websiteLink); // Append website link to company content div

                // Create status select dropdown
                const statusSelect = document.createElement('select');
                statusSelect.classList.add('status-select');
                statusSelect.addEventListener('change', function () {
                    // Update the status of the company
                    const newStatus = this.value;
                    company.category = newStatus;
                    const statusCounts = calculateStatusCounts(sortedCompanies);
                    displayStatusCounts(statusCounts);
                });

                // Populate status options
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
                deleteButton.addEventListener('click', function () {
                    const companyName = company.name;
                    const confirmationMessage = `Are you sure you want to delete ${companyName}?`;

                    if (confirm(confirmationMessage)) {
                        deleteCompany(companyName);
                        const statusCounts = calculateStatusCounts(sortedCompanies);
                        displayStatusCounts(statusCounts);
                    } else {
                        // User clicked cancel, do nothing
                    }
                });

                // Create favorite button
                // Create favorite button
                const favoriteButton = document.createElement('button');
                favoriteButton.textContent = company.favorite ? 'Unfavorite' : 'Favorite';
                favoriteButton.classList.add('favorite-button');
                favoriteButton.addEventListener('click', function () {
                    const newFavoriteStatus = !company.favorite;
                    fetch(`/api/companies/${company.name}/favorite`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ favorite: newFavoriteStatus }),
                    })
                        .then(response => {
                            if (response.ok) {
                                // If the request is successful, update the company object and UI
                                company.favorite = newFavoriteStatus;
                                favoriteButton.textContent = newFavoriteStatus ? 'Unfavorite' : 'Favorite';
                                if (newFavoriteStatus) {
                                    companyDiv.classList.add('favorite');
                                } else {
                                    companyDiv.classList.remove('favorite');
                                }
                            } else {
                                console.error('Failed to toggle favorite status');
                            }
                        })
                        .catch(error => {
                            console.error('Error toggling favorite status:', error);
                        });
                });



                // Append elements to company content div
                companyContentDiv.appendChild(statusSelect);
                companyContentDiv.appendChild(deleteButton);
                companyContentDiv.appendChild(favoriteButton);

                // Append elements to company div
                companyDiv.appendChild(nameDiv);
                companyDiv.appendChild(companyContentDiv);

                // Append company div to grid
                grid.appendChild(companyDiv);
            });
        }).catch(error => console.error('Error fetching companies:', error));
}



// Function to calculate status counts
function calculateStatusCounts(companies) {
    const statusCounts = {};
    statusOrder.forEach(status => {
        statusCounts[status] = companies.filter(company => company.category === status).length;
    });
    return statusCounts;
}

// Function to display status counts
function displayStatusCounts(statusCounts) {
    const countsContainer = document.getElementById('statusCounts');
    countsContainer.innerHTML = ''; // Clear previous counts

    // Create buttons for each status count
    Object.entries(statusCounts).forEach(([status, count]) => {
        const countDiv = document.createElement('div'); // Create a div to contain each button
        const countButton = document.createElement('button');
        countButton.textContent = status;
        countButton.classList.add('status-button');
        countButton.addEventListener('click', () => {
            filterAndDisplayByStatus(status);
        });

        const countSpan = document.createElement('span');
        countSpan.textContent = count;
        countButton.appendChild(countSpan);

        countDiv.appendChild(countButton); // Append button to div
        countsContainer.appendChild(countDiv); // Append div to container
    });
}

// Function to delete a company
function deleteCompany(companyName) {
    // Send DELETE request to delete the company
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

// Event listener for page load
document.addEventListener('DOMContentLoaded', () => {
    fetchAndDisplayCompanies(); // Fetch and display all companies on page load
    document.getElementById('refreshCompanies').addEventListener('click', fetchAndDisplayCompanies);
    document.getElementById('saveChanges').addEventListener('click', saveChanges);
});

// Function to save changes to company status
function saveChanges() {
    const companyRows = document.querySelectorAll('.company');
    companyRows.forEach(row => {
        const companyName = row.querySelector('div').textContent;
        const newStatus = row.querySelector('.status-select').value;

        // Call a function to save the changes for this company
        saveCompanyChanges(companyName, newStatus);
    });
}

// Function to save changes for a specific company
function saveCompanyChanges(companyName, newStatus) {
    // Send PUT request to update the company status
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

// Function to filter and display companies by status
function filterAndDisplayByStatus(status) {
    fetchAndDisplayCompanies(status);
}
