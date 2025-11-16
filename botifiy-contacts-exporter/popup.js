// popup.js - منطق الواجهة الرئيسية

// ==================== DOM Elements ====================
const exportBtn = document.getElementById('exportBtn');
const statusDiv = document.getElementById('status');

// New UI Elements
const summaryTotalCard = document.getElementById('summaryTotalCard');
const totalContactsCount = document.getElementById('totalContactsCount');
const savedCountTotal = document.getElementById('savedCountTotal');
const unsavedCountTotal = document.getElementById('unsavedCountTotal');

// Accordion Elements
const filterAccordion = document.getElementById('filterAccordion');
const accordionToggle = document.getElementById('accordionToggle');
const accordionContent = document.getElementById('accordionContent');
const labelFilterRadio = document.getElementById('labelFilterRadio');

// Radio Buttons
const radioButtons = document.querySelectorAll('input[name="exportType"]');

// Labels Modal Elements
const labelsTriggerArea = document.getElementById('labelsTriggerArea');
const openLabelsModalBtn = document.getElementById('openLabelsModal');
const labelsModal = document.getElementById('labelsModal');
const closeLabelsModalBtn = document.getElementById('closeLabelsModal');
const modalLabelsList = document.getElementById('modalLabelsList');
const labelsSearch = document.getElementById('labelsSearch');
const modalSelectAll = document.getElementById('modalSelectAll');
const modalDeselectAll = document.getElementById('modalDeselectAll');
const modalDoneBtn = document.getElementById('modalDoneBtn');
const selectedLabelsSummary = document.getElementById('selectedLabelsSummary');

// Final Summary Elements
const finalSummary = document.getElementById('finalSummary');
const summaryDescription = document.getElementById('summaryDescription');
const exportCountFinal = document.getElementById('exportCountFinal');

// Info Area
const infoArea = document.getElementById('infoArea');

// Countries Modal Elements
const countriesFilterRadio = document.getElementById('countriesFilterRadio');
const countriesTriggerArea = document.getElementById('countriesTriggerArea');
const openCountriesModalBtn = document.getElementById('openCountriesModal');
const countriesModal = document.getElementById('countriesModal');
const closeCountriesModalBtn = document.getElementById('closeCountriesModal');
const modalCountriesList = document.getElementById('modalCountriesList');
const countriesSearch = document.getElementById('countriesSearch');
const modalSelectAllCountries = document.getElementById('modalSelectAllCountries');
const modalDeselectAllCountries = document.getElementById('modalDeselectAllCountries');
const modalCountriesDoneBtn = document.getElementById('modalCountriesDoneBtn');
const selectedCountriesSummary = document.getElementById('selectedCountriesSummary');

// ==================== Data Variables ====================
let cachedContacts = null;
let cachedTabId = null;
let contactStats = { saved: 0, unsaved: 0 };
let availableLabels = [];
let selectedLabelIds = [];
let labelAssociations = [];
let currentExportType = 'all'; // all, saved, unsaved, labels

// Countries Variables
let availableCountries = [];
let selectedCountryCodes = [];
let contactsByCountry = {};

// ==================== Country Codes Database ====================
const COUNTRY_CODES = {
  // الدول العربية
  '966': { name: 'السعودية', flag: '🇸🇦', priority: 1 },
  '20': { name: 'مصر', flag: '🇪🇬', priority: 1 },
  '971': { name: 'الإمارات', flag: '🇦🇪', priority: 1 },
  '965': { name: 'الكويت', flag: '🇰🇼', priority: 1 },
  '962': { name: 'الأردن', flag: '🇯🇴', priority: 1 },
  '968': { name: 'عمان', flag: '🇴🇲', priority: 1 },
  '974': { name: 'قطر', flag: '🇶🇦', priority: 1 },
  '973': { name: 'البحرين', flag: '🇧🇭', priority: 1 },
  '967': { name: 'اليمن', flag: '🇾🇪', priority: 1 },
  '964': { name: 'العراق', flag: '🇮🇶', priority: 1 },
  '963': { name: 'سوريا', flag: '🇸🇾', priority: 1 },
  '961': { name: 'لبنان', flag: '🇱🇧', priority: 1 },
  '970': { name: 'فلسطين', flag: '🇵🇸', priority: 1 },
  '218': { name: 'ليبيا', flag: '🇱🇾', priority: 1 },
  '213': { name: 'الجزائر', flag: '🇩🇿', priority: 1 },
  '216': { name: 'تونس', flag: '🇹🇳', priority: 1 },
  '212': { name: 'المغرب', flag: '🇲🇦', priority: 1 },
  '249': { name: 'السودان', flag: '🇸🇩', priority: 1 },
  '252': { name: 'الصومال', flag: '🇸🇴', priority: 1 },
  '222': { name: 'موريتانيا', flag: '🇲🇷', priority: 1 },
  '253': { name: 'جيبوتي', flag: '🇩🇯', priority: 1 },
  '269': { name: 'جزر القمر', flag: '🇰🇲', priority: 1 },
  '1': { name: 'الولايات المتحدة/كندا', flag: '🇺🇸', priority: 2 },
  '44': { name: 'المملكة المتحدة', flag: '🇬🇧', priority: 2 },
  '33': { name: 'فرنسا', flag: '🇫🇷', priority: 2 },
  '49': { name: 'ألمانيا', flag: '🇩🇪', priority: 2 },
  '39': { name: 'إيطاليا', flag: '🇮🇹', priority: 2 },
  '34': { name: 'إسبانيا', flag: '🇪🇸', priority: 2 },
  '31': { name: 'هولندا', flag: '🇳🇱', priority: 2 },
  '32': { name: 'بلجيكا', flag: '🇧🇪', priority: 2 },
  '41': { name: 'سويسرا', flag: '🇨🇭', priority: 2 },
  '43': { name: 'النمسا', flag: '🇦🇹', priority: 2 },
  '45': { name: 'الدنمارك', flag: '🇩🇰', priority: 2 },
  '46': { name: 'السويد', flag: '🇸🇪', priority: 2 },
  '47': { name: 'النرويج', flag: '🇳🇴', priority: 2 },
  '48': { name: 'بولندا', flag: '🇵🇱', priority: 2 },
  '351': { name: 'البرتغال', flag: '🇵🇹', priority: 2 },
  '353': { name: 'إيرلندا', flag: '🇮🇪', priority: 2 },
  '358': { name: 'فنلندا', flag: '🇫🇮', priority: 2 },
  '30': { name: 'اليونان', flag: '🇬🇷', priority: 2 },
  '420': { name: 'التشيك', flag: '🇨🇿', priority: 2 },
  '36': { name: 'المجر', flag: '🇭🇺', priority: 2 },
  '40': { name: 'رومانيا', flag: '🇷🇴', priority: 2 },
  '380': { name: 'أوكرانيا', flag: '🇺🇦', priority: 2 },
  '355': { name: 'ألبانيا', flag: '🇦🇱', priority: 2 },
  '359': { name: 'بلغاريا', flag: '🇧🇬', priority: 2 },
  '385': { name: 'كرواتيا', flag: '🇭🇷', priority: 2 },
  '357': { name: 'قبرص', flag: '🇨🇾', priority: 2 },
  '372': { name: 'إستونيا', flag: '🇪🇪', priority: 2 },
  '371': { name: 'لاتفيا', flag: '🇱🇻', priority: 2 },
  '370': { name: 'ليتوانيا', flag: '🇱🇹', priority: 2 },
  '352': { name: 'لوكسمبورغ', flag: '🇱🇺', priority: 2 },
  '389': { name: 'مقدونيا الشمالية', flag: '🇲🇰', priority: 2 },
  '373': { name: 'مولدوفا', flag: '🇲🇩', priority: 2 },
  '382': { name: 'الجبل الأسود', flag: '🇲🇪', priority: 2 },
  '381': { name: 'صربيا', flag: '🇷🇸', priority: 2 },
  '421': { name: 'سلوفاكيا', flag: '🇸🇰', priority: 2 },
  '386': { name: 'سلوفينيا', flag: '🇸🇮', priority: 2 },
  '375': { name: 'بيلاروسيا', flag: '🇧🇾', priority: 2 },
  '387': { name: 'البوسنة والهرسك', flag: '🇧🇦', priority: 2 },
  '354': { name: 'آيسلندا', flag: '🇮🇸', priority: 2 },
  '377': { name: 'موناكو', flag: '🇲🇨', priority: 2 },
  '378': { name: 'سان مارينو', flag: '🇸🇲', priority: 2 },
  '356': { name: 'مالطا', flag: '🇲🇹', priority: 2 },
  '423': { name: 'ليختنشتاين', flag: '🇱🇮', priority: 2 },
  '376': { name: 'أندورا', flag: '🇦🇩', priority: 2 },
  '90': { name: 'تركيا', flag: '🇹🇷', priority: 2 },
  '98': { name: 'إيران', flag: '🇮🇷', priority: 2 },
  '92': { name: 'باكستان', flag: '🇵🇰', priority: 2 },
  '91': { name: 'الهند', flag: '🇮🇳', priority: 2 },
  '86': { name: 'الصين', flag: '🇨🇳', priority: 2 },
  '81': { name: 'اليابان', flag: '🇯🇵', priority: 2 },
  '82': { name: 'كوريا الجنوبية', flag: '🇰🇷', priority: 2 },
  '60': { name: 'ماليزيا', flag: '🇲🇾', priority: 2 },
  '62': { name: 'إندونيسيا', flag: '🇮🇩', priority: 2 },
  '66': { name: 'تايلاند', flag: '🇹🇭', priority: 2 },
  '84': { name: 'فيتنام', flag: '🇻🇳', priority: 2 },
  '65': { name: 'سنغافورة', flag: '🇸🇬', priority: 2 },
  '63': { name: 'الفلبين', flag: '🇵🇭', priority: 2 },
  '880': { name: 'بنغلاديش', flag: '🇧🇩', priority: 2 },
  '95': { name: 'ميانمار', flag: '🇲🇲', priority: 2 },
  '977': { name: 'نيبال', flag: '🇳🇵', priority: 2 },
  '94': { name: 'سريلانكا', flag: '🇱🇰', priority: 2 },
  '93': { name: 'أفغانستان', flag: '🇦🇫', priority: 2 },
  '996': { name: 'قيرغيزستان', flag: '🇰🇬', priority: 2 },
  '998': { name: 'أوزبكستان', flag: '🇺🇿', priority: 2 },
  '992': { name: 'طاجيكستان', flag: '🇹🇯', priority: 2 },
  '993': { name: 'تركمانستان', flag: '🇹🇲', priority: 2 },
  '994': { name: 'أذربيجان', flag: '🇦🇿', priority: 2 },
  '995': { name: 'جورجيا', flag: '🇬🇪', priority: 2 },
  '374': { name: 'أرمينيا', flag: '🇦🇲', priority: 2 },
  '855': { name: 'كمبوديا', flag: '🇰🇭', priority: 2 },
  '856': { name: 'لاوس', flag: '🇱🇦', priority: 2 },
  '673': { name: 'بروناي', flag: '🇧🇳', priority: 2 },
  '670': { name: 'تيمور الشرقية', flag: '🇹🇱', priority: 2 },
  '976': { name: 'منغوليا', flag: '🇲🇳', priority: 2 },
  '850': { name: 'كوريا الشمالية', flag: '🇰🇵', priority: 2 },
  '886': { name: 'تايوان', flag: '🇹🇼', priority: 2 },
  '852': { name: 'هونغ كونغ', flag: '🇭🇰', priority: 2 },
  '853': { name: 'ماكاو', flag: '🇲🇴', priority: 2 },
  '7': { name: 'روسيا', flag: '🇷🇺', priority: 2 },
  '55': { name: 'البرازيل', flag: '🇧🇷', priority: 3 },
  '52': { name: 'المكسيك', flag: '🇲🇽', priority: 3 },
  '54': { name: 'الأرجنتين', flag: '🇦🇷', priority: 3 },
  '56': { name: 'تشيلي', flag: '🇨🇱', priority: 3 },
  '57': { name: 'كولومبيا', flag: '🇨🇴', priority: 3 },
  '51': { name: 'بيرو', flag: '🇵🇪', priority: 3 },
  '58': { name: 'فنزويلا', flag: '🇻🇪', priority: 3 },
  '593': { name: 'الإكوادور', flag: '🇪🇨', priority: 3 },
  '591': { name: 'بوليفيا', flag: '🇧🇴', priority: 3 },
  '595': { name: 'باراغواي', flag: '🇵🇾', priority: 3 },
  '598': { name: 'الأوروغواي', flag: '🇺🇾', priority: 3 },
  '506': { name: 'كوستاريكا', flag: '🇨🇷', priority: 3 },
  '507': { name: 'بنما', flag: '🇵🇦', priority: 3 },
  '503': { name: 'السلفادور', flag: '🇸🇻', priority: 3 },
  '502': { name: 'غواتيمالا', flag: '🇬🇹', priority: 3 },
  '504': { name: 'هندوراس', flag: '🇭🇳', priority: 3 },
  '505': { name: 'نيكاراغوا', flag: '🇳🇮', priority: 3 },
  '53': { name: 'كوبا', flag: '🇨🇺', priority: 3 },
  '509': { name: 'هايتي', flag: '🇭🇹', priority: 3 },
  '1809': { name: 'جمهورية الدومينيكان', flag: '🇩🇴', priority: 3 },
  '1876': { name: 'جامايكا', flag: '🇯🇲', priority: 3 },
  '592': { name: 'غيانا', flag: '🇬🇾', priority: 3 },
  '597': { name: 'سورينام', flag: '🇸🇷', priority: 3 },
  '27': { name: 'جنوب أفريقيا', flag: '🇿🇦', priority: 3 },
  '234': { name: 'نيجيريا', flag: '🇳🇬', priority: 3 },
  '254': { name: 'كينيا', flag: '🇰🇪', priority: 3 },
  '233': { name: 'غانا', flag: '🇬🇭', priority: 3 },
  '255': { name: 'تنزانيا', flag: '🇹🇿', priority: 3 },
  '256': { name: 'أوغندا', flag: '🇺🇬', priority: 3 },
  '251': { name: 'إثيوبيا', flag: '🇪🇹', priority: 3 },
  '250': { name: 'رواندا', flag: '🇷🇼', priority: 3 },
  '257': { name: 'بوروندي', flag: '🇧🇮', priority: 3 },
  '260': { name: 'زامبيا', flag: '🇿🇲', priority: 3 },
  '263': { name: 'زيمبابوي', flag: '🇿🇼', priority: 3 },
  '265': { name: 'مالاوي', flag: '🇲🇼', priority: 3 },
  '258': { name: 'موزمبيق', flag: '🇲🇿', priority: 3 },
  '267': { name: 'بوتسوانا', flag: '🇧🇼', priority: 3 },
  '264': { name: 'ناميبيا', flag: '🇳🇦', priority: 3 },
  '268': { name: 'إسواتيني', flag: '🇸🇿', priority: 3 },
  '266': { name: 'ليسوتو', flag: '🇱🇸', priority: 3 },
  '221': { name: 'السنغال', flag: '🇸🇳', priority: 3 },
  '223': { name: 'مالي', flag: '🇲🇱', priority: 3 },
  '225': { name: 'ساحل العاج', flag: '🇨🇮', priority: 3 },
  '226': { name: 'بوركينا فاسو', flag: '🇧🇫', priority: 3 },
  '227': { name: 'النيجر', flag: '🇳🇪', priority: 3 },
  '228': { name: 'توغو', flag: '🇹🇬', priority: 3 },
  '229': { name: 'بنين', flag: '🇧🇯', priority: 3 },
  '220': { name: 'غامبيا', flag: '🇬🇲', priority: 3 },
  '224': { name: 'غينيا', flag: '🇬🇳', priority: 3 },
  '245': { name: 'غينيا بيساو', flag: '🇬🇼', priority: 3 },
  '232': { name: 'سيراليون', flag: '🇸🇱', priority: 3 },
  '231': { name: 'ليبيريا', flag: '🇱🇷', priority: 3 },
  '237': { name: 'الكاميرون', flag: '🇨🇲', priority: 3 },
  '236': { name: 'جمهورية أفريقيا الوسطى', flag: '🇨🇫', priority: 3 },
  '235': { name: 'تشاد', flag: '🇹🇩', priority: 3 },
  '242': { name: 'الكونغو', flag: '🇨🇬', priority: 3 },
  '243': { name: 'جمهورية الكونغو الديمقراطية', flag: '🇨🇩', priority: 3 },
  '241': { name: 'الغابون', flag: '🇬🇦', priority: 3 },
  '240': { name: 'غينيا الاستوائية', flag: '🇬🇶', priority: 3 },
  '244': { name: 'أنغولا', flag: '🇦🇴', priority: 3 },
  '261': { name: 'مدغشقر', flag: '🇲🇬', priority: 3 },
  '230': { name: 'موريشيوس', flag: '🇲🇺', priority: 3 },
  '248': { name: 'سيشل', flag: '🇸🇨', priority: 3 },
  '262': { name: 'ريونيون', flag: '🇷🇪', priority: 3 },
  '291': { name: 'إريتريا', flag: '🇪🇷', priority: 3 },
  '61': { name: 'أستراليا', flag: '🇦🇺', priority: 3 },
  '64': { name: 'نيوزيلندا', flag: '🇳🇿', priority: 3 },
  '679': { name: 'فيجي', flag: '🇫🇯', priority: 3 },
  '675': { name: 'بابوا غينيا الجديدة', flag: '🇵🇬', priority: 3 },
  '687': { name: 'كاليدونيا الجديدة', flag: '🇳🇨', priority: 3 },
  '689': { name: 'بولينيزيا الفرنسية', flag: '🇵🇫', priority: 3 },
  '685': { name: 'ساموا', flag: '🇼🇸', priority: 3 },
  '676': { name: 'تونغا', flag: '🇹🇴', priority: 3 },
  '678': { name: 'فانواتو', flag: '🇻🇺', priority: 3 }
};

// ==================== Initialization ====================
document.addEventListener('DOMContentLoaded', async () => {
  try {
    // 1. التحقق من فتح واتساب ويب
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!tab.url || !tab.url.includes('web.whatsapp.com')) {
      updateStatus('error', '❌ الرجاء فتح واتساب ويب أولاً');
      exportBtn.disabled = true;
      return;
    }

    // 2. تحديث الحالة
    updateStatus('loading', '⏳ جارٍ حساب عدد جهات الاتصال...');
    exportBtn.disabled = true;

    // 3. استخراج جهات الاتصال
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: extractContactsFromWhatsApp
    });

    // 4. حفظ النتائج
    const data = results[0].result;
    cachedContacts = data.contacts;
    availableLabels = data.availableLabels || [];
    labelAssociations = data.labelAssociations || [];
    cachedTabId = tab.id;

    // 5. Debug
    console.log('📦 Data:', {
      contacts: cachedContacts.length,
      labels: availableLabels.length,
      associations: labelAssociations.length
    });

    // 6. التحقق من وجود بيانات
    if (!cachedContacts || cachedContacts.length === 0) {
      updateStatus('error', '⚠️ لم يتم العثور على جهات اتصال');
      exportBtn.disabled = true;
      return;
    }

    // 7. حساب الإحصائيات
    contactStats = calculateContactStats(cachedContacts);

    // 8. عرض البطاقة الإجمالية
    showSummaryCard();

    // 9. عرض Accordion
    showAccordion();

    // 10. إظهار خيار التصنيفات إذا كانت موجودة
    if (availableLabels.length > 0) {
      labelFilterRadio.style.display = 'block';
      initializeLabelsModal();
    }

    // 10.5. تجهيز بيانات الدول
    contactsByCountry = groupContactsByCountry(cachedContacts);
    availableCountries = buildAvailableCountries(contactsByCountry);

    // 10.6. إظهار خيار الدول إذا كانت موجودة
    if (availableCountries.length > 0) {
      countriesFilterRadio.style.display = 'block';
      initializeCountriesModal();
    }

    // 11. تحديث الملخص
    updateFinalSummary();

    // 12. إظهار المعلومات
    infoArea.style.display = 'block';

    // 13. تفعيل زر التصدير
    updateStatus('success', 'جاهز للتصدير');
    exportBtn.disabled = false;

  } catch (error) {
    console.error('خطأ:', error);
    updateStatus('error', '❌ حدث خطأ: ' + error.message);
    exportBtn.disabled = true;
  }
});

// ==================== UI Functions ====================

function showSummaryCard() {
  totalContactsCount.textContent = cachedContacts.length.toLocaleString('ar-EG');
  savedCountTotal.textContent = contactStats.saved.toLocaleString('ar-EG');
  unsavedCountTotal.textContent = contactStats.unsaved.toLocaleString('ar-EG');
  summaryTotalCard.style.display = 'block';
}

function showAccordion() {
  filterAccordion.style.display = 'block';
}

function updateStatus(type, message) {
  statusDiv.textContent = message;
  statusDiv.className = 'status-message';
  if (type) {
    statusDiv.classList.add(type);
  }
}

function calculateContactStats(contacts) {
  const stats = { saved: 0, unsaved: 0 };

  contacts.forEach(contact => {
    if (contact.type === 'جهة محفوظة') {
      stats.saved++;
    } else {
      stats.unsaved++;
    }
  });

  return stats;
}

// ==================== Accordion ====================

accordionToggle.addEventListener('click', () => {
  accordionContent.classList.toggle('active');

  // تحديث السهم
  const title = accordionToggle.querySelector('.accordion-title');
  if (accordionContent.classList.contains('active')) {
    title.textContent = '▲ اختيار نوع التصدير';
  } else {
    title.textContent = '▼ اختيار نوع التصدير';
  }
});

// ==================== Radio Buttons ====================

radioButtons.forEach(radio => {
  radio.addEventListener('change', (e) => {
    currentExportType = e.target.value;

    // تحديث hint في الـ accordion header
    const hint = accordionToggle.querySelector('.accordion-hint');
    switch (currentExportType) {
      case 'all':
        hint.textContent = 'الكل';
        labelsTriggerArea.style.display = 'none';
        countriesTriggerArea.style.display = 'none';
        break;
      case 'saved':
        hint.textContent = 'المحفوظ فقط';
        labelsTriggerArea.style.display = 'none';
        countriesTriggerArea.style.display = 'none';
        break;
      case 'unsaved':
        hint.textContent = 'غير المحفوظ فقط';
        labelsTriggerArea.style.display = 'none';
        countriesTriggerArea.style.display = 'none';
        break;
      case 'labels':
        hint.textContent = 'حسب التصنيفات';
        labelsTriggerArea.style.display = 'block';
        countriesTriggerArea.style.display = 'none';
        break;
      case 'countries':
        hint.textContent = 'حسب الدولة';
        labelsTriggerArea.style.display = 'none';
        countriesTriggerArea.style.display = 'block';
        break;
    }

    updateFinalSummary();
  });
});

// ==================== Labels Modal ====================

function initializeLabelsModal() {
  // ملء قائمة التصنيفات
  renderModalLabels();
}

function renderModalLabels() {
  modalLabelsList.innerHTML = '';

  availableLabels.forEach(label => {
    const count = labelAssociations.filter(a => a.labelId === label.id).length;

    const item = document.createElement('div');
    item.className = 'modal-label-item';
    item.dataset.labelName = label.name.toLowerCase();
    item.innerHTML = `
      <input type="checkbox" id="modal_label_${label.id}" value="${label.id}">
      <label for="modal_label_${label.id}">${label.name}</label>
      <span class="modal-label-count">${count}</span>
    `;

    const checkbox = item.querySelector('input');
    checkbox.addEventListener('change', updateModalSelection);

    modalLabelsList.appendChild(item);
  });
}

// فتح Modal
openLabelsModalBtn.addEventListener('click', () => {
  labelsModal.classList.add('active');
});

// إغلاق Modal
closeLabelsModalBtn.addEventListener('click', () => {
  labelsModal.classList.remove('active');
});

labelsModal.addEventListener('click', (e) => {
  if (e.target === labelsModal) {
    labelsModal.classList.remove('active');
  }
});

// البحث في التصنيفات
labelsSearch.addEventListener('input', (e) => {
  const searchTerm = e.target.value.toLowerCase().trim();

  const items = modalLabelsList.querySelectorAll('.modal-label-item');
  items.forEach(item => {
    const labelName = item.dataset.labelName;
    if (labelName.includes(searchTerm)) {
      item.classList.remove('hidden');
    } else {
      item.classList.add('hidden');
    }
  });
});

// تحديد الكل
modalSelectAll.addEventListener('click', () => {
  const checkboxes = modalLabelsList.querySelectorAll('input[type="checkbox"]:not(.hidden input)');
  const visibleCheckboxes = Array.from(modalLabelsList.querySelectorAll('.modal-label-item:not(.hidden) input[type="checkbox"]'));
  visibleCheckboxes.forEach(cb => cb.checked = true);
  updateModalSelection();
});

// إلغاء الكل
modalDeselectAll.addEventListener('click', () => {
  const checkboxes = modalLabelsList.querySelectorAll('input[type="checkbox"]');
  checkboxes.forEach(cb => cb.checked = false);
  updateModalSelection();
});

// تحديث التحديد
function updateModalSelection() {
  const checkboxes = modalLabelsList.querySelectorAll('input[type="checkbox"]:checked');
  selectedLabelIds = Array.from(checkboxes).map(cb => cb.value);
}

// زر "تم"
modalDoneBtn.addEventListener('click', () => {
  labelsModal.classList.remove('active');
  updateLabelsSummary();
  updateFinalSummary();
});

function updateLabelsSummary() {
  if (selectedLabelIds.length === 0) {
    selectedLabelsSummary.textContent = 'لم يتم اختيار أي تصنيف';
  } else if (selectedLabelIds.length === 1) {
    const label = availableLabels.find(l => l.id === selectedLabelIds[0]);
    selectedLabelsSummary.textContent = `تم اختيار: ${label.name}`;
  } else {
    selectedLabelsSummary.textContent = `تم اختيار ${selectedLabelIds.length} تصنيفات`;
  }
}

// ==================== Countries Modal ====================

function initializeCountriesModal() {
  renderModalCountries();
}

function renderModalCountries() {
  modalCountriesList.innerHTML = '';

  availableCountries.forEach(country => {
    const item = document.createElement('div');
    item.className = 'modal-label-item';
    item.dataset.countryName = country.name.toLowerCase();
    item.innerHTML = `
      <input type="checkbox" id="modal_country_${country.code}" value="${country.code}">
      <label for="modal_country_${country.code}">${country.flag} ${country.name}</label>
      <span class="modal-label-count">${country.count}</span>
    `;

    const checkbox = item.querySelector('input');
    checkbox.addEventListener('change', updateModalCountriesSelection);

    modalCountriesList.appendChild(item);
  });
}

// فتح Modal
openCountriesModalBtn.addEventListener('click', () => {
  countriesModal.classList.add('active');
});

// إغلاق Modal
closeCountriesModalBtn.addEventListener('click', () => {
  countriesModal.classList.remove('active');
});

countriesModal.addEventListener('click', (e) => {
  if (e.target === countriesModal) {
    countriesModal.classList.remove('active');
  }
});

// البحث في الدول
countriesSearch.addEventListener('input', (e) => {
  const searchTerm = e.target.value.toLowerCase().trim();

  const items = modalCountriesList.querySelectorAll('.modal-label-item');
  items.forEach(item => {
    const countryName = item.dataset.countryName;
    if (countryName.includes(searchTerm)) {
      item.classList.remove('hidden');
    } else {
      item.classList.add('hidden');
    }
  });
});

// تحديد الكل
modalSelectAllCountries.addEventListener('click', () => {
  const visibleCheckboxes = Array.from(modalCountriesList.querySelectorAll('.modal-label-item:not(.hidden) input[type="checkbox"]'));
  visibleCheckboxes.forEach(cb => cb.checked = true);
  updateModalCountriesSelection();
});

// إلغاء الكل
modalDeselectAllCountries.addEventListener('click', () => {
  const checkboxes = modalCountriesList.querySelectorAll('input[type="checkbox"]');
  checkboxes.forEach(cb => cb.checked = false);
  updateModalCountriesSelection();
});

// تحديث التحديد
function updateModalCountriesSelection() {
  const checkboxes = modalCountriesList.querySelectorAll('input[type="checkbox"]:checked');
  selectedCountryCodes = Array.from(checkboxes).map(cb => cb.value);
}

// زر "تم"
modalCountriesDoneBtn.addEventListener('click', () => {
  countriesModal.classList.remove('active');
  updateCountriesSummary();
  updateFinalSummary();
});

function updateCountriesSummary() {
  if (selectedCountryCodes.length === 0) {
    selectedCountriesSummary.textContent = 'لم يتم اختيار أي دولة';
  } else if (selectedCountryCodes.length === 1) {
    const country = availableCountries.find(c => c.code === selectedCountryCodes[0]);
    selectedCountriesSummary.textContent = `تم اختيار: ${country.flag} ${country.name}`;
  } else {
    selectedCountriesSummary.textContent = `تم اختيار ${selectedCountryCodes.length} دولة`;
  }
}

// ==================== Final Summary ====================

function updateFinalSummary() {
  if (!cachedContacts || cachedContacts.length === 0) {
    finalSummary.style.display = 'none';
    return;
  }

  let contactsToExport = getContactsToExport();
  const count = contactsToExport.length;

  exportCountFinal.textContent = count.toLocaleString('ar-EG');

  // تحديث النص الوصفي
  let description = '';
  switch (currentExportType) {
    case 'all':
      description = 'سيتم تصدير <strong>' + count.toLocaleString('ar-EG') + '</strong> جهة اتصال (جميع الجهات).';
      break;
    case 'saved':
      description = 'سيتم تصدير <strong>' + count.toLocaleString('ar-EG') + '</strong> جهة اتصال (المحفوظة فقط).';
      break;
    case 'unsaved':
      description = 'سيتم تصدير <strong>' + count.toLocaleString('ar-EG') + '</strong> جهة اتصال (غير المحفوظة فقط).';
      break;
    case 'labels':
      if (selectedLabelIds.length === 0) {
        description = 'الرجاء اختيار تصنيف واحد على الأقل.';
      } else {
        description = 'سيتم تصدير <strong>' + count.toLocaleString('ar-EG') + '</strong> جهة اتصال من التصنيفات المحددة.';
      }
      break;
    case 'countries':
      if (selectedCountryCodes.length === 0) {
        description = 'الرجاء اختيار دولة واحدة على الأقل.';
      } else {
        description = 'سيتم تصدير <strong>' + count.toLocaleString('ar-EG') + '</strong> جهة اتصال من الدول المحددة.';
      }
      break;
  }

  summaryDescription.innerHTML = description;
  finalSummary.style.display = 'flex';
}

function getContactsToExport() {
  let contacts = cachedContacts;

  switch (currentExportType) {
    case 'saved':
      contacts = contacts.filter(c => c.type === 'جهة محفوظة');
      break;
    case 'unsaved':
      contacts = contacts.filter(c => c.type !== 'جهة محفوظة');
      break;
    case 'labels':
      if (selectedLabelIds.length > 0) {
        const labelNames = selectedLabelIds.map(id => {
          const label = availableLabels.find(l => l.id === id);
          return label ? label.name : null;
        }).filter(name => name !== null);

        contacts = contacts.filter(contact => {
          if (!contact.labels || contact.labels.length === 0) return false;
          return contact.labels.some(label => labelNames.includes(label));
        });
      } else {
        contacts = [];
      }
      break;
    case 'countries':
      if (selectedCountryCodes.length > 0) {
        contacts = [];
        selectedCountryCodes.forEach(code => {
          if (contactsByCountry[code]) {
            contacts = contacts.concat(contactsByCountry[code]);
          }
        });
      } else {
        contacts = [];
      }
      break;
  }

  return contacts;
}

// ==================== Export ====================

exportBtn.addEventListener('click', async () => {
  try {
    const contactsToExport = getContactsToExport();

    if (contactsToExport.length === 0) {
      if (currentExportType === 'labels' && selectedLabelIds.length === 0) {
        updateStatus('error', '⚠️ الرجاء اختيار تصنيف واحد على الأقل');
      } else if (currentExportType === 'countries' && selectedCountryCodes.length === 0) {
        updateStatus('error', '⚠️ الرجاء اختيار دولة واحدة على الأقل');
      } else {
        updateStatus('error', '⚠️ لا توجد جهات اتصال مطابقة للفلاتر');
      }
      return;
    }

    exportBtn.disabled = true;
    updateStatus('loading', '⏳ جارٍ تصدير جهات الاتصال...');

    const csvContent = convertToCSV(contactsToExport);
    await downloadCSV(csvContent);

    updateStatus('success', '✅ تم التصدير بنجاح!');

    setTimeout(() => {
      exportBtn.disabled = false;
      updateStatus('success', 'جاهز للتصدير');
    }, 2000);

  } catch (error) {
    console.error('خطأ في التصدير:', error);
    updateStatus('error', '❌ حدث خطأ: ' + error.message);
    exportBtn.disabled = false;
  }
});

// ==================== CSV Functions ====================

function convertToCSV(contacts) {
  let csv = 'الاسم,رقم الهاتف,النوع,التصنيفات\n';

  contacts.forEach(contact => {
    const name = escapeCSV(contact.name || 'غير محدد');
    const phone = escapeCSV(contact.phone);
    const type = escapeCSV(contact.type);
    const labels = escapeCSV(
      contact.labels && contact.labels.length > 0
        ? contact.labels.join('; ')
        : '-'
    );

    csv += `"${name}","${phone}","${type}","${labels}"\n`;
  });

  return csv;
}

function escapeCSV(text) {
  if (!text) return '';
  return text.toString().replace(/"/g, '""');
}

async function downloadCSV(csvContent) {
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], {
    type: 'text/csv;charset=utf-8;'
  });

  const url = URL.createObjectURL(blob);

  const now = new Date();
  const timestamp = now.toISOString().slice(0, 10) + '_' +
                   now.toTimeString().slice(0, 5).replace(':', '-');
  const filename = `botifiy_contacts_${timestamp}.csv`;

  await chrome.downloads.download({
    url: url,
    filename: filename,
    saveAs: true
  });

  setTimeout(() => URL.revokeObjectURL(url), 100);
}

// ==================== Utility Functions ====================

function isValidPhoneNumber(phoneNumber) {
  if (!/^\d+$/.test(phoneNumber)) {
    return false;
  }
  const length = phoneNumber.length;
  return length >= 10 && length <= 13;
}

// ==================== Country Detection Functions ====================

function detectCountryCode(phoneNumber) {
  if (!phoneNumber || typeof phoneNumber !== 'string') return null;

  // تنظيف الرقم
  const cleanNumber = phoneNumber.replace(/[^0-9]/g, '');

  // محاولة المطابقة مع country codes (من الأطول للأقصر)
  // الترتيب: 3 أرقام، ثم 2، ثم 1
  for (let len = 3; len >= 1; len--) {
    const code = cleanNumber.substring(0, len);
    if (COUNTRY_CODES[code]) {
      return code;
    }
  }

  return null;
}

function groupContactsByCountry(contacts) {
  const countryGroups = {};
  const unknownContacts = [];

  contacts.forEach(contact => {
    // تجاهل المجموعات وقوائم البث
    if (contact.type === 'مجموعة' || contact.type === 'قائمة بث') {
      return;
    }

    const countryCode = detectCountryCode(contact.phone);

    if (countryCode && COUNTRY_CODES[countryCode]) {
      if (!countryGroups[countryCode]) {
        countryGroups[countryCode] = [];
      }
      countryGroups[countryCode].push(contact);
    } else {
      unknownContacts.push(contact);
    }
  });

  // إضافة مجموعة "غير معروف" إذا كانت موجودة
  if (unknownContacts.length > 0) {
    countryGroups['unknown'] = unknownContacts;
  }

  return countryGroups;
}

function buildAvailableCountries(contactsByCountry) {
  const countries = [];

  Object.keys(contactsByCountry).forEach(code => {
    const count = contactsByCountry[code].length;

    if (code === 'unknown') {
      countries.push({
        code: 'unknown',
        name: 'غير معروف',
        flag: '❓',
        count: count,
        priority: 3
      });
    } else {
      const countryInfo = COUNTRY_CODES[code];
      countries.push({
        code: code,
        name: countryInfo.name,
        flag: countryInfo.flag,
        count: count,
        priority: countryInfo.priority
      });
    }
  });

  // ترتيب حسب الأولوية ثم حسب العدد
  countries.sort((a, b) => {
    if (a.priority !== b.priority) {
      return a.priority - b.priority;
    }
    return b.count - a.count;
  });

  return countries;
}

// ==================== WhatsApp Data Extraction ====================

function extractContactsFromWhatsApp() {
  return new Promise((resolve, reject) => {
    const contacts = [];
    const seenNumbers = new Set();
    let unsavedCounter = 1;

    const allLabels = [];
    const labelAssociations = [];

    function isValidPhoneNumber(phoneNumber) {
      if (!/^\d+$/.test(phoneNumber)) return false;
      const length = phoneNumber.length;
      return length >= 10 && length <= 13;
    }

    function getLabelsForContact(contactId) {
      const labelNames = [];
      labelAssociations.forEach(assoc => {
        if (assoc.associationId === contactId) {
          const label = allLabels.find(l => l.id === assoc.labelId);
          if (label) {
            labelNames.push(label.name);
          }
        }
      });
      return labelNames;
    }

    function hasAnyLabel(contactId) {
      return labelAssociations.some(assoc => assoc.associationId === contactId);
    }

    function isValidContactId(contactId) {
      if (!contactId || typeof contactId !== 'string') return false;
      return contactId.includes('@c.us') ||
             contactId.includes('@g.us') ||
             contactId.includes('@broadcast') ||
             contactId.includes('@lid');
    }

    const dbRequest = indexedDB.open('model-storage');

    dbRequest.onerror = () => {
      reject(new Error('فشل الوصول إلى قاعدة بيانات واتساب'));
    };

    dbRequest.onsuccess = (event) => {
      const db = event.target.result;

      if (!db.objectStoreNames.contains('contact') ||
          !db.objectStoreNames.contains('chat')) {
        db.close();
        reject(new Error('قاعدة البيانات غير جاهزة'));
        return;
      }

      try {
        const hasLabels = db.objectStoreNames.contains('label') &&
                          db.objectStoreNames.contains('label-association');

        const storeNames = ['contact', 'chat'];
        if (hasLabels) {
          storeNames.push('label', 'label-association');
        }
        const transaction = db.transaction(storeNames, 'readonly');

        let contactsProcessed = false;
        let chatsProcessed = false;
        let labelsProcessed = !hasLabels;
        let labelItemsProcessed = !hasLabels;

        // Extract labels
        if (hasLabels) {
          try {
            const labelStore = transaction.objectStore('label');
            const labelRequest = labelStore.openCursor();

            labelRequest.onsuccess = (e) => {
              const cursor = e.target.result;
              if (cursor) {
                const label = cursor.value;
                if (label.id && label.name) {
                  allLabels.push({
                    id: label.id,
                    name: label.name
                  });
                }
                cursor.continue();
              } else {
                labelsProcessed = true;
                checkCompletion();
              }
            };

            labelRequest.onerror = () => {
              labelsProcessed = true;
              checkCompletion();
            };
          } catch (error) {
            labelsProcessed = true;
            checkCompletion();
          }
        }

        // Extract label associations
        if (hasLabels) {
          try {
            const labelItemsStore = transaction.objectStore('label-association');
            const labelItemsRequest = labelItemsStore.openCursor();

            labelItemsRequest.onsuccess = (e) => {
              const cursor = e.target.result;
              if (cursor) {
                const item = cursor.value;
                if (item.labelId && item.associationId) {
                  labelAssociations.push({
                    labelId: item.labelId,
                    associationId: item.associationId
                  });
                }
                cursor.continue();
              } else {
                labelItemsProcessed = true;
                checkCompletion();
              }
            };

            labelItemsRequest.onerror = () => {
              labelItemsProcessed = true;
              checkCompletion();
            };
          } catch (error) {
            labelItemsProcessed = true;
            checkCompletion();
          }
        }

        // Extract contacts
        const contactStore = transaction.objectStore('contact');
        const contactRequest = contactStore.openCursor();

        contactRequest.onsuccess = (e) => {
          const cursor = e.target.result;

          if (cursor) {
            const contact = cursor.value;

            if (contact.isAddressBookContact === 1 && contact.id) {
              const phoneNumber = contact.id.split('@')[0];

              if (phoneNumber &&
                  isValidPhoneNumber(phoneNumber) &&
                  !seenNumbers.has(phoneNumber)) {

                contacts.push({
                  name: contact.name || contact.pushname || phoneNumber,
                  phone: phoneNumber,
                  type: 'جهة محفوظة',
                  labels: [],
                  contactId: contact.id
                });
                seenNumbers.add(phoneNumber);
              }
            }

            cursor.continue();
          } else {
            contactsProcessed = true;
            checkCompletion();
          }
        };

        contactRequest.onerror = () => {
          contactsProcessed = true;
          checkCompletion();
        };

        // Extract chats
        const chatStore = transaction.objectStore('chat');
        const chatRequest = chatStore.openCursor();

        chatRequest.onsuccess = (e) => {
          const cursor = e.target.result;

          if (cursor) {
            const chat = cursor.value;

            if (chat.id && isValidContactId(chat.id)) {
              const phoneNumber = chat.id.split('@')[0];
              const uniqueKey = phoneNumber || chat.id;

              const hasValidPhone = phoneNumber && isValidPhoneNumber(phoneNumber);
              const isGroupOrBroadcast = chat.id.includes('@g.us') || chat.id.includes('@broadcast');

              if ((hasValidPhone || isGroupOrBroadcast) && !seenNumbers.has(uniqueKey)) {
                let name = chat.name || chat.formattedTitle || chat.pushname || null;

                let contactType;
                if (chat.id.includes('@g.us')) {
                  contactType = 'مجموعة';
                  name = name || 'مجموعة بدون اسم';
                } else if (chat.id.includes('@broadcast')) {
                  contactType = 'قائمة بث';
                  name = name || 'قائمة بث';
                } else {
                  const isUnsaved = !name;
                  if (isUnsaved) {
                    name = `Unnamed ${unsavedCounter}`;
                    unsavedCounter++;
                  }
                  contactType = isUnsaved ? 'غير محفوظ' : 'محادثة';
                }

                contacts.push({
                  name: name,
                  phone: phoneNumber || chat.id.split('@')[0],
                  type: contactType,
                  labels: [],
                  contactId: chat.id
                });
                seenNumbers.add(uniqueKey);
              }
            }

            cursor.continue();
          } else {
            chatsProcessed = true;
            checkCompletion();
          }
        };

        chatRequest.onerror = () => {
          chatsProcessed = true;
          checkCompletion();
        };

        function checkCompletion() {
          if (contactsProcessed && chatsProcessed &&
              labelsProcessed && labelItemsProcessed) {

            // Extract missing contacts from labelAssociations
            let missingAdded = 0;
            const extractedIds = new Set();

            contacts.forEach(contact => {
              if (contact.contactId) {
                extractedIds.add(contact.contactId);
              }
            });

            labelAssociations.forEach(assoc => {
              const contactId = assoc.associationId;

              if (!extractedIds.has(contactId)) {
                if (contactId.includes('@c.us')) {
                  const phoneNumber = contactId.split('@')[0];

                  if (phoneNumber && isValidPhoneNumber(phoneNumber)) {
                    contacts.push({
                      name: phoneNumber,
                      phone: phoneNumber,
                      type: 'محذوف',
                      labels: [],
                      contactId: contactId
                    });
                    extractedIds.add(contactId);
                    missingAdded++;
                  }
                }
              }
            });

            // Map labels to contacts
            contacts.forEach(contact => {
              if (contact.contactId) {
                contact.labels = getLabelsForContact(contact.contactId);
                delete contact.contactId;
              }
            });

            db.close();

            // Sort
            contacts.sort((a, b) => {
              if (a.type === 'جهة محفوظة' && b.type !== 'جهة محفوظة') return -1;
              if (a.type !== 'جهة محفوظة' && b.type === 'جهة محفوظة') return 1;
              return a.name.localeCompare(b.name);
            });

            resolve({
              contacts: contacts,
              availableLabels: allLabels,
              labelAssociations: labelAssociations
            });
          }
        }

        transaction.onerror = () => {
          db.close();
          reject(new Error('خطأ في قراءة البيانات'));
        };

      } catch (error) {
        db.close();
        reject(error);
      }
    };
  });
}
