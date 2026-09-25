document.addEventListener('DOMContentLoaded', () => {
    const tabsContainer = document.getElementById('tabs-container');
    const contentContainer = document.getElementById('content-container');
    const editorContainer = document.getElementById('editor-container');
    const jsonEditor = document.getElementById('json-editor');
    const editBtn = document.getElementById('edit-btn');
    const saveJsonBtn = document.getElementById('save-json-btn');
    const cancelEditBtn = document.getElementById('cancel-edit-btn');
    const resetJsonBtn = document.getElementById('reset-json-btn');
    const editorMsg = document.getElementById('editor-msg');

    let currentData = null;
    let savedDayIndex = parseInt(localStorage.getItem('currentRoutineDay')) || 0;

    // --- CARGA DE DATOS ---
    function loadData() {
        const localData = localStorage.getItem('gymRoutineData');
        if (localData) {
            currentData = JSON.parse(localData);
            renderApp(currentData.routines);
        } else {
            fetch('data.json')
                .then(response => response.json())
                .then(data => {
                    currentData = data;
                    localStorage.setItem('gymRoutineData', JSON.stringify(data));
                    renderApp(data.routines);
                });
        }
    }

    // --- RENDERIZADO DE LA APP ---
    function renderApp(routines) {
        tabsContainer.innerHTML = '';
        contentContainer.innerHTML = '';

        // Ajustar índice si excede la cantidad de rutinas
        if (savedDayIndex >= routines.length) savedDayIndex = 0;

        routines.forEach((routine, index) => {
            // Pestañas
            const btn = document.createElement('button');
            btn.className = `tab-btn ${index === savedDayIndex ? 'active' : ''}`;
            btn.textContent = `Día ${index + 1}`;
            btn.dataset.target = routine.id;
            btn.addEventListener('click', () => switchTab(routine.id, index));
            tabsContainer.appendChild(btn);

            // Contenido
            const section = document.createElement('section');
            section.id = routine.id;
            section.className = `routine-content ${index === savedDayIndex ? 'active' : ''}`;

            const ul = document.createElement('ul');
            ul.className = 'exercise-list';

            routine.exercises.forEach(exercise => {
                const li = document.createElement('li');
                li.innerHTML = `
                    <div class="exercise-info">
                        <strong>${exercise.name}</strong>
                        <div class="exercise-notes">${exercise.notes}</div>
                    </div>
                    <span class="exercise-reps">${exercise.sets}x${exercise.reps}</span>
                `;
                ul.appendChild(li);
            });
            section.appendChild(ul);

            // Botón para terminar el día
            const finishBtn = document.createElement('button');
            finishBtn.className = 'finish-btn';
            finishBtn.textContent = 'Terminar Rutina';
            finishBtn.addEventListener('click', () => completeDay(index, routines.length));
            section.appendChild(finishBtn);

            contentContainer.appendChild(section);
        });
    }

    function switchTab(targetId, index) {
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.target === targetId));
        document.querySelectorAll('.routine-content').forEach(content => content.classList.toggle('active', content.id === targetId));
    }

    function completeDay(currentIndex, totalDays) {
        let nextDay = currentIndex + 1;
        if (nextDay >= totalDays) nextDay = 0;
        localStorage.setItem('currentRoutineDay', nextDay);
        savedDayIndex = nextDay;
        
        // Animación suave y recarga visual
        contentContainer.style.opacity = 0;
        setTimeout(() => {
            renderApp(currentData.routines);
            contentContainer.style.opacity = 1;
        }, 300);
    }

    // --- EDITOR JSON ---
    editBtn.addEventListener('click', () => {
        contentContainer.classList.add('hidden');
        editorContainer.classList.remove('hidden');
        jsonEditor.value = JSON.stringify(currentData, null, 2);
        editorMsg.textContent = '';
    });

    cancelEditBtn.addEventListener('click', () => {
        editorContainer.classList.add('hidden');
        contentContainer.classList.remove('hidden');
    });

    saveJsonBtn.addEventListener('click', () => {
        try {
            const parsed = JSON.parse(jsonEditor.value);
            currentData = parsed;
            localStorage.setItem('gymRoutineData', JSON.stringify(parsed));
            renderApp(currentData.routines);
            editorContainer.classList.add('hidden');
            contentContainer.classList.remove('hidden');
        } catch (e) {
            editorMsg.textContent = "Error: El formato JSON no es válido.";
        }
    });

    resetJsonBtn.addEventListener('click', () => {
        if(confirm("¿Restaurar los datos originales? Perderás tus cambios.")) {
            localStorage.removeItem('gymRoutineData');
            loadData();
            editorContainer.classList.add('hidden');
            contentContainer.classList.remove('hidden');
        }
    });

    // --- CRONÓMETRO ---
    let timerInterval;
    let seconds = 0;
    let isRunning = false;
    const display = document.getElementById('display');

    function updateDisplay() {
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        display.textContent = `${m}:${s}`;
    }

    document.getElementById('start-btn').addEventListener('click', () => {
        if (!isRunning) {
            isRunning = true;
            timerInterval = setInterval(() => {
                seconds++;
                updateDisplay();
            }, 1000);
        }
    });

    document.getElementById('pause-btn').addEventListener('click', () => {
        isRunning = false;
        clearInterval(timerInterval);
    });

    document.getElementById('reset-btn').addEventListener('click', () => {
        isRunning = false;
        clearInterval(timerInterval);
        seconds = 0;
        updateDisplay();
    });

    // Iniciar app
    loadData();
    contentContainer.style.transition = "opacity 0.3s";
});
