import { supabase } from '../supabase-client.js';
import * as TMDB from '../tmdb-api.js';

// Dynamic loading of html2canvas
async function loadHtml2Canvas() {
    if (window.html2canvas) return;
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

export async function openTicketModal(logId) {
    // 1. Fetch full log details
    const { data: log } = await supabase
        .from('logs')
        .select('*, movie:movies(*)')
        .eq('id', logId)
        .single();

    if (!log) return alert('Log no encontrado');

    // 2. Create Modal
    const modalId = 'ticketModal';
    let modal = document.getElementById(modalId);
    if (!modal) {
        modal = document.createElement('div');
        modal.id = modalId;
        modal.className = 'modal active';
        document.body.appendChild(modal);
    }

    // 3. Render Ticket content
    const posterUrl = TMDB.getImageUrl(log.custom_poster_path || log.movie.poster_path, 'w500');
    const bgUrl = TMDB.getImageUrl(log.movie.backdrop_path, 'w1280');

    modal.innerHTML = `
        <div class="modal-content" style="max-width: 450px; background:transparent; box-shadow:none; overflow:visible;">
            <div style="text-align:right; margin-bottom:10px;">
                <button class="modal-close btn-icon" style="background:rgba(0,0,0,0.5); color:white;">&times;</button>
            </div>
            
            <div id="ticketNode" style="
                background: linear-gradient(135deg, #d4af37 0%, #f9f295 50%, #aa8e28 100%);
                border-radius: 12px;
                overflow: hidden;
                position: relative;
                box-shadow: 0 10px 30px rgba(0,0,0,0.5);
                font-family: 'Courier New', monospace;
                color: #2c3e50;
                display: flex;
                flex-direction: column;
            ">
                <!-- Header Stub -->
                <div style="border-bottom: 2px dashed #2c3e50; padding: 16px; background: rgba(255,255,255,0.1); display:flex; justify-content:space-between; align-items:center;">
                    <div style="font-weight:900; letter-spacing:2px; font-size:1.2rem;">CINEMA TICKET</div>
                    <div style="font-weight:700;">ADMIT ONE</div>
                </div>

                <!-- Main Body -->
                <div style="padding: 24px; position:relative;">
                    <!-- Watermark/BG -->
                    <div style="position:absolute; top:0; left:0; width:100%; height:100%; 
                                background-image: url('${posterUrl}'); 
                                background-size: cover; 
                                background-position: center; 
                                opacity: 0.15; 
                                filter: grayscale(100%);
                                z-index:0;"></div>
                    
                    <div style="position:relative; z-index:1;">
                        <h1 style="margin:0 0 10px 0; font-size:1.8rem; line-height:1.1; text-transform:uppercase; font-weight:800; text-shadow: 1px 1px 0px rgba(255,255,255,0.5);">${log.movie.title}</h1>
                        
                        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:12px; margin-top:20px; font-size:0.9rem; font-weight:600;">
                            <div>
                                <div style="font-size:0.7rem; opacity:0.7;">FECHA</div>
                                <div>${log.watched_at}</div>
                            </div>
                            <div>
                                <div style="font-size:0.7rem; opacity:0.7;">HORA</div>
                                <div>20:00</div> <!-- Mocked or user input? -->
                            </div>
                             <div>
                                <div style="font-size:0.7rem; opacity:0.7;">SALA</div>
                                <div>VIP 4</div>
                            </div>
                            <div>
                                <div style="font-size:0.7rem; opacity:0.7;">PUNTUACIÓN</div>
                                <div>${'★'.repeat(Math.round(log.rating / 2))}${'☆'.repeat(5 - Math.round(log.rating / 2))}</div>
                            </div>
                        </div>

                        <div style="margin-top:20px; text-align:center;">
                             <div style="font-family: 'Libre Barcode 39', cursive; font-size:2rem; opacity:0.8;">${log.id.split('-')[0]}</div>
                        </div>
                    </div>
                </div>
                
                <!-- Ticket Rip Effect (Circles) -->
                <div style="position:absolute; left:-10px; top:50%; width:20px; height:20px; border-radius:50%; background:#1a1a1a;"></div>
                <div style="position:absolute; right:-10px; top:50%; width:20px; height:20px; border-radius:50%; background:#1a1a1a;"></div>
            </div>

            <div style="margin-top:20px; text-align:center;">
                <button id="downloadTicketBtn" class="btn btn-primary" style="box-shadow: 0 4px 15px rgba(212, 175, 55, 0.4);">
                    <i class="fas fa-download"></i> Descargar Imagen
                </button>
            </div>
        </div>
    `;

    // Events
    modal.querySelector('.modal-close').onclick = () => {
        document.body.removeChild(modal);
    };

    document.getElementById('downloadTicketBtn').onclick = async () => {
        const btn = document.getElementById('downloadTicketBtn');
        const originalText = btn.innerHTML;
        btn.textContent = 'Generando...';

        await loadHtml2Canvas();

        const node = document.getElementById('ticketNode');

        try {
            const canvas = await html2canvas(node, {
                backgroundColor: null,
                scale: 2 // High res
            });

            const link = document.createElement('a');
            link.download = `ticket-${log.movie.title}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();

            btn.innerHTML = `<i class="fas fa-check"></i> Listo!`;
            setTimeout(() => btn.innerHTML = originalText, 2000);
        } catch (e) {
            console.error(e);
            alert('Error generando imagen');
            btn.innerHTML = originalText;
        }
    };
}
