import Chart from 'chart.js/auto';

// Sistema de tabla de puntajes con equipos
export class Scoreboard {
  constructor() {
    this.players = [];
    this.teams = [];
    this.teamsChart = null;
    this.playersChart = null;
    this.initializeEventListeners();
    this.loadFromStorage();
    this.renderTeamSelect();
  }

  initializeEventListeners() {
    // Jugadores
    document.getElementById('addPlayerBtn').addEventListener('click', () => this.addPlayer());
    document.getElementById('clearTableBtn').addEventListener('click', () => this.clearAll());
    document.getElementById('playerScore').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.addPlayer();
    });
    document.getElementById('playerName').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.addPlayer();
    });

    // Equipos
    document.getElementById('addTeamBtn').addEventListener('click', () => this.addTeam());
    document.getElementById('teamName').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.addTeam();
    });

    // Pestañas
    document.getElementById('tabJugadores').addEventListener('click', () => this.switchTab('jugadores'));
    document.getElementById('tabEquipos').addEventListener('click', () => this.switchTab('equipos'));
    document.getElementById('tabGraficos').addEventListener('click', () => this.switchTab('graficos'));
  }

  switchTab(tab) {
    // Ocultar todos
    document.getElementById('contenidoJugadores').classList.add('hidden');
    document.getElementById('contenidoEquipos').classList.add('hidden');
    document.getElementById('contenidoGraficos').classList.add('hidden');

    // Quitar estilos de botones
    document.getElementById('tabJugadores').classList.remove('border-b-2', 'border-indigo-500');
    document.getElementById('tabJugadores').classList.add('text-gray-400', 'border-transparent');
    document.getElementById('tabEquipos').classList.remove('border-b-2', 'border-indigo-500');
    document.getElementById('tabEquipos').classList.add('text-gray-400', 'border-transparent');
    document.getElementById('tabGraficos').classList.remove('border-b-2', 'border-indigo-500');
    document.getElementById('tabGraficos').classList.add('text-gray-400', 'border-transparent');

    // Mostrar tab seleccionado
    if (tab === 'jugadores') {
      document.getElementById('contenidoJugadores').classList.remove('hidden');
      document.getElementById('tabJugadores').classList.add('border-b-2', 'border-indigo-500');
      document.getElementById('tabJugadores').classList.remove('text-gray-400', 'border-transparent');
    } else if (tab === 'equipos') {
      document.getElementById('contenidoEquipos').classList.remove('hidden');
      document.getElementById('tabEquipos').classList.add('border-b-2', 'border-indigo-500');
      document.getElementById('tabEquipos').classList.remove('text-gray-400', 'border-transparent');
      this.renderTeamsTable();
    } else if (tab === 'graficos') {
      document.getElementById('contenidoGraficos').classList.remove('hidden');
      document.getElementById('tabGraficos').classList.add('border-b-2', 'border-indigo-500');
      document.getElementById('tabGraficos').classList.remove('text-gray-400', 'border-transparent');
      setTimeout(() => {
        this.renderCharts();
      }, 100);
    }
  }

  addTeam() {
    const nameInput = document.getElementById('teamName');
    const colorInput = document.getElementById('teamColor');
    
    const name = nameInput.value.trim();
    const color = colorInput.value;

    if (!name) {
      alert('Por favor ingresa el nombre del equipo');
      nameInput.focus();
      return;
    }

    if (this.teams.some(t => t.name.toLowerCase() === name.toLowerCase())) {
      alert('Este equipo ya existe');
      return;
    }

    this.teams.push({
      id: Date.now(),
      name,
      color
    });

    nameInput.value = '';
    this.renderTeamSelect();
    this.render();
    this.saveToStorage();
  }

  renderTeamSelect() {
    const select = document.getElementById('playerTeam');
    const options = this.teams.map(t => `<option value="${t.id}">${t.name}</option>`).join('');
    select.innerHTML = '<option value="">Seleccionar equipo...</option>' + options;
  }

  addPlayer() {
    const nameInput = document.getElementById('playerName');
    const teamInput = document.getElementById('playerTeam');
    const scoreInput = document.getElementById('playerScore');
    
    const name = nameInput.value.trim();
    const teamId = parseInt(teamInput.value) || null;
    const score = parseInt(scoreInput.value) || 0;

    if (!name) {
      alert('Por favor ingresa el nombre del jugador');
      nameInput.focus();
      return;
    }

    if (!teamId) {
      alert('Por favor selecciona un equipo');
      teamInput.focus();
      return;
    }

    if (this.players.some(p => p.name.toLowerCase() === name.toLowerCase())) {
      alert('Este jugador ya existe');
      return;
    }

    this.players.push({
      id: Date.now(),
      name,
      teamId,
      score
    });

    nameInput.value = '';
    scoreInput.value = '';
    teamInput.value = '';
    nameInput.focus();

    this.render();
    this.saveToStorage();
  }

  updatePlayerScore(id, amount) {
    const player = this.players.find(p => p.id === id);
    if (player) {
      player.score += amount;
      if (player.score < 0) player.score = 0;
      this.render();
      this.saveToStorage();
    }
  }

  removePlayer(id) {
    this.players = this.players.filter(p => p.id !== id);
    this.render();
    this.saveToStorage();
  }

  removeTeam(id) {
    if (confirm('¿Estás seguro? Los jugadores de este equipo serán eliminados.')) {
      this.teams = this.teams.filter(t => t.id !== id);
      this.players = this.players.filter(p => p.teamId !== id);
      this.renderTeamSelect();
      this.render();
      this.saveToStorage();
    }
  }

  clearAll() {
    if (this.players.length === 0 && this.teams.length === 0) return;
    if (confirm('¿Estás seguro de que deseas limpiar todo?')) {
      this.players = [];
      this.teams = [];
      this.renderTeamSelect();
      this.render();
      this.saveToStorage();
    }
  }

  getTeamById(id) {
    return this.teams.find(t => t.id === id);
  }

  getTeamStats(teamId) {
    const teamPlayers = this.players.filter(p => p.teamId === teamId);
    const totalScore = teamPlayers.reduce((sum, p) => sum + p.score, 0);
    const avgScore = teamPlayers.length > 0 ? (totalScore / teamPlayers.length).toFixed(2) : 0;
    
    return {
      players: teamPlayers.length,
      totalScore,
      avgScore
    };
  }

  getSortedPlayers() {
    return [...this.players].sort((a, b) => b.score - a.score);
  }

  getSortedTeams() {
    return [...this.teams].map(team => ({
      ...team,
      ...this.getTeamStats(team.id)
    })).sort((a, b) => b.totalScore - a.totalScore);
  }

  renderTeamsTable() {
    const tbody = document.getElementById('teamsTable');
    const emptyMessage = document.getElementById('emptyTeamsMessage');
    const sortedTeams = this.getSortedTeams();

    if (sortedTeams.length === 0) {
      tbody.innerHTML = '';
      emptyMessage.style.display = 'block';
      return;
    }

    emptyMessage.style.display = 'none';
    tbody.innerHTML = sortedTeams.map((team, index) => `
      <tr class="hover:bg-gray-700 transition-colors">
        <td class="px-6 py-4">
          <span class="text-lg font-bold text-indigo-400">
            ${this.getMedalEmoji(index)} ${index + 1}°
          </span>
        </td>
        <td class="px-6 py-4 font-medium">
          <div class="flex items-center gap-2">
            <span class="w-4 h-4 rounded-full" style="background-color: ${team.color}"></span>
            ${team.name}
          </div>
        </td>
        <td class="px-6 py-4 text-center">${team.players}</td>
        <td class="px-6 py-4 text-center text-xl font-bold text-yellow-400">${team.totalScore}</td>
        <td class="px-6 py-4 text-center">${team.avgScore}</td>
        <td class="px-6 py-4 text-center">
          <button onclick="window.scoreboard.removeTeam(${team.id})" 
            class="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm transition-colors">Eliminar</button>
        </td>
      </tr>
    `).join('');
  }

  render() {
    const tbody = document.getElementById('scoresTable');
    const emptyMessage = document.getElementById('emptyMessage');
    const sortedPlayers = this.getSortedPlayers();

    if (sortedPlayers.length === 0) {
      tbody.innerHTML = '';
      emptyMessage.style.display = 'block';
      return;
    }

    emptyMessage.style.display = 'none';
    tbody.innerHTML = sortedPlayers.map((player, index) => {
      const team = this.getTeamById(player.teamId);
      return `
        <tr class="hover:bg-gray-700 transition-colors">
          <td class="px-6 py-4">
            <span class="text-lg font-bold text-indigo-400">
              ${this.getMedalEmoji(index)} ${index + 1}°
            </span>
          </td>
          <td class="px-6 py-4 font-medium">${player.name}</td>
          <td class="px-6 py-4 text-center">
            <span class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium" style="background-color: ${team.color}20; color: ${team.color}">
              <span class="w-2 h-2 rounded-full" style="background-color: ${team.color}"></span>
              ${team.name}
            </span>
          </td>
          <td class="px-6 py-4 text-center text-xl font-bold text-yellow-400">${player.score}</td>
          <td class="px-6 py-4 text-center">
            <div class="flex gap-2 justify-center">
              <button onclick="window.scoreboard.updatePlayerScore(${player.id}, 10)" 
                class="px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-sm transition-colors">+10</button>
              <button onclick="window.scoreboard.updatePlayerScore(${player.id}, -10)" 
                class="px-3 py-1 bg-orange-600 hover:bg-orange-700 rounded text-sm transition-colors">-10</button>
              <button onclick="window.scoreboard.removePlayer(${player.id})" 
                class="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm transition-colors">Eliminar</button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  renderCharts() {
    // Gráfico de equipos
    const teamsCtx = document.getElementById('teamsChart').getContext('2d');
    const sortedTeams = this.getSortedTeams();

    if (this.teamsChart) {
      this.teamsChart.destroy();
    }

    this.teamsChart = new Chart(teamsCtx, {
      type: 'bar',
      data: {
        labels: sortedTeams.map(t => t.name),
        datasets: [{
          label: 'Puntaje Total',
          data: sortedTeams.map(t => t.totalScore),
          backgroundColor: sortedTeams.map(t => t.color),
          borderColor: sortedTeams.map(t => t.color),
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            labels: { color: '#fff' }
          }
        },
        scales: {
          y: {
            ticks: { color: '#fff' },
            grid: { color: '#374151' }
          },
          x: {
            ticks: { color: '#fff' },
            grid: { color: '#374151' }
          }
        }
      }
    });

    // Gráfico de jugadores (top 10)
    const playersCtx = document.getElementById('playersChart').getContext('2d');
    const topPlayers = this.getSortedPlayers().slice(0, 10);

    if (this.playersChart) {
      this.playersChart.destroy();
    }

    this.playersChart = new Chart(playersCtx, {
      type: 'doughnut',
      data: {
        labels: topPlayers.map(p => p.name),
        datasets: [{
          data: topPlayers.map(p => p.score),
          backgroundColor: [
            '#ff6b6b', '#4ecdc4', '#45b7d1', '#ffd93d', '#a8e6cf',
            '#ff8b94', '#b4a7d6', '#73a580', '#fda769', '#ffd89b'
          ],
          borderColor: '#1f2937',
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            labels: { color: '#fff' },
            position: 'right'
          }
        }
      }
    });
  }

  getMedalEmoji(index) {
    const medals = ['🥇', '🥈', '🥉'];
    return medals[index] || '⭐';
  }

  saveToStorage() {
    localStorage.setItem('scoreboard_players', JSON.stringify(this.players));
    localStorage.setItem('scoreboard_teams', JSON.stringify(this.teams));
  }

  loadFromStorage() {
    const savedPlayers = localStorage.getItem('scoreboard_players');
    const savedTeams = localStorage.getItem('scoreboard_teams');
    
    if (savedPlayers) {
      this.players = JSON.parse(savedPlayers);
    }
    if (savedTeams) {
      this.teams = JSON.parse(savedTeams);
    }
    
    this.render();
  }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  window.scoreboard = new Scoreboard();
});
