document.addEventListener('DOMContentLoaded', () => {
    const tabsContainer = document.getElementById('tabs-container');
    const contentContainer = document.getElementById('content-container');

    // Cargar los datos desde el JSON
    fetch('data.json')
        .then(response => {
            if (!response.ok) throw new Error('Error al cargar el JSON');
            return response.json();
        })
        .then(data => {
            renderApp(data.routines);
        })
        .catch(error => console.error('Error:', error));

    function renderApp(routines) {
        routines.forEach((routine, index) => {
            // 1. Crear el botón (Tab)
            const btn = document.createElement('button');
            btn.className = `tab-btn ${index === 0 ? 'active' : ''}`;
            btn.textContent = routine.title.split(':')[0]; // Extrae solo "Día 1", "Día 2", etc.
            btn.dataset.target = routine.id;
            
            // Evento para cambiar de pestaña
            btn.addEventListener('click', () => switchTab(routine.id));
            tabsContainer.appendChild(btn);

            // 2. Crear la sección de contenido de la rutina
            const section = document.createElement('section');
            section.id = routine.id;
            section.className = `routine-content ${index === 0 ? 'active' : ''}`;

            const title = document.createElement('h2');
            title.textContent = routine.title;
            section.appendChild(title);

            const ul = document.createElement('ul');
            ul.className = 'exercise-list';

            routine.exercises.forEach(exercise => {
                const li = document.createElement('li');
                li.innerHTML = `
                    <div class="exercise-info">
                        <strong>${exercise.name}</strong>
                        <div class="exercise-notes">${exercise.notes}</div>
                    </div>
                    <span class="exercise-reps">${exercise.sets} x ${exercise.reps}</span>
                `;
                ul.appendChild(li);
            });

            section.appendChild(ul);
            contentContainer.appendChild(section);
        });
    }

    function switchTab(targetId) {
        // Actualizar botones
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.target === targetId);
        });

        // Actualizar contenidos
        document.querySelectorAll('.routine-content').forEach(content => {
            content.classList.toggle('active', content.id === targetId);
        });
    }
});
