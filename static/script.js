// DOM Elements
const elements = {};

// Configuration
const fareConfigs = {
    'taxi': {
        'normal': {
            minCharge: 40.95,
            baseFare: 15.5,
            perMinPrice: 2.1,
            perKmRates: [
                { maxKm: 5, rate: 5.59 },
                { maxKm: 10, rate: 6.79 },
                { maxKm: 15, rate: 6.64 },
                { maxKm: Infinity, rate: 5.39 }
            ]
        },
        'fromAirport': {
            minCharge: 42.95,
            baseFare: 15.5,
            perMinPrice: 2.1,
            perKmRates: [
                { maxKm: 5, rate: 5.87 },
                { maxKm: 10, rate: 7.13 },
                { maxKm: 15, rate: 6.64 },
                { maxKm: Infinity, rate: 5.39 }
            ]
        },
        'toAirport': {
            minCharge: 40.95,
            baseFare: 15.5,
            perMinPrice: 2.1,
            perKmRates: [
                { maxKm: 5, rate: 5.59 },
                { maxKm: 10, rate: 6.79 },
                { maxKm: 15, rate: 6.31 },
                { maxKm: Infinity, rate: 5.12 }
            ]
        }
    },
    'uberx': {
        'normal': {
            minCharge: 40.95,
            baseFare: 18,
            perMinPrice: 2.04,
            perKmRates: [
                { maxKm: 5, rate: 4.73 },
                { maxKm: 10, rate: 5.23 },
                { maxKm: 15, rate: 5.63 },
                { maxKm: Infinity, rate: 4.88 }
            ]
        },
        'fromAirport': {
            minCharge: 42.95,
            baseFare: 18,
            perMinPrice: 2.04,
            perKmRates: [
                { maxKm: 5, rate: 4.97 },
                { maxKm: 10, rate: 5.49 },
                { maxKm: 15, rate: 5.63 },
                { maxKm: Infinity, rate: 4.88 }
            ]
        },
        'toAirport': {
            minCharge: 40.95,
            baseFare: 18,
            perMinPrice: 2.04,
            perKmRates: [
                { maxKm: 5, rate: 4.73 },
                { maxKm: 10, rate: 5.23 },
                { maxKm: 15, rate: 5.35 },
                { maxKm: Infinity, rate: 4.64 }
            ]
        }
    },
    'comfort': {
        'normal': {
            minCharge: 56,
            baseFare: 26.85,
            perMinPrice: 1.6,
            perKmPrice: 6.29
        }
    },
    'uberxl': {
        'normal': {
            minCharge: 75,
            baseFare: 40,
            perMinPrice: 1.9,
            perKmPrice: 8.68
        }
    },
    'uberxxl': {
        'normal': {
            minCharge: 80,
            baseFare: 45,
            perMinPrice: 1.9,
            perKmPrice: 9.22
        }
    },
    'black': {
        'normal': {
            minCharge: 90,
            baseFare: 45,
            perMinPrice: 1.9,
            perKmPrice: 9.22
        }
    }
};

// Column visibility mappings
const columnMappings = {
    'toggleTime': 0,
    'toggleType': 1,
    'toggleDuration': 2,
    'toggleDistance': 3,
    'toggleSurge': 4,
    'toggleWaitingFee': 5,
    'toggleTip': 6,
    'togglePrice': 7,
    'toggleCalcPrice': 8,
    'toggleDiff': 9,
    'toggleAirport': 10
};

// App state
let selectedFiles = [];
let currentRow = null;
let airportModal = null;

/**
 * Initialize the dark mode detection
 */
function initDarkMode() {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.classList.add('dark');
    }
    
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
        if (event.matches) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    });
}

/**
 * Initialize DOM elements and store references
 */
function initDOMElements() {
    const elementIds = [
        'uploadArea', 'fileInput', 'imagePreview', 'submitBtn', 
        'loader', 'resultTable', 'resultBody', 'resultFooter', 
        'errorAlert', 'toggleCalcColumns', 'columnTogglePopup', 
        'clearAllBtn', 'copyTableBtn', 'toAirportBtn', 
        'fromAirportBtn', 'resetAirportBtn', 'noticeBox'
    ];
    
    elementIds.forEach(id => {
        elements[id] = document.getElementById(id);
    });
    
    airportModal = new bootstrap.Modal(document.getElementById('airportModal'));
}

/**
 * Prevent default behaviors for drag events
 */
function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

/**
 * Setup drag and drop functionality
 */
function setupDragDrop() {
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        elements.uploadArea.addEventListener(eventName, preventDefaults, false);
    });

    elements.uploadArea.addEventListener('dragenter', () => {
        elements.uploadArea.style.borderColor = 'var(--primary-color)';
    });

    elements.uploadArea.addEventListener('dragleave', () => {
        elements.uploadArea.style.borderColor = '';
    });

    elements.uploadArea.addEventListener('drop', (e) => {
        elements.uploadArea.style.borderColor = '';
        const dt = e.dataTransfer;
        handleFiles(dt.files);
    });
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
    // Add click counter variables at the beginning of setupEventListeners
    let clickCount = 0;
    let lastClickTime = 0;
    
    // Add card header click handler
    const cardHeader = document.querySelector('.card-header');
    if (cardHeader) {
        cardHeader.addEventListener('click', function() {
            const currentTime = new Date().getTime();
            
            // Reset count if more than 500ms between clicks
            if (currentTime - lastClickTime > 500) {
                clickCount = 0;
            }
            
            clickCount++;
            lastClickTime = currentTime;
            
            if (clickCount === 5) {
                // Reset click count
                clickCount = 0;
                
                // Uncheck specified checkboxes
                ['toggleTime', 'toggleType', 'toggleCalcPrice', 'toggleDiff', 'toggleAirport']
                    .forEach(id => {
                        const checkbox = document.getElementById(id);
                        if (checkbox) {
                            checkbox.checked = false;
                            checkbox.dispatchEvent(new Event('change'));
                        }
                    });
            }
        });
    }

    // Add reset columns button handler
    const resetColumnsBtn = document.getElementById('resetColumns');
    if (resetColumnsBtn) {
        resetColumnsBtn.addEventListener('click', function() {
            // Get all checkboxes in the popup
            const checkboxes = elements.columnTogglePopup.querySelectorAll('input[type="checkbox"]');
            
            // Check all checkboxes and trigger change event
            checkboxes.forEach(checkbox => {
                checkbox.checked = true;
                checkbox.dispatchEvent(new Event('change'));
            });
        });
    }
    
    // File upload area click
    elements.uploadArea.addEventListener('click', () => {
        elements.fileInput.click();
    });
    
    // File input change
    elements.fileInput.addEventListener('change', function() {
        handleFiles(this.files);
    });
    
    // Clear all button
    elements.clearAllBtn.addEventListener('click', function() {
        selectedFiles = [];
        elements.imagePreview.innerHTML = '';
        updateSubmitButton();
    });
    
    // Submit button
    elements.submitBtn.addEventListener('click', submitFiles);
    
    // Copy table button
    elements.copyTableBtn.addEventListener('click', copyTableToClipboard);
    
    // Toggle columns button
    elements.toggleCalcColumns.addEventListener('click', function(e) {
        e.stopPropagation();
        elements.columnTogglePopup.style.display = 
            elements.columnTogglePopup.style.display === 'none' ? 'block' : 'none';
    });
    
    // Close popup when clicking outside
    document.addEventListener('click', function(e) {
        if (!elements.columnTogglePopup.contains(e.target) && 
            e.target !== elements.toggleCalcColumns) {
            elements.columnTogglePopup.style.display = 'none';
        }
    });
    
    // Airport buttons
    elements.toAirportBtn.addEventListener('click', function() {
        updateAirportType('toAirport', '往機場');
    });
    
    elements.fromAirportBtn.addEventListener('click', function() {
        updateAirportType('fromAirport', '由機場');
    });
    
    elements.resetAirportBtn.addEventListener('click', function() {
        updateAirportType('normal', '');
    });
    
    // Airport button in table rows
    document.addEventListener('click', function(e) {
        if (e.target.closest('.airport-btn')) {
            const btn = e.target.closest('.airport-btn');
            currentRow = btn.closest('tr');
            airportModal.show();
        }
    });
    
    // Column toggle checkboxes
    setupColumnToggleCheckboxes();
}

/**
 * Set up column toggle checkboxes
 */
function setupColumnToggleCheckboxes() {
    Object.keys(columnMappings).forEach(checkboxId => {
        const checkbox = document.getElementById(checkboxId);
        checkbox.addEventListener('change', function() {
            const columnIndex = columnMappings[checkboxId];
            const table = document.querySelector('.table');
            
            // Toggle header
            const header = table.querySelector(`thead th:nth-child(${columnIndex + 1})`);
            if (header) {
                header.style.display = this.checked ? '' : 'none';
            }
            
            // Toggle all cells in this column
            const cells = table.querySelectorAll(`tbody td:nth-child(${columnIndex + 1})`);
            cells.forEach(cell => {
                cell.style.display = this.checked ? '' : 'none';
            });
        });
    });
}

/**
 * Handle selected files for upload
 */
function handleFiles(files) {
    if (files.length === 0) return;
    
    // Get current valid files count
    const currentValidFiles = selectedFiles.filter(file => file !== null).length;
    
    // Calculate how many more files we can accept
    const remainingSlots = 10 - currentValidFiles;
    
    if (remainingSlots <= 0) {
        showError('已達到最大上傳限制 (10張圖片)');
        return;
    }

    // Only process up to the remaining slots
    const filesToProcess = Array.from(files).slice(0, remainingSlots);
    
    filesToProcess.forEach(file => {
        if (!file.type.match('image.*')) return;
        
        selectedFiles.push(file);
        addImagePreview(file, selectedFiles.length - 1);
    });
    
    if (files.length > remainingSlots) {
        showError(`已達到最大上傳限制，只接受了 ${remainingSlots} 張圖片`);
    }
    
    updateSubmitButton();
}

/**
 * Show error message
 */
function showError(message) {
    elements.errorAlert.textContent = message;
    elements.errorAlert.style.display = 'block';
}

/**
 * Hide error message
 */
function hideError() {
    elements.errorAlert.style.display = 'none';
}

/**
 * Add image preview to the UI
 */
function addImagePreview(file, index) {
    const reader = new FileReader();
    
    reader.onload = function(e) {
        const div = document.createElement('div');
        div.className = 'preview-item';
        div.dataset.index = index;
        
        const img = document.createElement('img');
        img.src = e.target.result;
        
        const removeBtn = document.createElement('button');
        removeBtn.className = 'remove-btn';
        removeBtn.innerHTML = '×';
        removeBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            removeImage(index);
        });
        
        div.appendChild(img);
        div.appendChild(removeBtn);
        elements.imagePreview.appendChild(div);
    };
    
    reader.readAsDataURL(file);
}

/**
 * Remove image from selection
 */
function removeImage(index) {
    selectedFiles[index] = null;
    const item = elements.imagePreview.querySelector(`[data-index="${index}"]`);
    if (item) {
        item.remove();
    }
    updateSubmitButton();
}

/**
 * Update submit button state
 */
function updateSubmitButton() {
    const validFiles = selectedFiles.filter(file => file !== null);
    elements.submitBtn.disabled = validFiles.length === 0;
    elements.clearAllBtn.disabled = validFiles.length === 0;
}

/**
 * Submit files to backend
 */
async function submitFiles() {
    const validFiles = selectedFiles.filter(file => file !== null);
    if (validFiles.length === 0) return;
    
    // Hide any previous errors
    hideError();
    
    // Show loading animation
    elements.loader.style.display = 'block';
    elements.resultTable.style.display = 'none';
    elements.submitBtn.disabled = true;

    // Hide notice box
    elements.noticeBox.style.display = 'none';
    
    try {
        const formData = new FormData();
        validFiles.forEach((file) => {
            formData.append('images', file);
        });
        
        // Send files to Flask backend
        const response = await fetch('/api/process-images', {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Upload failed');
        }
        
        const data = await response.json();
        
        if (data.error) {
            throw new Error(data.error);
        }
        
        displayResults(data);
        
    } catch (error) {
        console.error('Error:', error);
        showError(error.message || 'An error occurred during processing');
        elements.loader.style.display = 'none';
    } finally {
        elements.submitBtn.disabled = false;
    }
}

/**
 * Copy table data to clipboard
 */
function copyTableToClipboard() {
    const rows = document.querySelectorAll('#resultBody tr');
    let copyText = '';
    
    rows.forEach(row => {
        const cells = Array.from(row.querySelectorAll('td'));
        const rowData = cells
            .filter(cell => {
                // Check if the cell is visible (not display: none)
                const style = window.getComputedStyle(cell);
                return style.display !== 'none';
            })
            .map(cell => {
                // If there's an input field, get its value
                const input = cell.querySelector('input');
                if (input) {
                    return input.value || '';
                }
                // Otherwise get the cell's text content
                return cell.textContent.trim();
            });
        
        copyText += rowData.join('\t') + '\n';
    });
    
    navigator.clipboard.writeText(copyText).then(() => {
        // Temporarily change button text to show success
        const originalText = elements.copyTableBtn.innerHTML;
        elements.copyTableBtn.innerHTML = '<i class="bi bi-check"></i> Copied!';
        setTimeout(() => {
            elements.copyTableBtn.innerHTML = originalText;
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy text:', err);
        alert('Failed to copy table data');
    });
}

/**
 * Display results in the table
 */
function displayResults(data) {
    elements.resultBody.innerHTML = '';

    let count = 0; // number of rows
    let sumPrice = 0; // sum of price
    let sumDifference = 0; // sum of difference
    
    data.forEach(item => {
        count++;

        const duration = item['Duration (minutes)'];
        const distance = item['Distance (km)'];
        const surge = item['Surge (HK$)'];
        const tip = item['Tip'];
        const price = item['Price (HK$)'];
        const airportTrip = item['Airport trip?'];
        const rideType = item['Type of ride'];

        const row = document.createElement('tr');
        sumPrice += price;
        
        let calculatedPrice = calculatePrice(duration, distance, surge, 0, tip, airportTrip, rideType);
        let difference = (price - calculatedPrice).toFixed(2);
        if (rideType.startsWith('咪錶的士')) {
            calculatedPrice = price;
            difference = 0;
        }
        sumDifference += parseFloat(difference);

        row.innerHTML = `
            <td>${item['Time of the ride']}</td>
            <td>${rideType}</td>
            <td>${duration}</td>
            <td>${distance}</td>
            <td>${surge || ''}</td>
            <td>${item['Waiting Fee?'] === 'X' ? `<input type="number" class="waitingFeeInput" step="0.01" min="0" max="100"/>` : item['Waiting Fee?'] || ''}</td>
            <td>${tip}</td>
            <td>${price}</td>
            <td class="calculatedPrice">${calculatedPrice}</td>
            <td class="priceDifference ${parseFloat(difference) <= -5 ? 'bigPriceDifference' : ''}">${difference}</td>
            <td>
                ${!['Comfort', 'UberXL', 'UberXXL', 'Black'].includes(rideType) && !rideType.startsWith('咪錶的士') ? `
                    <button class="btn btn-sm btn-outline-secondary airport-btn" data-type="normal">
                        <i class="bi bi-airplane"></i>
                    </button>
                ` : ''}
            </td>
        `;

        row.cells[0].dataset.rideType = rideType;
        
        elements.resultBody.appendChild(row);

        // Add event listener for waiting fee input if it exists
        setupWaitingFeeInput(row, duration, distance, surge, tip, price, rideType);
    });
    
    // Initial summary row
    updateSummaryFooter(count, sumPrice, sumDifference);

    elements.loader.style.display = 'none';
    elements.resultTable.style.display = 'block';
}

/**
 * Set up waiting fee input event handling
 */
function setupWaitingFeeInput(row, duration, distance, surge, tip, price, rideType) {
    const waitingFeeInput = row.querySelector('.waitingFeeInput');
    if (!waitingFeeInput) return;
    
    waitingFeeInput.setAttribute('pattern', '^\d*\.?\d{0,2}$');

    waitingFeeInput.addEventListener('input', function(e) {
        // Format and validate input
        let value = formatWaitingFeeInput(this.value);
        
        // Only update if value actually changed
        if (this.value !== value) {
            this.value = value;
        }

        // Calculate with the new waiting fee
        const waitingFee = this.value === '' ? 0 : parseFloat(this.value);
        const airportType = row.querySelector('.airport-btn')?.dataset.type || 'normal';
        
        updateRowCalculation(row, duration, distance, surge, waitingFee, tip, price, rideType, airportType);
    });
}

/**
 * Format waiting fee input to ensure valid values
 */
function formatWaitingFeeInput(value) {
    // Remove any non-numeric characters except decimal point
    let formattedValue = value.replace(/[^\d.]/g, '');
    
    // Ensure only one decimal point
    const decimalPoints = formattedValue.match(/\./g);
    if (decimalPoints && decimalPoints.length > 1) {
        formattedValue = formattedValue.replace(/\.+$/, '');
    }

    // Handle decimal places
    if (formattedValue.includes('.')) {
        const [whole, decimal] = formattedValue.split('.');
        formattedValue = whole + '.' + (decimal || '').slice(0, 2);
    }

    // Check if value is within 0-100 range
    let numValue = parseFloat(formattedValue);
    if (numValue > 100) {
        formattedValue = '100';
    }

    return formattedValue;
}

/**
 * Update the row calculation with new values
 */
function updateRowCalculation(row, duration, distance, surge, waitingFee, tip, price, rideType, airportType) {
    const newCalculatedPrice = calculatePrice(duration, distance, surge, waitingFee, tip, airportType, rideType);
    const calculatedPriceCell = row.querySelector('.calculatedPrice');
    const differenceCell = row.querySelector('.priceDifference');
    
    calculatedPriceCell.textContent = newCalculatedPrice;
    const newDifference = (price - newCalculatedPrice).toFixed(2);
    differenceCell.textContent = newDifference;
    differenceCell.classList.toggle('bigPriceDifference', parseFloat(newDifference) <= -5);

    // Recalculate total summary
    recalculateTotalSummary();
}

/**
 * Recalculate total summary values
 */
function recalculateTotalSummary() {
    let totalDifference = 0;
    document.querySelectorAll('.priceDifference').forEach(cell => {
        totalDifference += parseFloat(cell.textContent || 0);
    });

    // Get the number of rows and total price
    const count = document.querySelectorAll('#resultBody tr').length;
    const sumPrice = parseFloat(elements.resultFooter.children[1].textContent.split('$')[1]);
    
    // Update summary footer
    updateSummaryFooter(count, sumPrice, totalDifference);
}

/**
 * Update the summary footer
 */
function updateSummaryFooter(count, sumPrice, sumDifference) {
    elements.resultFooter.innerHTML = `
        <p class="mb-1">總筆數: ${count} 筆</p>
        <p class="mb-0">總行程收入: HK$ ${sumPrice.toFixed(2)}</p>
        <p class="mb-0">總差額: HK$ ${sumDifference.toFixed(2)}</p>
    `;
}

/**
 * Update the airport type for the current row
 */
function updateAirportType(airportType, label) {
    if (!currentRow) return;
    
    const duration = parseFloat(currentRow.cells[2].textContent); 
    const distance = parseFloat(currentRow.cells[3].textContent);
    const surge = currentRow.cells[4].textContent; 
    const waitingFeeInput = currentRow.cells[5].querySelector('input'); 
    const waitingFee = waitingFeeInput ? parseFloat(waitingFeeInput.value) || 0 : 0;
    const tip = parseFloat(currentRow.cells[6].textContent) || 0; 
    const price = parseFloat(currentRow.cells[7].textContent);
    const rideType = currentRow.cells[0].dataset.rideType;

    // Update button appearance
    updateAirportButtonStyle(currentRow, airportType);
    
    // Update price calculations
    updateRowCalculation(currentRow, duration, distance, surge, waitingFee, tip, price, rideType, airportType);
    
    airportModal.hide();
}

/**
 * Update the airport button style based on type
 */
function updateAirportButtonStyle(row, airportType) {
    const airportBtn = row.querySelector('.airport-btn');
    if (!airportBtn) return;
    
    airportBtn.dataset.type = airportType;
    airportBtn.classList.remove('btn-outline-secondary', 'btn-primary', 'btn-info');
    
    if (airportType === 'normal') {
        airportBtn.classList.add('btn-outline-secondary');
        airportBtn.querySelector('i').classList.remove('bi-airplane-fill');
        airportBtn.querySelector('i').classList.add('bi-airplane');
    } else if (airportType === 'toAirport') {
        airportBtn.classList.add('btn-primary');
        airportBtn.querySelector('i').classList.remove('bi-airplane');
        airportBtn.querySelector('i').classList.add('bi-airplane-fill');
    } else {
        airportBtn.classList.add('btn-info');
        airportBtn.querySelector('i').classList.remove('bi-airplane-fill');
        airportBtn.querySelector('i').classList.add('bi-airplane');
    }
}

/**
 * Calculate the price based on ride details
 */
function calculatePrice(duration, distance, surge, waitingFee = 0, tip, airportTrip, rideType) {
    // Ensure all inputs are proper numbers
    duration = parseFloat(duration) || 0;
    distance = parseFloat(distance) || 0;
    surge = parseFloat(surge) || 0;
    waitingFee = parseFloat(waitingFee) || 0;
    tip = parseFloat(tip) || 0;
    
    let serviceType = 'taxi'; // default to taxi
    let commission = 0.9;
    let petFee = 0;

    // Determine service type and commission based on ride type
    if (rideType) {
        const rideTypeLower = rideType.toLowerCase();
        if (rideTypeLower.includes('uber pet')) {
            serviceType = 'uberx';
            commission = 0.73;
            petFee = 20; // Add $20 for Uber Pet rides
        } else if (rideTypeLower.includes('uberxxl')) {
            serviceType = 'uberxxl';
            commission = 0.7;
        } else if (rideTypeLower.includes('uberxl')) {
            serviceType = 'uberxl';
            commission = 0.7;
        } else if (rideTypeLower.includes('uberx')) {
            serviceType = 'uberx';
            commission = 0.73;
        } else if (rideTypeLower.includes('comfort')) {
            serviceType = 'comfort';
            commission = 0.7;
        } else if (rideTypeLower.includes('black')) {
            serviceType = 'black';
            commission = 0.7;
        }
    }

    // For fixed-rate services, always use 'normal' config regardless of airport status
    const useAirportTrip = ['taxi', 'uberx'].includes(serviceType) ? airportTrip : 'normal';
    
    // Safety check for config existence
    if (!fareConfigs[serviceType] || !fareConfigs[serviceType][useAirportTrip]) {
        console.error(`Config not found for ${serviceType} with airport trip ${useAirportTrip}`);
        return 0;
    }
    
    const config = fareConfigs[serviceType][useAirportTrip];
    const perKmPrice = getPerKmRate(distance, config);

    // Calculate price
    let price = (config.baseFare + 
        duration * config.perMinPrice + 
        (distance * perKmPrice) + 
        surge + 
        waitingFee +
        petFee) * commission +
        tip;
    
    // Apply minimum charge
    if (price < config.minCharge * commission) {
        price = config.minCharge * commission;
    }
    
    return price.toFixed(2);
}

/**
 * Get per km rate based on distance
 */
function getPerKmRate(distance, rateConfig) {
    // Ensure distance is a number
    distance = parseFloat(distance) || 0;
    
    if (rateConfig.perKmPrice !== undefined) {
        return rateConfig.perKmPrice;
    }
    
    // Use the variable rate system
    // Add a safety check in case no matching rate is found
    const rateItem = rateConfig.perKmRates.find(rate => distance <= rate.maxKm);
    return rateItem ? rateItem.rate : rateConfig.perKmRates[0].rate;
}

/**
 * Initialize the application
 */
document.addEventListener('DOMContentLoaded', function() {
    initDarkMode();
    initDOMElements();
    setupDragDrop();
    setupEventListeners();
});