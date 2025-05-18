document.addEventListener('DOMContentLoaded', function() {
    // SIDEBAR TOGGLE
    const menuBar = document.querySelector('#content nav .bx.bx-menu');
    const sidebar = document.getElementById('sidebar');

    if (menuBar && sidebar) {
        menuBar.addEventListener('click', function () {
            sidebar.classList.toggle('hide');
        });
    }

    // SIDEBAR ACTIVE STATE
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    const sidebarLinks = document.querySelectorAll('#sidebar .side-menu li a');

    sidebarLinks.forEach(link => {
        const linkPath = link.getAttribute('href');
        const linkLi = link.parentElement;
        if (linkPath === currentPath) {
            linkLi.classList.add('active');
        } else {
            linkLi.classList.remove('active');
        }
    });

    // MEDICINE MANAGEMENT (only on medicines.html)
    const medicineForm = document.getElementById('medicineForm');
    const medicineTableBody = document.getElementById('medicineTableBody');
    const medicineId = document.getElementById('medicineId');
    const medicineName = document.getElementById('medicineName');
    const medicineCategory = document.getElementById('medicineCategory');
    const medicinePrice = document.getElementById('medicinePrice');
    const medicineStock = document.getElementById('medicineStock');
    const medicineDescription = document.getElementById('medicineDescription');
    const prescriptionRequired = document.getElementById('prescriptionRequired');
    const formTitle = document.getElementById('form-title');
    const saveButton = document.getElementById('saveButton');
    const cancelButton = document.getElementById('cancelButton');

    if (medicineForm && medicineTableBody && medicineId && medicineName && medicineCategory && medicinePrice && medicineStock && medicineDescription && prescriptionRequired && formTitle && saveButton && cancelButton) {
        // Display medicines in the table
        async function renderMedicines() {
            try {
                const response = await fetch('/admin/api/products');
                if (!response.ok) throw new Error('Failed to fetch medicines');
                const medicines = await response.json();

                if (medicines.length === 0) {
                    medicineTableBody.innerHTML = `
                        <tr>
                            <td colspan="7" class="empty-state">No medicines added yet</td>
                        </tr>
                    `;
                    return;
                }

                medicineTableBody.innerHTML = '';
                medicines.forEach(medicine => {
                    let statusClass = '';
                    let statusText = '';

                    if (medicine.stock <= 0) {
                        statusClass = 'out-of-stock';
                        statusText = 'Out of Stock';
                    } else if (medicine.stock <= 10) {
                        statusClass = 'low-stock';
                        statusText = 'Low Stock';
                    } else {
                        statusClass = 'in-stock';
                        statusText = 'In Stock';
                    }

                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td>${medicine.name}</td>
                        <td>${medicine.category}</td>
                        <td>LKR ${parseFloat(medicine.price).toFixed(2)}</td>
                        <td>${medicine.stock}</td>
                        <td><span class="status ${statusClass}">${statusText}</span></td>
                        <td>${medicine.prescriptionRequired}</td>
                        <td class="action-buttons">
                            <button class="btn btn-warning btn-edit" data-id="${medicine.id}">
                                <i class='bx bx-edit'></i>
                            </button>
                            <button class="btn btn-danger btn-delete" data-id="${medicine.id}">
                                <i class='bx bx-trash'></i>
                            </button>
                        </td>
                    `;
                    medicineTableBody.appendChild(tr);
                });

                document.querySelectorAll('.btn-edit').forEach(button => {
                    button.addEventListener('click', editMedicine);
                });

                document.querySelectorAll('.btn-delete').forEach(button => {
                    button.addEventListener('click', deleteMedicine);
                });
            } catch (error) {
                console.error('Error rendering medicines:', error);
                medicineTableBody.innerHTML = `<tr><td colspan="7" class="empty-state">Failed to load medicines</td></tr>`;
            }
        }

        async function addMedicine(e) {
            e.preventDefault();

            if (!medicineForm.checkValidity()) {
                alert('Please fill all required fields');
                return;
            }

            const medicine = {
                id: medicineId.value ? parseInt(medicineId.value) : null,
                name: medicineName.value,
                category: medicineCategory.value,
                price: parseFloat(medicinePrice.value),
                stock: parseInt(medicineStock.value),
                description: medicineDescription.value,
                prescriptionRequired: prescriptionRequired.value
            };

            const method = medicineId.value ? 'PUT' : 'POST';
            const url = medicineId.value ? `/admin/api/products/${medicine.id}` : '/admin/api/products';

            try {
                const response = await fetch(url, {
                    method: method,
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(medicine)
                });

                const result = await response.json();
                if (!response.ok) {
                    throw new Error(result.error || 'Failed to save medicine');
                }

                alert(result.message || (medicineId.value ? 'Medicine updated successfully!' : 'Medicine added successfully!'));
                resetForm();
                renderMedicines();
            } catch (error) {
                console.error('Error:', error);
                alert(`An error occurred: ${error.message}`);
            }
        }

        function editMedicine(e) {
            const id = e.currentTarget.dataset.id;
            fetch(`/admin/api/products`)
                .then(res => res.json())
                .then(medicines => {
                    const medicine = medicines.find(med => med.id === parseInt(id));
                    if (!medicine) return;

                    medicineId.value = medicine.id;
                    medicineName.value = medicine.name;
                    medicineCategory.value = medicine.category;
                    medicinePrice.value = medicine.price;
                    medicineStock.value = medicine.stock;
                    medicineDescription.value = medicine.description;
                    prescriptionRequired.value = medicine.prescriptionRequired;

                    formTitle.textContent = 'Update Medicine';
                    saveButton.textContent = 'Update Medicine';
                    cancelButton.style.display = 'inline-block';

                    document.querySelector('.medicine-form').scrollIntoView({ behavior: 'smooth' });
                });
        }

        async function deleteMedicine(e) {
            const id = e.currentTarget.dataset.id;

            if (!confirm('Are you sure you want to delete this medicine?')) return;

            try {
                const response = await fetch(`/admin/api/products/${id}`, {
                    method: 'DELETE'
                });

                const result = await response.json();
                if (!response.ok) {
                    throw new Error(result.error || 'Failed to delete medicine');
                }

                alert(result.message || 'Medicine deleted successfully!');
                renderMedicines();
            } catch (error) {
                console.error('Error:', error);
                alert(`An error occurred: ${error.message}`);
            }
        }

        function resetForm() {
            medicineId.value = '';
            medicineForm.reset();
            formTitle.textContent = 'Add Medicine';
            saveButton.textContent = 'Add Medicine';
            cancelButton.style.display = 'none';
        }

        // Initial render
        renderMedicines();

        medicineForm.addEventListener('submit', addMedicine);
        cancelButton.addEventListener('click', resetForm);
    }

    // DARK MODE TOGGLE
    const switchMode = document.getElementById('switch-mode');

    if (switchMode) {
        switchMode.addEventListener('change', function () {
            if (this.checked) {
                document.body.classList.add('dark');
            } else {
                document.body.classList.remove('dark');
            }
        });
    }
});