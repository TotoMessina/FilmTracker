import { supabase } from '../supabase-client.js';
import * as TMDB from '../tmdb-api.js';

let tournamentState = {
    rounds: [],
    currentRoundIndex: 0, // 0=Quarter, 1=Semi, 2=Final
    matches: [],
    winners: []
};

// Start a new tournament
export async function initTournament(containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = '<div class="loading">Preparando el Mundial...</div>';

    // 1. Fetch Watchlist
    const { data: watchlist, error } = await supabase
        .from('watchlist')
        .select(`*, movie:movies(*)`);

    if (error || !watchlist || watchlist.length < 8) {
        container.innerHTML = `
            <div style="text-align:center; padding:40px;">
                <h2>🍿 Mundial de Películas</h2>
                <p>Necesitas al menos 8 películas en tu Watchlist para armar un torneo.</p>
                <div style="font-size:2rem; margin-top:16px;">😐</div>
            </div>
        `;
        return;
    }

    // 2. Shuffle and pick 8
    const shuffled = watchlist.sort(() => 0.5 - Math.random()).slice(0, 8);

    // 3. Setup Quarter Finals (4 matches)
    tournamentState = {
        rounds: ['Cuartos de Final', 'Semifinales', 'GRAN FINAL'],
        currentRoundIndex: 0,
        matches: [],
        winners: []
    };

    // Create pairs
    for (let i = 0; i < shuffled.length; i += 2) {
        tournamentState.matches.push([shuffled[i], shuffled[i + 1]]);
    }

    renderMatch(container);
}

function renderMatch(container) {
    const roundName = tournamentState.rounds[tournamentState.currentRoundIndex];
    const currentMatchIndex = tournamentState.winners.length / 2; // Logic for progression? No, simple queue.

    // We process matches one by one. 
    // If currentRound has 4 matches, we need to get through them.
    // wait, simpler logic:
    // matches array holds the CURRENT round matches.
    // when empty, we move winners to a new round.

    if (tournamentState.matches.length === 0) {
        // Round complete?
        if (tournamentState.winners.length === 1) {
            renderWinner(container, tournamentState.winners[0]);
            return;
        }

        // Setup next round
        tournamentState.currentRoundIndex++;
        const nextRoundMatches = [];
        for (let i = 0; i < tournamentState.winners.length; i += 2) {
            nextRoundMatches.push([tournamentState.winners[i], tournamentState.winners[i + 1]]);
        }
        tournamentState.matches = nextRoundMatches;
        tournamentState.winners = []; // Reset for this new round
    }

    const match = tournamentState.matches[0];
    const movieA = match[0].movie;
    const movieB = match[1].movie;

    container.innerHTML = `
        <div class="tournament-arena" style="text-align:center; padding-top:20px;">
            <div style="margin-bottom:24px;">
                <h2 style="color:var(--primary); text-transform:uppercase; letter-spacing:2px;">${roundName}</h2>
                <p style="color:var(--text-muted);">Elige la que quieres ver HOY</p>
            </div>

            <div style="display:flex; justify-content:center; align-items:center; gap:40px; flex-wrap:wrap;">
                
                <!-- MOVIE A -->
                <div class="fighter-card" id="fighterA" style="width:250px; cursor:pointer; transition:transform 0.2s;">
                    <div style="position:relative; border-radius:12px; overflow:hidden; box-shadow:0 8px 20px rgba(0,0,0,0.4); border:3px solid transparent;">
                        <img src="${TMDB.getImageUrl(movieA.poster_path)}" style="width:100%; display:block;">
                        <div style="position:absolute; bottom:0; left:0; width:100%; background:linear-gradient(to top, rgba(0,0,0,0.9), transparent); padding:20px 10px 10px;">
                            <h3 style="font-size:1.1rem; text-shadow:0 2px 4px black;">${movieA.title}</h3>
                            <div style="color:var(--warning); font-size:0.9rem;">⭐ ${movieA.vote_average.toFixed(1)}</div>
                        </div>
                    </div>
                </div>

                <div style="font-size:2rem; font-weight:900; color:var(--text-muted); font-style:italic;">VS</div>

                <!-- MOVIE B -->
                <div class="fighter-card" id="fighterB" style="width:250px; cursor:pointer; transition:transform 0.2s;">
                    <div style="position:relative; border-radius:12px; overflow:hidden; box-shadow:0 8px 20px rgba(0,0,0,0.4); border:3px solid transparent;">
                        <img src="${TMDB.getImageUrl(movieB.poster_path)}" style="width:100%; display:block;">
                        <div style="position:absolute; bottom:0; left:0; width:100%; background:linear-gradient(to top, rgba(0,0,0,0.9), transparent); padding:20px 10px 10px;">
                            <h3 style="font-size:1.1rem; text-shadow:0 2px 4px black;">${movieB.title}</h3>
                            <div style="color:var(--warning); font-size:0.9rem;">⭐ ${movieB.vote_average.toFixed(1)}</div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    `;

    // Add interactions
    const cardA = document.getElementById('fighterA');
    const cardB = document.getElementById('fighterB');

    const handleVote = (winnerIndex) => {
        // Visual feedback
        const winnerCard = winnerIndex === 0 ? cardA : cardB;
        const loserCard = winnerIndex === 0 ? cardB : cardA;

        winnerCard.style.borderColor = 'var(--primary)';
        winnerCard.style.transform = 'scale(1.05)';
        loserCard.style.opacity = '0.3';
        loserCard.style.transform = 'scale(0.9)';

        setTimeout(() => {
            // Advance logic
            tournamentState.winners.push(match[winnerIndex]);
            tournamentState.matches.shift(); // Remove processed match
            renderMatch(container);
        }, 600);
    };

    cardA.onclick = () => handleVote(0);
    cardB.onclick = () => handleVote(1);

    // Hover effects
    cardA.onmouseover = () => cardA.style.transform = 'translateY(-5px)';
    cardA.onmouseout = () => cardA.style.transform = 'translateY(0)';

    cardB.onmouseover = () => cardB.style.transform = 'translateY(-5px)';
    cardB.onmouseout = () => cardB.style.transform = 'translateY(0)';
}

function renderWinner(container, winner) {
    container.innerHTML = `
        <div style="text-align:center; padding-top:40px; animation: fadeIn 1s;">
            <h1 style="color:var(--primary); font-size:2.5rem; margin-bottom:10px;">🏆 ¡TENEMOS GANADORA!</h1>
            <p style="font-size:1.2rem; margin-bottom:30px;">La elegida para esta noche es:</p>
            
            <div style="max-width:300px; margin:0 auto; position:relative;">
                <img src="${TMDB.getImageUrl(winner.movie.poster_path)}" style="width:100%; border-radius:12px; box-shadow:0 0 50px rgba(229, 9, 20, 0.4); border:4px solid var(--primary);">
                <div style="margin-top:20px;">
                    <h2 style="font-size:1.5rem;">${winner.movie.title}</h2>
                </div>
            </div>

            <div style="margin-top:40px; display:flex; gap:16px; justify-content:center;">
                <button id="logWinnerBtn" class="btn btn-primary" style="padding:12px 32px; font-size:1.1rem;">
                    <i class="fas fa-check"></i> Registrar como Vista
                </button>
                <button id="restartBtn" class="btn btn-secondary">
                    <i class="fas fa-redo"></i> Nuevo Torneo
                </button>
            </div>
        </div>
    `;

    document.getElementById('logWinnerBtn').onclick = () => {
        import('./logging.js').then(m => m.openLogModal(winner.movie.tmdb_id));
    };

    document.getElementById('restartBtn').onclick = () => {
        initTournament(container.id);
    };

    // Confetti effect (simple CSS/JS optional)
    launchConfetti();
}

function launchConfetti() {
    // Basic confetti implementation if desired, or skip for now to keep it lightweight
    // Relying on the user "Wow" factor from the UI design
}
