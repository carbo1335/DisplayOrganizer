// 전체화면 토글 기능
function toggleFullscreen() {
    const doc = document.documentElement;
    const isFullscreen = document.fullscreenElement || 
                       document.webkitFullscreenElement || 
                       document.mozFullScreenElement || 
                       document.msFullscreenElement;

    if (!isFullscreen) {
        if (doc.requestFullscreen) {
            doc.requestFullscreen();
        } else if (doc.webkitRequestFullscreen) { /* Safari/iOS */
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

// 버튼 상태 업데이트
function updateFullscreenButton() {
    const btn = document.getElementById('fullscreen-btn');
    if (!btn) return;

    const isFullscreen = document.fullscreenElement || 
                       document.webkitFullscreenElement || 
                       document.mozFullScreenElement || 
                       document.msFullscreenElement;

    if (isFullscreen) {
        btn.textContent = '전체화면 해제';
        btn.classList.add('active');
    } else {
        btn.textContent = '전체화면';
        btn.classList.remove('active');
    }
}

// 초기화
document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('fullscreen-btn');
    if (btn) {
        btn.addEventListener('click', toggleFullscreen);
    }

    // 여러 브라우저의 전체화면 변경 이벤트 감지
    const changeEvents = ['fullscreenchange', 'webkitfullscreenchange', 'mozfullscreenchange', 'MSFullscreenChange'];
    changeEvents.forEach(event => {
        document.addEventListener(event, updateFullscreenButton);
    });
    
    updateFullscreenButton();
});
