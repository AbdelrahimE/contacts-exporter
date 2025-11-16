// popup.js - منطق الواجهة الرئيسية

// عناصر DOM
const exportBtn = document.getElementById('exportBtn');
const statusDiv = document.getElementById('status');
const countDiv = document.getElementById('count');
const statsArea = document.getElementById('statsArea');
const savedCountSpan = document.getElementById('savedCount');
const unsavedCountSpan = document.getElementById('unsavedCount');
const filterArea = document.getElementById('filterArea');
const contactFilter = document.getElementById('contactFilter');

// 🆕 عناصر DOM للتصنيفات
const labelsFilterArea = document.getElementById('labelsFilterArea');
const labelsList = document.getElementById('labelsList');
const selectAllLabelsBtn = document.getElementById('selectAllLabelsBtn');
const deselectAllLabelsBtn = document.getElementById('deselectAllLabelsBtn');
const selectedLabelsCount = document.getElementById('selectedLabelsCount');

// 🆕 عناصر DOM لملخص التصدير
const exportSummary = document.getElementById('exportSummary');
const exportCount = document.getElementById('exportCount');

// متغير لحفظ جهات الاتصال المستخرجة (لتجنب الاستخراج مرتين)
let cachedContacts = null;
let cachedTabId = null;
let contactStats = { saved: 0, unsaved: 0, chat: 0 };

// 🆕 متغيرات التصنيفات
let availableLabels = [];     // قائمة التصنيفات المتاحة
let selectedLabelIds = [];    // التصنيفات المحددة
let labelAssociations = [];   // 🆕 العلاقات بين التصنيفات والجهات (للأعداد الصحيحة)

// ============================================
// عند تحميل الصفحة - استخراج وعرض العدد
// ============================================
document.addEventListener('DOMContentLoaded', async () => {
  try {
    // 1. الحصول على التبويب النشط
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    // 2. التحقق من أن واتساب ويب مفتوح
    if (!tab.url || !tab.url.includes('web.whatsapp.com')) {
      updateStatus('error', '❌ الرجاء فتح واتساب ويب أولاً');
      exportBtn.disabled = true;
      return;
    }

    // 3. تحديث الحالة
    updateStatus('loading', '⏳ جارٍ حساب عدد جهات الاتصال...');
    exportBtn.disabled = true;

    // 4. استخراج جهات الاتصال
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: extractContactsFromWhatsApp
    });

    // 🆕 5. حفظ النتائج مع التصنيفات في الذاكرة المؤقتة
    const data = results[0].result;
    cachedContacts = data.contacts;
    availableLabels = data.availableLabels || [];
    labelAssociations = data.labelAssociations || [];  // 🆕 حفظ العلاقات لحساب الأعداد الصحيحة
    cachedTabId = tab.id;

    // 🔍 DEBUG: ماذا استلمنا؟
    console.log('📦 ===== Data Received in Popup =====');
    console.log(`  Total contacts: ${cachedContacts.length}`);
    console.log(`  Available labels: ${availableLabels.length}`);
    console.log(`  Label associations: ${labelAssociations.length}`);
    console.log('  Labels:', availableLabels);

    // 🔍 DEBUG: عرض عدد كل تصنيف
    availableLabels.forEach(label => {
      const count = labelAssociations.filter(a => a.labelId === label.id).length;
      console.log(`    - "${label.name}": ${count} associations`);
    });
    console.log('=====================================');

    // 6. التحقق من وجود جهات اتصال
    if (!cachedContacts || cachedContacts.length === 0) {
      updateStatus('error', '⚠️ لم يتم العثور على جهات اتصال');
      countDiv.textContent = '0';
      exportBtn.disabled = true;
      return;
    }

    // 7. حساب إحصائيات جهات الاتصال
    contactStats = calculateContactStats(cachedContacts);

    // 8. عرض العدد الإجمالي
    countDiv.textContent = cachedContacts.length.toLocaleString('ar-EG');
    countDiv.classList.add('animate');

    // 9. عرض الإحصائيات
    savedCountSpan.textContent = contactStats.saved.toLocaleString('ar-EG');
    unsavedCountSpan.textContent = contactStats.unsaved.toLocaleString('ar-EG');
    statsArea.style.display = 'flex';

    // 10. عرض الفلتر
    filterArea.style.display = 'block';

    // 🆕 11. عرض فلتر التصنيفات (إذا كانت موجودة)
    console.log('🎨 ===== Rendering Labels Filter =====');
    console.log(`  availableLabels.length: ${availableLabels.length}`);
    console.log(`  Should show filter: ${availableLabels.length > 0}`);

    if (availableLabels.length > 0) {
      console.log('  ✅ Showing labels filter area...');
      renderLabelsFilter(availableLabels, cachedContacts);
      labelsFilterArea.style.display = 'block';
    } else {
      console.log('  ❌ No labels available - filter area hidden');
    }
    console.log('======================================');

    // 12. تحديث الحالة وتفعيل الزر
    updateStatus('success', 'جاهز للتصدير');
    exportBtn.disabled = false;

    // 🆕 13. تحديث ملخص التصدير
    updateExportSummary();

    // إزالة التأثير الحركي بعد ثانية
    setTimeout(() => {
      countDiv.classList.remove('animate');
    }, 1000);

  } catch (error) {
    console.error('خطأ في حساب العدد:', error);
    updateStatus('error', '❌ حدث خطأ: ' + error.message);
    exportBtn.disabled = true;
  }
});

// ============================================
// عند الضغط على زر التصدير
// ============================================
exportBtn.addEventListener('click', async () => {
  try {
    // 1. التحقق من وجود بيانات محفوظة
    if (!cachedContacts || cachedContacts.length === 0) {
      updateStatus('error', '⚠️ لا توجد جهات اتصال للتصدير');
      return;
    }

    // 2. تطبيق فلتر النوع
    const filterValue = contactFilter.value;
    let contactsToExport = filterContacts(cachedContacts, filterValue);

    // 🆕 3. تطبيق فلتر التصنيفات
    if (selectedLabelIds.length > 0) {
      contactsToExport = filterContactsByLabels(contactsToExport, selectedLabelIds);
    }

    // 4. التحقق من وجود جهات بعد الفلترة
    if (contactsToExport.length === 0) {
      updateStatus('error', '⚠️ لا توجد جهات اتصال مطابقة للفلاتر');
      exportBtn.disabled = false;
      return;
    }

    // 4. تعطيل الزر وتحديث الحالة
    exportBtn.disabled = true;
    updateStatus('loading', '⏳ جارٍ تصدير جهات الاتصال...');

    // 5. تحويل إلى CSV
    const csvContent = convertToCSV(contactsToExport);

    // 4. تحميل الملف
    await downloadCSV(csvContent);

    // 5. إظهار رسالة النجاح
    updateStatus('success', '✅ تم التصدير بنجاح!');

    // 6. إعادة تفعيل الزر بعد 2 ثانية
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

// تحديث رسالة الحالة
function updateStatus(type, message) {
  statusDiv.textContent = message;
  statusDiv.className = 'status-message';

  if (type) {
    statusDiv.classList.add(type);
  }
}

// حساب إحصائيات جهات الاتصال
function calculateContactStats(contacts) {
  const stats = { saved: 0, unsaved: 0, chat: 0 };

  contacts.forEach(contact => {
    if (contact.type === 'جهة محفوظة') {
      stats.saved++;
    } else if (contact.type === 'غير محفوظ') {
      stats.unsaved++;
    } else if (contact.type === 'محادثة') {
      stats.chat++;
    }
  });

  // إضافة المحادثات إلى غير المحفوظة
  stats.unsaved += stats.chat;

  return stats;
}

// تطبيق الفلتر على جهات الاتصال
function filterContacts(contacts, filterType) {
  if (filterType === 'all') {
    return contacts;
  } else if (filterType === 'saved') {
    return contacts.filter(c => c.type === 'جهة محفوظة');
  } else if (filterType === 'unsaved') {
    return contacts.filter(c => c.type === 'غير محفوظ' || c.type === 'محادثة');
  }
  return contacts;
}

// 🆕 عرض قائمة التصنيفات
function renderLabelsFilter(labels, contacts) {
  labelsList.innerHTML = '';

  labels.forEach(label => {
    // 🔧 حساب العدد الحقيقي من labelAssociations (جميع الجهات في WhatsApp، ليس فقط المستخرجة)
    const count = labelAssociations.filter(assoc =>
      assoc.labelId === label.id
    ).length;

    // إنشاء عنصر checkbox
    const item = document.createElement('div');
    item.className = 'label-checkbox-item';
    item.innerHTML = `
      <input type="checkbox" id="label_${label.id}" value="${label.id}">
      <label for="label_${label.id}">${label.name}</label>
      <span class="label-count">${count}</span>
    `;

    // إضافة event listener
    const checkbox = item.querySelector('input');
    checkbox.addEventListener('change', updateSelectedLabels);

    labelsList.appendChild(item);
  });
}

// 🆕 تحديد جميع التصنيفات
selectAllLabelsBtn.addEventListener('click', () => {
  const checkboxes = labelsList.querySelectorAll('input[type="checkbox"]');
  checkboxes.forEach(cb => cb.checked = true);
  updateSelectedLabels();
});

// 🆕 إلغاء تحديد جميع التصنيفات
deselectAllLabelsBtn.addEventListener('click', () => {
  const checkboxes = labelsList.querySelectorAll('input[type="checkbox"]');
  checkboxes.forEach(cb => cb.checked = false);
  updateSelectedLabels();
});

// 🆕 تحديث ملخص التصدير عند تغيير فلتر النوع
contactFilter.addEventListener('change', () => {
  updateExportSummary();
});

// 🆕 تحديث قائمة التصنيفات المحددة
function updateSelectedLabels() {
  const checkboxes = labelsList.querySelectorAll('input[type="checkbox"]:checked');
  selectedLabelIds = Array.from(checkboxes).map(cb => cb.value);
  selectedLabelsCount.textContent = selectedLabelIds.length;

  // 🆕 تحديث ملخص التصدير
  updateExportSummary();
}

// 🆕 حساب وتحديث ملخص التصدير
function updateExportSummary() {
  if (!cachedContacts || cachedContacts.length === 0) {
    exportSummary.style.display = 'none';
    return;
  }

  // تطبيق فلتر النوع
  const filterValue = contactFilter.value;
  let contactsToExport = filterContacts(cachedContacts, filterValue);

  // تطبيق فلتر التصنيفات
  if (selectedLabelIds.length > 0) {
    contactsToExport = filterContactsByLabels(contactsToExport, selectedLabelIds);
  }

  // تحديث العرض
  const count = contactsToExport.length;
  exportCount.textContent = `${count.toLocaleString('ar-EG')} جهة اتصال`;

  // إظهار الملخص
  exportSummary.style.display = 'block';
}

// 🆕 فلترة جهات الاتصال حسب التصنيفات
function filterContactsByLabels(contacts, labelIds) {
  if (labelIds.length === 0) return contacts;

  // تحويل IDs إلى أسماء
  const labelNames = labelIds.map(id => {
    const label = availableLabels.find(l => l.id === id);
    return label ? label.name : null;
  }).filter(name => name !== null);

  // فلترة جهات الاتصال
  return contacts.filter(contact => {
    if (!contact.labels || contact.labels.length === 0) return false;

    // التحقق من وجود أي تصنيف محدد
    return contact.labels.some(label => labelNames.includes(label));
  });
}

// تحويل البيانات إلى CSV
function convertToCSV(contacts) {
  // 🆕 العنوان مع التصنيفات
  let csv = 'الاسم,رقم الهاتف,النوع,التصنيفات\n';

  // إضافة كل جهة اتصال
  contacts.forEach(contact => {
    const name = escapeCSV(contact.name || 'غير محدد');
    const phone = escapeCSV(contact.phone);
    const type = escapeCSV(contact.type);
    // 🆕 التصنيفات مفصولة بفاصلة منقوطة
    const labels = escapeCSV(
      contact.labels && contact.labels.length > 0
        ? contact.labels.join('; ')
        : '-'
    );

    csv += `"${name}","${phone}","${type}","${labels}"\n`;
  });

  return csv;
}

// تجهيز النص لـ CSV (معالجة الفواصل والاقتباسات)
function escapeCSV(text) {
  if (!text) return '';
  // استبدال الاقتباسات المزدوجة بـ اثنين
  return text.toString().replace(/"/g, '""');
}

// تحميل ملف CSV
async function downloadCSV(csvContent) {
  // إنشاء Blob
  const BOM = '\uFEFF'; // UTF-8 BOM للدعم الكامل للعربية في Excel
  const blob = new Blob([BOM + csvContent], {
    type: 'text/csv;charset=utf-8;'
  });

  // إنشاء URL
  const url = URL.createObjectURL(blob);

  // اسم الملف مع التاريخ والوقت
  const now = new Date();
  const timestamp = now.toISOString().slice(0, 10) + '_' +
                   now.toTimeString().slice(0, 5).replace(':', '-');
  const filename = `botifiy_contacts_${timestamp}.csv`;

  // تحميل الملف
  await chrome.downloads.download({
    url: url,
    filename: filename,
    saveAs: true
  });

  // تنظيف الذاكرة
  setTimeout(() => URL.revokeObjectURL(url), 100);
}

// ============================================
// دالة مساعدة للتحقق من صحة رقم الهاتف
// ============================================
function isValidPhoneNumber(phoneNumber) {
  // التحقق من أن الرقم يحتوي على أرقام فقط
  if (!/^\d+$/.test(phoneNumber)) {
    return false;
  }

  // أرقام الهواتف الدولية الصحيحة تتراوح بين 10-13 رقم
  // أرقام 14-15 رقم هي WhatsApp IDs داخلية
  const length = phoneNumber.length;
  return length >= 10 && length <= 13;
}

// ============================================
// دالة الاستخراج - يتم حقنها في صفحة واتساب
// ============================================
function extractContactsFromWhatsApp() {
  return new Promise((resolve, reject) => {
    const contacts = [];
    const seenNumbers = new Set(); // لمنع التكرار
    let unsavedCounter = 1; // عداد للأسماء الوهمية للجهات غير المحفوظة

    // 🆕 متغيرات للتصنيفات
    const allLabels = [];          // جميع التصنيفات
    const labelAssociations = [];  // العلاقات بين التصنيفات والمحادثات

    // دالة التحقق من صحة رقم الهاتف (نسخة داخلية)
    function isValidPhoneNumber(phoneNumber) {
      if (!/^\d+$/.test(phoneNumber)) return false;
      const length = phoneNumber.length;
      return length >= 10 && length <= 13;  // تم التعديل من 15 إلى 13
    }

    // 🆕 دالة مساعدة: الحصول على تصنيفات جهة اتصال
    function getLabelsForContact(contactId) {
      const labelNames = [];

      // البحث عن جميع التصنيفات المرتبطة بهذه الجهة
      labelAssociations.forEach(assoc => {
        if (assoc.associationId === contactId) {
          // البحث عن اسم التصنيف
          const label = allLabels.find(l => l.id === assoc.labelId);
          if (label) {
            labelNames.push(label.name);
          }
        }
      });

      return labelNames;
    }

    // 🆕 دالة مساعدة: التحقق من وجود تصنيف لهذه الجهة
    function hasAnyLabel(contactId) {
      return labelAssociations.some(assoc => assoc.associationId === contactId);
    }

    // 🆕 دالة محسنة للتحقق من صحة الهوية (أكثر شمولاً)
    function isValidContactId(contactId) {
      // نقبل أي ID صالح من WhatsApp
      if (!contactId || typeof contactId !== 'string') return false;

      // نقبل:
      // - @c.us (محادثات فردية)
      // - @g.us (مجموعات)
      // - @broadcast (broadcast lists)
      // - @lid (أرقام status/channels)
      return contactId.includes('@c.us') ||
             contactId.includes('@g.us') ||
             contactId.includes('@broadcast') ||
             contactId.includes('@lid');
    }

    // فتح قاعدة بيانات واتساب IndexedDB
    const dbRequest = indexedDB.open('model-storage');

    dbRequest.onerror = () => {
      reject(new Error('فشل الوصول إلى قاعدة بيانات واتساب'));
    };

    dbRequest.onsuccess = (event) => {
      const db = event.target.result;

      // 🔍 DEBUG: طباعة جميع أسماء الجداول المتاحة
      console.log('🗄️ ===== WhatsApp IndexedDB Object Stores =====');
      console.log(`📊 Total stores: ${db.objectStoreNames.length}`);
      for (let i = 0; i < db.objectStoreNames.length; i++) {
        const storeName = db.objectStoreNames[i];
        console.log(`  ${i + 1}. "${storeName}"`);
      }
      console.log('==============================================');

      // التحقق من وجود الجداول المطلوبة
      if (!db.objectStoreNames.contains('contact') ||
          !db.objectStoreNames.contains('chat')) {
        db.close();
        reject(new Error('قاعدة البيانات غير جاهزة. حاول تحديث الصفحة'));
        return;
      }

      try {
        // 🆕 التحقق من وجود جداول التصنيفات (WhatsApp Business)
        const hasLabels = db.objectStoreNames.contains('label') &&
                          db.objectStoreNames.contains('label-association');

        // 🔍 DEBUG: حالة التصنيفات
        console.log('🏷️ ===== Labels Detection =====');
        console.log(`  Has 'label' store: ${db.objectStoreNames.contains('label')}`);
        console.log(`  Has 'label-association' store: ${db.objectStoreNames.contains('label-association')}`);
        console.log(`  Final hasLabels: ${hasLabels}`);
        console.log('===============================');

        // إنشاء معاملة قراءة
        const storeNames = ['contact', 'chat'];
        if (hasLabels) {
          storeNames.push('label', 'label-association');
        }
        const transaction = db.transaction(storeNames, 'readonly');

        // متغيرات للتتبع
        let contactsProcessed = false;
        let chatsProcessed = false;
        let labelsProcessed = !hasLabels;      // 🆕 إذا لم تكن موجودة، اعتبرها معالجة
        let labelItemsProcessed = !hasLabels;  // 🆕

        // ========================================
        // 🆕 الخطوة 1: استخراج تعريفات التصنيفات
        // ========================================
        if (hasLabels) {
          try {
            const labelStore = transaction.objectStore('label');
            const labelRequest = labelStore.openCursor();

            labelRequest.onsuccess = (e) => {
            const cursor = e.target.result;
            if (cursor) {
              const label = cursor.value;

              // 🔍 DEBUG: طباعة بنية أول تصنيف فقط
              if (allLabels.length === 0) {
                console.log('🏷️ ===== First Label Structure =====');
                console.log('Label keys:', Object.keys(label));
                console.log('Label sample:', label);
                console.log('====================================');
              }

              if (label.id && label.name) {
                allLabels.push({
                  id: label.id,
                  name: label.name
                });
              }
              cursor.continue();
            } else {
              // 🔍 DEBUG: عدد التصنيفات المستخرجة
              console.log(`✅ Labels extracted: ${allLabels.length}`);
              console.log('Labels:', allLabels);

              labelsProcessed = true;
              checkCompletion();
            }
          };

          labelRequest.onerror = () => {
            console.error('❌ Error reading labels');
            labelsProcessed = true;
            checkCompletion();
          };
          } catch (error) {
            console.error('❌ Exception accessing label store:', error);
            labelsProcessed = true;
            checkCompletion();
          }
        }

        // ========================================
        // 🆕 الخطوة 2: استخراج علاقات التصنيفات
        // ========================================
        if (hasLabels) {
          try {
            const labelItemsStore = transaction.objectStore('label-association');
            const labelItemsRequest = labelItemsStore.openCursor();

          labelItemsRequest.onsuccess = (e) => {
            const cursor = e.target.result;
            if (cursor) {
              const item = cursor.value;

              // 🔍 DEBUG: طباعة بنية أول label item فقط
              if (labelAssociations.length === 0) {
                console.log('🔗 ===== First Label Item Structure =====');
                console.log('Item keys:', Object.keys(item));
                console.log('Item sample:', item);
                console.log('=========================================');
              }

              if (item.labelId && item.associationId) {
                labelAssociations.push({
                  labelId: item.labelId,
                  associationId: item.associationId
                });
              }
              cursor.continue();
            } else {
              // 🔍 DEBUG: عدد العلاقات المستخرجة
              console.log(`✅ Label associations extracted: ${labelAssociations.length}`);

              labelItemsProcessed = true;
              checkCompletion();
            }
          };

          labelItemsRequest.onerror = () => {
            console.error('❌ Error reading label items');
            labelItemsProcessed = true;
            checkCompletion();
          };
          } catch (error) {
            console.error('❌ Exception accessing label-association store:', error);
            labelItemsProcessed = true;
            checkCompletion();
          }
        }

        // ========================================
        // الخطوة 3: استخراج جهات الاتصال المحفوظة
        // ========================================
        const contactStore = transaction.objectStore('contact');
        const contactRequest = contactStore.openCursor();

        contactRequest.onsuccess = (e) => {
          const cursor = e.target.result;

          if (cursor) {
            const contact = cursor.value;

            // فقط جهات الاتصال المحفوظة
            if (contact.isAddressBookContact === 1 && contact.id) {
              const phoneNumber = contact.id.split('@')[0];

              // ✅ التحقق من صحة رقم الهاتف (استبعاد WhatsApp IDs الداخلية)
              if (phoneNumber &&
                  isValidPhoneNumber(phoneNumber) &&
                  !seenNumbers.has(phoneNumber)) {

                contacts.push({
                  name: contact.name || contact.pushname || phoneNumber,
                  phone: phoneNumber,
                  type: 'جهة محفوظة',
                  labels: [],  // سيتم تعبئتها لاحقاً بعد اكتمال labelAssociations
                  contactId: contact.id  // 🆕 حفظ ID لاستخدامه لاحقاً
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

        // ========================================
        // الخطوة 2: استخراج المحادثات (جهات غير محفوظة، مجموعات، broadcast lists)
        // ========================================
        const chatStore = transaction.objectStore('chat');
        const chatRequest = chatStore.openCursor();

        chatRequest.onsuccess = (e) => {
          const cursor = e.target.result;

          if (cursor) {
            const chat = cursor.value;

            // 🔧 نقبل جميع أنواع المحادثات (فردية، مجموعات، broadcast)
            if (chat.id && isValidContactId(chat.id)) {
              const phoneNumber = chat.id.split('@')[0];
              const uniqueKey = phoneNumber || chat.id;

              // ✅ نستخرج الجهة إذا:
              // 1. رقم هاتف صالح (للمحادثات الفردية)
              // 2. مجموعة أو broadcast (لأنها قد تحتوي على تصنيفات)
              const hasValidPhone = phoneNumber && isValidPhoneNumber(phoneNumber);
              const isGroupOrBroadcast = chat.id.includes('@g.us') || chat.id.includes('@broadcast');

              if ((hasValidPhone || isGroupOrBroadcast) && !seenNumbers.has(uniqueKey)) {
                // محاولة الحصول على الاسم
                let name = chat.name || chat.formattedTitle || chat.pushname || null;

                // تحديد النوع
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
                  labels: [],  // سيتم تعبئتها لاحقاً بعد اكتمال labelAssociations
                  contactId: chat.id  // 🆕 حفظ ID لاستخدامه لاحقاً
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

        // ========================================
        // 🆕 التحقق من اكتمال جميع العمليات
        // ========================================
        function checkCompletion() {
          // 🔍 DEBUG: حالة الإكمال
          console.log('🔄 ===== Check Completion =====');
          console.log(`  contactsProcessed: ${contactsProcessed}`);
          console.log(`  chatsProcessed: ${chatsProcessed}`);
          console.log(`  labelsProcessed: ${labelsProcessed}`);
          console.log(`  labelItemsProcessed: ${labelItemsProcessed}`);
          console.log(`  Total contacts: ${contacts.length}`);
          console.log(`  Total labels: ${allLabels.length}`);
          console.log(`  Total associations: ${labelAssociations.length}`);
          console.log('===============================');

          if (contactsProcessed && chatsProcessed &&
              labelsProcessed && labelItemsProcessed) {

            // 🆕 الخطوة 3: استخراج الجهات المفقودة من labelAssociations
            console.log('🔍 ===== Extracting Missing Contacts from Labels =====');
            console.log(`  Contacts before: ${contacts.length}`);

            let missingAdded = 0;
            const extractedIds = new Set();

            // جمع جميع IDs المستخرجة
            contacts.forEach(contact => {
              if (contact.contactId) {
                extractedIds.add(contact.contactId);
              }
            });

            // البحث عن الجهات المفقودة في labelAssociations
            labelAssociations.forEach(assoc => {
              const contactId = assoc.associationId;

              // إذا لم نستخرج هذه الجهة من قبل
              if (!extractedIds.has(contactId)) {
                // فقط @c.us (محادثات فردية)
                if (contactId.includes('@c.us')) {
                  const phoneNumber = contactId.split('@')[0];

                  // التحقق من صحة رقم الهاتف
                  if (phoneNumber && isValidPhoneNumber(phoneNumber)) {
                    contacts.push({
                      name: phoneNumber, // استخدام الرقم كاسم
                      phone: phoneNumber,
                      type: 'محذوف', // جهة محذوفة من المحادثات
                      labels: [],  // سيتم تعبئتها لاحقاً
                      contactId: contactId
                    });
                    extractedIds.add(contactId);
                    missingAdded++;
                  }
                }
              }
            });

            console.log(`  Missing contacts added: ${missingAdded}`);
            console.log(`  Contacts after: ${contacts.length}`);
            console.log('=====================================================');

            // 🆕 تعيين التصنيفات لجهات الاتصال (بعد اكتمال جميع البيانات)
            console.log('🔗 ===== Mapping Labels to Contacts =====');
            console.log(`  Processing ${contacts.length} contacts...`);
            let contactsWithLabels = 0;
            let groupCount = 0;
            let broadcastCount = 0;

            contacts.forEach(contact => {
              if (contact.contactId) {
                contact.labels = getLabelsForContact(contact.contactId);
                if (contact.labels.length > 0) {
                  contactsWithLabels++;
                }
                // إحصائيات
                if (contact.type === 'مجموعة') groupCount++;
                if (contact.type === 'قائمة بث') broadcastCount++;
                // حذف contactId (لا نحتاجه في التصدير)
                delete contact.contactId;
              }
            });

            console.log(`  ✅ ${contactsWithLabels} contacts have labels`);
            console.log(`  📊 Groups: ${groupCount}, Broadcasts: ${broadcastCount}`);
            console.log('========================================');

            db.close();

            // ترتيب النتائج: المحفوظة أولاً
            contacts.sort((a, b) => {
              if (a.type === 'جهة محفوظة' && b.type !== 'جهة محفوظة') return -1;
              if (a.type !== 'جهة محفوظة' && b.type === 'جهة محفوظة') return 1;
              return a.name.localeCompare(b.name);
            });

            // 🆕 إرجاع البيانات مع قائمة التصنيفات المتاحة والعلاقات
            console.log('🎉 ===== Final Result =====');
            console.log(`  Returning ${contacts.length} contacts`);
            console.log(`  Returning ${allLabels.length} labels`);
            console.log(`  Returning ${labelAssociations.length} label associations`);
            console.log('===========================');

            resolve({
              contacts: contacts,
              availableLabels: allLabels,
              labelAssociations: labelAssociations  // 🆕 إرجاع العلاقات لحساب الأعداد الصحيحة
            });
          }
        }

        // معالجة أخطاء المعاملة
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
