(function() {
    // 1. Panel Tasarımı
    const fullPageOverlay = document.createElement('div');
    fullPageOverlay.id = 'full-page-drawing-overlay';
    fullPageOverlay.style.cssText = 'position:fixed; top:0; left:0; width:100vw; height:100vh; background:#000000; z-index:9999999; display:flex; flex-direction:column; font-family:sans-serif; overflow:hidden;';

    const header = document.createElement('div');
    header.style.cssText = 'display:flex; justify-content:space-between; align-items:center; background:#1e1e1e; padding:10px 20px; border-bottom:1px solid #333; color:#fff;';
    
    const titleSpan = document.createElement('span');
    titleSpan.textContent = '🎨 Tam Ekran Çizim Alanı';
    titleSpan.style.cssText = 'font-weight:bold; font-size:16px;';
    
    const closeBtn = document.createElement('button');
    closeBtn.textContent = '❌ Kapat';
    closeBtn.style.cssText = 'background:none; border:none; color:#ff4d4d; cursor:pointer; font-weight:bold; font-size:14px;';
    closeBtn.onclick = () => fullPageOverlay.remove();

    header.appendChild(titleSpan);
    header.appendChild(closeBtn);
    fullPageOverlay.appendChild(header);

    const canvas = document.createElement('canvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight - 140; // Butonları yukarı almak için tuvali dikeyde daha çok kısalttık
    canvas.style.cssText = 'background:#000000; cursor:crosshair; touch-action:none; flex-grow:1;';
    fullPageOverlay.appendChild(canvas);

    // Alt Kontrol Çubuğu - Alt sınırdan çok daha yukarıya basması için alttan 60px dolgu (padding) verdik
    const controls = document.createElement('div');
    controls.style.cssText = 'display:flex; gap:16px; align-items:center; justify-content:center; background:#1e1e1e; padding:16px 12px 60px 12px; border-top:1px solid #333; flex-wrap:wrap;';

    // 2. Renk Seçim Kutuları
    const colorPalette = document.createElement('div');
    colorPalette.style.cssText = 'display:flex; gap:10px; align-items:center;';
    
    const colors = [
        { hex: '#ffffff' },
        { hex: '#ff4d4d' },
        { hex: '#4caf50' },
        { hex: '#2196f3' },
        { hex: '#ffeb3b' }
    ];

    let currentDrawColor = '#ffffff';

    colors.forEach((color, index) => {
        const cBtn = document.createElement('button');
        cBtn.style.cssText = `width:35px; height:35px; background:${color.hex}; border:2px solid #52525b; border-radius:6px; cursor:pointer; padding:0; display:inline-block;`;
        
        cBtn.addEventListener('click', () => {
            isEraser = false;
            eraserBtn.style.background = '#27272a';
            eraserBtn.textContent = '🧽';
            currentDrawColor = color.hex;
            
            Array.from(colorPalette.children).forEach(b => b.style.borderColor = '#52525b');
            cBtn.style.borderColor = '#fff';
        });
        
        colorPalette.appendChild(cBtn);
    });
    colorPalette.children[0].style.borderColor = '#fff';
    controls.appendChild(colorPalette);

    // İşlevsel Butonlar
    const btnStyle = 'width:50px; height:35px; font-size:16px; display:flex; align-items:center; justify-content:center; border:1px solid #3f3f46; border-radius:6px; background:#27272a; color:#e4e4e7; cursor:pointer; box-sizing:border-box; padding:0;';
    
    const eraserBtn = document.createElement('button');
    eraserBtn.textContent = '🧽';
    eraserBtn.style.cssText = btnStyle;
    controls.appendChild(eraserBtn);

    const clearBtn = document.createElement('button');
    clearBtn.textContent = '🗑️';
    clearBtn.style.cssText = btnStyle + 'background:#451a03; border-color:#7c2d12;';
    controls.appendChild(clearBtn);

    const copyBtn = document.createElement('button');
    copyBtn.textContent = '📋';
    copyBtn.style.cssText = btnStyle + 'background:#064e3b; border-color:#065f46; width:70px;';
    controls.appendChild(copyBtn);

    fullPageOverlay.appendChild(controls);
    document.body.appendChild(fullPageOverlay);

    // 3. Çizim Mantığı
    const ctx = canvas.getContext('2d');
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 5;
    
    let isDrawing = false;
    let isEraser = false;
    let lastX = 0;
    let lastY = 0;

    function draw(e) {
        if (!isDrawing) return;
        
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(x, y);
        
        if (isEraser) {
            ctx.lineWidth = 30;
            ctx.strokeStyle = '#000000';
        } else {
            ctx.lineWidth = 5;
            ctx.strokeStyle = currentDrawColor;
        }
        
        ctx.stroke();
        [lastX, lastY] = [x, y];
    }

    canvas.addEventListener('mousedown', (e) => {
        isDrawing = true;
        const rect = canvas.getBoundingClientRect();
        [lastX, lastY] = [e.clientX - rect.left, e.clientY - rect.top];
    });

    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', () => isDrawing = false);
    canvas.addEventListener('mouseout', () => isDrawing = false);

    window.addEventListener('resize', () => {
        if (document.getElementById('full-page-drawing-overlay')) {
            const temp = ctx.getImageData(0, 0, canvas.width, canvas.height);
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight - 140;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.putImageData(temp, 0, 0);
        }
    });

    // 4. Buton Aksiyonları
    eraserBtn.addEventListener('click', () => {
        isEraser = !isEraser;
        if (isEraser) {
            eraserBtn.style.background = '#3f3f46';
            eraserBtn.textContent = '✏️';
        } else {
            eraserBtn.style.background = '#27272a';
            eraserBtn.textContent = '🧽';
        }
    });

    clearBtn.addEventListener('click', () => {
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    });

    copyBtn.addEventListener('click', () => {
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;
        const tempCtx = tempCanvas.getContext('2d');
        
        tempCtx.fillStyle = '#000000';
        tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
        tempCtx.drawImage(canvas, 0, 0);

        tempCanvas.toBlob((blob) => {
            const item = new ClipboardItem({ 'image/png': blob });
            navigator.clipboard.write([item]).then(() => {
                const originalText = copyBtn.textContent;
                copyBtn.textContent = '✅';
                setTimeout(() => copyBtn.textContent = originalText, 1500);
            }).catch(err => {
                console.error('Kopyalama hatası:', err);
            });
        }, 'image/png');
    });

})();
