/**
 * Export a tlač výsledkov tepelnotechnického posúdenia
 */

// Konštanty
const WINDOWS_PER_PAGE = 4; // Maximálny počet okien na jednu stranu

// Generovanie tlačovej stránky
function generatePrintView() {
    // Otvorenie nového okna pre tlačový náhľad
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    
    if (!printWindow) {
        alert('Blokovanie vyskakovacích okien. Povoľte vyskakovacie okná pre túto stránku a skúste to znova.');
        return;
    }
    
    // Získanie dát projektu
    const projectTitle = document.getElementById('project-title').value || 'Tepelnotechnické posúdenie otvorových konštrukcií';
    const projectSubtitle = document.getElementById('project-subtitle').value || '';
    const firstPageNumber = parseInt(document.getElementById('first-page-number').value) || 1;
    const buildingVolume = parseFloat(document.getElementById('building-volume').value) || 0;
    const normativeUw = parseFloat(document.getElementById('normative-value').value) || 0.85;
    const normativeAirExchange = parseFloat(document.getElementById('air-exchange-value').value) || 0.5;
    
    // Rozdelenie okien na stránky
    const pages = splitWindowsToPages(windowsData);
    
    // HTML pre tlač
    let printHTML = generatePrintHTML(pages, {
        projectTitle,
        projectSubtitle,
        firstPageNumber,
        buildingVolume,
        normativeUw,
        normativeAirExchange
    });
    
    // Zápis HTML do nového okna
    printWindow.document.write(printHTML);
    printWindow.document.close();
    
    // Tlač po načítaní
    printWindow.onload = function() {
        // Automatická tlač nie je aktivovaná, aby mal užívateľ možnosť skontrolovať dokumenty
        // printWindow.print();
    };
}

// Rozdelenie okien na stránky
function splitWindowsToPages(windows) {
    const pages = [];
    let currentPage = [];
    
    windows.forEach((window, index) => {
        currentPage.push(window);
        
        // Ak máme maximálny počet okien na stránku alebo je to posledné okno
        if (currentPage.length === WINDOWS_PER_PAGE || index === windows.length - 1) {
            pages.push([...currentPage]);
            currentPage = [];
        }
    });
    
    return pages;
}

// Generovanie HTML pre tlač
function generatePrintHTML(pages, settings) {
    const { 
        projectTitle, 
        projectSubtitle, 
        firstPageNumber,
        buildingVolume,
        normativeUw,
        normativeAirExchange
    } = settings;
    
    // Výpočet celkových hodnôt
    const totalStats = calculateTotalStats();
    
    // Generovanie HTML pre tlačové stránky
    let pagesHTML = '';
    
    // Generovanie stránok s oknami
    pages.forEach((pageWindows, pageIndex) => {
        pagesHTML += generatePageHTML(pageWindows, pageIndex, firstPageNumber, false);
    });
    
    // Generovanie poslednej stránky so súhrnom
    pagesHTML += generateSummaryPageHTML(totalStats, pages.length, firstPageNumber, {
        buildingVolume,
        normativeUw,
        normativeAirExchange
    });
    
    // Kompletné HTML pre tlač
    return `
        <!DOCTYPE html>
        <html lang="sk">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${projectTitle}</title>
            <style>
                /* Základné štýly pre tlač */
                @page {
                    size: A4 portrait;
                    margin: 15mm;
                }
                
                * {
                    box-sizing: border-box;
                    margin: 0;
                    padding: 0;
                    font-family: Arial, sans-serif;
                }
                
                body {
                    background-color: white;
                    font-size: 10pt;
                    line-height: 1.3;
                }
                
                /* Kontajner A4 stránky */
                .a4-page {
                    width: 210mm;
                    height: 297mm;
                    margin: 0 auto 20mm auto;
                    padding: 0;
                    background-color: white;
                    position: relative;
                    box-shadow: 0 0 10px rgba(0,0,0,0.1);
                }
                
                /* Vnútorné odsadenie stránky (margins) */
                .page-content {
                    padding: 15mm;
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                }
                
                /* Hlavička stránky */
                .page-header {
                    margin-bottom: 10mm;
                }
                
                h1 {
                    font-size: 14pt;
                    font-weight: bold;
                    margin-bottom: 4pt;
                    text-align: center;
                }
                
                h2 {
                    font-size: 12pt;
                    font-weight: normal;
                    margin-bottom: 10pt;
                    text-align: center;
                }
                
                /* Tabuľka okien */
                .windows-table {
                    width: 100%;
                    border-collapse: collapse;
                    table-layout: fixed;
                    margin-bottom: 10mm;
                    flex: 1;
                }
                
                .windows-table th,
                .windows-table td {
                    border: 1px solid black;
                    padding: 4pt;
                    vertical-align: middle;
                    font-size: 9pt;
                }
                
                .windows-table th {
                    background-color: #f0f0f0;
                    font-weight: bold;
                    text-align: center;
                }
                
                /* Otočený text v hlavičke */
                .rotated-header {
                    height: 100px;
                    position: relative;
                }
                
                .rotated-text {
                    position: absolute;
                    transform: rotate(-90deg);
                    transform-origin: center center;
                    width: 100px;
                    text-align: center;
                    left: -30px;
                    top: 40px;
                }
                
                /* Šírky stĺpcov */
                .col-number {
                    width: 20px;
                }
                
                .col-image {
                    width: 120px;
                }
                
                .col-dimensions {
                    width: 60px;
                }
                
                .col-parameter {
                    width: 50px;
                }
                
                /* Bunka s obrázkom */
                .window-image-cell {
                    text-align: center;
                    height: 100px;
                    vertical-align: middle;
                }
                
                .window-image-cell img {
                    max-width: 100%;
                    max-height: 100px;
                    object-fit: contain;
                }
                
                /* Päta stránky */
                .page-footer {
                    position: absolute;
                    bottom: 10mm;
                    left: 0;
                    width: 100%;
                    text-align: center;
                    font-size: 10pt;
                }
                
                /* Súhrnná tabuľka na poslednej strane */
                .summary-table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 10mm;
                }
                
                .summary-table th,
                .summary-table td {
                    border: 1px solid black;
                    padding: 4pt;
                    font-size: 10pt;
                }
                
                .summary-table th {
                    background-color: #f0f0f0;
                    font-weight: bold;
                    text-align: center;
                }
                
                /* Posúdenie */
                .assessment-result {
                    font-weight: bold;
                }
                
                .status-vyhovuje {
                    color: green;
                }
                
                .status-nevyhovuje {
                    color: red;
                }
                
                /* Tlačidlá pre tlač */
                .print-controls {
                    text-align: center;
                    margin: 15pt 0;
                    position: fixed;
                    top: 10px;
                    right: 10px;
                    background: white;
                    padding: 10px;
                    border: 1px solid #ccc;
                    border-radius: 4px;
                    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
                }
                
                .print-btn {
                    padding: 8pt 15pt;
                    background-color: #4CAF50;
                    color: white;
                    border: none;
                    border-radius: 4pt;
                    cursor: pointer;
                    margin: 0 5pt;
                }
                
                .close-btn {
                    padding: 8pt 15pt;
                    background-color: #f44336;
                    color: white;
                    border: none;
                    border-radius: 4pt;
                    cursor: pointer;
                    margin: 0 5pt;
                }
                
                @media print {
                    .print-controls {
                        display: none !important;
                    }
                    
                    .a4-page {
                        margin: 0;
                        box-shadow: none;
                        page-break-after: always;
                    }
                    
                    body {
                        margin: 0;
                        padding: 0;
                    }
                }
            </style>
        </head>
        <body>
            <div class="print-controls">
                <button class="print-btn" onclick="window.print();">Tlačiť</button>
                <button class="close-btn" onclick="window.close();">Zavrieť</button>
            </div>
            
            ${pagesHTML}
        </body>
        </html>
    `;
}

// Generovanie HTML pre jednu stránku
function generatePageHTML(pageWindows, pageIndex, firstPageNumber, isLastPage) {
    const pageNumber = firstPageNumber + pageIndex;
    
    // Hlavička tabuľky
    let tableHeaderHTML = `
        <tr>
            <th rowspan="2" class="col-number">P.č.</th>
            <th rowspan="2" class="col-image">Schéma otvorovej konštrukcie</th>
            <th rowspan="2" class="col-dimensions">Celková dĺžka škár l (m)</th>
            <th rowspan="2" class="col-dimensions">Súčiniteľ škárovej prievzdušnosti iLV·10⁻⁴ (m³/(m·s·Pa⁰·⁶⁷))</th>
            <th class="col-parameter">Uf</th>
            <th class="col-parameter">Af</th>
            <th class="col-parameter">Ug</th>
            <th class="col-parameter">Ag</th>
            <th class="col-parameter">ψg</th>
            <th class="col-parameter">lg</th>
            <th class="col-parameter">Aw</th>
            <th rowspan="2" colspan="18">Súčiniteľ prechodu tepla otvorovej konštrukcie (W/(m²·K))</th>
        </tr>
        <tr>
            <th>(W/(m²·K))</th>
            <th>(m²)</th>
            <th>(W/(m²·K))</th>
            <th>(m²)</th>
            <th>(W/(m·K))</th>
            <th>(m)</th>
            <th>(m²)</th>
        </tr>
    `;
    
    // Riadky s oknami
    let windowRowsHTML = '';
    
    pageWindows.forEach((window, index) => {
        let windowImage = '';
        
        // Pridanie obrázka, ak existuje
        if (window.image) {
            windowImage = `<img src="${window.image}" alt="Okno ${window.index + 1}">`;
        }
        
        // Výpočet Uw
        const ufAf = window.uf * window.af;
        const ugAg = window.ug * window.ag;
        const psiGlg = window.psiG * window.lg;
        
        // Riadok okna
        windowRowsHTML += `
            <tr>
                <td class="col-number">${window.index + 1}</td>
                <td class="window-image-cell">${windowImage}</td>
                <td class="col-dimensions">${window.jointLength ? window.jointLength.toFixed(3) : ''}</td>
                <td class="col-dimensions">${window.airPermeability.toFixed(1)}</td>
                <td class="col-parameter">${window.uf.toFixed(3)}</td>
                <td class="col-parameter">${window.af.toFixed(3)}</td>
                <td class="col-parameter">${window.ug.toFixed(3)}</td>
                <td class="col-parameter">${window.ag.toFixed(3)}</td>
                <td class="col-parameter">${window.psiG.toFixed(3)}</td>
                <td class="col-parameter">${window.lg.toFixed(3)}</td>
                <td class="col-parameter">${window.area ? window.area.toFixed(3) : ''}</td>
                <td colspan="18" class="result-value">${window.uw ? window.uw.toFixed(3) : ''}</td>
            </tr>
        `;
    });
    
    // Výpočet medzivýsledkov pre túto stránku
    const pageStats = calculatePageStats(pageWindows);
    
    // Riadok s medzivýsledkom, ak nie je posledná stránka
    let subtotalRowHTML = '';
    if (!isLastPage) {
        subtotalRowHTML = `
            <tr>
                <td colspan="10" style="text-align: right; font-weight: bold;">Medzisúčet:</td>
                <td class="col-parameter">${pageStats.totalArea.toFixed(3)}</td>
                <td colspan="18">${pageStats.averageUw.toFixed(3)}</td>
            </tr>
        `;
    }
    
    // Kompletná HTML tabuľka
    const tableHTML = `
        <table class="windows-table">
            ${tableHeaderHTML}
            ${windowRowsHTML}
            ${subtotalRowHTML}
        </table>
    `;
    
    // Kompletná HTML stránka
    return `
        <div class="a4-page">
            <div class="page-content">
                <div class="page-header">
                    <h1>Tepelnotechnické vlastnosti a posúdenie otvorových konštrukcií</h1>
                    <h2>Tab. 1.5 - Tepelnotechnické vlastnosti a posúdenie otvorových konštrukcií</h2>
                </div>
                
                ${tableHTML}
                
                <div class="page-footer">
                    ${pageNumber}
                </div>
            </div>
        </div>
    `;
}

// Generovanie HTML pre poslednú stránku so súhrnom
function generateSummaryPageHTML(totalStats, pageCount, firstPageNumber, settings) {
    const { buildingVolume, normativeUw, normativeAirExchange } = settings;
    const pageNumber = firstPageNumber + pageCount;
    
    // Posúdenie súčiniteľa prechodu tepla
    const uAssessment = totalStats.averageUw <= normativeUw ? 'vyhovuje' : 'nevyhovuje';
    const uAssessmentClass = totalStats.averageUw <= normativeUw ? 'status-vyhovuje' : 'status-nevyhovuje';
    
    // Posúdenie výmeny vzduchu
    const airExchangeAssessment = totalStats.airExchangeRate >= normativeAirExchange ? 'vyhovuje' : 'nevyhovuje';
    const airExchangeClass = totalStats.airExchangeRate >= normativeAirExchange ? 'status-vyhovuje' : 'status-nevyhovuje';
    
    // HTML pre súhrnnú tabuľku
    const summaryTableHTML = `
        <table class="summary-table">
            <tr>
                <th colspan="2">Súhrnné výsledky posúdenia</th>
            </tr>
            <tr>
                <td>Celková plocha otvorových konštrukcií</td>
                <td><b>Σ I = ${totalStats.totalArea.toFixed(3)} m²</b></td>
            </tr>
            <tr>
                <td>Vážený priemer súčiniteľa prechodu tepla</td>
                <td><b>Uw = ${totalStats.averageUw.toFixed(3)} W/(m²·K)</b></td>
            </tr>
            <tr>
                <td>Normová hodnota súčiniteľa prechodu tepla</td>
                <td><b>Uw,N = ${normativeUw.toFixed(2)} W/(m²·K)</b></td>
            </tr>
            <tr>
                <td>Posúdenie</td>
                <td><b class="${uAssessmentClass}">Uw = ${totalStats.averageUw.toFixed(3)} W/(m²·K) ${totalStats.averageUw <= normativeUw ? '≤' : '>'} Uw,N = ${normativeUw.toFixed(2)} W/(m²·K) - ${uAssessment}</b></td>
            </tr>
        </table>
        
        <table class="summary-table">
            <tr>
                <th colspan="2">Posúdenie výmeny vzduchu v budove</th>
            </tr>
            <tr>
                <td>Drevené a oceľové okná a časť dverí: ΣI = ${totalStats.totalArea.toFixed(3)} m²</td>
                <td></td>
            </tr>
            <tr>
                <td>Obostavaný (vykurovaný) objem budovy</td>
                <td><b>Vb = ${buildingVolume.toFixed(2)} m³</b></td>
            </tr>
            <tr>
                <td>Výpočítaný index výmeny vzduchu pre celú budovu (1/h)</td>
                <td><b>n = ${totalStats.airExchangeRate.toFixed(2)} 1/h</b></td>
            </tr>
            <tr>
                <td>Posúdenie výmeny vzduchu v budove</td>
                <td><b class="${airExchangeClass}">n = ${totalStats.airExchangeRate.toFixed(2)} 1/h ${totalStats.airExchangeRate >= normativeAirExchange ? '≥' : '<'} n = ${normativeAirExchange.toFixed(2)} 1/h - ${airExchangeAssessment}</b></td>
            </tr>
        </table>
    `;
    
    // Kompletná HTML stránka
    return `
        <div class="a4-page">
            <div class="page-content">
                <div class="page-header">
                    <h1>Tepelnotechnické vlastnosti a posúdenie otvorových konštrukcií</h1>
                    <h2>Posúdenie a výsledky</h2>
                </div>
                
                ${summaryTableHTML}
                
                <div class="page-footer">
                    ${pageNumber}
                </div>
            </div>
        </div>
    `;
}

// Výpočet štatistík pre jednu stránku
function calculatePageStats(windows) {
    let totalArea = 0;
    let totalUwArea = 0;
    
    // Výpočet pre každé okno
    windows.forEach(window => {
        const windowTotalArea = window.area * window.count;
        totalArea += windowTotalArea;
        totalUwArea += window.uw * windowTotalArea;
    });
    
    // Vážený priemer súčiniteľa Uw
    const averageUw = totalArea > 0 ? totalUwArea / totalArea : 0;
    
    return {
        totalArea,
        averageUw
    };
}

// Výpočet celkových štatistík
function calculateTotalStats() {
    let totalArea = 0;
    let totalUwArea = 0;
    let totalAirExchange = 0;
    
    // Výpočet pre každé okno
    windowsData.forEach(window => {
        const windowTotalArea = window.area * window.count;
        totalArea += windowTotalArea;
        totalUwArea += window.uw * windowTotalArea;
        totalAirExchange += window.airPermeability * window.jointLength * window.count;
    });
    
    // Vážený priemer súčiniteľa Uw
    const averageUw = totalArea > 0 ? totalUwArea / totalArea : 0;
    
    // Výpočet výmeny vzduchu
    const buildingVolume = parseFloat(document.getElementById('building-volume').value) || 0;
    let airExchangeRate = 0;
    
    if (buildingVolume > 0) {
        // Výpočet podľa vzorca n = 25200 * (Σ(iLV * l)) / Vb
        airExchangeRate = 25200 * totalAirExchange / buildingVolume;
    }
    
    return {
        totalArea,
        averageUw,
        airExchangeRate
    };
}

// Export do CSV
function exportToCSV() {
    // Kontrola, či sú zadané okná
    if (windowsData.length === 0) {
        alert('Nie sú zadané žiadne okná na export!');
        return;
    }
    
    // Hlavička CSV
    let csvContent = "P.č.,Počet,Šírka (mm),Výška (mm),Celková dĺžka škár (m),Celková plocha (m²),Uf (W/(m².K)),Af (m²),Ug (W/(m².K)),Ag (m²),ψg (W/(m.K)),lg (m),Súčiniteľ škárovej prievzdušnosti,Uw (W/(m².K))\n";
    
    // Riadky s dátami
    windowsData.forEach((window, index) => {
        const row = [
            index + 1,
            window.count,
            window.width,
            window.height,
            window.jointLength ? window.jointLength.toFixed(3) : 0,
            window.area ? window.area.toFixed(3) : 0,
            window.uf.toFixed(3),
            window.af.toFixed(3),
            window.ug.toFixed(3),
            window.ag.toFixed(3),
            window.psiG.toFixed(3),
            window.lg.toFixed(3),
            window.airPermeability.toFixed(1),
            window.uw ? window.uw.toFixed(3) : 0
        ];
        
        csvContent += row.join(',') + "\n";
    });
    
    // Pridanie súhrnných údajov
    const totalStats = calculateTotalStats();
    csvContent += "\nSúhrnné údaje\n";
    csvContent += "Celková plocha otvorových konštrukcií (m²)," + totalStats.totalArea.toFixed(3) + "\n";
    csvContent += "Vážený priemer súčiniteľa prechodu tepla (W/(m².K))," + totalStats.averageUw.toFixed(3) + "\n";
    csvContent += "Výpočítaný index výmeny vzduchu pre celú budovu (1/h)," + totalStats.airExchangeRate.toFixed(2) + "\n";
    
    // Stiahnutie súboru
    downloadFile(csvContent, 'tepelnotechnicke_posudenie.csv', 'text/csv');
}

// Export do JSON
function exportToJSON() {
    // Kontrola, či sú zadané okná
    if (windowsData.length === 0) {
        alert('Nie sú zadané žiadne okná na export!');
        return;
    }
    
    // Získanie nastavení projektu
    const settings = {
        title: document.getElementById('project-title').value,
        subtitle: document.getElementById('project-subtitle').value,
        firstPageNumber: document.getElementById('first-page-number').value,
        buildingVolume: document.getElementById('building-volume').value,
        normativeUw: document.getElementById('normative-value').value,
        normativeAirExchange: document.getElementById('air-exchange-value').value
    };
    
    // Vytvorenie objektu JSON
    const jsonData = {
        settings: settings,
        windows: windowsData,
        customMaterials: customMaterials,
        normativeValues: normativeValues,
        airExchangeValues: airExchangeValues
    };
    
    // Konverzia na JSON string
    const jsonContent = JSON.stringify(jsonData, null, 2);
    
    // Stiahnutie súboru
    downloadFile(jsonContent, 'tepelnotechnicke_posudenie.json', 'application/json');
}

// Stiahnutie súboru
function downloadFile(content, fileName, contentType) {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.style.display = 'none';
    
    document.body.appendChild(a);
    a.click();
    
    setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, 100);
}