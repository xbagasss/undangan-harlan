document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize AOS (Animation on Scroll)
    AOS.init({
        once: true,
        offset: 80,
        easing: 'ease-out-cubic',
    });

    // 2. Handle URL Parameter for Guest Name
    const urlParams = new URLSearchParams(window.location.search);
    const to = urlParams.get('to');
    if (to) {
        const guestNameStr = decodeURIComponent(to).replace(/\b\w/g, l => l.toUpperCase());
        document.getElementById('guest-name').textContent = guestNameStr;
    }

    // 3. UI Elements
    const btnOpen = document.getElementById('open-invitation');
    const coverWrapper = document.getElementById('cover');
    const mainContent = document.getElementById('main-content');
    const bgMusicIframe = document.getElementById('bg-music-iframe');
    const musicControl = document.getElementById('music-control');
    const musicIcon = musicControl.querySelector('i');

    let isPlaying = false;

    // 4. Open Invitation Logic (Split Door Effect)
    btnOpen.addEventListener('click', () => {
        // Trigger split door CSS animation
        coverWrapper.classList.add('open');

        // Show main content and reveal smoothly
        mainContent.style.pointerEvents = 'auto';
        mainContent.style.opacity = '1';

        // Allow body scroll
        document.body.style.overflow = 'auto';
        document.body.style.overflowX = 'hidden';

        // Play Audio (YouTube Iframe)
        if (bgMusicIframe) {
            bgMusicIframe.contentWindow.postMessage(JSON.stringify({ event: 'command', func: 'playVideo' }), '*');
            isPlaying = true;
            musicControl.style.display = 'flex';
            musicControl.classList.remove('paused');
        }

        // Hide cover wrapper completely from DOM after animation completes to free memory
        setTimeout(() => {
            coverWrapper.style.display = 'none';
            // Refresh AOS positioning since layout changed
            AOS.refresh();
        }, 1500);
    });

    // 5. Music Control Toggle
    musicControl.addEventListener('click', () => {
        if (isPlaying) {
            bgMusicIframe.contentWindow.postMessage(JSON.stringify({ event: 'command', func: 'pauseVideo' }), '*');
            musicControl.classList.add('paused');
        } else {
            bgMusicIframe.contentWindow.postMessage(JSON.stringify({ event: 'command', func: 'playVideo' }), '*');
            musicControl.classList.remove('paused');
        }
        isPlaying = !isPlaying;
    });

    // 6. Countdown Timer Logic
    // Target Date: 7 Maret 2026, 15:30 WIB
    const countDownDate = new Date("Mar 07, 2026 15:30:00").getTime();

    const x = setInterval(function () {
        const now = new Date().getTime();
        const distance = countDownDate - now;

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        // Format to 2 digits
        document.getElementById("cd-days").innerText = days.toString().padStart(2, '0');
        document.getElementById("cd-hours").innerText = hours.toString().padStart(2, '0');
        document.getElementById("cd-minutes").innerText = minutes.toString().padStart(2, '0');
        document.getElementById("cd-seconds").innerText = seconds.toString().padStart(2, '0');

        if (distance < 0) {
            clearInterval(x);
            document.querySelector(".countdown-container").innerHTML = "<h3 style='color: var(--primary);'>Acara Sedang Berlangsung / Telah Selesai</h3>";
        }
    }, 1000);


    // 7. RSVP Form & Local Storage Logic
    const rsvpForm = document.getElementById('rsvp-form');
    const wishesList = document.getElementById('wishes-list');

    loadWishes();

    rsvpForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const name = document.getElementById('name').value;
        const attendance = document.getElementById('attendance').value;
        const message = document.getElementById('message').value;

        if (!name || !attendance || !message) return;

        const newWish = { name, attendance, message, timestamp: new Date().toISOString() };

        let wishes = JSON.parse(localStorage.getItem('undangan_wishes_v2') || '[]');
        wishes.unshift(newWish);
        localStorage.setItem('undangan_wishes_v2', JSON.stringify(wishes));

        renderWish(newWish, true); // true applies quick animation for just added item
        rsvpForm.reset();

        // Remove focus styling if any
        Array.from(rsvpForm.elements).forEach(el => el.blur());
    });

    function loadWishes() {
        let wishes = JSON.parse(localStorage.getItem('undangan_wishes_v2'));

        if (!wishes || wishes.length === 0) {
            // Seeder data
            wishes = [
                {
                    name: 'Keluarga Budi Santoso',
                    attendance: 'Hadir',
                    message: 'Barakallah, semoga Rayyan menjadi anak yang sholeh, berbakti, dan berguna bagi agama, nusa dan bangsa. Aamiin.',
                    timestamp: new Date().toISOString()
                }
            ];
            localStorage.setItem('undangan_wishes_v2', JSON.stringify(wishes));
        }

        wishesList.innerHTML = '';
        wishes.forEach(wish => renderWish(wish, false));
    }

    function renderWish(wish, isNew) {
        const isHadir = wish.attendance === 'Hadir';
        const badgeClass = isHadir ? 'wish-badge present' : 'wish-badge absent';
        const badgeText = isHadir ? '<i class="fa-solid fa-check"></i> Hadir' : '<i class="fa-solid fa-xmark"></i> Tidak Hadir';

        const wishHTML = `
            <div class="wish-item" ${isNew ? 'style="animation: fadeInDown 0.5s;"' : ''}>
                <div class="wish-header">
                    <span class="wish-name">${wish.name}</span>
                    <span class="${badgeClass}">${badgeText}</span>
                </div>
                <div class="wish-msg">"${wish.message}"</div>
            </div>
        `;

        wishesList.insertAdjacentHTML(isNew ? 'afterbegin' : 'beforeend', wishHTML);
    }

    // 8. Generate Background Particles (Gold Dust)
    function createParticles() {
        const container = document.getElementById('particles-container');
        if (!container) return;

        const particleCount = 40; // Number of particles

        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.classList.add('particle');

            // Randomize properties for organic feel
            const size = Math.random() * 6 + 2; // Size between 2px and 8px
            const left = Math.random() * 100; // Position 0% to 100%
            const duration = Math.random() * 15 + 15; // Animation duration 15s to 30s
            const delay = Math.random() * 20; // Start delay 0s to 20s

            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            particle.style.left = `${left}%`;
            particle.style.animationDuration = `${duration}s`;
            particle.style.animationDelay = `${delay}s`;

            container.appendChild(particle);
        }
    }

    createParticles();
});
