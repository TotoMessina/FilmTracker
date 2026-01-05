function openFiltersModal() {
    const existing = document.getElementById('filtersModal');
    if (existing) existing.remove();

    const backdrop = document.createElement('div');
    backdrop.id = 'filtersModal';
    backdrop.className = 'modal-backdrop active';

    // Generate years
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear; i >= 1900; i--) years.push(i);
    const yearOptions = years.map(y => `<option value="${y}">${y}</option>`).join('');

    backdrop.innerHTML = `
        <div class="modal-content" style="max-width:500px; height:auto; overflow:visible;">
            <div class="modal-header">
                <h3>Filtros Avanzados</h3>
                <button class="modal-close"><i class="fas fa-times"></i></button>
            </div>
            <div class="modal-body" style="grid-template-columns: 1fr; gap:16px;">
                
                <!-- Sort -->
                <div class="form-group">
                    <label>Ordenar Por</label>
                    <select id="filterSort" class="form-input" style="background:var(--surface); color:var(--text);">
                        <option value="popularity.desc">Más Populares (Default)</option>
                        <option value="popularity.asc">Menos Populares</option>
                        <option value="vote_average.desc">Mejor Calificadas</option>
                        <option value="primary_release_date.desc">Más Nuevas</option>
                        <option value="primary_release_date.asc">Más Antiguas</option>
                        <option value="revenue.desc">Mayor Recaudación</option>
                    </select>
                </div>

                <!-- Year -->
                <div class="form-group">
                    <label>Año de Lanzamiento</label>
                    <select id="filterYear" class="form-input" style="background:var(--surface); color:var(--text);">
                        <option value="">Cualquiera</option>
                        ${yearOptions}
                    </select>
                </div>

                <!-- Providers -->
                <div class="form-group">
                    <label>Plataforma (Streaming)</label>
                    <div style="display:flex; gap:12px; flex-wrap:wrap;">
                        <label class="provider-check" style="cursor:pointer; display:flex; flex-direction:column; align-items:center; gap:4px;">
                            <input type="checkbox" name="provider" value="8" style="display:none;">
                            <img src="https://image.tmdb.org/t/p/original/t2yyOv40HZeVUxj05m4UqxBbD9T.jpg" style="width:40px; height:40px; border-radius:8px; opacity:0.5; border:2px solid transparent; transition:all 0.2s;">
                            <span style="font-size:0.7rem;">Netflix</span>
                        </label>
                         <label class="provider-check" style="cursor:pointer; display:flex; flex-direction:column; align-items:center; gap:4px;">
                            <input type="checkbox" name="provider" value="337" style="display:none;">
                            <img src="https://image.tmdb.org/t/p/original/pbpMk2JmcoNnQwx5JGpXngfoWtp.jpg" style="width:40px; height:40px; border-radius:8px; opacity:0.5; border:2px solid transparent; transition:all 0.2s;">
                            <span style="font-size:0.7rem;">Disney+</span>
                        </label>
                        <label class="provider-check" style="cursor:pointer; display:flex; flex-direction:column; align-items:center; gap:4px;">
                            <input type="checkbox" name="provider" value="119" style="display:none;">
                            <img src="https://image.tmdb.org/t/p/original/sVBEF7q7LqjHAWSnKwDbznr2zZG.jpg" style="width:40px; height:40px; border-radius:8px; opacity:0.5; border:2px solid transparent; transition:all 0.2s;">
                            <span style="font-size:0.7rem;">Prime</span>
                        </label>
                        <label class="provider-check" style="cursor:pointer; display:flex; flex-direction:column; align-items:center; gap:4px;">
                            <input type="checkbox" name="provider" value="1899" style="display:none;">
                            <img src="https://image.tmdb.org/t/p/original/6uhMBGF5KQkvPq4FvJ4NzbT1Y6l.jpg" style="width:40px; height:40px; border-radius:8px; opacity:0.5; border:2px solid transparent; transition:all 0.2s;">
                            <span style="font-size:0.7rem;">Max</span>
                        </label>
                         <label class="provider-check" style="cursor:pointer; display:flex; flex-direction:column; align-items:center; gap:4px;">
                            <input type="checkbox" name="provider" value="350" style="display:none;">
                            <img src="https://image.tmdb.org/t/p/original/2E03IAFuvSVWspjNJ31pMks99D3.jpg" style="width:40px; height:40px; border-radius:8px; opacity:0.5; border:2px solid transparent; transition:all 0.2s;">
                            <span style="font-size:0.7rem;">Apple</span>
                        </label>
                    </div>
                </div>

                <div class="form-group">
                     <label>Géneros Extra</label>
                     <select id="filterGenre" class="form-input" style="background:var(--surface); color:var(--text);">
                        <option value="">Ninguno</option>
                        <option value="28">Acción</option>
                        <option value="12">Aventura</option>
                        <option value="16">Animación</option>
                        <option value="35">Comedia</option>
                        <option value="80">Crimen</option>
                        <option value="99">Documental</option>
                        <option value="18">Drama</option>
                        <option value="10751">Familia</option>
                        <option value="14">Fantasía</option>
                        <option value="36">Historia</option>
                        <option value="27">Terror</option>
                        <option value="10402">Música</option>
                        <option value="9648">Misterio</option>
                        <option value="10749">Romance</option>
                        <option value="878">Ciencia Ficción</option>
                        <option value="10770">Película de TV</option>
                        <option value="53">Suspense</option>
                        <option value="10752">Bélica</option>
                        <option value="37">Western</option>
                     </select>
                </div>

                <button id="applyFiltersBtn" class="btn btn-primary" style="width:100%;">Aplicar Filtros</button>
            </div>
        </div>
    `;

    document.body.appendChild(backdrop);

    // Initial Logic (Pre-select based on current state)
    if (discoveryState.params.sort_by) document.getElementById('filterSort').value = discoveryState.params.sort_by;
    if (discoveryState.params.primary_release_year) document.getElementById('filterYear').value = discoveryState.params.primary_release_year;
    if (discoveryState.params.with_genres) document.getElementById('filterGenre').value = discoveryState.params.with_genres;

    // Checkboxes
    if (discoveryState.params.with_watch_providers) {
        const selected = discoveryState.params.with_watch_providers.split('|');
        backdrop.querySelectorAll('input[name="provider"]').forEach(chk => {
            if (selected.includes(chk.value)) {
                chk.checked = true;
                chk.nextElementSibling.style.opacity = '1';
                chk.nextElementSibling.style.borderColor = 'var(--primary)';
            }
        });
    }

    // Toggle Visuals for Checkboxes
    backdrop.querySelectorAll('input[name="provider"]').forEach(chk => {
        chk.addEventListener('change', e => {
            const img = e.target.nextElementSibling;
            if (e.target.checked) {
                img.style.opacity = '1';
                img.style.borderColor = 'var(--primary)';
            } else {
                img.style.opacity = '0.5';
                img.style.borderColor = 'transparent';
            }
        });
    });


    // Close
    const close = () => backdrop.remove();
    backdrop.querySelector('.modal-close').onclick = close;
    backdrop.onclick = (e) => { if (e.target === backdrop) close(); }

    // Apply
    document.getElementById('applyFiltersBtn').onclick = () => {
        const sort = document.getElementById('filterSort').value;
        const year = document.getElementById('filterYear').value;
        const genre = document.getElementById('filterGenre').value;

        // Providers
        const providers = [];
        backdrop.querySelectorAll('input[name="provider"]:checked').forEach(c => providers.push(c.value));

        // Update State
        const newParams = { ...discoveryState.params };

        if (sort) newParams.sort_by = sort;
        if (year) newParams.primary_release_year = year;
        else delete newParams.primary_release_year;

        // Merge genre if exists or overwrite?
        // Let's overwrite for simple filter logic
        if (genre) newParams.with_genres = genre;
        // If empty? keep whatever was there or delete? 
        // If explicit none selected, maybe we shouldn't delete 'cause user might be in "Action" pill.
        // But here we selected "Genre Extra". Let's say it overrides.

        if (providers.length > 0) {
            newParams.with_watch_providers = providers.join('|');
            newParams.watch_region = 'MX'; // Required for providers
        } else {
            delete newParams.with_watch_providers;
            delete newParams.watch_region;
        }

        discoveryState.params = newParams;
        resetGrid(); // Keep current mode but reset page
        fetchDiscoveryMovies();
        close();
    };
}
