import { supabase } from '../supabase-client.js';

// Country Codes (ISO 3166-1 alpha-2) to Lat/Lon mapping (Simplified for capitals/centers)
const COUNTRY_COORDS = {
    'US': [37.0902, -95.7129], 'GB': [55.3781, -3.4360], 'FR': [46.2276, 2.2137],
    'DE': [51.1657, 10.4515], 'ES': [40.4637, -3.7492], 'IT': [41.8719, 12.5674],
    'JP': [36.2048, 138.2529], 'KR': [35.9078, 127.7669], 'CN': [35.8617, 104.1954],
    'IN': [20.5937, 78.9629], 'BR': [-14.2350, -51.9253], 'MX': [23.6345, -102.5528],
    'CA': [56.1304, -106.3468], 'AU': [-25.2744, 133.7751], 'NZ': [-40.9006, 174.8860],
    'AR': [-38.4161, -63.6167], 'CL': [-35.6751, -71.5430], 'CO': [4.5709, -74.2973],
    'SE': [60.1282, 18.6435], 'NO': [60.4720, 8.4689], 'DK': [56.2639, 9.5018],
    'FI': [61.9241, 25.7482], 'IE': [53.1424, -7.6921], 'RU': [61.5240, 105.3188]
    // Add more as needed
};

async function loadLeaflet() {
    if (window.L) return;

    // Add CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);

    // Add JS
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

export async function renderMap(containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = '<div class="loading">Cargando mapa...</div>';

    await loadLeaflet();

    // Fetch Logs with Movie Countries
    const { data: logs } = await supabase
        .from('logs')
        .select(`
            id,
            movie:movies(title, production_countries)
        `);

    if (!logs) {
        container.innerHTML = 'Error al cargar datos.';
        return;
    }

    // Process Data
    const countryCounts = {}; // { 'US': { count: 10, titles: [] } }

    logs.forEach(log => {
        try {
            const countries = typeof log.movie.production_countries === 'string'
                ? JSON.parse(log.movie.production_countries)
                : log.movie.production_countries;

            if (Array.isArray(countries)) {
                countries.forEach(c => {
                    const code = c.iso_3166_1;
                    if (!countryCounts[code]) {
                        countryCounts[code] = { count: 0, titles: [], name: c.name };
                    }
                    countryCounts[code].count++;
                    if (countryCounts[code].titles.length < 5) {
                        countryCounts[code].titles.push(log.movie.title);
                    }
                });
            }
        } catch (e) { console.error('Error parsing countries', e); }
    });

    // Render Map Container
    container.innerHTML = `
        <div style="height: 500px; width: 100%; border-radius: 12px; overflow: hidden; position: relative; z-index: 1;" id="mapView"></div>
        <div style="margin-top: 16px; display: flex; gap: 16px; overflow-x: auto; padding-bottom: 8px;">
            ${Object.entries(countryCounts).sort((a, b) => b[1].count - a[1].count).map(([code, data]) => `
                <div style="background: var(--surface); padding: 12px; border-radius: 8px; min-width: 140px; border: 1px solid var(--border);">
                    <div style="font-weight: 700; font-size: 1.1rem; color: var(--primary);">${data.count}</div>
                    <div style="font-size: 0.9rem;">${data.name}</div>
                </div>
            `).join('')}
        </div>
    `;

    // Init Leaflet
    const map = L.map('mapView').setView([20, 0], 2);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19
    }).addTo(map);

    // Add Markers
    Object.entries(countryCounts).forEach(([code, data]) => {
        const coords = COUNTRY_COORDS[code];
        if (coords) {
            const marker = L.circleMarker(coords, {
                radius: Math.min(10 + data.count, 30),
                color: '#E50914',
                fillColor: '#E50914',
                fillOpacity: 0.6
            }).addTo(map);

            marker.bindPopup(`
                <strong>${data.name}</strong><br>
                ${data.count} Películas<br>
                <hr style="margin:4px 0; border:0; border-top:1px solid #ccc;">
                <div style="font-size:0.85rem">
                    ${data.titles.join('<br>')}
                    ${data.count > 5 ? '<br>...y más' : ''}
                </div>
            `);
        }
    });
}
