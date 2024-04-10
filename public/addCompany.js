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
            // Sort companies by status
            data.sort((a, b) => statusOrder.indexOf(a.category) - statusOrder.indexOf(b.category));

            const grid = document.getElementById('companiesGrid');
            grid.innerHTML = ''; // Clear the grid before displaying the sorted companies

            data.forEach(company => {
                const companyDiv = document.createElement('div');
                companyDiv.className = `company ${company.category}`;
                
                const nameDiv = document.createElement('div');
                nameDiv.textContent = company.name;
                
                const statusSelect = document.createElement('select');
                statusSelect.classList.add('status-select'); // Add a class for styling
                statusSelect.addEventListener('change', function() {
                    // Update the company status when the dropdown value changes
                    const newStatus = this.value;
                    company.category = newStatus; // Update the category in the data array
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
            
                companyDiv.appendChild(nameDiv);
                companyDiv.appendChild(statusSelect);
            
                grid.appendChild(companyDiv);
            });
        }).catch(error => console.error('Error fetching companies:', error));
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

document.addEventListener('DOMContentLoaded', () => {
    fetchAndDisplayCompanies();
    document.getElementById('refreshCompanies').addEventListener('click', fetchAndDisplayCompanies);
    document.getElementById('saveChanges').addEventListener('click', saveChanges);
});
