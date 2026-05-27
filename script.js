document.addEventListener("DOMContentLoaded", () => {
    const btnNo = document.getElementById("btn-no");
    const btnYes = document.getElementById("btn-yes");
    const questionContainer = document.getElementById("question-container");
    const contractContainer = document.getElementById("contract-container");

    // Function to move the "No" button randomly
    let isFirstMove = true;
    const moveButton = () => {
        if (isFirstMove) {
            // Set initial fixed position so the transition works on the first hover
            const rect = btnNo.getBoundingClientRect();
            btnNo.style.position = 'fixed';
            btnNo.style.left = `${rect.left}px`;
            btnNo.style.top = `${rect.top}px`;
            btnNo.style.right = 'auto'; // override CSS 'right'
            
            // Force reflow
            void btnNo.offsetWidth;
            isFirstMove = false;
        }

        // Limit movement exclusively inside the white container
        const containerRect = questionContainer.getBoundingClientRect();
        
        // Button dimensions
        const btnWidth = btnNo.offsetWidth;
        const btnHeight = btnNo.offsetHeight;

        // Safe padding so it doesn't touch the container edges
        const padding = 15; 
        
        const minX = containerRect.left + padding;
        const maxX = containerRect.right - btnWidth - padding;
        
        const minY = containerRect.top + padding;
        const maxY = containerRect.bottom - btnHeight - padding;

        // Ensure valid ranges just in case the container is too small
        const safeMaxX = Math.max(minX, maxX);
        const safeMaxY = Math.max(minY, maxY);

        const randomX = Math.floor(Math.random() * (safeMaxX - minX + 1)) + minX;
        const randomY = Math.floor(Math.random() * (safeMaxY - minY + 1)) + minY;

        btnNo.style.left = `${randomX}px`;
        btnNo.style.top = `${randomY}px`;
    };

    // Move button on hover (desktop)
    btnNo.addEventListener("mouseover", moveButton);
    // Move button on touch start (mobile devices)
    btnNo.addEventListener("touchstart", (e) => {
        e.preventDefault(); // Prevents the click from registering if they manage to tap
        moveButton();
    });
    // Just in case they somehow click it
    btnNo.addEventListener("click", (e) => {
        e.preventDefault();
        moveButton();
    });

    // Handle "Yes" click
    btnYes.addEventListener("click", () => {
        // Launch confetti
        confetti({
            particleCount: 150,
            spread: 80,
            origin: { y: 0.6 },
            colors: ['#f472b6', '#fcd34d', '#ffffff', '#ec4899']
        });

        // Hide question, show contract
        questionContainer.classList.add("hidden");
        contractContainer.classList.remove("hidden");
        
        // Remove the 'No' button from the DOM completely
        btnNo.remove();
    });

    // Add floating hearts effect to the background
    const createHeart = () => {
        const heart = document.createElement("div");
        heart.classList.add("heart");
        // Randomly pick a heart or star emoji
        const emojis = ['❤️', '💖', '✨', '💕', '🍮'];
        heart.innerText = emojis[Math.floor(Math.random() * emojis.length)];
        heart.style.left = Math.random() * 100 + "vw";
        heart.style.animationDuration = Math.random() * 3 + 3 + "s";
        document.body.appendChild(heart);

        setTimeout(() => {
            heart.remove();
        }, 5000);
    };

    setInterval(createHeart, 400);

    // --- SIGNATURE CANVAS LOGIC ---
    const sigCanvas = document.getElementById('ayled-signature');
    if (sigCanvas) {
        const sigCtx = sigCanvas.getContext('2d');
        let isDrawingSig = false;

        sigCtx.strokeStyle = '#0f172a';
        sigCtx.lineWidth = 2;
        sigCtx.lineCap = 'round';
        sigCtx.lineJoin = 'round';

        const getSigPos = (e) => {
            const rect = sigCanvas.getBoundingClientRect();
            const clientX = e.clientX || (e.touches && e.touches[0].clientX);
            const clientY = e.clientY || (e.touches && e.touches[0].clientY);
            return {
                x: clientX - rect.left,
                y: clientY - rect.top
            };
        };

        const startSig = (e) => {
            isDrawingSig = true;
            const pos = getSigPos(e);
            sigCtx.beginPath();
            sigCtx.moveTo(pos.x, pos.y);
            if(e.cancelable) e.preventDefault();
        };

        const drawSig = (e) => {
            if (!isDrawingSig) return;
            const pos = getSigPos(e);
            sigCtx.lineTo(pos.x, pos.y);
            sigCtx.stroke();
            if(e.cancelable) e.preventDefault();
        };

        const stopSig = () => { isDrawingSig = false; };

        sigCanvas.addEventListener('mousedown', startSig);
        sigCanvas.addEventListener('mousemove', drawSig);
        sigCanvas.addEventListener('mouseup', stopSig);
        sigCanvas.addEventListener('mouseout', stopSig);
        
        sigCanvas.addEventListener('touchstart', startSig, {passive: false});
        sigCanvas.addEventListener('touchmove', drawSig, {passive: false});
        sigCanvas.addEventListener('touchend', stopSig);

        document.getElementById('clear-ayled-sig').addEventListener('click', () => {
            sigCtx.clearRect(0, 0, sigCanvas.width, sigCanvas.height);
        });
    }

    // --- SET TODAY'S DATE ---
    const today = new Date();
    const dateStr = `${String(today.getDate()).padStart(2, '0')} / ${String(today.getMonth() + 1).padStart(2, '0')} / ${today.getFullYear()}`;
    const dateEl = document.getElementById('current-date');
    if (dateEl) dateEl.innerText = dateStr;

    // --- DOWNLOAD LOGIC ---
    const btnDownload = document.getElementById('btn-download');
    if (btnDownload) {
        btnDownload.addEventListener('click', () => {
            const contractEl = document.getElementById('printable-contract');
            btnDownload.innerText = "Guardando...";
            btnDownload.disabled = true;

            html2canvas(contractEl, {
                scale: 2, 
                backgroundColor: '#fffbeb'
            }).then(canvas => {
                try {
                    const dataURL = canvas.toDataURL('image/png');
                    const link = document.createElement('a');
                    link.href = dataURL;
                    link.download = 'Contrato_Oficial_Noviazgo.png';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    
                    btnDownload.innerText = "¡Descargado con éxito! 💖";
                    setTimeout(() => {
                        btnDownload.innerText = "Firmar y Descargar Contrato 💾";
                        btnDownload.disabled = false;
                    }, 3000);
                } catch (e) {
                    throw new Error("Tainted canvas"); // fuerza al fallback
                }
            }).catch(err => {
                console.warn("Alternativa de PDF (Seguridad de navegador)...", err);
                window.print(); // Fallback a Guardar como PDF
                btnDownload.innerText = "Firmar y Descargar Contrato 💾";
                btnDownload.disabled = false;
            });
        });
    }
});
