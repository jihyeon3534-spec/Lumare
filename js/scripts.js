/**
 * 루마레(Lumare) 웹사이트 통합 스크립트 (최종 수정본 - 무한 루프 슬라이더 포함)
 */

document.addEventListener("DOMContentLoaded", function () {
    
    // --- 1. GSAP 및 플러그인 초기화 ---
    if (typeof gsap !== "undefined") {
        gsap.registerPlugin(ScrollTrigger, ScrollSmoother);
        if (typeof Draggable !== "undefined") {
            gsap.registerPlugin(Draggable);
        }

        try {
            const smoother = ScrollSmoother.create({
                smooth: 2,
                effects: true,
                smoothTouch: 0.1
            });
        } catch (e) {
            console.warn("ScrollSmoother init failed:", e);
        }
    }

    // --- 2. 주요 요소 변수 선언 ---
    const header = document.querySelector('#main-header');
    const mainView = document.querySelector('#main_view');
    const sideNav = document.querySelector('#side-nav');
    const btnOpen = document.querySelector('.btn-menu-open'); 
    const btnClose = document.querySelector('.btn-menu-close'); 
    const follower = document.querySelector('.cursor-follower');
    const spaceContainer = document.querySelector(".room_container");
    const slideWrapper = document.querySelector('.slide_wrapper');
    const slideItems = document.querySelectorAll('.slide_item');
    const fraction = document.querySelector('.fraction');
    const tabLinks = document.querySelectorAll('.tab-link');
    const subImgLists = document.querySelectorAll('.sub-img-list');

    // --- 3. 메뉴(사이드바) 및 탭 제어 ---
    const toggleMenu = (isOpen) => {
        if (!sideNav) return;
        if (isOpen) {
            sideNav.classList.add('active'); 
            document.body.style.overflow = 'hidden'; 
            gsap.fromTo(".menu-item", 
                { opacity: 0, y: 30 }, 
                { opacity: 1, y: 0, duration: 0.8, stagger: 0.1, ease: "power2.out", delay: 0.1 }
            );
            const firstLink = document.querySelector('.tab-link[data-target="prologue"]');
            if (firstLink) firstLink.dispatchEvent(new Event('mouseenter'));
        } else {
            sideNav.classList.remove('active'); 
            document.body.style.overflow = ''; 
        }
    };

    btnOpen?.addEventListener('click', (e) => { e.preventDefault(); toggleMenu(true); });
    btnClose?.addEventListener('click', () => toggleMenu(false));

    tabLinks.forEach(link => {
        link.addEventListener('mouseenter', () => {
            const target = link.getAttribute('data-target');
            tabLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            
            const targetImg = document.getElementById(`${target}-img`);
            if (targetImg && !targetImg.classList.contains('active')) {
                subImgLists.forEach(img => img.classList.remove('active'));
                targetImg.classList.add('active');
                gsap.fromTo(targetImg, 
                    { filter: "blur(10px)", scale: 1.1 }, 
                    { filter: "blur(0px)", scale: 1, duration: 1, ease: "power2.out" }
                );
            }
            if (follower) {
                gsap.to(follower, { scale: 3, backgroundColor: "rgba(179, 158, 125, 0.2)", border: "none", duration: 0.3 });
            }
        });
        link.addEventListener('mouseleave', () => {
            if (follower) {
                gsap.to(follower, { scale: 1, backgroundColor: "transparent", border: "1px solid #B39E7D", duration: 0.3 });
            }
        });
    });

    // --- 4. 헤더 상태 제어 ---
    if (header && mainView) {
        ScrollTrigger.create({
            trigger: mainView,
            start: "bottom top",
            onEnter: () => header.classList.add('on'),
            onLeaveBack: () => header.classList.remove('on'),
        });
    }

    // --- 5. #experience 섹션 애니메이션 ---
    const expSection = document.querySelector('#experience .inner');
    if (expSection) {
        const isMobile = window.innerWidth <= 350;
        const targetHeight = isMobile ? 80 : 150;
        gsap.timeline({
            scrollTrigger: {
                trigger: expSection,
                start: "top 75%",
                toggleActions: "play none none none"
            }
        })
        .fromTo("#experience .text_center p", { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 1, stagger: 0.3 })
        .fromTo(".divider-vertical", { height: 0, opacity: 0 }, { height: targetHeight, opacity: 1, duration: 1.2 }, "-=0.4")
        .fromTo(".text_area p", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 1 }, "-=0.6");
    }

    // --- 6. #space 섹션 로직 (1.5초 멈춤 효과 포함) ---
    if (spaceContainer) {
        let mm = gsap.matchMedia();

        mm.add("(min-width: 769px)", () => {
            let tl = gsap.timeline({
                scrollTrigger: {
                    trigger: "#space",
                    pin: true,
                    scrub: 1,
                    start: "top top-=120",
                    end: () => "+=" + (spaceContainer.scrollWidth - window.innerWidth + window.innerHeight * 3), 
                    invalidateOnRefresh: true,
                }
            });

            tl.to(spaceContainer, { x: 0, duration: 1.5 }); 
            tl.to(spaceContainer, {
                x: () => -(spaceContainer.scrollWidth - window.innerWidth),
                ease: "none",
                duration: 7 
            });
            tl.to(spaceContainer, { 
                x: () => -(spaceContainer.scrollWidth - window.innerWidth),
                duration: 1.5 
            });
            
            document.querySelector('.more_btn_wrap').style.display = 'none';
            document.querySelectorAll('.room_item').forEach(item => {
                item.style.display = 'block';
                item.style.opacity = '1';
                item.style.transform = 'none'; 
            });
        });

        mm.add("(max-width: 768px)", () => {
            gsap.set(spaceContainer, { x: 0 });
            const items = document.querySelectorAll('.room_item');
            const btnMore = document.querySelector('.btn_more');
            const btnWrap = document.querySelector('.more_btn_wrap');
            const initialCount = 4;

            items.forEach((item, index) => {
                item.style.display = index < initialCount ? 'block' : 'none';
            });
            
            btnWrap.style.display = (items.length > initialCount) ? 'block' : 'none';

            btnMore.onclick = function() {
                items.forEach(item => {
                    if (item.style.display === 'none') {
                        item.style.display = 'block';
                        gsap.fromTo(item, 
                            { opacity: 0, y: 50 }, 
                            { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }
                        );
                    }
                });
                btnWrap.style.display = 'none'; 
            };
        });
    }

    // --- 7. #moment 무한 루프 자동 슬라이더 ---
    let currentIndex = 1; // 클론 때문에 1번부터 시작
    let isAnimating = false;
    let slideTimer;

    if (slideWrapper && slideItems.length > 0) {
        // 클론 생성 및 추가
        const firstClone = slideItems[0].cloneNode(true);
        const lastClone = slideItems[slideItems.length - 1].cloneNode(true);
        slideWrapper.append(firstClone);
        slideWrapper.prepend(lastClone);

        // 초기 위치 설정 (진짜 1번)
        gsap.set(slideWrapper, { xPercent: -100 });

        const updateFraction = () => {
            if (!fraction) return;
            let displayIndex = currentIndex;
            if (currentIndex > slideItems.length) displayIndex = 1;
            if (currentIndex < 1) displayIndex = slideItems.length;
            fraction.textContent = `${displayIndex} / ${slideItems.length}`;
        };

        const goToSlide = (index) => {
            if (isAnimating) return;
            isAnimating = true;
            currentIndex = index;

            gsap.to(slideWrapper, { 
                xPercent: -currentIndex * 100, 
                duration: 0.8, 
                ease: "power2.inOut",
                onComplete: () => {
                    if (currentIndex >= slideItems.length + 1) {
                        currentIndex = 1;
                        gsap.set(slideWrapper, { xPercent: -100 });
                    } else if (currentIndex <= 0) {
                        currentIndex = slideItems.length;
                        gsap.set(slideWrapper, { xPercent: -slideItems.length * 100 });
                    }
                    isAnimating = false;
                }
            });
            updateFraction();
        };

        const startAutoSlide = () => {
            stopAutoSlide();
            slideTimer = setInterval(() => goToSlide(currentIndex + 1), 4500);
        };
        const stopAutoSlide = () => clearInterval(slideTimer);

        startAutoSlide();
        updateFraction();

        document.querySelector('.next_btn')?.addEventListener('click', () => { 
            goToSlide(currentIndex + 1); 
            startAutoSlide(); 
        });
        document.querySelector('.prev_btn')?.addEventListener('click', () => { 
            goToSlide(currentIndex - 1); 
            startAutoSlide(); 
        });

        // 모바일 터치 스와이프
        let touchStartX = 0;
        let touchEndX = 0;

        slideWrapper.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
            stopAutoSlide();
        }, { passive: true });

        slideWrapper.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            const swipeLimit = 50;
            if (touchStartX - touchEndX > swipeLimit) goToSlide(currentIndex + 1);
            else if (touchEndX - touchStartX > swipeLimit) goToSlide(currentIndex - 1);
            startAutoSlide();
        }, { passive: true });

        window.addEventListener('resize', () => {
            gsap.set(slideWrapper, { xPercent: -currentIndex * 100 });
        });
    }

    // --- 8. 기타 요소 등장 (Reveal) ---
    document.querySelectorAll('.reveal').forEach(el => {
        gsap.from(el, {
            scrollTrigger: { trigger: el, start: "top 85%" },
            opacity: 0, y: 30, duration: 1, ease: "power2.out"
        });
    });

    // --- 9. 이미지 비교 슬라이더 (Before/After) ---
    const compareSection = document.querySelector('.compare-container');
    const dayLayer = document.querySelector('.view-layer.day');
    const handle = document.querySelector('.compare-handle');

    if (compareSection && dayLayer && handle) {
        let isDragging = false;
        const setPosition = (x) => {
            let limitX = Math.max(0, Math.min(x, compareSection.offsetWidth));
            let percentage = (limitX / compareSection.offsetWidth) * 100;
            gsap.set(handle, { left: percentage + "%" }); 
            gsap.set(dayLayer, { width: percentage + "%" }); 
        };
        const onMove = (e) => {
            if (!isDragging) return;
            let clientX = e.touches ? e.touches[0].clientX : e.clientX;
            let rect = compareSection.getBoundingClientRect();
            setPosition(clientX - rect.left);
        };
        handle.addEventListener('mousedown', (e) => { e.preventDefault(); isDragging = true; });
        handle.addEventListener('touchstart', () => { isDragging = true; }, {passive: false});
        window.addEventListener('mouseup', () => { isDragging = false; });
        window.addEventListener('touchend', () => { isDragging = false; });
        window.addEventListener('mousemove', onMove);
        window.addEventListener('touchmove', onMove, {passive: false});
        if (compareSection.offsetWidth > 0) setPosition(compareSection.offsetWidth / 2);
    }

}); // DOMContentLoaded 닫기

// --- 플로팅 버튼 스크롤 반응 로직 ---
const floatingBtn = document.querySelector('#floating-res');
if (floatingBtn) {
    gsap.to(floatingBtn, {
        y: -100,
        ease: "none",
        scrollTrigger: {
            trigger: "body",
            start: "top top",
            end: "bottom bottom",
            scrub: 1.5,
        }
    });
}

    // #day 섹션 애니메이션 타임라인
    const dayTl = gsap.timeline({
        scrollTrigger: {
            trigger: "#day",       // 애니메이션 기준점
            start: "top 75%",      // 섹션의 윗부분이 화면 75% 지점에 오면 시작
            toggleActions: "play none none reverse" // 올리면 다시 사라짐
        }
    });

    dayTl
    // 1. 영어 제목 등장
    .from("#day .service .english", { 
        y: 20, opacity: 0, duration: 0.6, ease: "power2.out" 
    })
    // 2. 한글 제목 등장 (약간 시차)
    .from("#day .service p:not(.english)", { 
        y: 20, opacity: 0, duration: 0.6, ease: "power2.out" 
    }, "-=0.4")
    // 3. 아이콘들 순차적 등장 (핵심: stagger)
    .from("#day .icon li", {
        y: 30, 
        opacity: 0, 
        duration: 0.6, 
        stagger: 0.15, // 0.15초 간격으로 하나씩 등장
        ease: "back.out(1.7)" // 살짝 튀어오르는 느낌
    }, "-=0.2")
    // 4. 웨이브 배경 서서히 등장
    .from(".flow_area", { 
        opacity: 0, duration: 1.2 
    }, "-=0.8");