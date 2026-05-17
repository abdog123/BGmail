// ========================================
// Genezis Gmail - script.js (مع نظام الحظر المؤقت)
// ========================================

const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwhqm0X3ZotU1CTxYyPDWgESbQPJuCvcs4MkGjgyPNXB4M7pUot_L1DsIk6bAF8lQHv/exec';

// نظام الحظر المؤقت (Rate Limiting)
let tempBlockUntil = null;
let gmailCreationHistory = [];

let currentUser = null;
let currentBalance = 0;
let currentPendingBalance = 0;
let currentBlocked = false;
let currentStatusText = "نشط";
let gmailPrice = 0;
let balanceUpdateInterval = null;

let usedGmailHistory = [];
let currentGeneratedData = null;
let isRequestLocked = false;

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
// دوال نظام الحظر المؤقت (جديدة)
// ========================================

function checkTempBlock() {
    if (currentBlocked) return { blocked: true, reason: "حسابك محظور نهائياً" };
    if (tempBlockUntil && new Date() < tempBlockUntil) {
        const remainingMinutes = Math.ceil((tempBlockUntil - new Date()) / 60000);
        return { blocked: true, reason: `⚠️ تم حظرك مؤقتاً بسبب إنشاء جميلات كثيرة في وقت قصير. يرجى الانتظار ${remainingMinutes} دقيقة`, permanent: false };
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
    
    // لو عمل أكثر من 3 جميلات في آخر دقيقة
    if (gmailCreationHistory.length > 3) {
        tempBlockUntil = new Date(now.getTime() + 3600000); // حظر لمدة ساعة
        showToast(`⚠️ تم حظرك مؤقتاً لمدة ساعة بسبب إنشاء جميلات كثيرة!`, true);
        return false;
    }
    return true;
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
    toast.style.background = isError ? 'linear-gradient(135deg, #dc3545, #b02a37)' : 'linear-gradient(135deg, #28a745, #1e7e34)';
    toast.classList.remove('hidden');
    setTimeout(() => toast.classList.add('hidden'), 3000);
}

function setButtonLoading(buttonId, isLoading, loadingText = 'جاري...') {
    const btn = document.getElementById(buttonId);
    if (!btn) return;
    if (isLoading) {
        btn._originalText = btn.innerHTML;
        btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> ${loadingText}`;
        btn.disabled = true;
        btn.style.opacity = '0.6';
    } else {
        btn.innerHTML = btn._originalText;
        btn.disabled = false;
        btn.style.opacity = '1';
    }
}

function togglePass(id) {
    const input = document.getElementById(id);
    if (input) {
        input.type = input.type === 'password' ? 'text' : 'password';
        const icon = input.nextElementSibling?.querySelector('i');
        if (icon) {
            icon.classList.toggle('fa-eye');
            icon.classList.toggle('fa-eye-slash');
        }
    }
}

function cleanPhone(phone) {
    let num = phone.toString().trim();
    while (num.startsWith('0')) {
        num = num.substring(1);
    }
    return num;
}

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

function copyToClipboardFromSpan(elementId) {
    const element = document.getElementById(elementId);
    if (!element || !element.textContent || element.textContent === '---') {
        showToast('لا يوجد نص للنسخ', true);
        return;
    }
    const text = element.textContent;
    navigator.clipboard.writeText(text).then(() => {
        showToast('✅ تم نسخ النص بنجاح');
    }).catch(() => {
        showToast('❌ فشل نسخ النص', true);
    });
}

// ========================================
// التحكم في الشاشات
// ========================================

function showLoginScreen() {
    document.getElementById('loginScreen').classList.remove('hidden');
    document.getElementById('registerScreen').classList.add('hidden');
    document.getElementById('mainScreen').classList.add('hidden');
}

function showRegisterScreen() {
    document.getElementById('loginScreen').classList.add('hidden');
    document.getElementById('registerScreen').classList.remove('hidden');
    document.getElementById('mainScreen').classList.add('hidden');
}

function showMainScreen() {
    document.getElementById('loginScreen').classList.add('hidden');
    document.getElementById('registerScreen').classList.add('hidden');
    document.getElementById('mainScreen').classList.remove('hidden');
}

// ========================================
// التسجيل
// ========================================

async function register() {
    const phone = document.getElementById('regPhone')?.value.trim();
    const name = document.getElementById('regName')?.value.trim();
    const password = document.getElementById('regPassword')?.value;
    const confirmPassword = document.getElementById('regConfirmPassword')?.value;
    
    if (!phone || phone.length < 10) {
        showToast('❌ رقم الهاتف غير صحيح', true);
        return;
    }
    if (!name) {
        showToast('❌ الرجاء إدخال الاسم الكامل', true);
        return;
    }
    if (!password || password.length < 4) {
        showToast('❌ كلمة المرور يجب أن تكون 4 أحرف على الأقل', true);
        return;
    }
    if (password !== confirmPassword) {
        showToast('❌ كلمة المرور غير متطابقة', true);
        return;
    }
    
    setButtonLoading('registerBtn', true);
    const result = await callAPI('signup', { name, phone: cleanPhone(phone), pass: password });
    setButtonLoading('registerBtn', false);
    
    if (result?.result === "success") {
        Swal.fire({
            icon: 'success',
            title: 'تم التسجيل بنجاح!',
            text: 'يمكنك الآن تسجيل الدخول إلى حسابك',
            background: '#12172f',
            color: '#fff',
            confirmButtonColor: '#667eea',
            timer: 2000,
            showConfirmButton: false
        });
        showLoginScreen();
    } else if (result?.result === "exists") {
        Swal.fire({
            title: 'تنبيه',
            text: 'هذا الرقم مسجل مسبقاً. يرجى تسجيل الدخول',
            icon: 'info',
            background: '#12172f',
            color: '#fff',
            confirmButtonColor: '#667eea'
        });
        showLoginScreen();
    } else {
        showToast('❌ فشل التسجيل، حاول مرة أخرى', true);
    }
}

// ========================================
// تسجيل الدخول
// ========================================

async function login() {
    const phone = document.getElementById('loginPhone')?.value.trim();
    const password = document.getElementById('loginPassword')?.value;
    
    if (!phone || !password) {
        showToast('❌ الرجاء إدخال رقم الهاتف وكلمة المرور', true);
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
        
        document.getElementById('balance').textContent = currentBalance;
        document.getElementById('pendingBalance').textContent = currentPendingBalance;
        
        const userNameEl = document.getElementById('userName');
        const userPhoneEl = document.getElementById('userPhone');
        if (userNameEl) userNameEl.textContent = result.name;
        if (userPhoneEl) userPhoneEl.textContent = result.phone;
        
        if (currentBlocked) {
            Swal.fire({
                title: 'محظور',
                text: 'حسابك محظور. يرجى التواصل مع الدعم',
                icon: 'error',
                background: '#12172f',
                color: '#fff',
                confirmButtonColor: '#667eea'
            });
            return false;
        }
        
        await loadServicePrice();
        showMainScreen();
        startBalanceUpdates();
        
        const savedRequest = loadPermanentGmailRequest();
        if (savedRequest && !currentGeneratedData && !isRequestLocked) {
            setTimeout(() => {
                Swal.fire({
                    title: '📦 لديك طلب Gmail غير مكتمل',
                    text: 'هل تريد استئناف إنشاء الجميل السابق؟',
                    icon: 'question',
                    background: '#12172f',
                    color: '#fff',
                    showCancelButton: true,
                    confirmButtonColor: '#667eea',
                    cancelButtonColor: '#6c757d',
                    confirmButtonText: '✅ نعم',
                    cancelButtonText: '❌ لا'
                }).then((res) => {
                    if (res.isConfirmed) {
                        currentGeneratedData = savedRequest;
                        isRequestLocked = true;
                        displayGmailData(currentGeneratedData);
                        document.getElementById('createModal').classList.remove('hidden');
                    } else {
                        clearPermanentGmailRequest();
                    }
                });
            }, 1000);
        }
        
        Swal.fire({
            icon: 'success',
            title: `أهلاً بك ${result.name}`,
            text: 'تم تسجيل الدخول بنجاح',
            background: '#12172f',
            color: '#fff',
            timer: 1500,
            showConfirmButton: false
        });
        return true;
    } else if (result?.result === "wrong_pass") {
        Swal.fire({
            title: 'خطأ',
            text: 'كلمة المرور غير صحيحة',
            icon: 'error',
            background: '#12172f',
            color: '#fff',
            confirmButtonColor: '#667eea'
        });
        return false;
    } else {
        Swal.fire({
            title: 'غير موجود',
            text: 'هذا الرقم غير مسجل. يرجى إنشاء حساب جديد',
            icon: 'warning',
            background: '#12172f',
            color: '#fff',
            confirmButtonColor: '#667eea'
        });
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
        text: 'هل أنت متأكد من تسجيل الخروج؟ سيتم حفظ طلب Gmail الحالي إن وجد.',
        icon: 'question',
        background: '#12172f',
        color: '#fff',
        showCancelButton: true,
        confirmButtonColor: '#dc3545',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'نعم',
        cancelButtonText: 'إلغاء'
    }).then((result) => {
        if (result.isConfirmed) {
            if (isRequestLocked && currentGeneratedData) {
                saveGmailRequestPermanently(currentGeneratedData);
                showToast('📦 تم حفظ طلب Gmail الخاص بك، يمكنك استئنافه لاحقاً');
            }
            stopBalanceUpdates();
            localStorage.removeItem('userPhone');
            localStorage.removeItem('userPassword');
            localStorage.removeItem('userName');
            currentUser = null;
            currentGeneratedData = null;
            isRequestLocked = false;
            showLoginScreen();
            showToast('👋 تم تسجيل الخروج بنجاح');
        }
    });
}

// ========================================
// جلب الرصيد والأسعار
// ========================================

async function loadBalance() {
    if (!currentUser) return;
    
    const result = await callAPI('getBalance', { phone: cleanPhone(currentUser.phone) });
    
    if (result?.success) {
        const oldBalance = currentBalance;
        const oldPendingBalance = currentPendingBalance;
        
        currentBalance = parseFloat(result.balance) || 0;
        currentPendingBalance = parseFloat(result.pendingBalance) || 0;
        currentBlocked = result.blocked === "TRUE";
        
        const balanceEl = document.getElementById('balance');
        const pendingEl = document.getElementById('pendingBalance');
        
        if (balanceEl) {
            balanceEl.textContent = currentBalance;
            if (oldBalance !== currentBalance && currentBalance > oldBalance) {
                balanceEl.classList.add('pulse-animation');
                setTimeout(() => balanceEl.classList.remove('pulse-animation'), 500);
                showToast(`💰 تم إضافة ${(currentBalance - oldBalance).toFixed(2)} ج.م إلى رصيدك`);
            }
        }
        if (pendingEl) {
            pendingEl.textContent = currentPendingBalance;
            if (oldPendingBalance !== currentPendingBalance) {
                pendingEl.classList.add('pulse-animation');
                setTimeout(() => pendingEl.classList.remove('pulse-animation'), 500);
            }
        }
    }
}

async function loadServicePrice() {
    const result = await callAPI('getServicePrice', { service: 'Gmail' });
    if (result?.success) {
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
        }
    }, 3000);
}

function stopBalanceUpdates() {
    if (balanceUpdateInterval) clearInterval(balanceUpdateInterval);
}

// ========================================
// إنشاء Gmail مع نظام الحظر المؤقت
// ========================================

function displayGmailData(data) {
    document.getElementById('generatedName').innerHTML = `${data.name} <button class="copy-btn" onclick="copyToClipboardFromSpan('generatedName')"><i class="fas fa-copy"></i></button>`;
    document.getElementById('generatedGmail').innerHTML = `${data.gmail} <button class="copy-btn" onclick="copyToClipboardFromSpan('generatedGmail')"><i class="fas fa-copy"></i></button>`;
    document.getElementById('generatedPassword').innerHTML = `${data.password} <button class="copy-btn" onclick="copyToClipboardFromSpan('generatedPassword')"><i class="fas fa-copy"></i></button>`;
    document.getElementById('generatedGenderAge').textContent = `${data.gender} / ${data.birthYear}`;
}

async function changeGmail() {
    if (!currentGeneratedData) {
        showToast('لا يوجد طلب نشط لتغييره', true);
        return;
    }
    
    const result = await Swal.fire({
        title: '🔄 تغيير الجميل',
        text: 'هل تريد تغيير البريد الإلكتروني؟ سيتم إنشاء بريد جديد',
        icon: 'question',
        background: '#12172f',
        color: '#fff',
        showCancelButton: true,
        confirmButtonColor: '#ff9800',
        cancelButtonColor: '#6c757d',
        confirmButtonText: '✅ نعم',
        cancelButtonText: '❌ إلغاء'
    });
    
    if (!result.isConfirmed) return;
    
    const newGmail = generateUniqueGmail();
    currentGeneratedData.gmail = newGmail;
    saveGmailRequestPermanently(currentGeneratedData);
    displayGmailData(currentGeneratedData);
    showToast('✅ تم تغيير البريد الإلكتروني بنجاح');
}

async function showCreateGmailModal() {
    // فحص الحظر المؤقت أولاً
    const blockCheck = checkTempBlock();
    if (blockCheck.blocked) {
        showToast(blockCheck.reason, true);
        return;
    }
    
    if (isRequestLocked && currentGeneratedData) {
        displayGmailData(currentGeneratedData);
        document.getElementById('createModal').classList.remove('hidden');
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
    
    // فحص الحظر المؤقت مرة أخرى
    const blockCheck = checkTempBlock();
    if (blockCheck.blocked) {
        showToast(blockCheck.reason, true);
        document.getElementById('createModal').classList.add('hidden');
        return;
    }
    
    const fileInput = document.getElementById('gmailScreenshot');
    if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
        showToast('❌ يرجى رفع صورة سكرين شوت لحساب Gmail الجديد', true);
        return;
    }
    
    const confirmed = await Swal.fire({
        title: 'تأكيد إنشاء الجميل',
        html: `
            <div style="text-align: center;">
                <i class="fas fa-exclamation-triangle" style="font-size: 48px; color: #ff9800; margin-bottom: 15px;"></i>
                <p><strong>تحذير هام!</strong></p>
                <p>هل قمت بإنشاء حساب Gmail بنفس البيانات الموضحة أعلاه؟</p>
                <p style="margin-top: 10px; padding: 10px; background: rgba(255,152,0,0.1); border-radius: 10px;">
                    📸 <strong>ملاحظة مهمة:</strong><br>
                    يرجى الاحتفاظ بالصورة (سكرين شوت) لحين تحويل المبلغ من الرصيد المتجمد إلى الرصيد الحالي.
                </p>
            </div>
        `,
        icon: 'warning',
        background: '#12172f',
        color: '#fff',
        showCancelButton: true,
        confirmButtonColor: '#dc3545',
        cancelButtonColor: '#6c757d',
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
    const fileNameSpan = document.getElementById('fileName');
    if (fileNameSpan) fileNameSpan.textContent = file.name;
    
    const result = await callAPI('submitGmail', {
        phone: cleanPhone(currentUser.phone),
        fullName: currentGeneratedData.name,
        gmail: fullGmail,
        password: currentGeneratedData.password,
        price: gmailPrice
    });
    
    if (!result?.success) {
        setButtonLoading('confirmCreateBtn', false);
        showToast(result?.error || 'حدث خطأ أثناء إرسال البيانات', true);
        return;
    }
    
    // تسجيل محاولة إنشاء الجميل في سجل الحظر المؤقت
    const canCreate = recordGmailCreation();
    if (!canCreate) {
        setButtonLoading('confirmCreateBtn', false);
        document.getElementById('createModal').classList.add('hidden');
        return;
    }
    
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
    await loadBalance();
    document.getElementById('createModal').classList.add('hidden');
    clearPermanentGmailRequest();
    isRequestLocked = false;
    currentGeneratedData = null;
    
    Swal.fire({
        icon: 'success',
        title: 'تم الإرسال بنجاح!',
        html: 'سيتم مراجعة الجميل خلال 2-4 أيام.<br><br>📸 <strong>تذكير هام:</strong><br>يرجى الاحتفاظ بالصورة (سكرين شوت) لحين تحويل المبلغ.',
        background: '#12172f',
        color: '#fff',
        confirmButtonColor: '#28a745',
        timer: 4000,
        showConfirmButton: true
    });
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
        showToast('❌ الرجاء إدخال رقم المحفظة', true);
        return;
    }
    if (isNaN(amount) || amount <= 0) {
        showToast('❌ الرجاء إدخال مبلغ صحيح', true);
        return;
    }
    if (amount < 30) {
        showToast('❌ الحد الأدنى للسحب هو 30 جنيه', true);
        return;
    }
    if (totalDeduction > currentBalance) {
        showToast(`❌ الرصيد غير كافٍ. المطلوب: ${totalDeduction} ج.م`, true);
        return;
    }
    
    const confirmWithdraw = await Swal.fire({
        title: 'تأكيد سحب الأموال',
        html: `
            <div style="text-align: center;">
                <i class="fas fa-money-bill-wave" style="font-size: 48px; color: #ff9800; margin-bottom: 15px;"></i>
                <p>المبلغ المطلوب: <strong>${amount} ج.م</strong></p>
                <p>مصاريف السحب: <strong>${fee} ج.م</strong></p>
                <p style="margin-top: 10px; padding: 10px; background: rgba(102,126,234,0.1); border-radius: 10px;">
                    <strong>الصافي المستلم: ${amount} ج.م</strong><br>
                    سيتم خصم ${totalDeduction} ج.م من رصيدك
                </p>
            </div>
        `,
        icon: 'question',
        background: '#12172f',
        color: '#fff',
        showCancelButton: true,
        confirmButtonColor: '#28a745',
        cancelButtonColor: '#6c757d',
        confirmButtonText: '✅ تأكيد السحب',
        cancelButtonText: '❌ إلغاء'
    });
    
    if (!confirmWithdraw.isConfirmed) return;
    
    setButtonLoading('submitWithdrawBtn', true);
    const result = await callAPI('submitWithdrawal', { 
        phone: cleanPhone(currentUser.phone), 
        wallet, 
        amount, 
        fee 
    });
    setButtonLoading('submitWithdrawBtn', false);
    
    if (result?.success) {
        await loadBalance();
        document.getElementById('withdrawModal').classList.add('hidden');
        document.getElementById('walletNumber').value = '';
        document.getElementById('withdrawAmount').value = '';
        Swal.fire({
            icon: 'success',
            title: 'تم إرسال طلب السحب',
            text: `تم خصم ${result.deducted || totalDeduction} ج.م من رصيدك. سيتم المراجعة خلال 2-4 أيام`,
            background: '#12172f',
            color: '#fff',
            confirmButtonColor: '#28a745',
            timer: 3000,
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
    
    const tbody = document.getElementById('gmailLogsBody');
    
    if (result?.success && result.gmails && result.gmails.length > 0) {
        const filter = document.getElementById('gmailStatusFilter')?.value || 'all';
        let filtered = result.gmails;
        if (filter !== 'all') {
            filtered = result.gmails.filter(g => g.status === filter);
        }
        
        if (filtered.length === 0) {
            tbody.innerHTML = '<div class="empty-state"><i class="fas fa-inbox"></i> لا توجد جميلات بهذه الحالة</div>';
        } else {
            let html = `<table class="logs-table">
                <thead>
                    <tr>
                        <th>البريد الإلكتروني</th>
                        <th>الحالة</th>
                        <th>التاريخ</th>
                    </tr>
                </thead>
                <tbody>`;
            
            filtered.slice().reverse().forEach(rec => {
                let statusText = '', statusClass = '';
                if (rec.status === 'Pending') { 
                    statusText = '⏳ قيد المراجعة'; 
                    statusClass = 'status-pending'; 
                }
                else if (rec.status === 'Approved') { 
                    statusText = '✅ مقبول - تمت الموافقة'; 
                    statusClass = 'status-approved'; 
                }
                else { 
                    statusText = '❌ مرفوض - غير مقبول'; 
                    statusClass = 'status-rejected'; 
                }
                const displayGmail = rec.gmail.replace('@gmail.com', '');
                const formattedDate = new Date(rec.timestamp).toLocaleDateString('ar-EG');
                html += `<tr>
                    <td style="direction: ltr;">${displayGmail}@gmail.com</td>
                    <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                    <td>${formattedDate}</td>
                </tr>`;
            });
            html += `</tbody>点心`;
            tbody.innerHTML = html;
        }
    } else {
        tbody.innerHTML = '<div class="empty-state"><i class="fas fa-inbox"></i> لا توجد جميلات</div>';
    }
    document.getElementById('gmailLogsModal').classList.remove('hidden');
}

async function showWithdrawLogs() {
    if (!currentUser) return;
    
    setButtonLoading('withdrawLogsBtn', true);
    const result = await callAPI('getMyWithdrawals', { phone: cleanPhone(currentUser.phone) });
    setButtonLoading('withdrawLogsBtn', false);
    
    const tbody = document.getElementById('withdrawLogsBody');
    
    if (result?.success && result.withdrawals && result.withdrawals.length > 0) {
        const filter = document.getElementById('withdrawStatusFilter')?.value || 'all';
        let filtered = result.withdrawals;
        if (filter !== 'all') {
            filtered = result.withdrawals.filter(w => w.status === filter);
        }
        
        if (filtered.length === 0) {
            tbody.innerHTML = '<div class="empty-state"><i class="fas fa-inbox"></i> لا توجد سحوبات بهذه الحالة</div>';
        } else {
            let html = `<table class="logs-table">
                <thead>
                    <tr>
                        <th>رقم المحفظة</th>
                        <th>المبلغ المطلوب</th>
                        <th>المصاريف (5ج)</th>
                        <th>الصافي المستلم</th>
                        <th>الحالة</th>
                        <th>التاريخ</th>
                    </tr>
                </thead>
                <tbody>`;
            
            filtered.slice().reverse().forEach(w => {
                let statusText = '', statusClass = '';
                if (w.status === 'Pending') { 
                    statusText = '⏳ قيد المراجعة'; 
                    statusClass = 'status-pending'; 
                }
                else if (w.status === 'Completed') { 
                    statusText = '✅ مكتمل - تم السحب'; 
                    statusClass = 'status-completed'; 
                }
                else { 
                    statusText = '❌ مرفوض - فشل السحب'; 
                    statusClass = 'status-rejected'; 
                }
                const date = new Date(w.timestamp).toLocaleDateString('ar-EG');
                const netAmount = w.amount - (w.fee || 5);
                html += `<tr>
                    <td>${w.wallet}</td>
                    <td>${w.amount} ج.م</td>
                    <td>${w.fee || 5} ج.م</td>
                    <td>${netAmount} ج.م</td>
                    <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                    <td>${date}</td>
                </tr>`;
            });
            html += `</tbody>点心`;
            tbody.innerHTML = html;
        }
    } else {
        tbody.innerHTML = '<div class="empty-state"><i class="fas fa-inbox"></i> لا توجد سحوبات</div>';
    }
    document.getElementById('withdrawLogsModal').classList.remove('hidden');
}

// ========================================
// رفع الصورة - عرض اسم الملف
// ========================================

document.getElementById('gmailScreenshot')?.addEventListener('change', function(e) {
    const fileName = e.target.files[0]?.name;
    const fileNameSpan = document.getElementById('fileName');
    if (fileNameSpan && fileName) {
        fileNameSpan.textContent = fileName;
    }
});

// ========================================
// بدء التشغيل
// ========================================

async function init() {
    // ربط الأزرار
    document.getElementById('showRegisterBtn')?.addEventListener('click', showRegisterScreen);
    document.getElementById('showLoginBtn')?.addEventListener('click', showLoginScreen);
    document.getElementById('registerBtn')?.addEventListener('click', register);
    document.getElementById('doLoginBtn')?.addEventListener('click', login);
    document.getElementById('logoutBtn')?.addEventListener('click', logout);
    document.getElementById('createGmailBtn')?.addEventListener('click', showCreateGmailModal);
    document.getElementById('confirmCreateBtn')?.addEventListener('click', confirmGmailCreation);
    document.getElementById('changeGmailSmallBtn')?.addEventListener('click', changeGmail);
    document.getElementById('withdrawBtn')?.addEventListener('click', showWithdrawModal);
    document.getElementById('submitWithdrawBtn')?.addEventListener('click', submitWithdrawRequest);
    document.getElementById('gmailLogsBtn')?.addEventListener('click', showGmailLogs);
    document.getElementById('withdrawLogsBtn')?.addEventListener('click', showWithdrawLogs);
    
    // فلترة السجلات
    document.getElementById('gmailStatusFilter')?.addEventListener('change', showGmailLogs);
    document.getElementById('withdrawStatusFilter')?.addEventListener('change', showWithdrawLogs);
    
    // إغلاق النوافذ
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const modal = e.target.closest('.modal-overlay');
            if (modal) modal.classList.add('hidden');
        });
    });
    
    window.addEventListener('click', (e) => {
        if (e.target.classList?.contains('modal-overlay')) {
            e.target.classList.add('hidden');
        }
    });
    
    window.copyToClipboardFromSpan = copyToClipboardFromSpan;
    window.togglePass = togglePass;
    
    // إخفاء شاشة التحميل
    setTimeout(() => {
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) loadingScreen.style.display = 'none';
    }, 1500);
    
    // التحقق من وجود جلسة نشطة
    const savedPhone = localStorage.getItem('userPhone');
    const savedPassword = localStorage.getItem('userPassword');
    
    if (savedPhone && savedPassword) {
        currentUser = { phone: savedPhone };
        const result = await callAPI('login', { phone: cleanPhone(savedPhone), pass: savedPassword });
        if (result?.result === "found") {
            currentUser = { phone: result.phone, name: result.name };
            currentBalance = parseFloat(result.balance) || 0;
            currentPendingBalance = parseFloat(result.pendingBalance) || 0;
            currentBlocked = result.blocked === "TRUE";
            document.getElementById('balance').textContent = currentBalance;
            document.getElementById('pendingBalance').textContent = currentPendingBalance;
            
            const userNameEl = document.getElementById('userName');
            const userPhoneEl = document.getElementById('userPhone');
            if (userNameEl) userNameEl.textContent = result.name;
            if (userPhoneEl) userPhoneEl.textContent = result.phone;
            
            if (!currentBlocked) {
                await loadServicePrice();
                showMainScreen();
                startBalanceUpdates();
                
                const savedRequest = loadPermanentGmailRequest();
                if (savedRequest && !currentGeneratedData && !isRequestLocked) {
                    setTimeout(() => {
                        Swal.fire({
                            title: '📦 لديك طلب Gmail غير مكتمل',
                            text: 'هل تريد استئناف إنشاء الجميل السابق؟',
                            icon: 'question',
                            background: '#12172f',
                            color: '#fff',
                            showCancelButton: true,
                            confirmButtonColor: '#667eea',
                            cancelButtonColor: '#6c757d',
                            confirmButtonText: '✅ نعم',
                            cancelButtonText: '❌ لا'
                        }).then((res) => {
                            if (res.isConfirmed) {
                                currentGeneratedData = savedRequest;
                                isRequestLocked = true;
                                displayGmailData(currentGeneratedData);
                                document.getElementById('createModal').classList.remove('hidden');
                            } else {
                                clearPermanentGmailRequest();
                            }
                        });
                    }, 1000);
                }
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
