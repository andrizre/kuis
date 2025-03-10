$(document).ready(function() {
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
                $('#login-form').submit(function(e) {
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
                $('#admin-login-form').submit(function(e) {
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
                $('#admin-login-btn').click(function() {
                    $('#login-container').addClass('hidden');
                    $('#admin-login-container').removeClass('hidden');
                });
                
                // Switch to student login
                $('#student-login-btn').click(function() {
                    $('#admin-login-container').addClass('hidden');
                    $('#login-container').removeClass('hidden');
                });
                
                // Logout button
                $('#logout-btn').click(function() {
                    localStorage.removeItem('userSession');
                    location.reload();
                });
                
                // Quiz navigation buttons
                $('#next-btn').click(function() {
                    if (currentQuestionIndex < questions.length - 1) {
                        currentQuestionIndex++;
                        showQuestion(currentQuestionIndex);
                        updateButtons();
                        updateProgressBar();
                    }
                });

                $('#prev-btn').click(function() {
                    if (currentQuestionIndex > 0) {
                        currentQuestionIndex--;
                        showQuestion(currentQuestionIndex);
                        updateButtons();
                        updateProgressBar();
                    }
                });

                $('#submit-btn').click(function() {
                    showResults();
                });

                $('#retry-btn').click(function() {
                    resetQuiz();
                });

                $('#reset-btn').click(function() {
                    if (confirm('Apakah Anda yakin ingin mereset kuis?')) {
                        resetQuiz();
                    }
                });
                
                // Admin functions
                $('#edit-mode-btn').click(function() {
                    toggleEditMode();
                });

                $('#save-edit-btn').click(function() {
                    saveEditedQuestions();
                });

                $('#cancel-edit-btn').click(function() {
                    toggleEditMode();
                });
                
                // Token management
                $('#manage-tokens-btn').click(function() {
                    showTokenManagement();
                });
                
                $('#back-from-tokens-btn').click(function() {
                    $('#token-container').addClass('hidden');
                    $('#main-header').removeClass('hidden');
                    $('#quiz-container').removeClass('hidden');
                });
                
                $('#add-token-btn').click(function() {
                    addNewToken();
                });
            }

            // Student login functions
            function showStudentInterface(userSession) {
                $('#login-container').addClass('hidden');
                $('#admin-login-container').addClass('hidden');
                $('#main-header').removeClass('hidden');
                $('#quiz-container').removeClass('hidden');
                
                // Show user info
                $('#user-info').html(`
                    <span class="font-medium">Nama:</span> ${userSession.username} | 
                    <span class="font-medium">Kelas:</span> ${userSession.class}
                `);
                
                // Hide admin buttons
                $('.admin-only').addClass('hidden');
                
                // Initialize quiz
                initializeQuiz();
            }
            
            // Admin login functions
            function showAdminInterface() {
                $('#login-container').addClass('hidden');
                $('#admin-login-container').addClass('hidden');
                $('#main-header').removeClass('hidden');
                $('#quiz-container').removeClass('hidden');
                
                // Show admin info
                $('#user-info').html(`
                    <span class="font-medium text-green-600">ADMIN MODE</span>
                `);
                
                // Show admin buttons
                $('.admin-only').removeClass('hidden');
                
                // Initialize quiz
                initializeQuiz();
            }
            
            // Token management functions
            function showTokenManagement() {
                $('#quiz-container').addClass('hidden');
                $('#main-header').addClass('hidden');
                $('#token-container').removeClass('hidden');
                
                renderTokenList();
            }
            
            function renderTokenList() {
                const tokens = JSON.parse(localStorage.getItem('validTokens'));
                
                if (tokens.length === 0) {
                    $('#token-list').html('<p class="text-gray-500">Tidak ada token yang aktif.</p>');
                    return;
                }
                
                const tokenHtml = tokens.map((tokenObj, index) => {
                    return `
                        <div class="flex items-center justify-between p-2 border-b border-gray-200 last:border-b-0">
                            <div>
                                <span class="font-medium">${tokenObj.token}</span>
                                ${tokenObj.description ? ` - <span class="text-gray-600">${tokenObj.description}</span>` : ''}
                            </div>
                            <button class="delete-token-btn text-red-500 hover:text-red-700" data-index="${index}">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                                </svg>
                            </button>
                        </div>
                    `;
                }).join('');
                
                $('#token-list').html(tokenHtml);
                
                // Add event listeners for delete buttons
                $('.delete-token-btn').click(function() {
                    const index = $(this).data('index');
                    deleteToken(index);
                });
            }
            
            function addNewToken() {
                const newToken = $('#new-token').val().trim();
                const description = $('#token-description').val().trim();
                
                if (!newToken) {
                    alert('Token tidak boleh kosong!');
                    return;
                }
                
                // Check if token already exists
                const tokens = JSON.parse(localStorage.getItem('validTokens'));
                if (tokens.some(t => t.token === newToken)) {
                    alert('Token sudah ada!');
                    return;
                }
                
                // Add new token
                tokens.push({
                    token: newToken,
                    description: description
                });
                
                localStorage.setItem('validTokens', JSON.stringify(tokens));
                
                // Clear input fields
                $('#new-token').val('');
                $('#token-description').val('');
                
                // Update token list
                renderTokenList();
            }
            
            function deleteToken(index) {
                if (confirm('Apakah Anda yakin ingin menghapus token ini?')) {
                    const tokens = JSON.parse(localStorage.getItem('validTokens'));
                    tokens.splice(index, 1);
                    localStorage.setItem('validTokens', JSON.stringify(tokens));
                    
                    // Update token list
                    renderTokenList();
                }
            }

            // Quiz variables
            let questions;
            let currentQuestionIndex;
            let userAnswers;

            // Quiz functions
            function initializeQuiz() {
                questions = JSON.parse(localStorage.getItem('quizQuestions'));
                currentQuestionIndex = 0;
                userAnswers = JSON.parse(localStorage.getItem('userAnswers')) || Array(questions.length).fill(null);
                
                updateProgressBar();
                showQuestion(currentQuestionIndex);
                updateButtons();
            }
            
            function showQuestion(index) {
                const question = questions[index];
                $('#question-text').text(`${index + 1}. ${question.question}`);
                $('#question-image').attr('src', question.imageUrl).toggle(question.imageUrl !== ""); // Menampilkan gambar jika ada
                
                const optionsHtml = question.options.map((option, i) => {
                    const isChecked = userAnswers[index] === i ? 'checked' : '';
                    return `
                        <div class="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                            <input type="radio" name="question${index}" id="option${i}" value="${i}" ${isChecked} class="answer-option w-4 h-4 text-blue-600 focus:ring-blue-500">
                            <label for="option${i}" class="ml-2 w-full text-gray-700 cursor-pointer">${option}</label>
                        </div>
                    `;
                }).join('');
                
                $('#options-container').html(optionsHtml);
                
                // Add event listener to radio buttons
                $('.answer-option').change(function() {
                    userAnswers[index] = parseInt($(this).val());
                    localStorage.setItem('userAnswers', JSON.stringify(userAnswers));
                    updateButtons();
                    updateProgressBar();
                });
            }

            function updateButtons() {
                $('#prev-btn').prop('disabled', currentQuestionIndex === 0);
                
                if (currentQuestionIndex === questions.length - 1) {
                    $('#next-btn').addClass('hidden');
                    $('#submit-btn').removeClass('hidden');
                } else {
                    $('#next-btn').removeClass('hidden');
                    $('#submit-btn').addClass('hidden');
                }
                
                // Enable submit button only if all questions are answered
                const allAnswered = userAnswers.every(answer => answer !== null);
                $('#submit-btn').prop('disabled', !allAnswered);
            }

            function updateProgressBar() {
                const answeredCount = userAnswers.filter(answer => answer !== null).length;
                const progressPercent = (answeredCount / questions.length) * 100;
                $('#progress-bar').css('width', `${progressPercent}%`);
                $('#progress-text').text(`${answeredCount}/${questions.length}`);
            }

            function showResults() {
                let correctCount = 0;
                const detailedResultsHtml = questions.map((question, index) => {
                    const userAnswer = userAnswers[index];
                    const isCorrect = userAnswer === question.correctAnswer;
                    if (isCorrect) correctCount++;
                    
                    return `
                        <div class="p-4 border ${isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'} rounded-lg">
                            <p class="font-semibold">${index + 1}. ${question.question}</p>
                            <p class="mt-1">Jawaban Anda: <span class="${isCorrect ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}">${question.options[userAnswer]}</span></p>
                            ${!isCorrect ? `<p class="mt-1">Jawaban Benar: <span class="text-green-600 font-medium">${question.options[question.correctAnswer]}</span></p>` : ''}
                        </div>
                    `;
                }).join('');
                
                const scorePercent = Math.round((correctCount / questions.length) * 100);
                
                $('#score-display').html(`Skor Anda: <span class="font-bold text-2xl">${scorePercent}%</span> (${correctCount}/${questions.length} benar)`);
                $('#detailed-results').html(detailedResultsHtml);
                
                $('#quiz-container').addClass('hidden');
                $('#results-container').removeClass('hidden');
            }

            function resetQuiz() {
                userAnswers = Array(questions.length).fill(null);
                localStorage.setItem('userAnswers', JSON.stringify(userAnswers));
                currentQuestionIndex = 0;
                
                showQuestion(currentQuestionIndex);
                updateButtons();
                updateProgressBar();
                
                $('#results-container').addClass('hidden');
                $('#quiz-container').removeClass('hidden');
            }

            function toggleEditMode() {
                if ($('#edit-container').hasClass('hidden')) {
                    // Show edit mode
                    populateEditForm();
                    $('#quiz-container').addClass('hidden');
                    $('#results-container').addClass('hidden');
                    $('#edit-container').removeClass('hidden');
                } else {
                    // Hide edit mode
                    $('#edit-container').addClass('hidden');
                    $('#quiz-container').removeClass('hidden');
                }
            }

            function populateEditForm() {
                const editHtml = questions.map((question, index) => {
                    let optionsHtml = '';
                    
                    question.options.forEach((option, optIndex) => {
                        optionsHtml += `
                            <div class="flex items-center mb-2">
                                <input type="text" class="option-text border border-gray-300 rounded px-3 py-2 w-full" 
                                       data-question="${index}" data-option="${optIndex}" value="${option}">
                                <input type="radio" name="correct-${index}" value="${optIndex}" 
                                       ${question.correctAnswer === optIndex ? 'checked' : ''} 
                                       class="correct-answer ml-2 w-5 h-5 text-green-600">
                            </div>
                        `;
                    });

                    return `
                        <div class="border border-gray-200 rounded-lg p-4 mb-4">
                            <textarea class="question-text border border-gray-300 rounded px-3 py-2 w-full" 
                                      data-index="${index}" rows="2">${question.question}</textarea>
                            <input type="text" class="image-url border border-gray-300 rounded px-3 py-2 w-full mt-2" 
                                   placeholder="URL Gambar" data-index="${index}" value="${question.imageUrl || ''}">
                            <div class="options-container mt-2">
                                ${optionsHtml}
                            </div>
                        </div>
                    `;
                }).join('');

                $('#edit-question-list').html(editHtml);
            }

            function saveEditedQuestions() {
                const updatedQuestions = questions.map((question, index) => {
                    const questionText = $(`.question-text[data-index="${index}"]`).val();
                    const options = [];
                    const correctAnswer = $(`input[name="correct-${index}"]:checked`).val();
                    const imageUrl = $(`.image-url[data-index="${index}"]`).val(); // Ambil URL gambar

                    for (let i = 0; i < 4; i++) {
                        const optionText = $(`.option-text[data-question="${index}"][data-option="${i}"]`).val();
                        options.push(optionText);
                    }

                    return {
                        question: questionText,
                        options: options,
                        correctAnswer: parseInt(correctAnswer),
                        imageUrl: imageUrl // Simpan URL gambar
                    };
                });

                localStorage.setItem('quizQuestions', JSON.stringify(updatedQuestions));
                questions = updatedQuestions; // Update the questions variable
                alert('Pertanyaan berhasil disimpan!');
            }
        });
