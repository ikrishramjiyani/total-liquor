const XLSX = require('xlsx');
const fs = require('fs');

let results = [];

function addResult(srNo, productName, selectedType, status, message) {

    results.push({
        "Sr No": srNo,
        "Product Name": productName,
        "Selected Type": selectedType,
        "Test(Pass/Fail)": status,
        "Message": message
    });

}

function saveExcel() {

    if (!fs.existsSync("reports")) {
        fs.mkdirSync("reports");
    }

    const worksheet = XLSX.utils.json_to_sheet(results);

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Results");

    XLSX.writeFile(workbook, "reports/product-test-report.xlsx");

}

module.exports = { addResult, saveExcel };