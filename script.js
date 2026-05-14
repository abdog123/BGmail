// ========================================
// B Gmail - script.js (النسخة النهائية مع حل مشكلة التسجيل والدخول)
// ========================================

const API_URL = "https://script.google.com/macros/s/AKfycbw7EXyeBagaReJjmaaRiZMnyThDz6hWLcHvK3qt3XgQbqbQ7xzVLByQLs6UzqYStcPu/exec";

let currentAccountNumber = null;
let currentBalance = 0;
let currentPendingBalance = 0;
let currentBlocked = false;
let gmailPrice = 0;
let balanceUpdateInterval = null;

// نظام الحظر المؤقت
let tempBlockUntil = null;
let gmailCreationHistory = [];

// سجل الأسماء والأرقام المستخدمة لمنع التكرار
let usedGmailHistory = [];

// ========================================
// الأسماء الكاملة
// ========================================

const NAMES_LIST = [
    "James Smith", "Emma Johnson", "Michael Brown", "Olivia Williams", "David Jones",
    "Sophia Garcia", "Daniel Miller", "Isabella Davis", "Matthew Wilson", "Ava Anderson",
    "Andrew Taylor", "Mia Thomas", "Joshua Moore", "Charlotte Martin", "Christopher Lee",
    "Amelia Walker", "William Harris", "Ella Young", "Benjamin King", "Abigail Scott",
    "Ryan Wright", "Harper Hill", "Alexander Green", "Evelyn Adams", "Jacob Nelson",
    "Scarlett Carter", "Ethan Roberts", "Grace Mitchell", "Noah Evans", "Chloe Turner",
    "Lucas Phillips", "Lily Campbell", "Jack Parker", "Aria Roberts", "Aiden Collins",
    "Zoey Richardson", "Samuel Murphy", "Mila Sanders", "Henry Cook", "Stella Morris",
    "Owen Reed", "Natalie Bailey", "Gabriel Bell", "Zoe Rivera", "Isaac Cooper",
    "Hannah Ward", "Caleb Murphy", "Leah Peterson", "Elijah Baker", "Victoria Phillips"
];

const GMAIL_PREFIXES = [
    "jamesmith", "emmajohnson", "michaelbrown", "oliviawilliams", "davidjones",
    "sophiagarcia", "danielmiller", "isabelladavis", "matthewwilson", "avaanderson",
    "andrewtaylor", "miathomas", "joshuamoore", "charlottemartin", "christopherlee",
    "ameliawalker", "williamharris", "ellayoung", "benjaminking", "abigailscott",
    "ryanwright", "harperhill", "alexandergreen", "evelynadams", "jacobnelson",
    "scarlettcarter", "ethanroberts", "gracemitchell", "noahevans", "chloeturner",
    "lucasphillips", "lilycampbell", "jackparker", "ariaroberts", "aidencollins",
    "zoeyrichardson", "samuelmurphy", "milasanders", "henrycook", "stellamorris",
    "owenreed", "nataliebailey", "gabrielbell", "zoerivera", "isaaccooper",
    "hannahward", "calebmurphy", "leahpeterson", "elijahbaker", "victoriaphillips"
];

const PASSWORDS_LIST = ["aass1122"];
const GENDERS = ["ذكر", "أنثى"];

function generateUniqueGmail() {
    let attempts = 0;
    let prefix, randomDigits, gmail;
    
    do {
        prefix = GMAIL_PREFIXES[Math.floor(Math.random() * GMAIL_PREFIXES.length)];
        randomDigits = Math.floor(Math.random() * 9000) + 1000;
        gmail = prefix + randomDigits;
        attempts++;
        
        if (attempts > 100) {
            randomDigits = Math.floor(Math.random() * 90000) + 10000;
            gmail = prefix + randomDigits;
        }
        if (attempts > 200) {
            randomDigits = Math.floor(Math.random() * 900000) + 100000;
            gmail = prefix + randomDigits;
        }
        
    } while (usedGmailHistory.includes(gmail));
    
    usedGmailHistory.push(gmail);
    return gmail;
}

function getRandomBirthYear() {
    const years = [];
    for (let i = 1980; i <= 2000; i++) {
        years.push(i);
    }
    return years[Math.floor(Math.random() * years.length)];
}

// ========================================
// دوال مساعدة
// ========================================

function showToast(message, isError = false) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = message;
    toast.style.background = isError ? '#dc3545' : '#4caf50';
    toast.classList.remove('hidden');
    setTimeout(() => toast.classList.add('hidden'), 3000);
}

function setButtonLoading(buttonId, isLoading, loadingText = 'جاري...') {
    const btn = document.getElementById(buttonId);
    if (!btn) return;
    if (isLoading) {
        btn._originalText = btn.innerHTML;
        btn.innerHTML = loadingText;
        btn.disabled = true;
        btn.style.opacity = '0.6';
    } else {
        btn.innerHTML = btn._originalText || btn.innerHTML;
        btn.disabled = false;
        btn.style.opacity = '1';
    }
}

function getDeviceId() {
    let deviceId = localStorage.getItem('deviceId');
    if (!deviceId) {
        deviceId = 'DEV_' + Math.random().toString(36).substr(2, 16) + '_' + Date.now();
        localStorage.setItem('deviceId', deviceId);
    }
    return deviceId;
}

async function callAPI(action, params = {}) {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            mode: 'cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action, ...params })
        });
        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        return { success: false, error: error.message };
    }
}

function copyToClipboard(text, fieldName) {
    navigator.clipboard.writeText(text).then(() => {
        showToast(`✅ تم نسخ ${fieldName} بنجاح!`, false);
    }).catch(() => {
        showToast(`❌ فشل نسخ ${fieldName}`, true);
    });
}

// ========================================
// التحكم في ظهور شاشة التسجيل والرئيسية
// ========================================

function showRegisterScreen() {
    const registerScreen = document.getElementById('registerScreen');
    const mainScreen = document.getElementById('mainScreen');
    
    if (registerScreen) registerScreen.classList.remove('hidden');
    if (mainScreen) mainScreen.classList.add('hidden');
}

function showMainScreen() {
    const registerScreen = document.getElementById('registerScreen');
    const mainScreen = document.getElementById('mainScreen');
    
    if (registerScreen) registerScreen.classList.add('hidden');
    if (mainScreen) mainScreen.classList.remove('hidden');
}

// ========================================
// التسجيل والدخول (مرة واحدة فقط)
// ========================================

async function registerDevice() {
    const deviceId = getDeviceId();
    const savedAccount = localStorage.getItem('accountNumber');
    
    // لو فيه حساب موجود بالفعل، ندخل بيه
    if (savedAccount) {
        currentAccountNumber = savedAccount;
        const result = await callAPI('getBalance', { accountNumber: savedAccount });
        
        if (result && result.success === true) {
            currentBalance = parseFloat(result.balance) || 0;
            currentPendingBalance = parseFloat(result.pendingBalance) || 0;
            currentBlocked = result.blocked === true;
            
            const balanceEl = document.getElementById('balance');
            const pendingEl = document.getElementById('pendingBalance');
            if (balanceEl) balanceEl.textContent = currentBalance;
            if (pendingEl) pendingEl.textContent = currentPendingBalance;
            
            if (currentBlocked) {
                showToast('⚠️ حسابك محظور! لا يمكنك استخدام الموقع.', true);
                return false;
            }
            
            await loadServicePrice();
            showMainScreen();
            startBalanceUpdates();
            showToast('تم تسجيل الدخول بنجاح!');
            return true;
        } else {
            localStorage.removeItem('accountNumber');
        }
    }
    
    // تسجيل جديد
    setButtonLoading('registerBtn', true, 'جاري التسجيل...');
    const accountNumber = 'ACC' + Math.floor(Math.random() * 100000) + Date.now().toString().slice(-6);
    const result = await callAPI('register', { accountNumber, deviceId });
    setButtonLoading('registerBtn', false);
    
    if (result && result.success === true) {
        localStorage.setItem('accountNumber', accountNumber);
        localStorage.setItem('deviceId', deviceId);
        currentAccountNumber = accountNumber;
        currentBlocked = false;
        currentBalance = 0;
        currentPendingBalance = 0;
        
        const balanceEl = document.getElementById('balance');
        const pendingEl = document.getElementById('pendingBalance');
        if (balanceEl) balanceEl.textContent = '0';
        if (pendingEl) pendingEl.textContent = '0';
        
        showToast('✅ تم تسجيل الجهاز بنجاح!');
        await loadServicePrice();
        showMainScreen();
        startBalanceUpdates();
        return true;
    } else {
        showToast(result?.error || 'فشل التسجيل، حاول مرة أخرى', true);
        return false;
    }
}

// ========================================
// جلب الرصيد وسعر الخدمة من الشيت
// ========================================

async function loadBalance() {
    if (!currentAccountNumber) return;
    
    const result = await callAPI('getBalance', { accountNumber: currentAccountNumber });
    
    if (result && result.success === true) {
        const oldBalance = currentBalance;
        const oldPendingBalance = currentPendingBalance;
        
        currentBalance = parseFloat(result.balance) || 0;
        currentPendingBalance = parseFloat(result.pendingBalance) || 0;
        currentBlocked = result.blocked === true;
        
        const balanceEl = document.getElementById('balance');
        const pendingEl = document.getElementById('pendingBalance');
        if (balanceEl) balanceEl.textContent = currentBalance;
        if (pendingEl) pendingEl.textContent = currentPendingBalance;
        
        if (oldBalance !== currentBalance && balanceEl) {
            balanceEl.style.animation = 'none';
            balanceEl.offsetHeight;
            balanceEl.style.animation = 'pulse 0.5s ease';
            if (oldBalance < currentBalance) {
                showToast(`💰 تم إضافة ${(currentBalance - oldBalance).toFixed(2)} ج.م إلى رصيدك`, false);
            }
        }
        if (oldPendingBalance !== currentPendingBalance && pendingEl) {
            pendingEl.style.animation = 'none';
            pendingEl.offsetHeight;
            pendingEl.style.animation = 'pulse 0.5s ease';
        }
        
        if (currentBlocked) {
            showToast('⚠️ حسابك محظور!', true);
            disableAllButtons();
        } else {
            enableAllButtons();
        }
    } else if (result && result.error === "User not found") {
        localStorage.removeItem('accountNumber');
        currentAccountNumber = null;
        showRegisterScreen();
    }
}

async function loadServicePrice() {
    if (!currentAccountNumber) return;
    
    const result = await callAPI('getServicePrice', { service: 'Gmail' });
    const priceEl = document.getElementById('servicePrice');
    
    if (result && result.success === true) {
        gmailPrice = parseFloat(result.price) || 8;
        if (priceEl) priceEl.textContent = gmailPrice + ' ج.م';
    } else {
        gmailPrice = 8;
        if (priceEl) priceEl.textContent = gmailPrice + ' ج.م';
    }
}

function startBalanceUpdates() {
    if (balanceUpdateInterval) clearInterval(balanceUpdateInterval);
    balanceUpdateInterval = setInterval(() => {
        if (currentAccountNumber) {
            loadBalance();
            loadServicePrice();
        }
    }, 500);
}

function stopBalanceUpdates() {
    if (balanceUpdateInterval) clearInterval(balanceUpdateInterval);
}

function disableAllButtons() {
    const buttons = ['createGmailBtn', 'withdrawBtn', 'gmailLogsBtn', 'withdrawLogsBtn'];
    buttons.forEach(id => {
        const btn = document.getElementById(id);
        if (btn) btn.disabled = true;
    });
}

function enableAllButtons() {
    const buttons = ['createGmailBtn', 'withdrawBtn', 'gmailLogsBtn', 'withdrawLogsBtn'];
    buttons.forEach(id => {
        const btn = document.getElementById(id);
        if (btn) btn.disabled = false;
    });
}

// ========================================
// نظام الحظر المؤقت
// ========================================

function checkTempBlock() {
    if (currentBlocked) {
        return { blocked: true, reason: "حسابك محظور نهائياً", permanent: true };
    }
    
    if (tempBlockUntil && new Date() < tempBlockUntil) {
        const remainingMinutes = Math.ceil((tempBlockUntil - new Date()) / 60000);
        return { blocked: true, reason: `⚠️ تم حظرك مؤقتاً لمدة ${remainingMinutes} دقيقة`, permanent: false };
    }
    
    if (tempBlockUntil && new Date() >= tempBlockUntil) {
        tempBlockUntil = null;
        gmailCreationHistory = [];
    }
    
    return { blocked: false };
}

function recordGmailCreation() {
    const now = new Date();
    gmailCreationHistory.push(now);
    
    const oneMinuteAgo = new Date(now.getTime() - 60000);
    gmailCreationHistory = gmailCreationHistory.filter(time => time >= oneMinuteAgo);
    
    if (gmailCreationHistory.length > 3) {
        tempBlockUntil = new Date(now.getTime() + 3600000);
        showToast(`⚠️ تم حظرك مؤقتاً لمدة ساعة!`, true);
        return false;
    }
    
    return true;
}

// ========================================
// إنشاء Gmail
// ========================================

function getRandomLocalData() {
    const randomName = NAMES_LIST[Math.floor(Math.random() * NAMES_LIST.length)];
    const randomGmail = generateUniqueGmail();
    const randomPassword = PASSWORDS_LIST[0];
    const randomGender = GENDERS[Math.floor(Math.random() * GENDERS.length)];
    const randomBirthYear = getRandomBirthYear();
    
    return { 
        name: randomName, 
        gmail: randomGmail, 
        password: randomPassword,
        gender: randomGender,
        birthYear: randomBirthYear
    };
}

let currentGeneratedData = null;

async function showCreateGmailModal() {
    const blockCheck = checkTempBlock();
    if (blockCheck.blocked) {
        showToast(blockCheck.reason, true);
        return;
    }
    
    if (currentBlocked) {
        showToast('❌ حسابك محظور نهائياً!', true);
        return;
    }
    
    setButtonLoading('createGmailBtn', true, 'جاري إنشاء البيانات...');
    currentGeneratedData = getRandomLocalData();
    setButtonLoading('createGmailBtn', false);
    
    document.getElementById('generatedName').innerHTML = `${currentGeneratedData.name} <button class="copy-btn" onclick="copyToClipboard('${currentGeneratedData.name.replace(/'/g, "\\'")}', 'الاسم')">📋 نسخ</button>`;
    document.getElementById('generatedGmail').innerHTML = `${currentGeneratedData.gmail} <button class="copy-btn" onclick="copyToClipboard('${currentGeneratedData.gmail.replace(/'/g, "\\'")}', 'البريد')">📋 نسخ</button>`;
    document.getElementById('generatedPassword').innerHTML = `${currentGeneratedData.password} <button class="copy-btn" onclick="copyToClipboard('${currentGeneratedData.password.replace(/'/g, "\\'")}', 'كلمة المرور')">📋 نسخ</button>`;
    document.getElementById('generatedGenderAge').textContent = `${currentGeneratedData.gender} / ${currentGeneratedData.birthYear}`;
    document.getElementById('createModal').classList.remove('hidden');
}

function showEnhancedConfirmDialog() {
    return new Promise((resolve) => {
        const dialog = document.createElement('div');
        dialog.className = 'confirm-dialog-overlay';
        dialog.innerHTML = `
            <div class="confirm-dialog">
                <div class="confirm-dialog-header">
                    <span class="confirm-dialog-icon">⚠️</span>
                    <h3>تأكيد إنشاء الجميل</h3>
                </div>
                <div class="confirm-dialog-body">
                    <p>هل قمت بإنشاء حساب Gmail <strong>بنفس البيانات</strong> الموضحة أعلاه؟</p>
                    <div class="confirm-dialog-warning">
                        <strong>🔴 تحذير هام:</strong>
                        <ul>
                            <li>في حالة التلاعب أو إرسال بيانات غير صحيحة</li>
                            <li>سيتم <strong>رفض الحساب فوراً</strong></li>
                            <li>وسيتم <strong>حظر حسابك نهائياً</strong> من الموقع</li>
                        </ul>
                    </div>
                </div>
                <div class="confirm-dialog-footer">
                    <button class="confirm-dialog-cancel">❌ إلغاء</button>
                    <button class="confirm-dialog-ok">✅ نعم، تم الإنشاء</button>
                </div>
            </div>
        `;
        document.body.appendChild(dialog);
        dialog.querySelector('.confirm-dialog-cancel').onclick = () => { dialog.remove(); resolve(false); };
        dialog.querySelector('.confirm-dialog-ok').onclick = () => { dialog.remove(); resolve(true); };
        dialog.onclick = (e) => { if (e.target === dialog) { dialog.remove(); resolve(false); } };
    });
}

async function confirmGmailCreation() {
    if (!currentGeneratedData) return;
    
    const blockCheck = checkTempBlock();
    if (blockCheck.blocked) {
        showToast(blockCheck.reason, true);
        document.getElementById('createModal').classList.add('hidden');
        return;
    }
    
    const confirmed = await showEnhancedConfirmDialog();
    if (!confirmed) return;
    
    setButtonLoading('confirmCreateBtn', true, 'جاري الإرسال...');
    
    const fullGmail = currentGeneratedData.gmail + '@gmail.com';
    
    const result = await callAPI('submitGmail', {
        accountNumber: currentAccountNumber,
        fullName: currentGeneratedData.name,
        gmail: fullGmail,
        password: currentGeneratedData.password,
        price: gmailPrice
    });
    
    setButtonLoading('confirmCreateBtn', false);
    
    if (result && result.success === true) {
        await loadBalance();
        document.getElementById('createModal').classList.add('hidden');
        currentGeneratedData = null;
        showToast('✅ تم الإرسال! سيتم مراجعة الجميل خلال 2-4 أيام');
    } else {
        showToast(result?.error || 'حدث خطأ أثناء الإرسال', true);
    }
}

// ========================================
// سحب الأموال (الحد الأدنى 30 جنيه)
// ========================================

function showWithdrawModal() {
    if (currentBlocked) {
        showToast('❌ حسابك محظور! لا يمكنك سحب الأموال.', true);
        return;
    }
    
    document.getElementById('availableBalanceHint').textContent = currentBalance;
    document.getElementById('withdrawModal').classList.remove('hidden');
}

async function submitWithdrawRequest() {
    const wallet = document.getElementById('walletNumber')?.value.trim() || '';
    const amount = parseFloat(document.getElementById('withdrawAmount')?.value || '0');
    
    if (!wallet) { showToast('الرجاء إدخال رقم المحفظة', true); return; }
    if (isNaN(amount) || amount <= 0) { showToast('الرجاء إدخال مبلغ صحيح', true); return; }
    if (amount > currentBalance) { showToast('المبلغ المطلوب أكبر من الرصيد المتاح', true); return; }
    if (amount < 30) { showToast('الحد الأدنى للسحب هو 30 جنيه', true); return; }
    
    setButtonLoading('submitWithdrawBtn', true, 'جاري الإرسال...');
    const result = await callAPI('submitWithdrawal', { 
        accountNumber: currentAccountNumber, 
        wallet, 
        amount 
    });
    setButtonLoading('submitWithdrawBtn', false);
    
    if (result && result.success === true) {
        await loadBalance();
        document.getElementById('withdrawModal').classList.add('hidden');
        document.getElementById('walletNumber').value = '';
        document.getElementById('withdrawAmount').value = '';
        showToast('✅ تم إرسال طلب السحب بنجاح');
    } else {
        showToast(result?.error || 'حدث خطأ', true);
    }
}

// ========================================
// عرض السجلات
// ========================================

async function showGmailLogs() {
    if (!currentAccountNumber) {
        showToast('الرجاء تسجيل الدخول أولاً', true);
        return;
    }
    
    setButtonLoading('gmailLogsBtn', true, 'جاري التحميل...');
    const result = await callAPI('getMyGmails', { accountNumber: currentAccountNumber });
    setButtonLoading('gmailLogsBtn', false);
    
    if (result && result.success === true && result.gmails) {
        const filter = document.getElementById('gmailStatusFilter')?.value || 'all';
        let filtered = result.gmails;
        if (filter !== 'all') {
            filtered = result.gmails.filter(g => g.status === filter);
        }
        
        const tbody = document.getElementById('gmailLogsBody');
        
        if (filtered.length === 0) {
            tbody.innerHTML = '<tr><td colspan="3" class="no-data">📭 لا توجد جميلات</td></tr>';
        } else {
            const reversed = [...filtered].reverse();
            tbody.innerHTML = reversed.map(rec => {
                let statusText = '', statusClass = '';
                if (rec.status === 'Pending') { 
                    statusText = '⏳ قيد المراجعة'; 
                    statusClass = 'status-pending'; 
                }
                else if (rec.status === 'Approved') { 
                    statusText = '✅ مقبول'; 
                    statusClass = 'status-approved'; 
                }
                else if (rec.status === 'Rejected') { 
                    statusText = '❌ مرفوض'; 
                    statusClass = 'status-rejected'; 
                }
                const displayGmail = rec.gmail.replace('@gmail.com', '');
                const formattedDate = new Date(rec.timestamp).toLocaleDateString('ar-EG');
                return `<tr>
                    <td style="direction: ltr;">${displayGmail}</td>
                    <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                    <td>${formattedDate}</td>
                </tr>`;
            }).join('');
        }
        document.getElementById('gmailLogsModal').classList.remove('hidden');
    } else {
        showToast('حدث خطأ في تحميل السجلات', true);
    }
}

async function showWithdrawLogs() {
    if (!currentAccountNumber) {
        showToast('الرجاء تسجيل الدخول أولاً', true);
        return;
    }
    
    setButtonLoading('withdrawLogsBtn', true, 'جاري التحميل...');
    const result = await callAPI('getMyWithdrawals', { accountNumber: currentAccountNumber });
    setButtonLoading('withdrawLogsBtn', false);
    
    if (result && result.success === true && result.withdrawals) {
        const filter = document.getElementById('withdrawStatusFilter')?.value || 'all';
        let filtered = result.withdrawals;
        if (filter !== 'all') {
            filtered = result.withdrawals.filter(w => w.status === filter);
        }
        
        const tbody = document.getElementById('withdrawLogsBody');
        
        if (filtered.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="no-data">📭 لا توجد سحوبات</td></tr>';
        } else {
            const reversed = [...filtered].reverse();
            tbody.innerHTML = reversed.map(w => {
                let statusText = '', statusClass = '';
                if (w.status === 'Pending') { 
                    statusText = '⏳ قيد المراجعة'; 
                    statusClass = 'status-pending'; 
                }
                else if (w.status === 'Completed') { 
                    statusText = '✅ مكتمل'; 
                    statusClass = 'status-completed'; 
                }
                else if (w.status === 'Rejected') { 
                    statusText = '❌ مرفوض'; 
                    statusClass = 'status-rejected'; 
                }
                const formattedDate = new Date(w.timestamp).toLocaleDateString('ar-EG');
                return `<tr>
                    <td>${w.wallet}</td>
                    <td>${w.amount} ج.م</td>
                    <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                    <td>${formattedDate}</td>
                </tr>`;
            }).join('');
        }
        document.getElementById('withdrawLogsModal').classList.remove('hidden');
    } else {
        showToast('حدث خطأ في تحميل السجلات', true);
    }
}

// ========================================
// بدء التشغيل
// ========================================

async function init() {
    // التحقق من التسجيل وإظهار الشاشة المناسبة
    const savedAccount = localStorage.getItem('accountNumber');
    
    if (savedAccount) {
        currentAccountNumber = savedAccount;
        await loadBalance();
        await loadServicePrice();
        showMainScreen();
        startBalanceUpdates();
    } else {
        showRegisterScreen();
    }
    
    // ربط الأزرار
    const registerBtn = document.getElementById('registerBtn');
    const createBtn = document.getElementById('createGmailBtn');
    const confirmBtn = document.getElementById('confirmCreateBtn');
    const withdrawBtn = document.getElementById('withdrawBtn');
    const submitWithdraw = document.getElementById('submitWithdrawBtn');
    const gmailLogs = document.getElementById('gmailLogsBtn');
    const withdrawLogs = document.getElementById('withdrawLogsBtn');
    
    if (registerBtn) registerBtn.addEventListener('click', registerDevice);
    if (createBtn) createBtn.addEventListener('click', showCreateGmailModal);
    if (confirmBtn) confirmBtn.addEventListener('click', confirmGmailCreation);
    if (withdrawBtn) withdrawBtn.addEventListener('click', showWithdrawModal);
    if (submitWithdraw) submitWithdraw.addEventListener('click', submitWithdrawRequest);
    if (gmailLogs) gmailLogs.addEventListener('click', showGmailLogs);
    if (withdrawLogs) withdrawLogs.addEventListener('click', showWithdrawLogs);
    
    window.copyToClipboard = copyToClipboard;
    
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.target.closest('.modal').classList.add('hidden');
        });
    });
    
    window.addEventListener('click', (e) => {
        if (e.target.classList && e.target.classList.contains('modal')) {
            e.target.classList.add('hidden');
        }
    });
    
    const gmailFilter = document.getElementById('gmailStatusFilter');
    const withdrawFilter = document.getElementById('withdrawStatusFilter');
    if (gmailFilter) gmailFilter.addEventListener('change', showGmailLogs);
    if (withdrawFilter) withdrawFilter.addEventListener('change', showWithdrawLogs);
}

window.addEventListener('DOMContentLoaded', init);
