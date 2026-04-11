const fs = require('fs');

function parseCSVRow(row) {
    let result = [];
    let current = '';
    let inQuotes = false;
    for (let c of row) {
        if (c === '"') { inQuotes = !inQuotes; }
        else if (c === ',' && !inQuotes) { result.push(current); current = ''; }
        else { current += c; }
    }
    result.push(current);
    return result;
}

const csv = fs.readFileSync('Scores&Grading.csv', 'utf8');
const lines = csv.trim().split('\r\n').join('\n').split('\n').map(l => parseCSVRow(l.trim()));

const commNames = lines[0].slice(1);
const indicators = [];
const data = {};
commNames.forEach(c => data[c] = {});

for (let i = 8; i < lines.length; i++) {
    const row = lines[i];
    if (!row || row.length < 2) continue;
    const ind = row[0];
    indicators.push(ind);
    for (let j = 1; j < row.length; j++) {
        let grade = row[j] ? row[j].trim() : '';
        if (!['A', 'B', 'C', 'D'].includes(grade)) grade = null; // Parse NA, blank, and invalid as null
        data[commNames[j-1]][ind] = grade;
    }
}

const output = `// Auto-generated from Scores&Grading.csv
const PREBUILT_COMMUNITIES = ${JSON.stringify(commNames)};
const PREBUILT_INDICATORS = ${JSON.stringify(indicators)};
const PREBUILT_DATA = ${JSON.stringify(data)};
`;

fs.writeFileSync('gradingData.js', output);
console.log('gradingData.js generated successfully!');
