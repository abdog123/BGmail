// ========================================
// B Gmail - script.js (النسخة النهائية المصححة)
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
let usedGmailHistory = [];

// ========================================
// الأسماء والبيانات
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
    } while (usedGmailHistory.includes(gmail));
    usedGmailHistory.push(gmail);
    return gmail;
}

function getRandomBirthYear() {
    return Math.floor(Math.random() * (2000 - 1980 + 1)) + 1980;
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
        showToast(`✅ تم نسخ ${fieldName}`, false);
    }).catch(() => {
        showToast(`❌ فشل نسخ ${fieldName}`, true);
    });
}

// ========================================
// التحكم في الشاشات
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
// التسجيل والدخول
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
            
            document.getElementById('balance').textContent = currentBalance;
            document.getElementById('pendingBalance').textContent = currentPendingBalance;
            
            if (currentBlocked) {
                showToast('⚠️ حسابك محظور!', true);
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
    setButtonLoading('registerBtn', true);
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
        
        document.getElementById('balance').textContent = '0';
        document.getElementById('pendingBalance').textContent = '0';
        
        showToast('✅ تم تسجيل الجهاز بنجاح!');
        await loadServicePrice();
        showMainScreen();
        startBalanceUpdates();
        return true;
    } else {
        showToast(result?.error || 'فشل التسجيل', true);
        return false;
    }
}

// ========================================
// الرصيد والأسعار
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
        
        document.getElementById('balance').textContent = currentBalance;
        document.getElementById('pendingBalance').textContent = currentPendingBalance;
        
        if (oldBalance !== currentBalance && currentBalance > oldBalance) {
            showToast(`💰 تم إضافة ${(currentBalance - oldBalance).toFixed(2)} ج.م`, false);
        }
        
        if (currentBlocked) {
            disableAllButtons();
        } else {
            enableAllButtons();
        }
    }
}

async function loadServicePrice() {
    if (!currentAccountNumber) return;
    
    const result = await callAPI('getServicePrice', { service: 'Gmail' });
    if (result && result.success === true) {
        gmailPrice = parseFloat(result.price) || 8;
        document.getElementById('servicePrice').textContent = gmailPrice + ' ج.م';
    } else {
        gmailPrice = 8;
        document.getElementById('servicePrice').textContent = gmailPrice + ' ج.م';
    }
}

function startBalanceUpdates() {
    if (balanceUpdateInterval) clearInterval(balanceUpdateInterval);
    balanceUpdateInterval = setInterval(() => {
        if (currentAccountNumber && !currentBlocked) {
            loadBalance();
            loadServicePrice();
        }
    }, 2000);
}

function disableAllButtons() {
    const btns = ['createGmailBtn', 'withdrawBtn', 'gmailLogsBtn', 'withdrawLogsBtn'];
    btns.forEach(id => {
        const btn = document.getElementById(id);
        if (btn) btn.disabled = true;
    });
}

function enableAllButtons() {
    const btns = ['createGmailBtn', 'withdrawBtn', 'gmailLogsBtn', 'withdrawLogsBtn'];
    btns.forEach(id => {
        const btn = document.getElementById(id);
        if (btn) btn.disabled = false;
    });
}

// ========================================
// نظام الحظر المؤقت
// ========================================

function checkTempBlock() {
    if (currentBlocked) {
        return { blocked: true, reason: "حسابك محظور نهائياً" };
    }
    if (tempBlockUntil && new Date() < tempBlockUntil) {
        const remaining = Math.ceil((tempBlockUntil - new Date()) / 60000);
        return { blocked: true, reason: `⚠️ ممنوع لمدة ${remaining} دقيقة` };
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
    gmailCreationHistory = gmailCreationHistory.filter(t => t >= oneMinuteAgo);
    
    if (gmailCreationHistory.length > 3) {
        tempBlockUntil = new Date(now.getTime() + 3600000);
        showToast(`⚠️ تم حظرك مؤقتاً لمدة ساعة`, true);
        return false;
    }
    return true;
}

// ========================================
// إنشاء Gmail
// ========================================

function getRandomLocalData() {
    return {
        name: NAMES_LIST[Math.floor(Math.random() * NAMES_LIST.length)],
        gmail: generateUniqueGmail(),
        password: PASSWORDS_LIST[0],
        gender: GENDERS[Math.floor(Math.random() * GENDERS.length)],
        birthYear: getRandomBirthYear()
    };
}

let currentGeneratedData = null;

async function showCreateGmailModal() {
    const block = checkTempBlock();
    if (block.blocked) {
        showToast(block.reason, true);
        return;
    }
    if (currentBlocked) {
        showToast('❌ حسابك محظور!', true);
        return;
    }
    
    setButtonLoading('createGmailBtn', true);
    currentGeneratedData = getRandomLocalData();
    setButtonLoading('createGmailBtn', false);
    
    document.getElementById('generatedName').innerHTML = `${currentGeneratedData.name} <button class="copy-btn" onclick="copyToClipboard('${currentGeneratedData.name.replace(/'/g, "\\'")}', 'الاسم')">📋 نسخ</button>`;
    document.getElementById('generatedGmail').innerHTML = `${currentGeneratedData.gmail} <button class="copy-btn" onclick="copyToClipboard('${currentGeneratedData.gmail.replace(/'/g, "\\'")}', 'البريد')">📋 نسخ</button>`;
    document.getElementById('generatedPassword').innerHTML = `${currentGeneratedData.password} <button class="copy-btn" onclick="copyToClipboard('${currentGeneratedData.password.replace(/'/g, "\\'")}', 'كلمة السر')">📋 نسخ</button>`;
    document.getElementById('generatedGenderAge').textContent = `${currentGeneratedData.gender} / ${currentGeneratedData.birthYear}`;
    document.getElementById('createModal').classList.remove('hidden');
}

async function confirmGmailCreation() {
    if (!currentGeneratedData) return;
    
    const block = checkTempBlock();
    if (block.blocked) {
        showToast(block.reason, true);
        document.getElementById('createModal').classList.add('hidden');
        return;
    }
    
    const confirmed = confirm('⚠️ هل أنت متأكد؟\n\nفي حالة التلاعب سيتم حظر حسابك نهائياً!');
    if (!confirmed) return;
    
    setButtonLoading('confirmCreateBtn', true);
    const result = await callAPI('submitGmail', {
        accountNumber: currentAccountNumber,
        fullName: currentGeneratedData.name,
        gmail: currentGeneratedData.gmail + '@gmail.com',
        password: currentGeneratedData.password,
        price: gmailPrice
    });
    setButtonLoading('confirmCreateBtn', false);
    
    if (result && result.success === true) {
        recordGmailCreation();
        await loadBalance();
        document.getElementById('createModal').classList.add('hidden');
        currentGeneratedData = null;
        showToast('✅ تم الإرسال! سيتم المراجعة خلال 2-4 أيام');
    } else {
        showToast(result?.error || 'حدث خطأ', true);
    }
}

// ========================================
// سحب الأموال
// ========================================

function showWithdrawModal() {
    if (currentBlocked) {
        showToast('❌ حسابك محظور!', true);
        return;
    }
    document.getElementById('availableBalanceHint').textContent = currentBalance;
    document.getElementById('withdrawModal').classList.remove('hidden');
}

async function submitWithdrawRequest() {
    const wallet = document.getElementById('walletNumber')?.value.trim();
    const amount = parseFloat(document.getElementById('withdrawAmount')?.value || 0);
    
    if (!wallet) { showToast('أدخل رقم المحفظة', true); return; }
    if (isNaN(amount) || amount <= 0) { showToast('أدخل مبلغ صحيح', true); return; }
    if (amount > currentBalance) { showToast('المبلغ أكبر من الرصيد', true); return; }
    if (amount < 30) { showToast('الحد الأدنى 30 جنيه', true); return; }
    
    setButtonLoading('submitWithdrawBtn', true);
    const result = await callAPI('submitWithdrawal', { accountNumber: currentAccountNumber, wallet, amount });
    setButtonLoading('submitWithdrawBtn', false);
    
    if (result && result.success === true) {
        await loadBalance();
        document.getElementById('withdrawModal').classList.add('hidden');
        document.getElementById('walletNumber').value = '';
        document.getElementById('withdrawAmount').value = '';
        showToast('✅ تم إرسال طلب السحب');
    } else {
        showToast(result?.error || 'حدث خطأ', true);
    }
}

// ========================================
// السجلات
// ========================================

async function showGmailLogs() {
    if (!currentAccountNumber) return;
    setButtonLoading('gmailLogsBtn', true);
    const result = await callAPI('getMyGmails', { accountNumber: currentAccountNumber });
    setButtonLoading('gmailLogsBtn', false);
    
    if (result?.success && result.gmails) {
        const filter = document.getElementById('gmailStatusFilter')?.value || 'all';
        let filtered = result.gmails;
        if (filter !== 'all') filtered = result.gmails.filter(g => g.status === filter);
        
        const tbody = document.getElementById('gmailLogsBody');
        if (filtered.length === 0) {
            tbody.innerHTML = '<tr><td colspan="3">لا توجد جميلات</td><tr>';
        } else {
            tbody.innerHTML = filtered.reverse().map(rec => {
                let statusText = '', statusClass = '';
                if (rec.status === 'Pending') { statusText = '⏳ قيد المراجعة'; statusClass = 'status-pending'; }
                else if (rec.status === 'Approved') { statusText = '✅ مقبول'; statusClass = 'status-approved'; }
                else if (rec.status === 'Rejected') { statusText = '❌ مرفوض'; statusClass = 'status-rejected'; }
                const email = rec.gmail.replace('@gmail.com', '');
                const date = new Date(rec.timestamp).toLocaleDateString('ar-EG');
                return `<tr><td style="direction:ltr">${email}</td><td><span class="status-badge ${statusClass}">${statusText}</span></td><td>${date}</td></tr>`;
            }).join('');
        }
        document.getElementById('gmailLogsModal').classList.remove('hidden');
    } else {
        showToast('خطأ في التحميل', true);
    }
}

async function showWithdrawLogs() {
    if (!currentAccountNumber) return;
    setButtonLoading('withdrawLogsBtn', true);
    const result = await callAPI('getMyWithdrawals', { accountNumber: currentAccountNumber });
    setButtonLoading('withdrawLogsBtn', false);
    
    if (result?.success && result.withdrawals) {
        const filter = document.getElementById('withdrawStatusFilter')?.value || 'all';
        let filtered = result.withdrawals;
        if (filter !== 'all') filtered = result.withdrawals.filter(w => w.status === filter);
        
        const tbody = document.getElementById('withdrawLogsBody');
        if (filtered.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4">لا توجد سحوبات</td><tr>';
        } else {
            tbody.innerHTML = filtered.reverse().map(w => {
                let statusText = '', statusClass = '';
                if (w.status === 'Pending') { statusText = '⏳ قيد المراجعة'; statusClass = 'status-pending'; }
                else if (w.status === 'Completed') { statusText = '✅ مكتمل'; statusClass = 'status-completed'; }
                else if (w.status === 'Rejected') { statusText = '❌ مرفوض'; statusClass = 'status-rejected'; }
                const date = new Date(w.timestamp).toLocaleDateString('ar-EG');
                return `<tr><td>${w.wallet}</td><td>${w.amount} ج.م</td><td><span class="status-badge ${statusClass}">${statusText}</span></td><td>${date}</td></tr>`;
            }).join('');
        }
        document.getElementById('withdrawLogsModal').classList.remove('hidden');
    } else {
        showToast('خطأ في التحميل', true);
    }
}

// ========================================
// بدء التشغيل
// ========================================

async function init() {
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
    document.getElementById('registerBtn')?.addEventListener('click', registerDevice);
    document.getElementById('createGmailBtn')?.addEventListener('click', showCreateGmailModal);
    document.getElementById('confirmCreateBtn')?.addEventListener('click', confirmGmailCreation);
    document.getElementById('withdrawBtn')?.addEventListener('click', showWithdrawModal);
    document.getElementById('submitWithdrawBtn')?.addEventListener('click', submitWithdrawRequest);
    document.getElementById('gmailLogsBtn')?.addEventListener('click', showGmailLogs);
    document.getElementById('withdrawLogsBtn')?.addEventListener('click', showWithdrawLogs);
    
    window.copyToClipboard = copyToClipboard;
    
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', (e) => e.target.closest('.modal')?.classList.add('hidden'));
    });
    window.addEventListener('click', (e) => {
        if (e.target.classList?.contains('modal')) e.target.classList.add('hidden');
    });
    
    document.getElementById('gmailStatusFilter')?.addEventListener('change', showGmailLogs);
    document.getElementById('withdrawStatusFilter')?.addEventListener('change', showWithdrawLogs);
}

window.addEventListener('DOMContentLoaded', init);
