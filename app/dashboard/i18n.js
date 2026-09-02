export const CATEGORIES = ['Jakker', 'Bukser', 'Skjørt/Kjoler', 'Topper/Skjorter', 'Sko', 'Vesker', 'Tilbehør'];
export const CATEGORIES_EN = ['Jackets', 'Pants', 'Skirts/Dresses', 'Tops/Shirts', 'Shoes', 'Bags', 'Accessories'];
// Shades of the brand blue #0000FF (same hue/saturation, wide lightness spread for contrast)
export const CATEGORY_COLORS = {
  'Jakker': '#C2C2FF', 'Bukser': '#8080FF', 'Skjørt/Kjoler': '#3D3DFF',
  'Topper/Skjorter': '#0000FA', 'Sko': '#0000B8', 'Vesker': '#000075', 'Tilbehør': '#000033'
};

export function catLabel(cat, lang) {
  if (lang !== 'en') return cat;
  const idx = CATEGORIES.indexOf(cat);
  return idx === -1 ? cat : CATEGORIES_EN[idx];
}

export const T = {
  no: {
    tagline: 'Vintage · Lager & Salg', logout: 'Logg ut',
    navStock: 'Lager', navAdd: 'Legg til', navAnalytics: 'Analyse',
    subSingle: 'Enkelt vare', subBulk: 'Bulk-import (Excel)',
    searchPlaceholder: 'Søk etter navn eller merke...', allCategories: 'Alle kategorier',
    allBrands: 'Alle merker', allColors: 'Alle farger',
    thVare: 'Vare', thKat: 'Kategori', thMerke: 'Merke', thStr: 'Str.', thInnkjop: 'Innkjøp',
    thKjopt: 'Kjøpt', thStatus: 'Status', thWarn: 'Alder', thSalg: 'Salg',
    markSold: 'Marker solgt', overdueTag: '30+ dager', filterOverdue: 'Over 30 dager',
    resetFilters: 'Nullstill',
    noItemsYet: 'Ingen varer ennå. Legg til din første under «Legg til».',
    noMatch: 'Ingen varer matcher søket ditt.',
    sellPricePlaceholder: 'Salgspris', confirmSell: 'Bekreft', cancelSell: 'Avbryt',
    addDropHint: 'Klikk for å legge til vare',
    analyzeAI: 'Legg til med AI', analyzing: 'Analyserer...', details: 'Detaljer', aiFilled: 'AI-utfylt',
    fName: 'Navn', fNameEn: 'Navn (engelsk, valgfritt)', fCategory: 'Kategori', fBrand: 'Merke',
    fSize: 'Størrelse', fColor: 'Farge', fCost: 'Innkjøpspris (kr)', fMargin: 'MVA (%)',
    fExpenses: 'Toll/frakt (kr)', fPotentialSale: 'Potensiell salgspris (kr)', fDate: 'Kjøpsdato', saveBtn: 'Lagre i lager',
    bulkTitle: 'Last opp Excel- eller CSV-fil', bulkHint: 'Klikk for å velge fil (.xlsx, .xls, .csv)',
    bulkHelp: 'Første rad bør være kolonneoverskrifter (f.eks. Navn, Kategori, Merke, Størrelse, Farge, Innkjøpspris, MVA, Dato). Du får matche kolonner og rette opp detaljer før noe lagres.',
    statToday: 'I dag', statWeek: 'Denne uken', statMonth: 'Denne måneden', statYear: 'Dette året',
    itemsLabel: n => n + (n === 1 ? ' vare' : ' varer'),
    profitTitle: 'Fortjeneste per kategori', liggeTitle: 'Gjennomsnittlig liggetid (kjøpt → solgt)', allItems: 'Alle varer',
    profitMarginTitle: 'Fortjenestemargin', totalProfitMargin: 'Total fortjenestemargin',
    marginOfSales: pct => pct + '% margin av salg',
    profitFormula: 'Salgspris − innkjøpspris − andre kostnader (toll/frakt)',
    segBought: 'Innkjøpspris', segExpenses: 'Kostnader (toll/frakt)', segProfit: 'Fortjeneste', segSaleTotal: 'Salgspris totalt',
    invTitle: 'Varelager', totalInv: 'Totalt varelager', potProfit: 'Potensiell fortjeneste',
    potProfitFormula: '(Lagerverdi × påslagsfaktor) − lagerverdi',
    markup: 'Påslagsfaktor i år',
    turnTitle: 'Omløpshastighet',
    turnWarn: n => n + (n === 1 ? ' vare har' : ' varer har') + ' ligget over 30 dager',
    viewOverdue: 'Vis i lager',
    stAvailable: 'TILGJENGELIG', stSold: 'SOLGT', days: 'dager', listed: 'ute', unknown: 'Ukjent',
    addTitle: 'Legg til i lager',
    addSubtitle: 'Last opp bilder av plagg og kvittering, eller fyll inn detaljene manuelt under.',
    attach: 'Legg ved', chipPhoto: 'Bilde av plagget', chipReceipt: 'Kvittering',
    chipBulk: 'Regneark (Excel / CSV)', orManual: 'eller fyll inn detaljene manuelt',
    editTitle: 'Rediger vare', cancel: 'Avbryt', save: 'Lagre endringer', del: 'Slett',
    confirmDelete: 'Er du sikker på at du vil slette denne varen?',
    fStatus: 'Status', fSale: 'Salgspris (kr)', optAvailable: 'Tilgjengelig', optSold: 'Solgt',
    notLoggedIn: 'Du er ikke innlogget lenger. Last siden på nytt og logg inn igjen.',
    giveName: 'Gi varen et navn.', saving: 'Lagrer...',
    saveFailed: 'Lagring feilet: ', deleteFailed: 'Sletting feilet: ',
    photoUploadFailed: 'Bildeopplasting feilet: ', savedWithoutPhoto: ' (varen lagres uten bilde)',
    couldNotReadData: 'Kunne ikke lese ut data automatisk. Fyll inn manuelt under.',
    uploadItemPhotoFirst: 'Last opp et bilde av plagget først.',
    notInUse: '— ikke i bruk —', matchColumns: file => `Match kolonner fra «${file}»`,
    buildPreviewBtn: n => `Bygg forhåndsvisning (${n} rader)`, back: 'Tilbake',
    checkAndEdit: (inc, tot) => `Sjekk og rediger før import (${inc} av ${tot} valgt)`,
    possibleDup: n => `${n} mulig${n === 1 ? 't' : 'e'} duplikat${n === 1 ? '' : 'er'} funnet (samme navn, merke, størrelse, pris og dato som noe som allerede finnes) — forhåndsvalgt til å hoppes over. Huk av «Inkluder» for å importere dem likevel.`,
    existsInStock: 'Finnes i lager', dupInFile: 'Duplikat i fil', remove: 'Fjern',
    include: 'Inkluder', importBtn: n => `Legg til ${n} varer i lager`, importing: 'Importerer...',
    importFailed: 'Import feilet: ', noRowsFound: 'Fant ingen rader i regnearket.',
    fileReadError: 'Kunne ikke lese filen. Sjekk at det er en gyldig .xlsx eller .csv-fil.',
    noneSelectedForImport: 'Ingen varer valgt for import.',
    allNeedName: 'Alle valgte rader trenger et navn før import.',
    firstRowHint: 'Første rad bør være kolonneoverskrifter (f.eks. Navn, Kategori, Merke, Størrelse, Farge, Innkjøpspris, MVA, Dato, Toll/frakt). Du får matche kolonner og rette opp detaljer før noe lagres.',
  },
  en: {
    tagline: 'Vintage · Stock & Sales', logout: 'Log out',
    navStock: 'Inventory', navAdd: 'Add', navAnalytics: 'Analytics',
    subSingle: 'Single item', subBulk: 'Bulk import (Excel)',
    searchPlaceholder: 'Search by name or brand...', allCategories: 'All categories',
    allBrands: 'All brands', allColors: 'All colors',
    thVare: 'Item', thKat: 'Category', thMerke: 'Brand', thStr: 'Size', thInnkjop: 'Cost',
    thKjopt: 'Bought', thStatus: 'Status', thWarn: 'Age', thSalg: 'Sale',
    markSold: 'Mark sold', overdueTag: '30+ days', filterOverdue: 'Over 30 days',
    resetFilters: 'Reset',
    noItemsYet: 'No items yet. Add your first one under "Add".',
    noMatch: 'No items match your search.',
    sellPricePlaceholder: 'Sale price', confirmSell: 'Confirm', cancelSell: 'Cancel',
    addDropHint: 'Click to add item',
    analyzeAI: 'Add with AI', analyzing: 'Analyzing...', details: 'Details', aiFilled: 'AI-filled',
    fName: 'Name', fNameEn: 'Name (English, optional)', fCategory: 'Category', fBrand: 'Brand',
    fSize: 'Size', fColor: 'Color', fCost: 'Cost price (kr)', fMargin: 'VAT (%)',
    fExpenses: 'Customs/shipping (kr)', fPotentialSale: 'Potential sale price (kr)', fDate: 'Purchase date', saveBtn: 'Save to inventory',
    bulkTitle: 'Upload Excel or CSV file', bulkHint: 'Click to select file (.xlsx, .xls, .csv)',
    bulkHelp: "First row should be column headers (e.g. Name, Category, Brand, Size, Color, Cost, VAT, Date). You'll match columns and correct details before anything is saved.",
    statToday: 'Today', statWeek: 'This week', statMonth: 'This month', statYear: 'This year',
    itemsLabel: n => n + (n === 1 ? ' item' : ' items'),
    profitTitle: 'Profit per category', liggeTitle: 'Average time to sell (bought → sold)', allItems: 'All items',
    profitMarginTitle: 'Profit margin', totalProfitMargin: 'Total profit margin',
    marginOfSales: pct => pct + '% margin of sales',
    profitFormula: 'Sale price − bought price − other expenses (customs/shipping)',
    segBought: 'Bought price', segExpenses: 'Expenses (customs/shipping)', segProfit: 'Profit', segSaleTotal: 'Sale price total',
    invTitle: 'Inventory', totalInv: 'Total inventory', potProfit: 'Potential profit',
    potProfitFormula: '(Inventory value × markup factor) − inventory value',
    markup: 'Markup factor this year',
    turnTitle: 'Turnover rate',
    turnWarn: n => n + (n === 1 ? ' item has' : ' items have') + ' been in stock over 30 days',
    viewOverdue: 'View in inventory',
    stAvailable: 'AVAILABLE', stSold: 'SOLD', days: 'days', listed: 'listed', unknown: 'Unknown',
    addTitle: 'Add to inventory',
    addSubtitle: 'Upload photos of the item and receipt, or fill in the details manually below.',
    attach: 'Attach', chipPhoto: 'Photo of garment', chipReceipt: 'Receipt',
    chipBulk: 'Spreadsheet (Excel / CSV)', orManual: 'or fill in the details manually',
    editTitle: 'Edit item', cancel: 'Cancel', save: 'Save changes', del: 'Delete',
    confirmDelete: 'Are you sure you want to delete this item?',
    fStatus: 'Status', fSale: 'Sale price (kr)', optAvailable: 'Available', optSold: 'Sold',
    notLoggedIn: 'You are no longer logged in. Reload the page and log in again.',
    giveName: 'Please give the item a name.', saving: 'Saving...',
    saveFailed: 'Save failed: ', deleteFailed: 'Delete failed: ',
    photoUploadFailed: 'Photo upload failed: ', savedWithoutPhoto: ' (item saved without photo)',
    couldNotReadData: 'Could not read data automatically. Fill in manually below.',
    uploadItemPhotoFirst: 'Upload a photo of the garment first.',
    notInUse: '— not used —', matchColumns: file => `Match columns from "${file}"`,
    buildPreviewBtn: n => `Build preview (${n} rows)`, back: 'Back',
    checkAndEdit: (inc, tot) => `Review and edit before import (${inc} of ${tot} selected)`,
    possibleDup: n => `${n} possible duplicate${n === 1 ? '' : 's'} found (same name, brand, size, price and date as an existing item) — pre-selected to be skipped. Check "Include" to import them anyway.`,
    existsInStock: 'Already in stock', dupInFile: 'Duplicate in file', remove: 'Remove',
    include: 'Include', importBtn: n => `Add ${n} items to inventory`, importing: 'Importing...',
    importFailed: 'Import failed: ', noRowsFound: 'No rows found in the spreadsheet.',
    fileReadError: 'Could not read the file. Check that it is a valid .xlsx or .csv file.',
    noneSelectedForImport: 'No items selected for import.',
    allNeedName: 'All selected rows need a name before import.',
    firstRowHint: 'First row should be column headers (e.g. Name, Category, Brand, Size, Color, Cost, VAT, Date, Customs/shipping). You\'ll match columns and correct details before anything is saved.',
  }
};

export function todayISO() { return new Date().toISOString().slice(0, 10); }
export function fmtKr(n) { return 'kr ' + Math.round(n || 0).toLocaleString('nb-NO'); }
export function daysBetween(a, b) { return Math.max(0, Math.round((new Date(b) - new Date(a)) / 86400000)); }

export function resizeImage(file, maxW) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxW / img.width);
        const canvas = document.createElement('canvas');
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.7));
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function emptyDraft() {
  return { name: '', category: CATEGORIES[0], brand: '', size: '', color: '', buyPrice: '', vat: '', expenses: '', potentialSalePrice: '', dateBought: todayISO() };
}

export function normalizeCategory(val) {
  const found = CATEGORIES.find(c => c.toLowerCase() === String(val || '').trim().toLowerCase());
  return found || CATEGORIES[CATEGORIES.length - 1];
}

export function normalizeDate(val) {
  if (!val) return todayISO();
  if (val instanceof Date) return val.toISOString().slice(0, 10);
  const parsed = new Date(val);
  if (!isNaN(parsed)) return parsed.toISOString().slice(0, 10);
  return todayISO();
}

export function fieldLabels(t) {
  return {
    name: t.fName, category: t.fCategory, brand: t.fBrand, size: t.fSize,
    color: t.fColor, buyPrice: t.fCost, vat: t.fMargin, expenses: t.fExpenses,
    potentialSalePrice: t.fPotentialSale, dateBought: t.fDate
  };
}

export const FIELD_SYNONYMS = {
  name: ['navn', 'name', 'vare', 'produkt', 'tittel', 'item'],
  category: ['kategori', 'category', 'type'],
  brand: ['merke', 'brand'],
  size: ['størrelse', 'storrelse', 'size', 'str'],
  color: ['farge', 'color', 'colour'],
  buyPrice: ['innkjøpspris', 'innkjopspris', 'pris', 'price', 'kost', 'kostpris', 'buyprice'],
  vat: ['mva', 'vat', 'avanse-mva', 'avansemva'],
  expenses: ['toll', 'frakt', 'toll/frakt', 'kostnader', 'expenses', 'shipping', 'customs'],
  potentialSalePrice: ['potensiell salgspris', 'salgspris', 'potentialsaleprice', 'saleprice', 'estimert salgspris'],
  dateBought: ['dato', 'kjøpsdato', 'kjopsdato', 'date', 'datebought', 'kjøpt']
};

export function guessMapping(headers) {
  const mapping = {};
  Object.entries(FIELD_SYNONYMS).forEach(([field, syns]) => {
    const match = headers.find(h => syns.includes(String(h).trim().toLowerCase()));
    mapping[field] = match || '';
  });
  return mapping;
}

export function makeKey(d) {
  return [d.name, d.brand, d.size, d.buyPrice, d.dateBought]
    .map(x => String(x ?? '').trim().toLowerCase())
    .join('|');
}

/* ---- analytics date-range helpers ---- */
function atMidnight(d) { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; }
export function parseDateStr(s) { return atMidnight(new Date(s + 'T00:00:00')); }
export function startOfWeek(d) { const x = atMidnight(d); const day = x.getDay(); const diff = day === 0 ? -6 : 1 - day; x.setDate(x.getDate() + diff); return x; }
export function startOfMonth(d) { return new Date(d.getFullYear(), d.getMonth(), 1); }
export function startOfYear(d) { return new Date(d.getFullYear(), 0, 1); }
export function addDays(d, n) { const x = new Date(d); x.setDate(x.getDate() + n); return x; }
export function addMonths(d, n) { const x = new Date(d); x.setMonth(x.getMonth() + n); return x; }
export function addYears(d, n) { const x = new Date(d); x.setFullYear(x.getFullYear() + n); return x; }
export function inRange(dateStr, start, end) { const d = parseDateStr(dateStr); return d >= start && d < end; }

export function periodRanges(now) {
  const today0 = atMidnight(now);
  const wStart = startOfWeek(now);
  const mStart = startOfMonth(now);
  const yStart = startOfYear(now);
  return {
    today: [today0, addDays(today0, 1)],
    yesterday: [addDays(today0, -1), today0],
    week: [wStart, addDays(wStart, 7)],
    lastWeek: [addDays(wStart, -7), wStart],
    month: [mStart, addMonths(mStart, 1)],
    lastMonth: [addMonths(mStart, -1), mStart],
    year: [yStart, addYears(yStart, 1)],
    lastYear: [addYears(yStart, -1), yStart],
  };
}

export function profitOfItem(it) {
  return (it.sold_price || 0) - (it.buy_price || 0) - (it.expenses || 0);
}
