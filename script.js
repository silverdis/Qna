// 로컬 스토리지에서 데이터 가져오기
let questions = JSON.parse(localStorage.getItem('questions')) || [];

// DOM 요소
const questionForm = document.getElementById('questionForm');
const questionList = document.getElementById('questionList');

// 질문 등록 이벤트 리스너
questionForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const subject = document.getElementById('subject').value;
    const title = document.getElementById('title').value;
    const content = document.getElementById('content').value;
    
    if (!subject || !title || !content) {
        alert('모든 필드를 입력해주세요.');
        return;
    }
    
    const question = {
        id: Date.now(),
        subject,
        title,
        content,
        answers: [],
        timestamp: new Date().toLocaleString()
    };
    
    questions.unshift(question);
    saveQuestions();
    renderQuestions();
    questionForm.reset();
});

// 답변 등록 함수
function addAnswer(questionId, answerContent) {
    const question = questions.find(q => q.id === questionId);
    if (question) {
        question.answers.push({
            content: answerContent,
            timestamp: new Date().toLocaleString()
        });
        saveQuestions();
        renderQuestions();
    }
}

// 질문 삭제 함수
function deleteQuestion(questionId) {
    if (confirm('정말로 이 질문을 삭제하시겠습니까?')) {
        questions = questions.filter(q => q.id !== questionId);
        saveQuestions();
        renderQuestions();
    }
}

// 로컬 스토리지에 저장
function saveQuestions() {
    localStorage.setItem('questions', JSON.stringify(questions));
}

// 질문 목록 렌더링
function renderQuestions() {
    questionList.innerHTML = questions.map(question => `
        <div class="question-card bg-white rounded-lg shadow-md p-4 fade-in">
            <div class="flex justify-between items-start mb-2">
                <div>
                    <span class="inline-block bg-indigo-100 text-indigo-800 text-sm font-medium px-2.5 py-0.5 rounded">
                        ${question.subject}
                    </span>
                    <h3 class="text-lg font-semibold mt-2">${question.title}</h3>
                </div>
                <button onclick="deleteQuestion(${question.id})" class="text-red-600 hover:text-red-800">
                    삭제
                </button>
            </div>
            <p class="text-gray-600 mb-4">${question.content}</p>
            <div class="text-sm text-gray-500 mb-4">작성일시: ${question.timestamp}</div>
            
            <!-- 답변 섹션 -->
            <div class="answer-section">
                <h4 class="font-medium mb-2">답변</h4>
                ${question.answers.map(answer => `
                    <div class="bg-gray-50 p-3 rounded mb-2">
                        <p class="text-gray-700">${answer.content}</p>
                        <div class="text-sm text-gray-500 mt-1">${answer.timestamp}</div>
                    </div>
                `).join('')}
                
                <!-- 답변 작성 폼 -->
                <form onsubmit="event.preventDefault(); addAnswer(${question.id}, this.answer.value); this.reset();" class="mt-2">
                    <div class="flex gap-2">
                        <input type="text" name="answer" placeholder="답변을 입력하세요" 
                               class="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
                        <button type="submit" class="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">
                            답변
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `).join('');
}

// 초기 렌더링
renderQuestions();
