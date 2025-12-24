// ---------------------------------------------------------
// Helper Functions
// ---------------------------------------------------------

// 브라우저 호환성 체크하여 전체화면 요소 반환
function getFullscreenElement() {
    return document.fullscreenElement || 
           document.webkitFullscreenElement || 
           document.mozFullScreenElement || 
           document.msFullscreenElement;
}

// 실제 전체화면 토글 실행 (메인 페이지에서만 호출됨)
function executeToggleFullscreen() {
    const doc = document.documentElement;
    const isFullscreen = getFullscreenElement();

    if (!isFullscreen) {
        if (doc.requestFullscreen) {
            doc.requestFullscreen();
        } else if (doc.webkitRequestFullscreen) {
            doc.webkitRequestFullscreen();
        } else if (doc.mozRequestFullScreen) {
            doc.mozRequestFullScreen();
        } else if (doc.msRequestFullscreen) {
            doc.msRequestFullscreen();
        }
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
    }
}

// 버튼 UI 업데이트 (상태값에 따라 텍스트/스타일 변경)
function updateButtonUI(isFullscreen) {
    const btn = document.getElementById('fullscreen-btn');
    if (!btn) return;

    if (isFullscreen) {
        btn.textContent = '전체화면 해제';
        btn.classList.add('active');
    } else {
        btn.textContent = '전체화면';
        btn.classList.remove('active');
    }
}

// ---------------------------------------------------------
// Main Initialization
// ---------------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {
    const isMain = window.self === window.top;
    const btn = document.getElementById('fullscreen-btn');
    
    // =========================================================
    // 1. 메인 페이지 로직 (Controller)
    // =========================================================
    if (isMain) {
        const stageButtons = document.querySelectorAll('.stage-btn');
        const menuContainer = document.querySelector('main > h1') ? document.querySelector('main') : null;
        const gameFrameContainer = document.getElementById('game-frame-container');
        const gameFrame = document.getElementById('game-frame');
        const mainHeader = document.querySelector('header');

        // (1) 전체화면 버튼 클릭 -> 직접 실행
        if (btn) {
            btn.addEventListener('click', executeToggleFullscreen);
        }

        // (2) 전체화면 상태 변경 감지 -> UI 업데이트 및 자식에게 전파
        const changeEvents = ['fullscreenchange', 'webkitfullscreenchange', 'mozfullscreenchange', 'MSFullscreenChange'];
        const handleFullscreenChange = () => {
            const isFull = !!getFullscreenElement();
            updateButtonUI(isFull);
            
            // Iframe이 열려있다면 상태 전달
            if (gameFrame && gameFrame.contentWindow) {
                gameFrame.contentWindow.postMessage({ type: 'fullscreenState', isFullscreen: isFull }, '*');
            }
        };
        changeEvents.forEach(evt => document.addEventListener(evt, handleFullscreenChange));
        // 초기 상태 확인
        handleFullscreenChange();

        // (3) Iframe 네비게이션 핸들링
        if (menuContainer && gameFrameContainer && gameFrame) {
            // 단계 진입
            stageButtons.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    const targetUrl = btn.getAttribute('href');
                    
                    document.querySelector('.stage-grid').style.display = 'none';
                    document.querySelector('h1').style.display = 'none';
                    if (mainHeader) mainHeader.style.display = 'none';
                    
                    gameFrameContainer.style.display = 'block';
                    gameFrame.src = targetUrl;
                });
            });

            // 자식으로부터의 메시지 수신
            window.addEventListener('message', (event) => {
                if (!event.data) return;

                if (event.data === 'exitStage') {
                    // 단계 종료 -> 메뉴 복귀
                    gameFrameContainer.style.display = 'none';
                    gameFrame.src = ''; 
                    
                    document.querySelector('.stage-grid').style.display = 'grid';
                    document.querySelector('h1').style.display = 'block';
                    if (mainHeader) mainHeader.style.display = 'flex';
                } 
                else if (event.data === 'toggleFullscreen') {
                    // 자식이 전체화면 요청함 -> 실행
                    executeToggleFullscreen();
                }
                else if (event.data === 'requestFullscreenState') {
                    // 자식이 현재 상태 알려달라고 함 -> 응답
                    const isFull = !!getFullscreenElement();
                    if (gameFrame.contentWindow) {
                        gameFrame.contentWindow.postMessage({ type: 'fullscreenState', isFullscreen: isFull }, '*');
                    }
                }
            });
        }
    }
    
    // =========================================================
    // 2. 단계 페이지 로직 (Iframe 내부)
    // =========================================================
    else {
        // (1) 전체화면 버튼 클릭 -> 부모에게 요청
        if (btn) {
            btn.addEventListener('click', () => {
                window.parent.postMessage('toggleFullscreen', '*');
            });
        }

        // (2) 뒤로가기 버튼 -> 부모에게 종료 신호
        const backBtn = document.querySelector('.back-btn');
        if (backBtn) {
            backBtn.addEventListener('click', (e) => {
                e.preventDefault();
                window.parent.postMessage('exitStage', '*');
            });
        }

        // (3) 부모로부터 상태 수신 -> UI 업데이트
        window.addEventListener('message', (event) => {
            if (event.data && event.data.type === 'fullscreenState') {
                updateButtonUI(event.data.isFullscreen);
            }
        });

        // (4) 로드 되자마자 부모에게 현재 상태 요청 (버튼 텍스트 동기화 위해)
        window.parent.postMessage('requestFullscreenState', '*');
    }
});