$(document).ready(function() {
    // Load HTML fragments
    $("#login-container").load("login.html");
    $("#admin-login-container").load("admin_login.html");
    $("#main-header").load("header.html");
    $("#quiz-container").load("quiz.html");
    $("#results-container").load("results.html");
    $("#edit-container").load("edit.html");
    $("#token-container").load("token.html");

    // Initialize system
    initSystem();

    // Set up event listeners
    setupEventListeners();

    // Functions
    function initSystem() {
        // Initialize admin credentials if not exists
        if (!localStorage.getItem('adminCredentials')) {
            const defaultAdmin = {
                username: 'admin',
                password: 'admin123' // In a real app, you'd use a hashed password
            };
            localStorage.setItem('adminCredentials', JSON.stringify(defaultAdmin));
        }

        // Initialize tokens if not exists
        if (!localStorage.getItem('validTokens')) {
            const defaultTokens = [
                { token: 'TOKEN123', description: 'Kelas 10A' },
                { token: 'TOKEN456', description: 'Kelas 10B' }
            ];
            localStorage.setItem('validTokens', JSON.stringify(defaultTokens));
        }

        // Set default questions if not exists
        if (!localStorage.getItem('quizQuestions')) {
            const defaultQuestions = [
                {
                    question: "Apa ibu kota Indonesia?",
                    options: ["Jakarta", "Bandung", "Surabaya", "Yogyakarta"],
                    correctAnswer: 0,
                    imageUrl: "" // URL gambar bisa ditambahkan di sini
                },
                {
                    question: "Planet apa yang dikenal sebagai 'Planet Merah'?",
                    options: ["Venus", "Mars", "Jupiter", "Saturnus"],
                    correctAnswer: 1,
                    imageUrl: ""
                },
                {
                    question: "Siapa penemu bola lampu?",
                    options: ["Albert Einstein", "Isaac Newton", "Thomas Edison", "Nikola Tesla"],
                    correctAnswer: 2,
                    imageUrl: ""
                },
                {
                    question: "Benua terbesar di dunia adalah?",
                    options: ["Afrika", "Amerika", "Asia", "Eropa"],
                    correctAnswer: 2,
                    imageUrl: ""
                },
                {
                    question: "Bahasa pemrograman apa yang dikembangkan oleh James Gosling?",
                    options: ["Python", "C++", "JavaScript", "Java"],
                    correctAnswer: 3,
                    imageUrl: ""
                },
                {
                    question: "Berapa jumlah provinsi di Indonesia?",
                    options: ["32", "33", "34", "38"],
                    correctAnswer: 2,
                    imageUrl: ""
                },
                {
                    question: "Sungai terpanjang di dunia adalah?",
                    options: ["Amazon", "Nil", "Yangtze", "Mississippi"],
                    correctAnswer: 1,
                    imageUrl: ""
                },
                {
                    question: "Tahun berapa Indonesia merdeka?",
                    options: ["1942", "1945", "1947", "1950"],
                    correctAnswer: 1,
                    imageUrl: ""
                },
                {
                    question: "Siapa presiden pertama Indonesia?",
                    options: ["Soekarno", "Soeharto", "BJ Habibie", "Megawati"],
                    correctAnswer: 0,
                    imageUrl: ""
                },
                {
                    question: "Elemen kimia apa yang memiliki simbol 'O'?",
                    options: ["Osmium", "Oksigen", "Oman", "Olsium"],
                    correctAnswer: 1,
                    imageUrl: ""
                }
            ];
            localStorage.setItem('quizQuestions', JSON.stringify(defaultQuestions));
            localStorage.setItem('lastQuizDate', dayjs().format('YYYY-MM-DD'));
        }

        // Check if already logged in
        const userSession = JSON.parse(localStorage.getItem('userSession'));
        if (userSession) {
            if (userSession.isAdmin) {
                showAdminInterface();
            } else {
                showStudentInterface(userSession);
            }
        }

        // Check if it's a new day to reset answers
        const today = dayjs().format('YYYY-MM-DD');
        const lastQuizDate = localStorage.getItem('lastQuizDate');
        if (lastQuizDate !== today) {
            localStorage.removeItem('userAnswers');
            localStorage.setItem('lastQuizDate', today);
        }

        // Display current date
        $('#date-display').text(dayjs().format('DD MMMM YYYY'));
    }

    function setupEventListeners() {
        // Login form submission
        $(document).on('submit', '#login-form', function(e) {
            e.preventDefault();
            
            const username = $('#username').val().trim();
            const userClass = $('#class').val().trim();
            const token = $('#token').val().trim();
            
            // Validate token
            const validTokens = JSON.parse(localStorage.getItem('validTokens'));
            const isValidToken = validTokens.some(t => t.token === token);
            
            if (!isValidToken) {
                $('#login-error').text('Token tidak valid!').removeClass('hidden');
                return;
            }
            
            if (username && userClass && token) {
                // Store session
                const userSession = {
                    username: username,
                    class: userClass,
                    token: token,
                    isAdmin: false,
                    loginTime: new Date().getTime()
                };
                
                localStorage.setItem('userSession', JSON.stringify(userSession));
                
                // Show quiz interface
                showStudentInterface(userSession);
            } else {
                $('#login-error').text('Semua field harus diisi!').removeClass('hidden');
            }
        });
        
        // Admin login form submission
        $(document).on('submit', '#admin-login-form', function(e) {
            e.preventDefault();
            
            const username = $('#admin-username').val().trim();
            const password = $('#admin-password').val().trim();
            
            // Check admin credentials
            const adminCredentials = JSON.parse(localStorage.getItem('adminCredentials'));
            
            if (username === adminCredentials.username && password === adminCredentials.password) {
                // Store admin session
                const adminSession = {
                    username: username,
                    isAdmin: true,
                    loginTime: new Date().getTime()
                };
                
                localStorage.setItem('userSession', JSON.stringify(adminSession));
                
                // Show admin interface
                showAdminInterface();
            } else {
                $('#admin-login-error').text('Username atau password salah!').removeClass('hidden');
            }
        });
        
        // Switch to admin login
        $(document).on('click', '#admin-login-btn',