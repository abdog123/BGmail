// ========================================
// B Gmail - script.js (النسخة النهائية الكاملة)
// ========================================

const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwhqm0X3ZotU1CTxYyPDWgESbQPJuCvcs4MkGjgyPNXB4M7pUot_L1DsIk6bAF8lQHv/exec';

let currentUser = null;
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
// الأسماء والبيانات المحلية
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
    return Math.floor(Math.random() * (2000 - 1980 + 1)) + 1980;
}

function getRandomLocalData() {
    return {
        name: NAMES_LIST[Math.floor(Math.random() * NAMES_LIST.length)],
        gmail: generateUniqueGmail(),
        password: PASSWORDS_LIST[0],
        gender: GENDERS[Math.floor(Math.random() * GENDERS.length)],
        birthYear: getRandomBirthYear()
    };
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

function copyToClipboard(text, fieldName) {
    navigator.clipboard.writeText(text).then(() => {
        showToast(`✅ تم نسخ ${fieldName}`, false);
    }).catch(() => {
        showToast(`❌ فشل نسخ ${fieldName}`, true);
    });
}

function togglePass(id) {
    const input = document.getElementById(id);
    if (input) {
        input.type = input.type === 'password' ? 'text' : 'password';
    }
}

function cleanPhone(phone) {
    let num = phone.toString().trim();
    while (num.startsWith('0')) {
        num = num.substring(1);
    }
    return num;
}

// ========================================
// التحكم في الشاشات
// ========================================

function showRegisterScreen() {
    document.getElementById('registerScreen')?.classList.remove('hidden');
    document.getElementById('loginScreen')?.classList.add('hidden');
    document.getElementById('mainScreen')?.classList.add('hidden');
}

function showLoginScreen() {
    document.getElementById('registerScreen')?.classList.add('hidden');
    document.getElementById('loginScreen')?.classList.remove('hidden');
    document.getElementById('mainScreen')?.classList.add('hidden');
}

function showMainScreen() {
    document.getElementById('registerScreen')?.classList.add('hidden');
    document.getElementById('loginScreen')?.classList.add('hidden');
    document.getElementById('mainScreen')?.classList.remove('hidden');
}

// ========================================
// دوال API
// ========================================

async function callAPI(action, params = {}) {
    try {
        const url = new URL(SCRIPT_URL);
        url.searchParams.append('action', action);
        Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
        
        const response = await fetch(url.toString(), {
            method: 'GET',
            mode: 'cors'
        });
        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        return { success: false, error: error.message };
    }
}

// ========================================
// التسجيل
// ========================================

async function register() {
    const phone = document.getElementById('regPhone')?.value.trim();
    const name = document.getElementById('regName')?.value.trim();
    const password = document.getElementById('regPassword')?.value;
    const confirmPassword = document.getElementById('regConfirmPassword')?.value;
    
    if (!phone) {
        showToast('الرجاء إدخال رقم الهاتف', true);
        return;
    }
    if (phone.length < 10) {
        showToast('رقم الهاتف غير صحيح', true);
        return;
    }
    if (!name) {
        showToast('الرجاء إدخال الاسم الكامل', true);
        return;
    }
    if (!password) {
        showToast('الرجاء إدخال كلمة المرور', true);
        return;
    }
    if (password.length < 4) {
        showToast('كلمة المرور يجب أن تكون 4 أحرف على الأقل', true);
        return;
    }
    if (password !== confirmPassword) {
        showToast('كلمة المرور غير متطابقة', true);
        return;
    }
    
    setButtonLoading('registerBtn', true);
    const result = await callAPI('signup', { name, phone: cleanPhone(phone), pass: password });
    setButtonLoading('registerBtn', false);
    
    if (result && result.result === "success") {
        Swal.fire({
            icon: 'success',
            title: 'تم التسجيل بنجاح!',
            text: 'يمكنك الآن تسجيل الدخول إلى حسابك',
            timer: 2000,
            showConfirmButton: false
        });
        showLoginScreen();
    } else if (result?.result === "exists") {
        Swal.fire('تنبيه', 'هذا الرقم مسجل مسبقاً. يرجى تسجيل الدخول', 'info');
        showLoginScreen();
    } else {
        showToast(result?.error || 'فشل التسجيل', true);
    }
}

// ========================================
// تسجيل الدخول
// ========================================

async function login() {
    const phone = document.getElementById('loginPhone')?.value.trim();
    const password = document.getElementById('loginPassword')?.value;
    
    if (!phone || !password) {
        showToast('الرجاء إدخال رقم الهاتف وكلمة المرور', true);
        return false;
    }
    
    setButtonLoading('doLoginBtn', true);
    const result = await callAPI('login', { phone: cleanPhone(phone), pass: password });
    setButtonLoading('doLoginBtn', false);
    
    if (result && result.result === "found") {
        localStorage.setItem('userPhone', result.phone);
        localStorage.setItem('userPassword', password);
        localStorage.setItem('userName', result.name);
        currentUser = { phone: result.phone, name: result.name };
        currentBalance = parseFloat(result.balance) || 0;
        currentPendingBalance = parseFloat(result.pendingBalance) || 0;
        currentBlocked = result.blocked === "TRUE";
        
        document.getElementById('balance').textContent = currentBalance;
        document.getElementById('pendingBalance').textContent = currentPendingBalance;
        
        if (currentBlocked) {
            Swal.fire('محظور', 'حسابك محظور. يرجى التواصل مع الدعم', 'error');
            return false;
        }
        
        await loadServicePrice();
        showMainScreen();
        startBalanceUpdates();
        Swal.fire({
            icon: 'success',
            title: `أهلاً بك ${result.name}`,
            text: 'تم تسجيل الدخول بنجاح',
            timer: 1500,
            showConfirmButton: false
        });
        return true;
    } else if (result?.result === "wrong_pass") {
        Swal.fire('خطأ', 'كلمة المرور غير صحيحة', 'error');
        return false;
    } else {
        Swal.fire('غير موجود', 'هذا الرقم غير مسجل. يرجى إنشاء حساب جديد', 'warning');
        showRegisterScreen();
        return false;
    }
}

// ========================================
// تسجيل الخروج
// ========================================

function logout() {
    Swal.fire({
        title: 'تسجيل الخروج',
        text: 'هل أنت متأكد من تسجيل الخروج؟',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'نعم',
        cancelButtonText: 'إلغاء'
    }).then((result) => {
        if (result.isConfirmed) {
            stopBalanceUpdates();
            localStorage.removeItem('userPhone');
            localStorage.removeItem('userPassword');
            localStorage.removeItem('userName');
            currentUser = null;
            currentBalance = 0;
            currentPendingBalance = 0;
            showLoginScreen();
            showToast('👋 تم تسجيل الخروج بنجاح', false);
        }
    });
}

// ========================================
// جلب الرصيد والأسعار
// ========================================

async function loadBalance() {
    if (!currentUser) return;
    
    const result = await callAPI('getBalance', { phone: cleanPhone(currentUser.phone) });
    
    if (result && result.success === true) {
        const oldBalance = currentBalance;
        const oldPendingBalance = currentPendingBalance;
        
        currentBalance = parseFloat(result.balance) || 0;
        currentPendingBalance = parseFloat(result.pendingBalance) || 0;
        currentBlocked = result.blocked === "TRUE";
        
        document.getElementById('balance').textContent = currentBalance;
        document.getElementById('pendingBalance').textContent = currentPendingBalance;
        
        if (oldBalance !== currentBalance && currentBalance > oldBalance) {
            showToast(`💰 تم إضافة ${(currentBalance - oldBalance).toFixed(2)} ج.م إلى رصيدك`, false);
        }
        
        if (currentBlocked) {
            disableAllButtons();
        } else {
            enableAllButtons();
        }
    }
}

async function loadServicePrice() {
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
        if (currentUser && !currentBlocked) {
            loadBalance();
            loadServicePrice();
        }
    }, 3000);
}

function stopBalanceUpdates() {
    if (balanceUpdateInterval) clearInterval(balanceUpdateInterval);
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
    if (currentBlocked) return { blocked: true, reason: "حسابك محظور نهائياً" };
    if (tempBlockUntil && new Date() < tempBlockUntil) {
        const remaining = Math.ceil((tempBlockUntil - new Date()) / 60000);
        return { blocked: true, reason: `⚠️ تم حظرك مؤقتاً لمدة ${remaining} دقيقة بسبب إنشاء جميلات كثيرة` };
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
        showToast(`⚠️ تم حظرك مؤقتاً لمدة ساعة بسبب إنشاء جميلات كثيرة!`, true);
        return false;
    }
    return true;
}

// ========================================
// إنشاء Gmail
// ========================================

let currentGeneratedData = null;

async function showCreateGmailModal() {
    const block = checkTempBlock();
    if (block.blocked) {
        showToast(block.reason, true);
        return;
    }
    if (currentBlocked) {
        showToast('❌ حسابك محظور نهائياً!', true);
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
    
    const confirmed = await Swal.fire({
        title: 'تأكيد إنشاء الجميل',
        html: '⚠️ <strong>تحذير هام!</strong><br><br>هل قمت بإنشاء حساب Gmail بنفس البيانات الموضحة أعلاه؟<br><br>في حالة التلاعب أو إرسال بيانات غير صحيحة،<br>سيتم <strong>رفض الحساب وحظر حسابك نهائياً</strong>',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: '✅ نعم، تم الإنشاء',
        cancelButtonText: '❌ إلغاء'
    });
    
    if (!confirmed.isConfirmed) return;
    
    setButtonLoading('confirmCreateBtn', true, 'جاري الإرسال...');
    const result = await callAPI('submitGmail', {
        phone: cleanPhone(currentUser.phone),
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
        Swal.fire({
            icon: 'success',
            title: 'تم الإرسال!',
            text: 'سيتم مراجعة الجميل خلال 2-4 أيام',
            timer: 2000,
            showConfirmButton: false
        });
    } else {
        showToast(result?.error || 'حدث خطأ أثناء الإرسال', true);
    }
}

// ========================================
// سحب الأموال
// ========================================

function showWithdrawModal() {
    if (currentBlocked) {
        showToast('❌ حسابك محظور! لا يمكنك سحب الأموال', true);
        return;
    }
    document.getElementById('availableBalanceHint').textContent = currentBalance;
    document.getElementById('withdrawModal').classList.remove('hidden');
}

async function submitWithdrawRequest() {
    const wallet = document.getElementById('walletNumber')?.value.trim();
    const amount = parseFloat(document.getElementById('withdrawAmount')?.value || 0);
    const fee = 5;
    const totalDeduction = amount + fee;
    
    if (!wallet) {
        showToast('الرجاء إدخال رقم المحفظة', true);
        return;
    }
    if (isNaN(amount) || amount <= 0) {
        showToast('الرجاء إدخال مبلغ صحيح', true);
        return;
    }
    if (amount < 30) {
        showToast('الحد الأدنى للسحب هو 30 جنيه', true);
        return;
    }
    if (totalDeduction > currentBalance) {
        showToast(`الرصيد غير كافٍ. المطلوب: ${totalDeduction} ج.م (${amount} + ${fee} مصاريف)`, true);
        return;
    }
    
    const confirmWithdraw = await Swal.fire({
        title: 'تأكيد سحب الأموال',
        html: `المبلغ المطلوب: ${amount} ج.م<br>مصاريف السحب: ${fee} ج.م<br><strong>الصافي المستلم: ${amount} ج.م</strong><br><br>سيتم خصم ${totalDeduction} ج.م من رصيدك`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: '✅ تأكيد السحب',
        cancelButtonText: '❌ إلغاء'
    });
    
    if (!confirmWithdraw.isConfirmed) return;
    
    setButtonLoading('submitWithdrawBtn', true);
    const result = await callAPI('submitWithdrawal', {
        phone: cleanPhone(currentUser.phone),
        wallet: wallet,
        amount: amount,
        fee: fee
    });
    setButtonLoading('submitWithdrawBtn', false);
    
    if (result && result.success === true) {
        await loadBalance();
        document.getElementById('withdrawModal').classList.add('hidden');
        document.getElementById('walletNumber').value = '';
        document.getElementById('withdrawAmount').value = '';
        Swal.fire({
            icon: 'success',
            title: 'تم إرسال طلب السحب',
            text: `تم خصم ${result.deducted || totalDeduction} ج.م من رصيدك. سيتم المراجعة خلال 2-4 أيام`,
            timer: 2500,
            showConfirmButton: false
        });
    } else {
        showToast(result?.error || 'حدث خطأ أثناء إرسال طلب السحب', true);
    }
}

// ========================================
// عرض السجلات
// ========================================

async function showGmailLogs() {
    if (!currentUser) return;
    
    setButtonLoading('gmailLogsBtn', true);
    const result = await callAPI('getMyGmails', { phone: cleanPhone(currentUser.phone) });
    setButtonLoading('gmailLogsBtn', false);
    
    if (result?.success && result.gmails) {
        const filter = document.getElementById('gmailStatusFilter')?.value || 'all';
        let filtered = result.gmails;
        if (filter !== 'all') {
            filtered = result.gmails.filter(g => g.status === filter);
        }
        
        const tbody = document.getElementById('gmailLogsBody');
        if (filtered.length === 0) {
            tbody.innerHTML = '<tr><td colspan="3" class="no-data">📭 لا توجد جميلات<\/td><\/tr>';
        } else {
            tbody.innerHTML = filtered.reverse().map(rec => {
                let statusText = '', statusClass = '';
                if (rec.status === 'Pending') { statusText = '⏳ قيد المراجعة'; statusClass = 'status-pending'; }
                else if (rec.status === 'Approved') { statusText = '✅ مقبول'; statusClass = 'status-approved'; }
                else if (rec.status === 'Rejected') { statusText = '❌ مرفوض'; statusClass = 'status-rejected'; }
                const email = rec.gmail.replace('@gmail.com', '');
                const date = new Date(rec.timestamp).toLocaleDateString('ar-EG');
                return `<tr><td style="direction:ltr">${email}<\/td><td><span class="status-badge ${statusClass}">${statusText}<\/span><\/td><td>${date}<\/td><\/tr>`;
            }).join('');
        }
        document.getElementById('gmailLogsModal').classList.remove('hidden');
    } else {
        showToast('حدث خطأ في تحميل السجلات', true);
    }
}

async function showWithdrawLogs() {
    if (!currentUser) return;
    
    setButtonLoading('withdrawLogsBtn', true);
    const result = await callAPI('getMyWithdrawals', { phone: cleanPhone(currentUser.phone) });
    setButtonLoading('withdrawLogsBtn', false);
    
    if (result?.success && result.withdrawals) {
        const filter = document.getElementById('withdrawStatusFilter')?.value || 'all';
        let filtered = result.withdrawals;
        if (filter !== 'all') {
            filtered = result.withdrawals.filter(w => w.status === filter);
        }
        
        const tbody = document.getElementById('withdrawLogsBody');
        if (filtered.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="no-data">📭 لا توجد سحوبات<\/td><\/tr>';
        } else {
            tbody.innerHTML = filtered.reverse().map(w => {
                let statusText = '', statusClass = '';
                if (w.status === 'Pending') { statusText = '⏳ قيد المراجعة'; statusClass = 'status-pending'; }
                else if (w.status === 'Completed') { statusText = '✅ مكتمل'; statusClass = 'status-completed'; }
                else if (w.status === 'Rejected') { statusText = '❌ مرفوض'; statusClass = 'status-rejected'; }
                const date = new Date(w.timestamp).toLocaleDateString('ar-EG');
                const netAmount = w.amount - (w.fee || 5);
                return `<tr><td>${w.wallet}<\/td><td>${w.amount} ج.م<\/td><td>${w.fee || 5} ج.م<\/td><td>${netAmount} ج.م<\/td><td><span class="status-badge ${statusClass}">${statusText}<\/span><\/td><td>${date}<\/td><\/tr>`;
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
    // ربط الأزرار
    document.getElementById('registerBtn')?.addEventListener('click', register);
    document.getElementById('showLoginBtn')?.addEventListener('click', showLoginScreen);
    document.getElementById('doLoginBtn')?.addEventListener('click', login);
    document.getElementById('showRegisterBtn')?.addEventListener('click', showRegisterScreen);
    document.getElementById('logoutBtn')?.addEventListener('click', logout);
    document.getElementById('createGmailBtn')?.addEventListener('click', showCreateGmailModal);
    document.getElementById('confirmCreateBtn')?.addEventListener('click', confirmGmailCreation);
    document.getElementById('withdrawBtn')?.addEventListener('click', showWithdrawModal);
    document.getElementById('submitWithdrawBtn')?.addEventListener('click', submitWithdrawRequest);
    document.getElementById('gmailLogsBtn')?.addEventListener('click', showGmailLogs);
    document.getElementById('withdrawLogsBtn')?.addEventListener('click', showWithdrawLogs);
    
    // إغلاق النوافذ المنبثقة
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.target.closest('.modal')?.classList.add('hidden');
        });
    });
    
    window.addEventListener('click', (e) => {
        if (e.target.classList?.contains('modal')) {
            e.target.classList.add('hidden');
        }
    });
    
    // فلترة السجلات
    document.getElementById('gmailStatusFilter')?.addEventListener('change', showGmailLogs);
    document.getElementById('withdrawStatusFilter')?.addEventListener('change', showWithdrawLogs);
    
    // التحقق من وجود جلسة نشطة
    window.copyToClipboard = copyToClipboard;
    window.togglePass = togglePass;
    
    const savedPhone = localStorage.getItem('userPhone');
    const savedPassword = localStorage.getItem('userPassword');
    
    if (savedPhone && savedPassword) {
        currentUser = { phone: savedPhone };
        const result = await callAPI('login', { phone: cleanPhone(savedPhone), pass: savedPassword });
        if (result && result.result === "found") {
            currentUser = { phone: result.phone, name: result.name };
            currentBalance = parseFloat(result.balance) || 0;
            currentPendingBalance = parseFloat(result.pendingBalance) || 0;
            currentBlocked = result.blocked === "TRUE";
            
            document.getElementById('balance').textContent = currentBalance;
            document.getElementById('pendingBalance').textContent = currentPendingBalance;
            
            if (!currentBlocked) {
                await loadServicePrice();
                showMainScreen();
                startBalanceUpdates();
            } else {
                showLoginScreen();
            }
        } else {
            showLoginScreen();
        }
    } else {
        showRegisterScreen();
    }
}

window.addEventListener('DOMContentLoaded', init);
