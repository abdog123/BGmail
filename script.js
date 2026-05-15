// ========================================
// B Gmail - script.js (النسخة النهائية الكاملة)
// ========================================

const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwhqm0X3ZotU1CTxYyPDWgESbQPJuCvcs4MkGjgyPNXB4M7pUot_L1DsIk6bAF8lQHv/exec';

let currentUser = null;
let currentBalance = 0;
let currentPendingBalance = 0;
let currentBlocked = false;
let currentStatusText = "نشط";
let gmailPrice = 0;
let balanceUpdateInterval = null;

// نظام الحظر المؤقت
let tempBlockUntil = null;
let gmailCreationHistory = [];
let usedGmailHistory = [];

// حفظ بيانات إنشاء الجميل بشكل دائم
let currentGeneratedData = null;
let isRequestLocked = false;

// ========================================
// الأسماء الكاملة (كل الأسماء التي بعثتها)
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
    "Hannah Ward", "Caleb Murphy", "Leah Peterson", "Elijah Baker", "Victoria Phillips",
    "Pierre Dubois", "Marie Lefebvre", "Louis Moreau", "Sophie Laurent", "Jean Dupont",
    "Claire Rousseau", "Paul Martin", "Chloé Blanc", "Jacques Girard", "Isabelle Dumont",
    "Friedrich Müller", "Anna Schmidt", "Hans Weber", "Julia Fischer", "Karl Braun",
    "Laura Wagner", "Wilhelm Koch", "Lena Zimmer", "Stefan Klein", "Eva Wolf",
    "Max Becker", "Nora Schmidt", "Franz Meyer", "Lena Fischer", "Erik Richter",
    "Johanna Hartmann", "Christian Schulz", "Maria Klein", "Georg Schneider", "Emma Keller",
    "Marco Rossi", "Sofia Bianchi", "Luca Ferrari", "Giulia Romano", "Giovanni Greco",
    "Alessia Conti", "Matteo Esposito", "Valentina Morelli", "Alessandro Ricci", "Serena Galli",
    "Miguel Martínez", "Isabel López", "Javier García", "Ana Fernández", "Alejandro Ruiz",
    "Marta Gómez", "Carlos Herrera", "Elena Vargas", "Sergio Morales", "Paula Romero",
    "Ivan Petrov", "Olga Ivanova", "Dmitry Sokolov", "Natalia Orlova", "Alexei Kuznetsov",
    "Maria Pavlova", "Sergei Popov", "Elena Mikhailova", "Nikolai Smirnov", "Irina Fedorova",
    "Wei Zhang", "Li Wei", "Chen Liu", "Mei Wang", "Jian Zhang", "Ling Chen",
    "Hao Yang", "Yumi Li", "Jun Xu", "Xia Chen", "Mustafa Yılmaz", "Elif Demir",
    "Ahmet Kaya", "Zeynep Yurt", "Mehmet Aslan", "Selin Yılmaz", "Hasan Korkmaz",
    "Derya Çelik", "Emre Yalçın", "Aylin Karaca", "Hakan Özkan", "Esra Akman",
    "Raj Patel", "Priya Sharma", "Arun Gupta", "Aarti Desai", "Vijay Kumar",
    "Sunita Rao", "Amit Mehta", "Neha Agarwal", "Carlos Silva", "Maria Oliveira",
    "João Santos", "Ana Costa", "Pedro Almeida", "Beatriz Rodrigues", "Luis Pereira",
    "Fernanda Martins", "Marcos Lima", "Juliana Sousa", "Rafael Carvalho", "Larissa Ferreira",
    "Liam Gallagher", "Ava Fitzgerald", "Noah Anderson", "Emily Davidson", "Ethan Brooks",
    "Sophia Carter", "Logan Harris", "Mia Palmer", "Mason Gray", "Isabella Bennett",
    "Olivia Wood", "Ethan Clarke", "Isabella Scott", "Gabriel Hunter", "Zoe Green",
    "Ryan Carter", "Emily Lewis", "Lucas Bennett", "Chloe Adams", "Jack Anderson",
    "Luca Martini", "Julia Roberts", "James Carter", "Lily Adams", "Henry Clarke",
    "Ava Martinez", "William Johnson", "Mia Wilson", "Alexander Thompson", "Ella White",
    "Samuel Evans", "Charlotte King", "Oliver Davis", "Grace Lee", "Noah Scott",
    "Zoe Harris", "Daniel Roberts", "Sofia Moore", "Thomas Harris", "Lily Robinson",
    "Gabriella Ortiz", "Marco Lombardi", "Elena Rossi", "Victor Alvarado", "Ana Silva",
    "Marcus Dupuis", "Chloe Watson", "Ryan Lee", "Amelia Peterson", "William Johnson",
    "Sophie Kim", "Hugo Moreno", "Natalie Smith", "Eli Garcia", "Mia Perez",
    "Olivia Rodriguez", "Adrian Lopez", "Isla Martin", "Sebastian Clarke", "Maya Sanders",
    "Evelyn Lewis", "Asher Walker", "Lily Martinez", "Leo Young", "Ella Foster",
    "Emily Rivera", "Jacob Murphy", "Clara Evans", "Adam King", "Mila James",
    "Nathan Roberts", "Anna Collins", "Henry Walker", "Sophie Davis", "Leo Johnson",
    "Isabella Stewart", "Liam Young", "Nora Bennett", "Lucas Garcia", "Sofia Allen",
    "William Edwards", "Grace Harris", "Jack Robinson", "Mia Sanchez", "Oliver Green",
    "Ella Hughes", "Gabriel Adams", "Aria Brooks", "Noah White", "Ava Morgan",
    "Maya Campbell", "Samuel Moore", "Layla Rogers", "Anthony Ward", "Hannah Sanders",
    "Isaac Peterson", "Ruby Ramirez", "Lucas Johnson", "Eliana Sullivan", "Evan Murphy",
    "Alice White", "Owen Thompson", "Emily Harris", "Gabriel Reed", "Ava Lee",
    "Liam Bennett", "Zoe Parker", "Sebastian Morris", "Lily Gray", "Julian Rivera",
    "Harper James", "Leo Collins", "Anna Ramirez", "Nathan Taylor", "Amelia Adams",
    "Henry Roberts", "Scarlett Clark", "Elijah Anderson", "Chloe Morris", "Oliver Hughes",
    "Isla Parker", "Jacob White", "Mia Evans", "Jack Edwards", "Emily Young",
    "Lucas Scott", "Ava Hill", "Daniel Mitchell", "Natalie Martin", "Henry Wilson",
    "Isabella Rodriguez", "Alexander Moore", "Lily Phillips", "Samuel Roberts", "Charlotte Gray",
    "Ethan Wright", "Emma Young", "James Johnson", "Sophia Bennett", "Benjamin White",
    "Nora Roberts", "Leo Evans", "Aria Davis", "William Walker", "Mia Lewis",
    "Gabriel Green", "Evelyn Scott", "Lucas Allen", "Isabella Hughes", "Samuel Clark",
    "Charlotte Lopez", "Jack Harris", "Lily Sanders", "James Turner", "Amelia Brooks",
    "Noah Cooper", "Ava Turner", "Lucas Evans", "Emily Ross", "Benjamin Martin",
    "Sophia Taylor", "Jack Allen", "Ella Moore", "William Martin", "Mia Wright",
    "Samuel Johnson", "Chloe Davis", "Ethan Davis", "Aria Campbell", "Elijah Thompson",
    "Lily Martinez", "Jacob Young", "Grace Taylor", "Nathan White", "Emma Stewart",
    "James Green", "Olivia Adams", "Henry Lewis", "Mia Ross", "Daniel Walker",
    "Charlotte Anderson", "Alexander Thomas", "Amelia Carter", "Leo White", "Aria Harris",
    "William Davis", "Lily Johnson", "Samuel Walker", "Sophia King", "Lucas Wilson",
    "Zoe Thompson", "Ethan Green", "Emily Evans", "Jack Lewis", "Ava Wright",
    "Gabriel Clark", "Mia Martin", "Oliver Davis"
];

// ========================================
// بادئات الجميل (كما بعثتها بدون dots أو @gmail.com)
// ========================================

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
    "hannahward", "calebmurphy", "leahpeterson", "elijahbaker", "victoriaphillips",
    "pierredubois", "marielefebvre", "luismoreau", "sophielaurent", "jeandupont",
    "clairerousseau", "paulmartin", "chloeblanc", "jacquesgirard", "isabelledumont",
    "friedrichmüller", "annaschmidt", "hansweber", "juliafischer", "karlbraun",
    "laurawagner", "wilhelmkoch", "lenazimmer", "stefanklein", "evawolf",
    "maxbecker", "noraschmidt", "franzmeyer", "lenafischer", "erikrichter",
    "johannahartmann", "christianschulz", "mariaklein", "georgschneider", "emmakeller",
    "marcorossi", "sofiabianchi", "lucaferrari", "giuliaromano", "giovannigreco",
    "alessiaconti", "matteoesposito", "valentinamorelli", "alessandroricci", "serenagalli",
    "miguelmartinez", "isabellopez", "javiergarcia", "anafernandez", "alejandroruiz",
    "martagomez", "carlosherrera", "elenavargas", "sergiomorales", "paularomero",
    "ivanpetrov", "olgaivanova", "dmitrysokolov", "nataliaorlova", "alexeikuznetsov",
    "mariapavlova", "sergeipopov", "elenamikhailova", "nikolaismirnov", "irinafedorova",
    "weizhang", "liwei", "chenliu", "meiwang", "jianzhang", "lingchen",
    "haoyang", "yumili", "junxu", "xiachen", "mustafayilmaz", "elifdemir",
    "ahmetkaya", "zeynepyurt", "mehmetaslan", "selinyilmaz", "hasankorkmaz",
    "deryacelik", "emreyalcin", "aylinkaraca", "hakanözkan", "esraakman",
    "rajpatel", "priyasharma", "arungupta", "aartidesai", "vijaykumar",
    "sunitarao", "amitmehta", "nehaagarwal", "carlossilva", "mariaoliveira",
    "joaosantos", "anacosta", "pedroalmeida", "beatrizrodrigues", "luispereira",
    "fernandamartins", "marcoslima", "julianasousa", "rafaelcarvalho", "larissaferreira",
    "liamgallagher", "avafitzgerald", "noahanderson", "emilydavidson", "ethanbrooks",
    "sophiacarter", "loganharris", "miapalmer", "masongray", "isabellabennett",
    "oliviawood", "ethanclarke", "isabellascott", "gabrielhunter", "zoegreen",
    "ryancarter", "emilylewis", "lucasbennett", "chloeadams", "jackanderson",
    "lucamartini", "juliaroberts", "jamescarter", "lilyadams", "henryclarke",
    "avamartinez", "williamjohnson", "miawilson", "alexanderthompson", "ellawhite",
    "samuelevans", "charlotteking", "oliverdavis", "gracelee", "noahscott",
    "zoeharris", "danielroberts", "sofiamoore", "thomasharris", "lilyrobinson",
    "gabriellaortiz", "marcolombardi", "elenarossi", "victoralvarado", "anasilva",
    "marcusdupuis", "chloewatson", "ryanlee", "ameliapeterson", "williamjohnson",
    "sophiekim", "hugomoreno", "nataliesmith", "eligarcia", "miaperez",
    "oliviarodriguez", "adrianlopez", "islamartin", "sebastianclarke", "mayasanders",
    "evelynlewis", "asherwalker", "lilymartinez", "leoyoung", "ellafoster",
    "emilyrivera", "jacobmurphy", "claraevans", "adamking", "milajames",
    "nathanroberts", "annacollins", "henrywalker", "sophiedavis", "leojohnson",
    "isabellastewart", "liamyoung", "norabennett", "lucasgarcia", "sofiaallen",
    "williamedwards", "graceharris", "jackrobinson", "miasanchez", "olivergreen",
    "ellahughes", "gabrieladams", "ariabrooks", "noahwhite", "avamorgan",
    "mayacampbell", "samuelmoore", "laylarogers", "anthonyward", "hannahsanders",
    "isaacpeterson", "rubyramirez", "lucasjohnson", "elianasullivan", "evanmurphy",
    "alicewhite", "owenthompson", "emilyharris", "gabrielreed", "avalee",
    "liambennett", "zoeparker", "sebastianmorris", "lilygray", "julianrivera",
    "harperjames", "leocollins", "annaramirez", "nathantaylor", "ameliaadams",
    "henryroberts", "scarlettclark", "elijahanderson", "chloemorris", "oliverhughes",
    "islaparker", "jacobwhite", "miaevans", "jackedwards", "emilyyoung",
    "lucasscott", "avahill", "danielmitchell", "nataliemartin", "henrywilson",
    "isabellarodriguez", "alexandermoore", "lilyphillips", "samuelroberts", "charlottegray",
    "ethanwright", "emmayoung", "jamesjohnson", "sophiabennett", "benjaminwhite",
    "noraroberts", "leoevans", "ariadavis", "williamwalker", "mialewis",
    "gabrielgreen", "evelynscott", "lucasallen", "isabellahughes", "samuelclark",
    "charlottelopez", "jackharris", "lilysanders", "jamesturner", "ameliabrooks",
    "noahcooper", "avaturner", "lucasevans", "emilyross", "benjaminmartin",
    "sophiataylor", "jackallen", "ellamoore", "williammartin", "miawright",
    "samueljohnson", "chloedavis", "ethandavis", "ariacampbell", "elijahthompson",
    "lilymartinez", "jacobyoung", "gracetaylor", "nathanwhite", "emmastewart",
    "jamesgreen", "oliviaadams", "henrylewis", "miaross", "danielwalker",
    "charlotteanderson", "alexanderthomas", "ameliacarter", "leowhite", "ariaharris",
    "williamdavis", "lilyjohnson", "samuelwalker", "sophiaking", "lucaswilson",
    "zoethompson", "ethangreen", "emilyevans", "jacklewis", "avawright",
    "gabrielclark", "miamartin", "oliverdavis"
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
// حفظ واستعادة بيانات إنشاء الجميل
// ========================================

function saveGmailRequestPermanently(data) {
    if (data) {
        const saveData = {
            name: data.name,
            gmail: data.gmail,
            password: data.password,
            gender: data.gender,
            birthYear: data.birthYear,
            timestamp: new Date().toISOString()
        };
        localStorage.setItem('permanentGmailRequest', JSON.stringify(saveData));
        localStorage.setItem('isRequestLocked', 'true');
        isRequestLocked = true;
    }
}

function loadPermanentGmailRequest() {
    const saved = localStorage.getItem('permanentGmailRequest');
    const locked = localStorage.getItem('isRequestLocked');
    if (saved && locked === 'true') {
        try {
            isRequestLocked = true;
            return JSON.parse(saved);
        } catch (e) {
            return null;
        }
    }
    return null;
}

function clearPermanentGmailRequest() {
    localStorage.removeItem('permanentGmailRequest');
    localStorage.removeItem('isRequestLocked');
    isRequestLocked = false;
    currentGeneratedData = null;
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
    
    if (!phone || phone.length < 10 || !name || !password || password.length < 4 || password !== confirmPassword) {
        showToast('يرجى التحقق من جميع البيانات', true);
        return;
    }
    
    setButtonLoading('registerBtn', true);
    const result = await callAPI('signup', { name, phone: cleanPhone(phone), pass: password });
    setButtonLoading('registerBtn', false);
    
    if (result?.result === "success") {
        Swal.fire({ icon: 'success', title: 'تم التسجيل بنجاح!', timer: 2000, showConfirmButton: false });
        showLoginScreen();
    } else if (result?.result === "exists") {
        Swal.fire('تنبيه', 'هذا الرقم مسجل مسبقاً', 'info');
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
    
    if (result?.result === "found") {
        localStorage.setItem('userPhone', result.phone);
        localStorage.setItem('userPassword', password);
        localStorage.setItem('userName', result.name);
        currentUser = { phone: result.phone, name: result.name };
        currentBalance = parseFloat(result.balance) || 0;
        currentPendingBalance = parseFloat(result.pendingBalance) || 0;
        currentBlocked = result.blocked === "TRUE";
        currentStatusText = result.statusText || "نشط";
        
        document.getElementById('balance').textContent = currentBalance;
        document.getElementById('pendingBalance').textContent = currentPendingBalance;
        
        if (currentBlocked) {
            Swal.fire('محظور', 'حسابك محظور', 'error');
            return false;
        }
        
        await loadServicePrice();
        showMainScreen();
        startBalanceUpdates();
        
        const savedRequest = loadPermanentGmailRequest();
        if (savedRequest && !currentGeneratedData && isRequestLocked) {
            setTimeout(() => {
                Swal.fire({
                    title: '📦 لديك طلب Gmail غير مكتمل',
                    text: 'هل تريد استئناف إنشاء الجميل السابق؟',
                    icon: 'question',
                    showCancelButton: true,
                    confirmButtonText: '✅ نعم',
                    cancelButtonText: '❌ لا',
                    allowOutsideClick: false
                }).then((res) => {
                    if (res.isConfirmed) {
                        currentGeneratedData = savedRequest;
                        displayGmailData(currentGeneratedData);
                        document.getElementById('createModal').classList.remove('hidden');
                    } else {
                        clearPermanentGmailRequest();
                    }
                });
            }, 500);
        }
        
        Swal.fire({ icon: 'success', title: `أهلاً بك ${result.name}`, timer: 1500, showConfirmButton: false });
        return true;
    } else if (result?.result === "wrong_pass") {
        Swal.fire('خطأ', 'كلمة المرور غير صحيحة', 'error');
        return false;
    } else {
        Swal.fire('غير موجود', 'الرقم غير مسجل', 'warning');
        showRegisterScreen();
        return false;
    }
}

// ========================================
// تسجيل الخروج
// ========================================

function logout() {
    if (isRequestLocked && currentGeneratedData) {
        Swal.fire({
            title: 'تنبيه',
            text: 'لديك طلب Gmail غير مكتمل. سيتم حفظه ويمكنك استئنافه لاحقاً.',
            icon: 'info',
            confirmButtonText: 'حسناً'
        });
        saveGmailRequestPermanently(currentGeneratedData);
    }
    stopBalanceUpdates();
    localStorage.removeItem('userPhone');
    localStorage.removeItem('userPassword');
    localStorage.removeItem('userName');
    currentUser = null;
    showLoginScreen();
    showToast('👋 تم تسجيل الخروج', false);
}

// ========================================
// جلب الرصيد والأسعار
// ========================================

async function loadBalance() {
    if (!currentUser) return;
    const result = await callAPI('getBalance', { phone: cleanPhone(currentUser.phone) });
    if (result?.success) {
        currentBalance = parseFloat(result.balance) || 0;
        currentPendingBalance = parseFloat(result.pendingBalance) || 0;
        currentBlocked = result.blocked === "TRUE";
        currentStatusText = result.statusText || "نشط";
        document.getElementById('balance').textContent = currentBalance;
        document.getElementById('pendingBalance').textContent = currentPendingBalance;
        currentBlocked ? disableAllButtons() : enableAllButtons();
    }
}

async function loadServicePrice() {
    const result = await callAPI('getServicePrice', { service: 'Gmail' });
    gmailPrice = (result?.success && result.price) ? parseFloat(result.price) : 8;
    document.getElementById('servicePrice').textContent = gmailPrice + ' ج.م';
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
    ['createGmailBtn', 'withdrawBtn', 'gmailLogsBtn', 'withdrawLogsBtn'].forEach(id => {
        const btn = document.getElementById(id);
        if (btn) btn.disabled = true;
    });
}

function enableAllButtons() {
    ['createGmailBtn', 'withdrawBtn', 'gmailLogsBtn', 'withdrawLogsBtn'].forEach(id => {
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
// إنشاء Gmail مع رفع الصورة
// ========================================

function displayGmailData(data) {
    document.getElementById('generatedName').innerHTML = `${data.name} <button class="copy-btn" onclick="copyToClipboard('${data.name.replace(/'/g, "\\'")}', 'الاسم')">📋 نسخ</button>`;
    document.getElementById('generatedGmail').innerHTML = `${data.gmail} <button class="copy-btn" onclick="copyToClipboard('${data.gmail.replace(/'/g, "\\'")}', 'البريد')">📋 نسخ</button>`;
    document.getElementById('generatedPassword').innerHTML = `${data.password} <button class="copy-btn" onclick="copyToClipboard('${data.password.replace(/'/g, "\\'")}', 'كلمة السر')">📋 نسخ</button>`;
    document.getElementById('generatedGenderAge').textContent = `${data.gender} / ${data.birthYear}`;
}

async function changeGmail() {
    if (!currentGeneratedData) {
        showToast('لا يوجد طلب نشط لتغييره', true);
        return;
    }
    
    const result = await Swal.fire({
        title: '🔄 تغيير الجميل',
        html: '<strong>هل الجميل مستخدم أو تريد تغييره؟</strong><br><br>سيتم إنشاء بريد جديد بدلاً من الحالي.',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: '✅ نعم، تغيير',
        cancelButtonText: '❌ إلغاء'
    });
    
    if (!result.isConfirmed) return;
    
    const newGmailData = {
        name: currentGeneratedData.name,
        gmail: generateUniqueGmail(),
        password: PASSWORDS_LIST[0],
        gender: currentGeneratedData.gender,
        birthYear: currentGeneratedData.birthYear
    };
    
    currentGeneratedData = newGmailData;
    saveGmailRequestPermanently(currentGeneratedData);
    displayGmailData(currentGeneratedData);
    showToast('✅ تم تغيير البريد الإلكتروني بنجاح', false);
}

async function showCreateGmailModal() {
    if (isRequestLocked && currentGeneratedData) {
        Swal.fire({
            title: '⚠️ لديك طلب قيد الإنشاء',
            text: 'يرجى إكمال الطلب الحالي أو تغييره أولاً',
            icon: 'warning',
            confirmButtonText: 'حسناً'
        });
        if (currentGeneratedData) {
            displayGmailData(currentGeneratedData);
            document.getElementById('createModal').classList.remove('hidden');
        }
        return;
    }
    
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
    isRequestLocked = true;
    saveGmailRequestPermanently(currentGeneratedData);
    setButtonLoading('createGmailBtn', false);
    
    displayGmailData(currentGeneratedData);
    document.getElementById('createModal').classList.remove('hidden');
}

async function confirmGmailCreation() {
    if (!currentGeneratedData) return;
    
    const fileInput = document.getElementById('gmailScreenshot');
    if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
        showToast('❌ يرجى رفع صورة سكرين شوت لحساب Gmail الجديد', true);
        return;
    }
    
    const confirmed = await Swal.fire({
        title: 'تأكيد إنشاء الجميل',
        html: '⚠️ <strong>تحذير هام!</strong><br><br>هل قمت بإنشاء حساب Gmail بنفس البيانات الموضحة أعلاه؟<br><br>📸 <strong>ملاحظة مهمة:</strong><br>يرجى الاحتفاظ بالصورة (سكرين شوت) لحين تحويل المبلغ من الرصيد المتجمد إلى الرصيد الحالي.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: '✅ نعم، تم الإنشاء',
        cancelButtonText: '❌ إلغاء'
    });
    
    if (!confirmed.isConfirmed) {
        saveGmailRequestPermanently(currentGeneratedData);
        showToast('📦 تم حفظ طلب Gmail الخاص بك، يمكنك استئنافه لاحقاً', false);
        document.getElementById('createModal').classList.add('hidden');
        return;
    }
    
    setButtonLoading('confirmCreateBtn', true);
    
    const file = fileInput.files[0];
    const fullGmail = currentGeneratedData.gmail + '@gmail.com';
    
    // 1. إرسال بيانات الجميل أولاً
    const result = await callAPI('submitGmail', {
        phone: cleanPhone(currentUser.phone),
        fullName: currentGeneratedData.name,
        gmail: fullGmail,
        password: currentGeneratedData.password,
        price: gmailPrice
    });
    
    if (!result?.success) {
        setButtonLoading('confirmCreateBtn', false);
        showToast(result?.error || 'حدث خطأ', true);
        return;
    }
    
    // 2. رفع الصورة
    const formData = new FormData();
    formData.append('action', 'uploadImage');
    formData.append('phone', cleanPhone(currentUser.phone));
    formData.append('gmail', fullGmail);
    formData.append('imageBlob', file);
    
    try {
        await fetch(SCRIPT_URL, {
            method: 'POST',
            body: formData
        });
    } catch (error) {
        console.error('Upload error:', error);
    }
    
    setButtonLoading('confirmCreateBtn', false);
    recordGmailCreation();
    await loadBalance();
    document.getElementById('createModal').classList.add('hidden');
    clearPermanentGmailRequest();
    
    Swal.fire({
        icon: 'success',
        title: 'تم الإرسال بنجاح!',
        html: 'سيتم مراجعة الجميل خلال 2-4 أيام.<br><br>📸 <strong>تذكير هام:</strong><br>يرجى الاحتفاظ بالصورة (سكرين شوت) لحين تحويل المبلغ من الرصيد المتجمد إلى الرصيد الحالي.',
        timer: 5000,
        showConfirmButton: true
    });
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
    const fee = 5;
    const totalDeduction = amount + fee;
    
    if (!wallet || isNaN(amount) || amount <= 0 || amount < 30 || totalDeduction > currentBalance) {
        showToast('يرجى التحقق من البيانات والمبلغ', true);
        return;
    }
    
    const confirmWithdraw = await Swal.fire({
        title: 'تأكيد سحب الأموال',
        html: `المبلغ: ${amount} ج.م<br>المصاريف: ${fee} ج.م<br><strong>الصافي: ${amount} ج.م</strong>`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: '✅ تأكيد',
        cancelButtonText: '❌ إلغاء'
    });
    
    if (!confirmWithdraw.isConfirmed) return;
    
    setButtonLoading('submitWithdrawBtn', true);
    const result = await callAPI('submitWithdrawal', { phone: cleanPhone(currentUser.phone), wallet, amount, fee });
    setButtonLoading('submitWithdrawBtn', false);
    
    if (result?.success) {
        await loadBalance();
        document.getElementById('withdrawModal').classList.add('hidden');
        document.getElementById('walletNumber').value = '';
        document.getElementById('withdrawAmount').value = '';
        Swal.fire({ icon: 'success', title: 'تم إرسال طلب السحب', timer: 2500, showConfirmButton: false });
    } else {
        showToast(result?.error || 'حدث خطأ', true);
    }
}

// ========================================
// عرض السجلات للمستخدم
// ========================================

async function showGmailLogs() {
    if (!currentUser) return;
    setButtonLoading('gmailLogsBtn', true);
    const result = await callAPI('getMyGmails', { phone: cleanPhone(currentUser.phone) });
    setButtonLoading('gmailLogsBtn', false);
    
    if (result?.success && result.gmails) {
        const filter = document.getElementById('gmailStatusFilter')?.value || 'all';
        let filtered = result.gmails;
        if (filter !== 'all') filtered = result.gmails.filter(g => g.status === filter);
        
        const tbody = document.getElementById('gmailLogsBody');
        if (filtered.length === 0) {
            tbody.innerHTML = '<td><td colspan="3" class="no-data">📭 لا توجد جميلات<\/td><\/tr>';
        } else {
            tbody.innerHTML = filtered.reverse().map(rec => {
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
                const email = rec.gmail.replace('@gmail.com', '');
                const date = new Date(rec.timestamp).toLocaleDateString('ar-EG');
                return `
                    <tr>
                        <td style="direction:ltr">${email}@gmail.com<\/td>
                        <td><span class="status-badge ${statusClass}">${statusText}<\/span><\/td>
                        <td>${date}<\/td>
                    <\/tr>
                `;
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
        if (filter !== 'all') filtered = result.withdrawals.filter(w => w.status === filter);
        
        const tbody = document.getElementById('withdrawLogsBody');
        if (filtered.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="no-data">📭 لا توجد سحوبات<\/td><\/tr>';
        } else {
            tbody.innerHTML = filtered.reverse().map(w => {
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
                const date = new Date(w.timestamp).toLocaleDateString('ar-EG');
                const netAmount = w.amount - (w.fee || 5);
                return `
                    <tr>
                        <td>${w.wallet}<\/td>
                        <td>${w.amount} ج.م<\/td>
                        <td>${w.fee || 5} ج.م<\/td>
                        <td>${netAmount} ج.م<\/td>
                        <td><span class="status-badge ${statusClass}">${statusText}<\/span><\/td>
                        <td>${date}<\/td>
                    <\/tr>
                `;
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
    document.getElementById('registerBtn')?.addEventListener('click', register);
    document.getElementById('showLoginBtn')?.addEventListener('click', showLoginScreen);
    document.getElementById('doLoginBtn')?.addEventListener('click', login);
    document.getElementById('showRegisterBtn')?.addEventListener('click', showRegisterScreen);
    document.getElementById('logoutBtn')?.addEventListener('click', logout);
    document.getElementById('createGmailBtn')?.addEventListener('click', showCreateG
