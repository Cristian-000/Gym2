document.addEventListener('DOMContentLoaded', () => {
    const tabsContainer = document.getElementById('tabs-container');
    const contentContainer = document.getElementById('content-container');
    const editorContainer = document.getElementById('editor-container');
    const visualEditorContent = document.getElementById('visual-editor-content');
    const editBtn = document.getElementById('edit-btn');
    const saveJsonBtn = document.getElementById('save-json-btn');
    const cancelEditBtn = document.getElementById('cancel-edit-btn');
    const resetJsonBtn = document.getElementById('reset-json-btn');

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

    // --- RENDERIZADO DE LA VISTA NORMAL ---
    function renderApp(routines) {
        tabsContainer.innerHTML = '';
        contentContainer.innerHTML = '';

        if (savedDayIndex >= routines.length) savedDayIndex = 0;

        routines.forEach((routine, index) => {
            const btn = document.createElement('button');
            btn.className = `tab-btn ${index === savedDayIndex ? 'active' : ''}`;
            btn.textContent = `Día ${index + 1}`;
            btn.dataset.target = routine.id;
            btn.addEventListener('click', () => switchTab(routine.id, index));
            tabsContainer.appendChild(btn);

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

            const finishBtn = document.createElement('button');
            finishBtn.className = 'finish-btn';
            finishBtn.textContent = 'Terminar Rutina';
            finishBtn.addEventListener('click', () => completeDay(index, routines.length));
            section.appendChild(finishBtn);

            contentContainer.appendChild(section);
        });
    }

    function switchTab(targetId) {
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.target === targetId));
        document.querySelectorAll('.routine-content').forEach(content => content.classList.toggle('active', content.id === targetId));
    }

    function completeDay(currentIndex, totalDays) {
        let nextDay = currentIndex + 1;
        if (nextDay >= totalDays) nextDay = 0;
        localStorage.setItem('currentRoutineDay', nextDay);
        savedDayIndex = nextDay;
        
        contentContainer.style.opacity = 0;
        setTimeout(() => {
            renderApp(currentData.routines);
            contentContainer.style.opacity = 1;
        }, 300);
    }

    // --- EDITOR VISUAL (NUEVO) ---
    function renderVisualEditor() {
        visualEditorContent.innerHTML = '';

        currentData.routines.forEach(routine => {
            const rBlock = document.createElement('div');
            rBlock.className = 'edit-routine-block';
            
            // Título del Día (Ej: Día 1: Pierna y Empuje)
            rBlock.innerHTML = `<input type="text" class="edit-routine-title" value="${routine.title}" data-id="${routine.id}">`;
            
            const exContainer = document.createElement('div');
            exContainer.className = 'edit-exercises';
            
            // Ejercicios
            routine.exercises.forEach(ex => {
                exContainer.appendChild(createExerciseEditBlock(ex));
            });

            // Botón Añadir Ejercicio
            const addBtn = document.createElement('button');
            addBtn.className = 'add-ex-btn';
            addBtn.textContent = '+ Añadir Ejercicio';
            addBtn.onclick = () => {
                exContainer.appendChild(createExerciseEditBlock({ name: '', sets: 3, reps: '10', notes: '' }));
            };

            rBlock.appendChild(exContainer);
            rBlock.appendChild(addBtn);
            visualEditorContent.appendChild(rBlock);
        });
    }

    function createExerciseEditBlock(ex) {
        const div = document.createElement('div');
        div.className = 'edit-ex-block';
        div.innerHTML = `
            <div class="edit-ex-header">
                <input type="text" class="ex-name" value="${ex.name}" placeholder="Nombre del ejercicio">
                <button class="del-ex-btn" title="Eliminar">✖</button>
            </div>
            <div class="edit-ex-row">
                <label>Series: <input type="number" class="ex-sets" value="${ex.sets}"></label>
                <label>Reps: <input type="text" class="ex-reps" value="${ex.reps}"></label>
            </div>
            <input type="text" class="ex-notes" value="${ex.notes}" placeholder="Notas (RIR, técnica...)">
        `;
        // Funcionalidad para eliminar ese bloque
        div.querySelector('.del-ex-btn').onclick = () => div.remove();
        return div;
    }

    // --- ACCIONES DEL EDITOR ---
    editBtn.addEventListener('click', () => {
        contentContainer.classList.add('hidden');
        editorContainer.classList.remove('hidden');
        renderVisualEditor();
    });

    cancelEditBtn.addEventListener('click', () => {
        editorContainer.classList.add('hidden');
        contentContainer.classList.remove('hidden');
    });

    saveJsonBtn.addEventListener('click', () => {
        const newRoutines = [];
        
        // Recorrer el DOM para reconstruir el objeto JSON
        document.querySelectorAll('.edit-routine-block').forEach(rBlock => {
            const titleInput = rBlock.querySelector('.edit-routine-title');
            const routine = {
                id: titleInput.dataset.id,
                title: titleInput.value,
                exercises: []
            };

            rBlock.querySelectorAll('.edit-ex-block').forEach(exBlock => {
                routine.exercises.push({
                    name: exBlock.querySelector('.ex-name').value,
                    sets: parseInt(exBlock.querySelector('.ex-sets').value) || 0,
                    reps: exBlock.querySelector('.ex-reps').value,
                    notes: exBlock.querySelector('.ex-notes').value
                });
            });
            newRoutines.push(routine);
        });

        // Guardar y refrescar
        currentData.routines = newRoutines;
        localStorage.setItem('gymRoutineData', JSON.stringify(currentData));
        renderApp(currentData.routines);
        
        editorContainer.classList.add('hidden');
        contentContainer.classList.remove('hidden');
    });

    resetJsonBtn.addEventListener('click', () => {
        if(confirm("¿Restaurar los datos originales del archivo? Perderás tus cambios locales.")) {
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
