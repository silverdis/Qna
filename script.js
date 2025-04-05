// Firebase 초기화
const firebaseConfig = {
  apiKey: "AIzaSyAw_06xdPCy_Rc9EvP0whSfzzBSO3Oi0eQ",
  authDomain: "qna1-7adad.firebaseapp.com",
  projectId: "qna1-7adad",
  storageBucket: "qna1-7adad.firebasestorage.app",
  messagingSenderId: "520189065709",
  appId: "1:520189065709:web:cf16860063abd45b940fe4",
  measurementId: "G-5BNN17M11Z"
};

// Firebase 초기화
firebase.initializeApp(firebaseConfig);
firebase.analytics(); // Analytics 초기화
const db = firebase.firestore();

// DOM 요소
const questionForm = document.getElementById('questionForm');
const questionList = document.getElementById('questionList');

// 질문 등록 이벤트 리스너
questionForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const subject = document.getElementById('subject').value;
    const title = document.getElementById('title').value;
    const content = document.getElementById('content').value;
    
    if (!subject || !title || !content) {
        alert('모든 필드를 입력해주세요.');
        return;
    }
    
    try {
        // 로딩 표시
        const submitButton = questionForm.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;
        submitButton.disabled = true;
        submitButton.innerHTML = '<span class="loading-spinner"></span> 등록 중...';
        
        // Firestore에 질문 추가
        await db.collection('questions').add({
            subject,
            title,
            content,
            answers: [],
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        // 폼 초기화
        questionForm.reset();
        
        // 버튼 상태 복원
        submitButton.disabled = false;
        submitButton.textContent = originalText;
        
        // 질문 목록 새로고침
        loadQuestions();
        
        // 성공 메시지
        showNotification('질문이 성공적으로 등록되었습니다!', 'success');
    } catch (error) {
        console.error("Error adding question: ", error);
        showNotification('질문 등록 중 오류가 발생했습니다.', 'error');
        
        // 버튼 상태 복원
        const submitButton = questionForm.querySelector('button[type="submit"]');
        submitButton.disabled = false;
        submitButton.textContent = '질문 등록';
    }
});

// 답변 등록 함수
async function addAnswer(questionId, answerContent) {
    if (!answerContent.trim()) {
        showNotification('답변 내용을 입력해주세요.', 'error');
        return;
    }
    
    try {
        const questionRef = db.collection('questions').doc(questionId);
        
        // 답변 추가
        await questionRef.update({
            answers: firebase.firestore.FieldValue.arrayUnion({
                content: answerContent,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            })
        });
        
        // 질문 목록 새로고침
        loadQuestions();
        
        // 성공 메시지
        showNotification('답변이 성공적으로 등록되었습니다!', 'success');
    } catch (error) {
        console.error("Error adding answer: ", error);
        showNotification('답변 등록 중 오류가 발생했습니다.', 'error');
    }
}

// 질문 삭제 함수
async function deleteQuestion(questionId) {
    if (confirm('정말로 이 질문을 삭제하시겠습니까?')) {
        try {
            await db.collection('questions').doc(questionId).delete();
            loadQuestions();
            showNotification('질문이 삭제되었습니다.', 'success');
        } catch (error) {
            console.error("Error deleting question: ", error);
            showNotification('질문 삭제 중 오류가 발생했습니다.', 'error');
        }
    }
}

// 알림 표시 함수
function showNotification(message, type = 'info') {
    // 기존 알림 제거
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // 새 알림 생성
    const notification = document.createElement('div');
    notification.className = `notification fixed top-4 right-4 p-4 rounded-md shadow-lg fade-in ${
        type === 'success' ? 'bg-green-500' : 
        type === 'error' ? 'bg-red-500' : 
        'bg-blue-500'
    } text-white`;
    notification.textContent = message;
    
    // 알림 추가
    document.body.appendChild(notification);
    
    // 3초 후 알림 제거
    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// 질문 목록 로드 함수
async function loadQuestions() {
    try {
        // 로딩 표시
        questionList.innerHTML = '<div class="text-center py-4"><div class="loading-spinner"></div><p class="mt-2 text-gray-500">질문을 불러오는 중...</p></div>';
        
        // Firestore에서 질문 가져오기
        const snapshot = await db.collection('questions')
            .orderBy('timestamp', 'desc')
            .get();
        
        if (snapshot.empty) {
            questionList.innerHTML = '<div class="text-center py-4 text-gray-500">등록된 질문이 없습니다.</div>';
            return;
        }
        
        // 질문 목록 렌더링
        questionList.innerHTML = '';
        
        snapshot.forEach(doc => {
            const question = doc.data();
            const questionId = doc.id;
            
            // timestamp가 서버 타임스탬프인 경우 처리
            const timestamp = question.timestamp ? 
                new Date(question.timestamp.toDate()).toLocaleString() : 
                '방금 전';
            
            const questionElement = document.createElement('div');
            questionElement.className = 'question-card bg-white rounded-lg shadow-md p-4 fade-in';
            questionElement.innerHTML = `
                <div class="flex justify-between items-start mb-2">
                    <div>
                        <span class="inline-block bg-indigo-100 text-indigo-800 text-sm font-medium px-2.5 py-0.5 rounded">
                            ${question.subject}
                        </span>
                        <h3 class="text-lg font-semibold mt-2">${question.title}</h3>
                    </div>
                    <button onclick="deleteQuestion('${questionId}')" class="text-red-600 hover:text-red-800">
                        삭제
                    </button>
                </div>
                <p class="text-gray-600 mb-4">${question.content}</p>
                <div class="text-sm text-gray-500 mb-4">작성일시: ${timestamp}</div>
                
                <!-- 답변 섹션 -->
                <div class="answer-section">
                    <h4 class="font-medium mb-2">답변</h4>
                    ${question.answers && question.answers.length > 0 ? 
                        question.answers.map(answer => `
                            <div class="bg-gray-50 p-3 rounded mb-2">
                                <p class="text-gray-700">${answer.content}</p>
                                <div class="text-sm text-gray-500 mt-1">
                                    ${answer.timestamp ? new Date(answer.timestamp.toDate()).toLocaleString() : '방금 전'}
                                </div>
                            </div>
                        `).join('') : 
                        '<p class="text-gray-500">아직 답변이 없습니다.</p>'
                    }
                    
                    <!-- 답변 작성 폼 -->
                    <form onsubmit="event.preventDefault(); addAnswer('${questionId}', this.answer.value); this.reset();" class="mt-2">
                        <div class="flex gap-2">
                            <input type="text" name="answer" placeholder="답변을 입력하세요" 
                                   class="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
                            <button type="submit" class="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">
                                답변
                            </button>
                        </div>
                    </form>
                </div>
            `;
            
            questionList.appendChild(questionElement);
        });
    } catch (error) {
        console.error("Error loading questions: ", error);
        questionList.innerHTML = '<div class="text-center py-4 text-red-500">질문을 불러오는 중 오류가 발생했습니다.</div>';
    }
}

// 초기 질문 목록 로드
loadQuestions();
