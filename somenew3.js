 // --- GLOBAL VARIABLES & LOCAL STORAGE KEYS ---
        const ASSETS_KEY = 'asset_management_assets';
        const COUNTER_KEY = 'asset_management_counter';
        
        let assets = []; 
        let nextAssetId = 1; 
        let currentFilter = 'all'; 

        // --- DOM Elements ---
        const totalAssetsCountEl = document.getElementById('totalAssetsCount');
        const assignedAssetsCountEl = document.getElementById('assignedAssetsCount');
        const faultyAssetsCountEl = document.getElementById('faultyAssetsCount');
        const activeUsersCountEl = document.getElementById('activeUsersCount');
        const assetTableBody = document.getElementById('assetTableBody');
        const assetForm = document.getElementById('assetForm');
        const submitButton = document.getElementById('submitButton');
        const currentFilterLabel = document.getElementById('currentFilterLabel');
        const metricCardsContainer = document.getElementById('metricCards');
        const editFirestoreIdInput = document.getElementById('editFirestoreId');
        const statusMessageEl = document.getElementById('statusMessage');

        // --- 1. INITIALIZATION AND LOCAL STORAGE ---

        function initApp() {
            // Load assets from Local Storage
            const storedAssets = localStorage.getItem(ASSETS_KEY);
            if (storedAssets) {
                try {
                    assets = JSON.parse(storedAssets);
                } catch (e) {
                    console.error("Error parsing stored assets:", e);
                    assets = [];
                }
            }

            // Load sequential counter from Local Storage
            const storedCounter = localStorage.getItem(COUNTER_KEY);
            if (storedCounter) {
                nextAssetId = parseInt(storedCounter, 10);
            }
            
            // Set up event listeners
            assetForm.addEventListener('submit', handleFormSubmit);
            metricCardsContainer.addEventListener('click', handleFilterClick);
            
            // Initial render
            renderAll();
        }

        function saveAssets() {
            // Save the current assets array to Local Storage
            localStorage.setItem(ASSETS_KEY, JSON.stringify(assets));
        }

        function saveCounter() {
            // Save the next available sequential ID to Local Storage
            localStorage.setItem(COUNTER_KEY, nextAssetId.toString());
        }
        
        function getNextSequentialId() {
            const id = nextAssetId;
            nextAssetId++;
            saveCounter();
            return id;
        }

        // --- 2. RENDERING AND METRICS ---

        function renderAll() {
            updateMetrics();
            renderTable(assets);
        }

        function updateMetrics() {
            // Calculate metrics based on the current 'assets' array
            const assigned = assets.filter(a => a.status === 'Assigned').length;
            const faulty = assets.filter(a => a.status === 'Faulty').length;
            
            // Calculate unique active users (users assigned to at least one asset)
            const uniqueUsers = new Set(
                assets
                .filter(a => a.assignedTo && a.assignedTo.trim() !== '' && a.assignedTo !== 'Unassigned')
                .map(a => a.assignedTo.trim().toLowerCase()) // Normalize and make case-insensitive
            ).size;
            
            // Update DOM
            totalAssetsCountEl.textContent = assets.length;
            assignedAssetsCountEl.textContent = assigned;
            faultyAssetsCountEl.textContent = faulty;
            activeUsersCountEl.textContent = uniqueUsers;
        }

        function renderTable(allAssets) {
            let filteredAssets = allAssets;

            // 1. Apply filtering based on currentFilter
            switch (currentFilter) {
                case 'assigned':
                    filteredAssets = allAssets.filter(a => a.status === 'Assigned');
                    currentFilterLabel.textContent = 'Assigned Assets';
                    break;
                case 'faulty':
                    filteredAssets = allAssets.filter(a => a.status === 'Faulty');
                    currentFilterLabel.textContent = 'Faulty Assets';
                    break;
                case 'activeUsers':
                    // Identify unique users assigned to an asset
                    const uniqueUserIDs = new Set(
                        allAssets
                        .filter(a => a.assignedTo && a.assignedTo.trim() !== '' && a.assignedTo !== 'Unassigned')
                        .map(a => a.assignedTo.trim().toLowerCase())
                    );
                    // Filter assets that belong to any of these unique users
                    filteredAssets = allAssets.filter(a => 
                        a.assignedTo && uniqueUserIDs.has(a.assignedTo.trim().toLowerCase())
                    );
                    currentFilterLabel.textContent = 'Assets Assigned to Active Users';
                    break;
                case 'all':
                default:
                    currentFilterLabel.textContent = 'All Assets';
                    break;
            }

            // 2. Render table rows
            assetTableBody.innerHTML = filteredAssets.map(asset => `
                <tr data-id="${asset.id}">
                    <td>${asset.assetId}</td>
                    <td>${asset.name}</td>
                    <td>${asset.category}</td>
                    <td>${asset.status}</td>
                    <td>${asset.assignedTo || 'Unassigned'}</td>
                    <td>${new Date(asset.dateAdded).toLocaleDateString()}</td>
                    <td class="actions">
                        <button class="edit-btn" onclick="editAsset('${asset.id}')">Edit</button>
                        <button class="delete-btn" onclick="deleteAsset('${asset.id}')">Delete</button>
                    </td>
                </tr>
            `).join('');
        }
        
        // Helper function for showing status messages
        function showStatus(message, isError = false) {
            statusMessageEl.textContent = message;
            statusMessageEl.style.color = isError ? '#F44336' : '#4CAF50';
            setTimeout(() => {
                statusMessageEl.textContent = '';
            }, 3000);
        }

        // --- 3. CRUD OPERATIONS ---

        async function handleFormSubmit(e) {
            e.preventDefault();
            
            submitButton.textContent = 'Saving...';
            submitButton.disabled = true;

            const name = document.getElementById('assetName').value.trim();
            const category = document.getElementById('category').value;
            const assignedToRaw = document.getElementById('assignedTo').value.trim();
            const assignedTo = assignedToRaw || 'Unassigned';
            const status = document.getElementById('status').value;
            const firestoreId = editFirestoreIdInput.value;
            
            const assetData = { name, category, assignedTo, status };

            try {
                if (firestoreId) {
                    // EDIT existing asset
                    const index = assets.findIndex(a => a.id === firestoreId);
                    if (index !== -1) {
                        assets[index] = { ...assets[index], ...assetData };
                        showStatus("Asset updated successfully!");
                    }
                } else {
                    // ADD new asset
                    const newId = crypto.randomUUID(); // Unique ID for Local Storage
                    const sequentialId = getNextSequentialId(); // Sequential ID for display
                    
                    const newAsset = {
                        id: newId,
                        assetId: sequentialId,
                        dateAdded: new Date().toISOString(),
                        ...assetData,
                    };
                    
                    assets.push(newAsset);
                    showStatus(`Asset added successfully with ID ${sequentialId}!`);
                }

                // Persist changes and re-render
                saveAssets();
                renderAll(); 

                // Reset form and UI state
                assetForm.reset();
                editFirestoreIdInput.value = '';
                submitButton.textContent = 'Add Asset';

            } catch (error) {
                console.error("Error saving asset:", error);
                showStatus("An error occurred while saving the asset.", true);
            } finally {
                submitButton.disabled = false;
            }
        }

        window.editAsset = function(localId) {
            const asset = assets.find(a => a.id === localId);
            
            if (asset) {
                // Pre-fill the form
                document.getElementById('assetName').value = asset.name;
                document.getElementById('category').value = asset.category;
                document.getElementById('assignedTo').value = asset.assignedTo === 'Unassigned' ? '' : asset.assignedTo;
                document.getElementById('status').value = asset.status;
                editFirestoreIdInput.value = localId; // Use the localId for editing
                submitButton.textContent = `Update Asset (ID: ${asset.assetId})`;
            }
        }

        window.deleteAsset = function(localId) {
            const assetIndex = assets.findIndex(a => a.id === localId);
            
            if (assetIndex !== -1) {
                assets.splice(assetIndex, 1); // Remove from array
                saveAssets();
                renderAll(); // Re-render everything
                showStatus("Asset deleted successfully!");
            }
        }

        // --- 4. FILTERING LOGIC ---

        function handleFilterClick(e) {
            const card = e.target.closest('.metric-card');
            if (card) {
                const newFilter = card.dataset.filter;
                
                // Clear the 'selected' class from all cards
                document.querySelectorAll('.metric-card').forEach(c => c.classList.remove('selected'));
                
                // Set the new filter and add 'selected' class to the clicked card
                currentFilter = newFilter;
                card.classList.add('selected');

                // Re-render the table with the new filter applied
                renderTable(assets);
            }
        }


        // --- 5. RESPONSIVE MENU TOGGLE ---
        const hamburger = document.getElementById('hamburger');
        const navMenu = document.getElementById('navMenu');

        hamburger.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });

        // Close menu when a link is clicked (on mobile)
        navMenu.addEventListener('click', (e) => {
             if (e.target.tagName === 'A' && window.innerWidth <= 640) {
                 navMenu.classList.remove('active');
             }
        });