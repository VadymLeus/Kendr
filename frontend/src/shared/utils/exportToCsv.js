// frontend/src/shared/utils/exportToCsv.js

export const exportToCsv = (data, headers, fileName) => {
    if (!data || !data.length) {
        console.warn('ExportToCsv: Немає даних для експорту');
        return;
    }

    const headerKeys = Object.keys(headers);
    const headerLabels = Object.values(headers);
    const separator = ';';
    const csvRows = [headerLabels.join(separator)];
    for (const row of data) {
        const values = headerKeys.map(key => {
            let value = row[key];
            if (value === null || value === undefined) {
                value = '';
            }

            const stringValue = String(value);
            if (stringValue.includes(separator) || stringValue.includes('"') || stringValue.includes('\n')) {
                return `"${stringValue.replace(/"/g, '""')}"`;
            }
            
            return stringValue;
        });
        csvRows.push(values.join(separator));
    }

    const csvString = csvRows.join('\n');
    const blob = new Blob(["\ufeff" + csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    const finalFileName = fileName.endsWith('.csv') ? fileName : `${fileName}.csv`;
    link.setAttribute('href', url);
    link.setAttribute('download', finalFileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};