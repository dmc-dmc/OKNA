/**
 * Tepelnotechnické posúdenie otvorových konštrukcií
 * Hlavný skript pre funkcionalitu
 */

// Globálne premenné
let windowsData = [];
let normativeValues = [];
let airExchangeValues = [];
let customMaterials = [];
let currentMaterial = 'wooden';

// Konštanty
const STORAGE_KEY_WINDOWS = 'thermal_windows_data';
const STORAGE_KEY_NORMATIVE = 'thermal_normative_values';
const STORAGE_KEY_AIR_EXCHANGE = 'thermal_air_exchange_values';
const STORAGE_KEY_MATERIALS = 'thermal_custom_materials';
const STORAGE_KEY_SETTINGS = 'thermal_settings';

// DOM elementy
const windowsList = document.getElementById('windows-list');
const windowTemplate = document.getElementById('window-template');
const addWindowBtn = document.getElementById('add-window');
const generatePrintBtn = document.getElementById('generate-print');
const exportCsvBtn = document.getElementById('export-csv');
const exportJsonBtn = document.getElementById('export-json');
const resetDataBtn = document.getElementById('reset-data');
const windowMaterialSelect = document.getElementById('window-material');
const customMaterialContainer = document.getElementById('custom-material-container');
const customMaterialName = document.getElementById('custom-material-name');
const addCustomMaterialBtn = document.getElementById('add-custom-material');
const normativeValueInput = document.getElementById('normative-value');
const savedNormativeValues = document.getElementById('saved-normative-values');
const saveNormativeValueBtn = document.getElementById('save-normative-value');
const airExchangeValueInput = document.getElementById('air-exchange-value');
const savedAirExchangeValues = document.getElementById('saved-air-exchange-values');
const saveAirExchangeValueBtn = document.getElementById('save-air-exchange-value');
const buildingVolumeInput = document.getElementById('building-volume');
const projectTitleInput = document.getElementById('project-title');
const projectSubtitleInput = document.getElementById('project-subtitle');
const firstPageNumberInput = document.getElementById('first-page-number');

// Štatistiky
const totalAreaElement = document.getElementById('total-area');
const averageUValueElement = document.getElementById('average-u-value');
const uAssessmentElement = document.getElementById('u-assessment');
const airExchangeResultElement = document.getElementById('air-exchange-result');
const airExchangeAssessmentElement = document.getElementById('air-exchange-assessment');

// Inicializácia
document.addEventListener('DOMContentLoaded', () => {
    // Načítanie uložených dát
    loadData();
    
    // Nastavenie udalostí
    setupEventListeners();
    
    // Aktualizácia UI
    updateWindowsList();
    updateTotalValues();
});

// Nastavenie udalostí
function setupEventListeners() {
    // Pridanie nového okna
    addWindowBtn.addEventListener('click', addNewWindow);
    
    // Celkový výpočet
    const calculateAllBtn = document.getElementById('calculate-all');
    if (calculateAllBtn) {
        calculateAllBtn.addEventListener('click', calculateAllWindows);
    }
    
    // Generovanie tlačovej strany
    generatePrintBtn.addEventListener('click', generatePrintPage);
    
    // Export dát
    exportCsvBtn.addEventListener('click', exportToCSV);
    exportJsonBtn.addEventListener('click', exportToJSON);
    
    // Reset dát
    resetDataBtn.addEventListener('click', resetAllData);
    
    // Výber materiálu okna
    windowMaterialSelect.addEventListener('change', handleMaterialChange);
    
    // Pridanie vlastného materiálu
    addCustomMaterialBtn.addEventListener('click', addCustomMaterial);
    
    // Uloženie normovej hodnoty
    saveNormativeValueBtn.addEventListener('click', saveNormativeValue);
    
    // Výber uloženej normovej hodnoty
    savedNormativeValues.addEventListener('change', (e) => {
        if (e.target.value) {
            normativeValueInput.value = e.target.value;
            updateTotalValues();
        }
    });
    
    // Uloženie hodnoty výmeny vzduchu
    saveAirExchangeValueBtn.addEventListener('click', saveAirExchangeValue);
    
    // Výber uloženej hodnoty výmeny vzduchu
    savedAirExchangeValues.addEventListener('change', (e) => {
        if (e.target.value) {
            airExchangeValueInput.value = e.target.value;
            updateTotalValues();
        }
    });
    
    // Zmena objemu budovy
    buildingVolumeInput.addEventListener('input', updateTotalValues);
    
    // Zmena nastavení projektu
    projectTitleInput.addEventListener('input', saveSettings);
    projectSubtitleInput.addEventListener('input', saveSettings);
    firstPageNumberInput.addEventListener('input', saveSettings);
    
    // Globálne parametre
    const applyGlobalParamsBtn = document.getElementById('apply-global-params');
    if (applyGlobalParamsBtn) {
        applyGlobalParamsBtn.addEventListener('click', applyGlobalParameters);
    }
}

// Načítanie dát z localStorage
function loadData() {
    try {
        // Načítanie dát o oknách
        const savedWindows = localStorage.getItem(STORAGE_KEY_WINDOWS);
        if (savedWindows) {
            windowsData = JSON.parse(savedWindows);
        }
        
        // Načítanie normových hodnôt
        const savedNormative = localStorage.getItem(STORAGE_KEY_NORMATIVE);
        if (savedNormative) {
            normativeValues = JSON.parse(savedNormative);
            updateNormativeValuesDropdown();
        }
        
        // Načítanie hodnôt výmeny vzduchu
        const savedAirExchange = localStorage.getItem(STORAGE_KEY_AIR_EXCHANGE);
        if (savedAirExchange) {
            airExchangeValues = JSON.parse(savedAirExchange);
            updateAirExchangeValuesDropdown();
        }
        
        // Načítanie vlastných materiálov
        const savedMaterials = localStorage.getItem(STORAGE_KEY_MATERIALS);
        if (savedMaterials) {
            customMaterials = JSON.parse(savedMaterials);
            updateMaterialsDropdown();
        }
        
        // Načítanie nastavení projektu
        const savedSettings = localStorage.getItem(STORAGE_KEY_SETTINGS);
        if (savedSettings) {
            const settings = JSON.parse(savedSettings);
            projectTitleInput.value = settings.title || '';
            projectSubtitleInput.value = settings.subtitle || '';
            firstPageNumberInput.value = settings.firstPageNumber || 1;
            buildingVolumeInput.value = settings.buildingVolume || '';
        }
    } catch (error) {
        console.error('Chyba pri načítaní dát:', error);
    }
}

// Uloženie dát do localStorage
function saveData() {
    try {
        localStorage.setItem(STORAGE_KEY_WINDOWS, JSON.stringify(windowsData));
        localStorage.setItem(STORAGE_KEY_NORMATIVE, JSON.stringify(normativeValues));
        localStorage.setItem(STORAGE_KEY_AIR_EXCHANGE, JSON.stringify(airExchangeValues));
        localStorage.setItem(STORAGE_KEY_MATERIALS, JSON.stringify(customMaterials));
        saveSettings();
    } catch (error) {
        console.error('Chyba pri ukladaní dát:', error);
    }
}

// Uloženie nastavení projektu
function saveSettings() {
    try {
        const settings = {
            title: projectTitleInput.value,
            subtitle: projectSubtitleInput.value,
            firstPageNumber: firstPageNumberInput.value,
            buildingVolume: buildingVolumeInput.value
        };
        localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
    } catch (error) {
        console.error('Chyba pri ukladaní nastavení:', error);
    }
}

// Pridanie nového okna
function addNewWindow() {
    // Najprv uložíme aktuálne hodnoty existujúcich okien
    windowsData.forEach((window, index) => {
        const countInput = document.getElementById(`window-count-${index}`);
        const widthInput = document.getElementById(`window-width-${index}`);
        const heightInput = document.getElementById(`window-height-${index}`);
        const ufInput = document.getElementById(`u-f-${index}`);
        const afInput = document.getElementById(`a-f-${index}`);
        const ugInput = document.getElementById(`u-g-${index}`);
        const agInput = document.getElementById(`a-g-${index}`);
        const psiGInput = document.getElementById(`psi-g-${index}`);
        const lgInput = document.getElementById(`l-g-${index}`);
        const airPermeabilityInput = document.getElementById(`air-permeability-${index}`);
        
        if (countInput) {
            window.count = parseInt(countInput.value) || 1;
            window.width = parseFloat(widthInput.value) || 0;
            window.height = parseFloat(heightInput.value) || 0;
            window.uf = parseFloat(ufInput.value) || 0;
            window.af = parseFloat(afInput.value) || 0;
            window.ug = parseFloat(ugInput.value) || 0;
            window.ag = parseFloat(agInput.value) || 0;
            window.psiG = parseFloat(psiGInput.value) || 0;
            window.lg = parseFloat(lgInput.value) || 0;
            window.airPermeability = parseFloat(airPermeabilityInput.value) || 1.4;
        }
    });
    
    const newWindowIndex = windowsData.length;
    
    // Vytvorenie nového okna
    const newWindow = {
        index: newWindowIndex,
        material: currentMaterial,
        count: 1,
        width: 0,
        height: 0,
        uf: 0,
        af: 0,
        ug: 0,
        ag: 0,
        psiG: 0,
        lg: 0,
        airPermeability: 1.4,
        image: null
    };
    
    // Pridanie do poľa
    windowsData.push(newWindow);
    
    // Aktualizácia UI
    updateWindowsList();
    saveData();
}

// Odstránenie okna
function removeWindow(index) {
    // Najprv uložíme aktuálne hodnoty do dát
    for (let i = 0; i < windowsData.length; i++) {
        const countInput = document.getElementById(`window-count-${i}`);
        if (countInput) {
            windowsData[i].count = parseInt(countInput.value) || 1;
            windowsData[i].width = parseFloat(document.getElementById(`window-width-${i}`).value) || 0;
            windowsData[i].height = parseFloat(document.getElementById(`window-height-${i}`).value) || 0;
            windowsData[i].uf = parseFloat(document.getElementById(`u-f-${i}`).value) || 0;
            windowsData[i].af = parseFloat(document.getElementById(`a-f-${i}`).value) || 0;
            windowsData[i].ug = parseFloat(document.getElementById(`u-g-${i}`).value) || 0;
            windowsData[i].ag = parseFloat(document.getElementById(`a-g-${i}`).value) || 0;
            windowsData[i].psiG = parseFloat(document.getElementById(`psi-g-${i}`).value) || 0;
            windowsData[i].lg = parseFloat(document.getElementById(`l-g-${i}`).value) || 0;
            windowsData[i].airPermeability = parseFloat(document.getElementById(`air-permeability-${i}`).value) || 1.4;
        }
    }

    // Odstránenie okna na danom indexe
    windowsData.splice(index, 1);
    
    // Preindexovanie okien
    windowsData.forEach((window, i) => {
        window.index = i;
    });
    
    // Aktualizácia UI
    updateWindowsList();
    updateTotalValues();
    saveData();
}

// Aktualizácia zoznamu okien
function updateWindowsList() {
    // Uloženie existujúcich hodnôt pred vyčistením zoznamu
    const existingWindows = [];
    
    // Prechádzanie všetkými existujúcimi oknami a uloženie aktuálnych hodnôt z UI
    for (let i = 0; i < windowsData.length; i++) {
        const countInput = document.getElementById(`window-count-${i}`);
        const widthInput = document.getElementById(`window-width-${i}`);
        const heightInput = document.getElementById(`window-height-${i}`);
        const ufInput = document.getElementById(`u-f-${i}`);
        const afInput = document.getElementById(`a-f-${i}`);
        const ugInput = document.getElementById(`u-g-${i}`);
        const agInput = document.getElementById(`a-g-${i}`);
        const psiGInput = document.getElementById(`psi-g-${i}`);
        const lgInput = document.getElementById(`l-g-${i}`);
        const airPermeabilityInput = document.getElementById(`air-permeability-${i}`);
        
        // Ak elementy existujú, aktualizujeme hodnoty v dátach
        if (countInput && windowsData[i]) {
            windowsData[i].count = parseInt(countInput.value) || 1;
            windowsData[i].width = parseFloat(widthInput.value) || 0;
            windowsData[i].height = parseFloat(heightInput.value) || 0;
            windowsData[i].uf = parseFloat(ufInput.value) || 0;
            windowsData[i].af = parseFloat(afInput.value) || 0;
            windowsData[i].ug = parseFloat(ugInput.value) || 0;
            windowsData[i].ag = parseFloat(agInput.value) || 0;
            windowsData[i].psiG = parseFloat(psiGInput.value) || 0;
            windowsData[i].lg = parseFloat(lgInput.value) || 0;
            windowsData[i].airPermeability = parseFloat(airPermeabilityInput.value) || 1.4;
            
            existingWindows.push(windowsData[i]);
        }
    }
    
    // Aktualizujeme dáta s uloženými hodnotami
    for (let i = 0; i < Math.min(existingWindows.length, windowsData.length); i++) {
        windowsData[i] = existingWindows[i];
    }
    
    // Vyčistenie zoznamu
    windowsList.innerHTML = '';
    
    // Pridanie okien
    windowsData.forEach((window, index) => {
        // Kopírovanie šablóny
        const windowNode = windowTemplate.content.cloneNode(true);
        
        // Nastavenie indexu
        windowNode.querySelector('.window-item').dataset.index = index;
        windowNode.querySelector('.window-header h3').textContent = `Otvorová konštrukcia #${index + 1}`;
        windowNode.querySelector('.remove-window').dataset.index = index;
        
        // Nahradenie placeholderov v ID
        const elements = windowNode.querySelectorAll('[id*="{index}"]');
        elements.forEach(element => {
            element.id = element.id.replace('{index}', index);
        });
        
        // Nahradenie placeholderov v data-index
        const dataIndexElements = windowNode.querySelectorAll('[data-index="{index}"]');
        dataIndexElements.forEach(element => {
            element.dataset.index = index;
        });
        
        // Pridanie do DOM
        windowsList.appendChild(windowNode);
        
        // Nastavenie hodnôt
        document.getElementById(`window-count-${index}`).value = window.count;
        document.getElementById(`window-width-${index}`).value = window.width || '';
        document.getElementById(`window-height-${index}`).value = window.height || '';
        document.getElementById(`u-f-${index}`).value = window.uf || '';
        document.getElementById(`a-f-${index}`).value = window.af || '';
        document.getElementById(`u-g-${index}`).value = window.ug || '';
        document.getElementById(`a-g-${index}`).value = window.ag || '';
        document.getElementById(`psi-g-${index}`).value = window.psiG || '';
        document.getElementById(`l-g-${index}`).value = window.lg || '';
        document.getElementById(`air-permeability-${index}`).value = window.airPermeability || 1.4;
        
        // Nastavenie hodnoty dĺžky škáry
        const jointLengthInput = document.getElementById(`total-joint-length-input-${index}`);
        if (jointLengthInput && window.jointLength) {
            jointLengthInput.value = window.jointLength;
        }

        // Nastavenie obrázka, ak existuje
        if (window.image) {
            const imageContainer = document.getElementById(`window-image-${index}`);
            imageContainer.innerHTML = '';
            const img = document.createElement('img');
            img.src = window.image;
            img.alt = `Okno ${index + 1}`;
            imageContainer.appendChild(img);
            
            // Pridanie tlačidla na vymazanie obrázka
            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = 'Odstrániť obrázok';
            deleteBtn.className = 'delete-image';
            deleteBtn.dataset.index = index;
            deleteBtn.addEventListener('click', (e) => {
                e.preventDefault();
                deleteWindowImage(index);
            });
            imageContainer.appendChild(deleteBtn);
        }
        
        // Nastavenie udalostí
        setupWindowEvents(index);
    });
    // Po nastavení hodnôt je potrebné aktualizovať stav ovládacích prvkov pre úpravu plochy
    windowsData.forEach((window, index) => {
        const useAreaAdjustmentCheckbox = document.getElementById(`use-area-adjustment-${index}`);
        if (useAreaAdjustmentCheckbox) {
            useAreaAdjustmentCheckbox.checked = window.useAreaAdjustment || false;
            toggleAreaAdjustmentControls(index, window.useAreaAdjustment || false);
        }
        
        const adjustmentTypeRadios = document.getElementsByName(`area-adjustment-type-${index}`);
        if (adjustmentTypeRadios.length > 0) {
            for (let radio of adjustmentTypeRadios) {
                if (radio.value === window.adjustmentType) {
                    radio.checked = true;
                }
            }
        }
        
        const adjustmentValueInput = document.getElementById(`area-adjustment-value-${index}`);
        if (adjustmentValueInput && window.adjustmentValue !== undefined) {
            adjustmentValueInput.value = window.adjustmentValue;
        }
        
        // Kontrola súčtu Af + Ag
        checkAreaSum(index);
    });
}

// Nastavenie udalostí pre okno
function setupWindowEvents(index) {
    // Tlačidlo na odstránenie okna
    const removeBtn = document.querySelector(`.remove-window[data-index="${index}"]`);
    if (removeBtn) {
        // Odstránime existujúce event listenery
        const newRemoveBtn = removeBtn.cloneNode(true);
        removeBtn.parentNode.replaceChild(newRemoveBtn, removeBtn);
        
        // Pridáme nový event listener
        newRemoveBtn.addEventListener('click', () => {
            removeWindow(index);
        });
    }
    
    // Tlačidlo na duplikovanie okna
    const duplicateBtn = document.querySelector(`.duplicate-window[data-index="${index}"]`);
    if (duplicateBtn) {
        // Odstránime existujúce event listenery
        const newDuplicateBtn = duplicateBtn.cloneNode(true);
        duplicateBtn.parentNode.replaceChild(newDuplicateBtn, duplicateBtn);
        
        // Pridáme nový event listener
        newDuplicateBtn.addEventListener('click', () => {
            duplicateWindow(index);
        });
    }
    
    // Tlačidlo na prenesenie globálnych parametrov pre toto okno
    const applyGlobalToWindowBtn = document.querySelector(`.apply-global-to-window[data-index="${index}"]`);
    if (applyGlobalToWindowBtn) {
        // Odstránime existujúce event listenery
        const newApplyBtn = applyGlobalToWindowBtn.cloneNode(true);
        applyGlobalToWindowBtn.parentNode.replaceChild(newApplyBtn, applyGlobalToWindowBtn);
        
        // Pridáme nový event listener
        newApplyBtn.addEventListener('click', () => {
            applyGlobalParametersToWindow(index);
        });
    }
    
    // Tlačidlo na výpočet
    const calculateBtn = document.querySelector(`.calculate-window[data-index="${index}"]`);
    if (calculateBtn) {
        // Odstránime existujúce event listenery
        const newCalculateBtn = calculateBtn.cloneNode(true);
        calculateBtn.parentNode.replaceChild(newCalculateBtn, calculateBtn);
        
        // Pridáme nový event listener
        newCalculateBtn.addEventListener('click', () => {
            updateWindowData(index);
            updateDimensionResults(index);
            updateWindowResult(index);
            alert(`Výpočet bol úspešne vykonaný. Uw = ${windowsData[index].uw.toFixed(3)} W/(m²·K)`);
        });
    }
    
    // Nahranie obrázka
    const imageUpload = document.getElementById(`window-image-upload-${index}`);
    if (imageUpload) {
        // Odstránime existujúce event listenery
        const newImageUpload = imageUpload.cloneNode(true);
        imageUpload.parentNode.replaceChild(newImageUpload, imageUpload);
        
        // Pridáme nový event listener
        newImageUpload.addEventListener('change', (e) => {
            handleImageUpload(e, index);
        });
    }
    
    // Vloženie obrázka zo schránky
    const pasteBtn = document.querySelector(`.paste-image[data-index="${index}"]`);
    if (pasteBtn) {
        // Odstránime existujúce event listenery
        const newPasteBtn = pasteBtn.cloneNode(true);
        pasteBtn.parentNode.replaceChild(newPasteBtn, pasteBtn);
        
        // Pridáme nový event listener
        newPasteBtn.addEventListener('click', () => {
            navigator.clipboard.read().then(items => {
                for (const item of items) {
                    if (item.types.includes('image/png') || item.types.includes('image/jpeg')) {
                        const type = item.types.find(t => t.startsWith('image/'));
                        item.getType(type).then(blob => {
                            const reader = new FileReader();
                            reader.onload = (event) => {
                                windowsData[index].image = event.target.result;
                                updateWindowsList();
                                saveData();
                            };
                            reader.readAsDataURL(blob);
                        });
                        break;
                    }
                }
            }).catch(err => {
                console.error('Chyba pri prístupe ku schránke:', err);
                alert('Nepodarilo sa vložiť obrázok zo schránky. Skúste nahrať obrázok zo súboru.');
            });
        });
    }
    
    // Zmena hodnôt - použijeme oneskorené uloženie, aby sme zabránili strate dát
    const debounceDelay = 300; // ms
    let debounceTimer;
    
    const createDebouncedHandler = (fieldId, updateFn) => {
        const field = document.getElementById(fieldId);
        if (field) {
            // Odstránime existujúce event listenery
            const newField = field.cloneNode(true);
            field.parentNode.replaceChild(newField, field);
            
            // Pridáme nový event listener s debounce funkciou
            newField.addEventListener('input', () => {
                // Zrušíme predchádzajúci časovač
                clearTimeout(debounceTimer);
                
                // Nastavíme nový časovač
                debounceTimer = setTimeout(() => {
                    if (typeof updateFn === 'function') {
                        updateFn(index);
                    }
                    saveData();
                }, debounceDelay);
            });
            
            // Pridáme event handler pre zmenu fokusu (blur)
            newField.addEventListener('blur', () => {
                clearTimeout(debounceTimer);
                if (typeof updateFn === 'function') {
                    updateFn(index);
                }
                saveData();
            });
        }
    };
    
    // Základné vstupné polia
    const inputFields = [
        `window-count-${index}`,
        `window-width-${index}`,
        `window-height-${index}`,
        `u-f-${index}`,
        `a-f-${index}`,
        `u-g-${index}`,
        `a-g-${index}`,
        `psi-g-${index}`,
        `l-g-${index}`,
        `air-permeability-${index}`
    ];
    
    inputFields.forEach(fieldId => {
        createDebouncedHandler(fieldId, updateWindowData);
    });
    
    // Rozmery s aktualizáciou výsledkov
    const dimensionInputs = [
        `window-width-${index}`,
        `window-height-${index}`
    ];
    
    dimensionInputs.forEach(fieldId => {
        createDebouncedHandler(fieldId, (idx) => {
            updateDimensionResults(idx);
            updateWindowData(idx);
        });
    });
    
    // Parametre s aktualizáciou výsledkov
    const parameterInputs = [
        `u-f-${index}`,
        `a-f-${index}`,
        `u-g-${index}`,
        `a-g-${index}`,
        `psi-g-${index}`,
        `l-g-${index}`
    ];
    
    parameterInputs.forEach(fieldId => {
        createDebouncedHandler(fieldId, (idx) => {
            updateWindowResult(idx);
            updateWindowData(idx);
        });
    });
    
    // Pridávame event listener pre input dĺžky škáry
    const jointLengthInput = document.getElementById(`total-joint-length-input-${index}`);
    if (jointLengthInput) {
        // Odstránime existujúce event listenery
        const newJointLengthInput = jointLengthInput.cloneNode(true);
        jointLengthInput.parentNode.replaceChild(newJointLengthInput, jointLengthInput);
        
        // Pridáme nový event listener
        newJointLengthInput.addEventListener('input', () => {
            const value = parseFloat(newJointLengthInput.value) || 0;
            windowsData[index].jointLength = value;
            updateTotalValues();
            saveData();
        });
    }

    // Ovládacie prvky pre úpravu plochy
    const useAreaAdjustmentCheckbox = document.getElementById(`use-area-adjustment-${index}`);
    if (useAreaAdjustmentCheckbox) {
        // Odstránime existujúce event listenery
        const newCheckbox = useAreaAdjustmentCheckbox.cloneNode(true);
        useAreaAdjustmentCheckbox.parentNode.replaceChild(newCheckbox, useAreaAdjustmentCheckbox);
        
        // Aktualizácia stavu z dát
        if (windowsData[index].useAreaAdjustment) {
            newCheckbox.checked = true;
            toggleAreaAdjustmentControls(index, true);
        }
        
        // Pridáme nový event listener
        newCheckbox.addEventListener('change', () => {
            const isChecked = newCheckbox.checked;
            toggleAreaAdjustmentControls(index, isChecked);
            windowsData[index].useAreaAdjustment = isChecked;
            
            // Pri zmene checkbox stavu aktualizujeme výsledky
            updateDimensionResults(index);
            updateWindowResult(index);
        });
    }
    
    // Radio buttony pre typ úpravy plochy
    const areaCutRadio = document.getElementById(`area-cut-${index}`);
    const areaAdditionRadio = document.getElementById(`area-addition-${index}`);
    
    if (areaCutRadio && areaAdditionRadio) {
        // Nastavenie podľa dát
        if (windowsData[index].adjustmentType === 'addition') {
            areaAdditionRadio.checked = true;
        } else {
            areaCutRadio.checked = true;
        }
        
        // Odstránime existujúce event listenery
        const newCutRadio = areaCutRadio.cloneNode(true);
        const newAdditionRadio = areaAdditionRadio.cloneNode(true);
        
        areaCutRadio.parentNode.replaceChild(newCutRadio, areaCutRadio);
        areaAdditionRadio.parentNode.replaceChild(newAdditionRadio, areaAdditionRadio);
        
        // Pridáme nové event listenery
        newCutRadio.addEventListener('change', () => {
            if (newCutRadio.checked) {
                windowsData[index].adjustmentType = 'cut';
                updateDimensionResults(index);
                updateWindowResult(index);
            }
        });
        
        newAdditionRadio.addEventListener('change', () => {
            if (newAdditionRadio.checked) {
                windowsData[index].adjustmentType = 'addition';
                updateDimensionResults(index);
                updateWindowResult(index);
            }
        });
    }
    
    // Input pre hodnotu úpravy plochy
    const areaAdjustmentInput = document.getElementById(`area-adjustment-value-${index}`);
    if (areaAdjustmentInput) {
        // Nastavenie podľa dát
        if (windowsData[index].adjustmentValue) {
            areaAdjustmentInput.value = windowsData[index].adjustmentValue;
        }
        
        // Odstránime existujúce event listenery
        const newAdjustmentInput = areaAdjustmentInput.cloneNode(true);
        areaAdjustmentInput.parentNode.replaceChild(newAdjustmentInput, areaAdjustmentInput);
        
        // Pridáme nový event listener
        newAdjustmentInput.addEventListener('input', () => {
            windowsData[index].adjustmentValue = parseFloat(newAdjustmentInput.value) || 0;
            updateDimensionResults(index);
            updateWindowResult(index);
        });
    }
    
    // Pridanie event listenerov pre Af a Ag pre kontrolu súčtu
    const afInput = document.getElementById(`a-f-${index}`);
    const agInput = document.getElementById(`a-g-${index}`);
    
    if (afInput && agInput) {
        afInput.addEventListener('input', () => {
            checkAreaSum(index);
        });
        
        agInput.addEventListener('input', () => {
            checkAreaSum(index);
        });
    }

    // Aktualizácia výsledkov po načítaní
    updateDimensionResults(index);
    updateWindowResult(index);
}

// Spracovanie nahratia obrázka
function handleImageUpload(event, index) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
        windowsData[index].image = e.target.result;
        updateWindowsList();
        saveData();
    };
    
    reader.readAsDataURL(file);
}

// Odstránenie obrázka okna
function deleteWindowImage(index) {
    windowsData[index].image = null;
    updateWindowsList();
    saveData();
}

// Aktualizácia dát okna
function updateWindowData(index) {
    // Kontrola, či okno existuje v dátach
    if (index >= windowsData.length) {
        console.error(`Okno s indexom ${index} neexistuje v dátach.`);
        return;
    }
    
    const window = windowsData[index];
    
    // Kontrola, či elementy existujú v DOM
    const countInput = document.getElementById(`window-count-${index}`);
    const widthInput = document.getElementById(`window-width-${index}`);
    const heightInput = document.getElementById(`window-height-${index}`);
    const ufInput = document.getElementById(`u-f-${index}`);
    const afInput = document.getElementById(`a-f-${index}`);
    const ugInput = document.getElementById(`u-g-${index}`);
    const agInput = document.getElementById(`a-g-${index}`);
    const psiGInput = document.getElementById(`psi-g-${index}`);
    const lgInput = document.getElementById(`l-g-${index}`);
    const airPermeabilityInput = document.getElementById(`air-permeability-${index}`);
    const jointLengthInput = document.getElementById(`total-joint-length-input-${index}`);
    
    if (!countInput || !widthInput || !heightInput || 
        !ufInput || !afInput || !ugInput || !agInput || 
        !psiGInput || !lgInput || !airPermeabilityInput || !jointLengthInput) {
        console.error(`Niektoré input elementy pre okno ${index} neexistujú v DOM.`);
        return;
    }
    
    // Aktualizácia dát
    window.count = parseInt(countInput.value) || 1;
    window.width = parseFloat(widthInput.value) || 0;
    window.height = parseFloat(heightInput.value) || 0;
    window.uf = parseFloat(ufInput.value) || 0;
    window.af = parseFloat(afInput.value) || 0;
    window.ug = parseFloat(ugInput.value) || 0;
    window.ag = parseFloat(agInput.value) || 0;
    window.psiG = parseFloat(psiGInput.value) || 0;
    window.lg = parseFloat(lgInput.value) || 0;
    window.airPermeability = parseFloat(airPermeabilityInput.value) || 1.4;
    window.jointLength = parseFloat(jointLengthInput.value) || 0;
    
    // Aktualizácia celkových hodnôt a uloženie
    updateDimensionResults(index);
    updateWindowResult(index);
    updateTotalValues();
    saveData();
}

// Aktualizácia výsledkov rozmerov
function updateDimensionResults(index) {
    try {
        console.log("Updating dimension results for index:", index);
        
        const window = windowsData[index];
        
        // 1. Prevod mm na m
        const width = window.width / 1000;
        const height = window.height / 1000;
        
        // 2. Výpočet obvodu a základnej plochy
        const windowPerimeter = 2 * (width + height);
        const calculatedArea = width * height;
        
        console.log("Basic calculations:", { width, height, windowPerimeter, calculatedArea });
        
        // 3. Aktualizácia UI pre základné hodnoty
        const perimeterElement = document.getElementById(`window-perimeter-${index}`);
        if (perimeterElement) {
            perimeterElement.textContent = windowPerimeter.toFixed(3);
        }
        
        // 4. Nastavenie dĺžky škáry
        const jointLengthInput = document.getElementById(`total-joint-length-input-${index}`);
        if (jointLengthInput && (parseFloat(jointLengthInput.value) === 0 || !window.jointLength)) {
            jointLengthInput.value = windowPerimeter.toFixed(3);
            window.jointLength = windowPerimeter;
        }
        
        // 5. Výpočet finálnej plochy (s prípadnou úpravou)
        let finalArea = calculatedArea;
        const useAreaAdjustmentCheckbox = document.getElementById(`use-area-adjustment-${index}`);
        
        if (useAreaAdjustmentCheckbox && useAreaAdjustmentCheckbox.checked) {
            const isAdjustmentCut = document.getElementById(`area-cut-${index}`).checked;
            const adjustmentValue = parseFloat(document.getElementById(`area-adjustment-value-${index}`).value) || 0;
            
            if (isAdjustmentCut) {
                finalArea = Math.max(0, calculatedArea - adjustmentValue);
            } else {
                finalArea = calculatedArea + adjustmentValue;
            }
            
            console.log("Area adjustment:", { isAdjustmentCut, adjustmentValue, finalArea });
        }
        
        // 6. Aktualizácia UI pre plochy
        document.getElementById(`total-area-${index}`).textContent = finalArea.toFixed(3);
        
        const adjustedAreaElement = document.getElementById(`adjusted-area-${index}`);
        if (adjustedAreaElement) {
            adjustedAreaElement.textContent = finalArea.toFixed(3);
        }
        
        // 7. Aktualizácia dát
        window.windowPerimeter = windowPerimeter;
        window.calculatedArea = calculatedArea;
        window.area = finalArea;
        
        // 8. Kontrola súčtu Af + Ag
        checkAreaSum(index);
        
        console.log("Window data updated:", window);
        
        // 9. Uloženie dát
        saveData();
    } catch (error) {
        console.error("Error in updateDimensionResults:", error);
    }
}

// Kontrola súčtu Af + Ag
function checkAreaSum(index) {
    try {
        console.log("Checking area sum for index:", index);
        
        const window = windowsData[index];
        const af = parseFloat(document.getElementById(`a-f-${index}`).value) || 0;
        const ag = parseFloat(document.getElementById(`a-g-${index}`).value) || 0;
        
        const sumAreas = af + ag;
        const totalArea = window.area || 0;
        
        console.log("Areas check:", { af, ag, sumAreas, totalArea });
        
        // Zobrazenie súčtu s čiastkovými hodnotami
        const sumAreasElement = document.getElementById(`sum-areas-detailed-${index}`);
        if (sumAreasElement) {
            sumAreasElement.textContent = `${af.toFixed(3)} + ${ag.toFixed(3)} = ${sumAreas.toFixed(3)}`;
        }
        
        // Kontrola rovnosti
        const areaStatus = document.getElementById(`area-check-status-${index}`);
        if (areaStatus) {
            const tolerance = 0.001; // tolerancia
            
            if (Math.abs(sumAreas - totalArea) <= tolerance) {
                areaStatus.textContent = "✓ OK";
                areaStatus.className = "area-check-status ok";
            } else {
                areaStatus.textContent = "✗ Chyba: hodnoty sa nerovnajú";
                areaStatus.className = "area-check-status error";
            }
        }
    } catch (error) {
        console.error("Error in checkAreaSum:", error);
    }
}

// Zobrazenie/skrytie ovládacích prvkov pre úpravu plochy
function toggleAreaAdjustmentControls(index, show) {
    const controls = document.getElementById(`area-adjustment-controls-${index}`);
    if (controls) {
        controls.style.display = show ? 'block' : 'none';
    }
}

// Aktualizácia výsledkov okna
function updateWindowResult(index) {
    const window = windowsData[index];
    
    // Výpočet Uw podľa vzorca Uw = (Uf * Af + Ug * Ag + ψg * lg) / Aw
    const ufAf = window.uf * window.af;
    const ugAg = window.ug * window.ag;
    const psiGlg = window.psiG * window.lg;
    const totalArea = window.area;
    
    let uw = 0;
    if (totalArea > 0) {
        uw = (ufAf + ugAg + psiGlg) / totalArea;
    }
    
// Aktualizácia UI
    document.getElementById(`u-w-${index}`).textContent = uw.toFixed(3);
    
    // Aktualizácia dát
    window.uw = uw;
    
    saveData();
    updateTotalValues();
}

// Výpočet celkových hodnôt
function updateTotalValues() {
    let totalArea = 0;
    let totalUwArea = 0;
    let totalAirExchange = 0;
    let totalJointsLength = 0;
    
    // Výpočet pre každé okno
    windowsData.forEach(window => {
        const windowTotalArea = window.area * window.count;
        totalArea += windowTotalArea;
        totalUwArea += window.uw * windowTotalArea;
        totalAirExchange += window.airPermeability * window.jointLength * window.count * 1e-4;
        totalJointsLength += window.jointLength * window.count;
    });
    
    // Vážený priemer súčiniteľa Uw
    const averageUw = totalArea > 0 ? totalUwArea / totalArea : 0;
    
    // Normová hodnota na porovnanie
    const normativeUw = parseFloat(normativeValueInput.value) || 0.85;
    
    // Posúdenie U-hodnoty
    const uAssessment = averageUw <= normativeUw ? 'vyhovuje' : 'nevyhovuje';
    const uAssessmentClass = averageUw <= normativeUw ? 'status-vyhovuje' : 'status-nevyhovuje';
    
    // Výpočet výmeny vzduchu
    const buildingVolume = parseFloat(buildingVolumeInput.value) || 0;
    let airExchangeRate = 0;
    
    if (buildingVolume > 0) {
        // Výpočet podľa vzorca n = 25200 * (Σ(iLV * l)) / Vb
        airExchangeRate = 25200 * totalAirExchange / buildingVolume;
    }
    
    // Normová hodnota výmeny vzduchu
    const normativeAirExchange = parseFloat(airExchangeValueInput.value) || 0.5;
    
    // Posúdenie výmeny vzduchu
    const airExchangeAssessment = airExchangeRate >= normativeAirExchange ? 'vyhovuje' : 'nevyhovuje';
    const airExchangeAssessmentClass = airExchangeRate >= normativeAirExchange ? 'status-vyhovuje' : 'status-nevyhovuje';
    
    // Aktualizácia UI
    totalAreaElement.textContent = totalArea.toFixed(3) + ' m²';
    
    // Aktualizácia celkovej dĺžky škár
    const totalJointsLengthElement = document.getElementById('total-joints-length');
    if (totalJointsLengthElement) {
        totalJointsLengthElement.textContent = totalJointsLength.toFixed(3) + ' m';
    }
    
    // Aktualizácia celkovej hodnoty iLV·l
    const totalAirPermeabilityElement = document.getElementById('total-air-permeability');
    if (totalAirPermeabilityElement) {
        const totalILVL = totalAirExchange; // konvertuje z 10^-4 násobkov na základnú hodnotu
        totalAirPermeabilityElement.textContent = totalILVL.toExponential(4) + ' m²/(s·Pa⁰·⁶⁷)';
    }
    
    averageUValueElement.textContent = averageUw.toFixed(3) + ' W/(m²·K)';
    uAssessmentElement.textContent = 'Uw = ' + averageUw.toFixed(3) + ' W/(m²·K) ' + (averageUw <= normativeUw ? '≤' : '>') + ' Uw,N = ' + normativeUw.toFixed(2) + ' W/(m²·K) - ' + uAssessment;
    uAssessmentElement.className = uAssessmentClass;
    
    airExchangeResultElement.textContent = airExchangeRate.toFixed(2) + ' 1/h';
    airExchangeAssessmentElement.textContent = 'n = ' + airExchangeRate.toFixed(2) + ' 1/h ' + (airExchangeRate >= normativeAirExchange ? '≥' : '<') + ' n = ' + normativeAirExchange.toFixed(2) + ' 1/h - ' + airExchangeAssessment;
    airExchangeAssessmentElement.className = airExchangeAssessmentClass;
}

// Zmena materiálu
function handleMaterialChange(e) {
    currentMaterial = e.target.value;
    
    if (currentMaterial === 'custom') {
        customMaterialContainer.style.display = 'flex';
    } else {
        customMaterialContainer.style.display = 'none';
    }
}

// Pridanie vlastného materiálu
function addCustomMaterial() {
    const materialName = customMaterialName.value.trim();
    
    if (!materialName) {
        alert('Zadajte názov materiálu');
        return;
    }
    
    // Kontrola, či materiál už existuje
    if (customMaterials.find(m => m.name === materialName)) {
        alert('Materiál s týmto názvom už existuje');
        return;
    }
    
    // Pridanie materiálu
    customMaterials.push({
        name: materialName,
        value: 'custom_' + customMaterials.length
    });
    
    // Aktualizácia dropdown
    updateMaterialsDropdown();
    
    // Vyčistenie poľa
    customMaterialName.value = '';
    
    // Uloženie dát
    saveData();
    
    // Nastavenie novopridaného materiálu ako aktuálneho
    windowMaterialSelect.value = customMaterials[customMaterials.length - 1].value;
    currentMaterial = windowMaterialSelect.value;
}

// Aktualizácia dropdown materiálov
function updateMaterialsDropdown() {
    // Odstránenie existujúcich vlastných materiálov
    const options = windowMaterialSelect.querySelectorAll('option');
    for (let i = 0; i < options.length; i++) {
        if (options[i].value.startsWith('custom_')) {
            windowMaterialSelect.removeChild(options[i]);
        }
    }
    
    // Pridanie vlastných materiálov
    customMaterials.forEach(material => {
        const option = document.createElement('option');
        option.value = material.value;
        option.textContent = material.name;
        windowMaterialSelect.insertBefore(option, windowMaterialSelect.querySelector('option[value="custom"]'));
    });
}

// Uloženie normovej hodnoty
function saveNormativeValue() {
    const value = parseFloat(normativeValueInput.value);
    
    if (isNaN(value)) {
        alert('Zadajte platnú hodnotu');
        return;
    }
    
    // Kontrola, či hodnota už existuje
    if (normativeValues.includes(value)) {
        alert('Táto hodnota už existuje');
        return;
    }
    
    // Pridanie hodnoty
    normativeValues.push(value);
    
    // Uloženie a aktualizácia dropdown
    saveData();
    updateNormativeValuesDropdown();
}

// Aktualizácia dropdown normových hodnôt
function updateNormativeValuesDropdown() {
    // Vyčistenie existujúcich možností
    savedNormativeValues.innerHTML = '<option value="">Vyberte uloženú hodnotu</option>';
    
    // Pridanie hodnôt
    normativeValues.sort((a, b) => a - b);
    normativeValues.forEach(value => {
        const option = document.createElement('option');
        option.value = value;
        option.textContent = value;
        savedNormativeValues.appendChild(option);
    });
}

// Uloženie hodnoty výmeny vzduchu
function saveAirExchangeValue() {
    const value = parseFloat(airExchangeValueInput.value);
    
    if (isNaN(value)) {
        alert('Zadajte platnú hodnotu');
        return;
    }
    
    // Kontrola, či hodnota už existuje
    if (airExchangeValues.includes(value)) {
        alert('Táto hodnota už existuje');
        return;
    }
    
    // Pridanie hodnoty
    airExchangeValues.push(value);
    
    // Uloženie a aktualizácia dropdown
    saveData();
    updateAirExchangeValuesDropdown();
}

// Aktualizácia dropdown hodnôt výmeny vzduchu
function updateAirExchangeValuesDropdown() {
    // Vyčistenie existujúcich možností
    savedAirExchangeValues.innerHTML = '<option value="">Vyberte uloženú hodnotu</option>';
    
    // Pridanie hodnôt
    airExchangeValues.sort((a, b) => a - b);
    airExchangeValues.forEach(value => {
        const option = document.createElement('option');
        option.value = value;
        option.textContent = value;
        savedAirExchangeValues.appendChild(option);
    });
}

// Reset všetkých dát
function resetAllData() {
    if (confirm('Naozaj chcete vymazať všetky údaje? Uložené normové hodnoty a typy materiálov zostanú zachované.')) {
        // Odstránenie dát o oknách
        windowsData = [];
        localStorage.removeItem(STORAGE_KEY_WINDOWS);
        
        // Reset nastavení
        projectTitleInput.value = '';
        projectSubtitleInput.value = '';
        firstPageNumberInput.value = '1';
        buildingVolumeInput.value = '';
        
        localStorage.removeItem(STORAGE_KEY_SETTINGS);
        
        // Aktualizácia UI
        updateWindowsList();
        updateTotalValues();
        
        alert('Údaje boli úspešne vymazané.');
    }
}

// Duplikovanie okna
function duplicateWindow(index) {
    // Najprv uložíme aktuálne hodnoty existujúcich okien
    for (let i = 0; i < windowsData.length; i++) {
        const countInput = document.getElementById(`window-count-${i}`);
        if (countInput) {
            windowsData[i].count = parseInt(countInput.value) || 1;
            windowsData[i].width = parseFloat(document.getElementById(`window-width-${i}`).value) || 0;
            windowsData[i].height = parseFloat(document.getElementById(`window-height-${i}`).value) || 0;
            windowsData[i].uf = parseFloat(document.getElementById(`u-f-${i}`).value) || 0;
            windowsData[i].af = parseFloat(document.getElementById(`a-f-${i}`).value) || 0;
            windowsData[i].ug = parseFloat(document.getElementById(`u-g-${i}`).value) || 0;
            windowsData[i].ag = parseFloat(document.getElementById(`a-g-${i}`).value) || 0;
            windowsData[i].psiG = parseFloat(document.getElementById(`psi-g-${i}`).value) || 0;
            windowsData[i].lg = parseFloat(document.getElementById(`l-g-${i}`).value) || 0;
            windowsData[i].airPermeability = parseFloat(document.getElementById(`air-permeability-${i}`).value) || 1.4;
        }
    }
    
    // Vytvorenie kópie okna
    const sourceWindow = windowsData[index];
    const newWindowIndex = windowsData.length;
    
    // Vytvorenie nového okna s hodnotami zo zdrojového okna
    const newWindow = {
        index: newWindowIndex,
        material: sourceWindow.material,
        count: sourceWindow.count,
        width: sourceWindow.width,
        height: sourceWindow.height,
        uf: sourceWindow.uf,
        af: sourceWindow.af,
        ug: sourceWindow.ug,
        ag: sourceWindow.ag,
        psiG: sourceWindow.psiG,
        lg: sourceWindow.lg,
        airPermeability: sourceWindow.airPermeability,
        image: sourceWindow.image,
        jointLength: sourceWindow.jointLength,
        area: sourceWindow.area,
        uw: sourceWindow.uw
    };
    
    // Pridanie do poľa
    windowsData.push(newWindow);
    
    // Aktualizácia UI
    updateWindowsList();
    updateTotalValues();
    saveData();
    
    // Informácia pre užívateľa
    alert(`Okno #${index + 1} bolo úspešne duplikované ako nové okno #${newWindowIndex + 1}`);
}

// Aplikovanie globálnych parametrov na jedno okno
function applyGlobalParametersToWindow(index) {
    // Načítanie globálnych parametrov
    const globalUf = parseFloat(document.getElementById('global-u-f').value) || 0;
    const globalUg = parseFloat(document.getElementById('global-u-g').value) || 0;
    const globalPsiG = parseFloat(document.getElementById('global-psi-g').value) || 0;
    
    // Kontrola, či je aspoň jeden parameter vyplnený
    if (globalUf === 0 && globalUg === 0 && globalPsiG === 0) {
        alert('Zadajte aspoň jeden globálny parameter.');
        return;
    }
    
    // Aplikovanie na konkrétne okno
    const ufInput = document.getElementById(`u-f-${index}`);
    const ugInput = document.getElementById(`u-g-${index}`);
    const psiGInput = document.getElementById(`psi-g-${index}`);
    
    if (ufInput && globalUf !== 0) {
        ufInput.value = globalUf.toFixed(3);
        windowsData[index].uf = globalUf;
    }
    
    if (ugInput && globalUg !== 0) {
        ugInput.value = globalUg.toFixed(3);
        windowsData[index].ug = globalUg;
    }
    
    if (psiGInput && globalPsiG !== 0) {
        psiGInput.value = globalPsiG.toFixed(3);
        windowsData[index].psiG = globalPsiG;
    }
    
    // Aktualizácia výsledkov pre okno
    updateWindowResult(index);
    
    // Aktualizácia celkových hodnôt
    updateTotalValues();
    saveData();
    
    // Informácia pre užívateľa
    alert(`Globálne parametre boli úspešne aplikované na okno #${index + 1}.`);
}

// Aplikovanie globálnych parametrov na všetky okná
function applyGlobalParameters() {
    // Načítanie globálnych parametrov
    const globalUf = parseFloat(document.getElementById('global-u-f').value) || 0;
    const globalUg = parseFloat(document.getElementById('global-u-g').value) || 0;
    const globalPsiG = parseFloat(document.getElementById('global-psi-g').value) || 0;
    
    // Kontrola, či je aspoň jeden parameter vyplnený
    if (globalUf === 0 && globalUg === 0 && globalPsiG === 0) {
        alert('Zadajte aspoň jeden globálny parameter.');
        return;
    }
    
    // Aplikovanie na všetky okná
    for (let i = 0; i < windowsData.length; i++) {
        const ufInput = document.getElementById(`u-f-${i}`);
        const ugInput = document.getElementById(`u-g-${i}`);
        const psiGInput = document.getElementById(`psi-g-${i}`);
        
        if (ufInput && globalUf !== 0) {
            ufInput.value = globalUf.toFixed(3);
            windowsData[i].uf = globalUf;
        }
        
        if (ugInput && globalUg !== 0) {
            ugInput.value = globalUg.toFixed(3);
            windowsData[i].ug = globalUg;
        }
        
        if (psiGInput && globalPsiG !== 0) {
            psiGInput.value = globalPsiG.toFixed(3);
            windowsData[i].psiG = globalPsiG;
        }
        
        // Aktualizácia výsledkov pre okno
        updateWindowResult(i);
    }
    
    // Aktualizácia celkových hodnôt
    updateTotalValues();
    saveData();
    
    // Informácia pre užívateľa
    alert('Globálne parametre boli úspešne aplikované na všetky okná.');
}

// Celkový výpočet všetkých okien a parametrov
function calculateAllWindows() {
    if (windowsData.length === 0) {
        alert('Nie sú zadané žiadne okná.');
        return;
    }
    
    // Aktualizácia údajov pre všetky okná
    for (let i = 0; i < windowsData.length; i++) {
        updateWindowData(i);
        updateDimensionResults(i);
        updateWindowResult(i);
    }
    
    // Aktualizácia celkových hodnôt
    updateTotalValues();
    
    // Informácia pre užívateľa
    alert('Všetky okná a celkové hodnoty boli úspešne prepočítané.');
}

// Generovanie tlačovej strany
function generatePrintPage() {
    // Kontrola, či sú zadané okná
    if (windowsData.length === 0) {
        alert('Nie sú zadané žiadne okná.');
        return;
    }
    
    // Volanie funkcie z export.js
    generatePrintView();
}
