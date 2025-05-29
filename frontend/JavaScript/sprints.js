class SprintManager {
    constructor() {
        this.API_URL = 'http://localhost:8000/api';
        this.sprints = [];
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        document.getElementById('btnNuevoSprint')?.addEventListener('click', () => {
            this.mostrarModalSprint();
        });

        document.getElementById('btnGuardarSprint')?.addEventListener('click', () => {
            this.guardarSprint();
        });
    }

    async cargarSprints() {
        try {
            const response = await fetch(`${this.API_URL}/sprints`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            this.sprints = await response.json();
            this.actualizarSelectSprints();
        } catch (error) {
            console.error('Error al cargar sprints:', error);
            this.mostrarError('Error al cargar los sprints');
        }
    }

    actualizarSelectSprints() {
        const select = document.getElementById('filtroSprint');
        if (!select) return;

        select.innerHTML = '<option value="">Todos los Sprints</option>' +
            this.sprints.map(sprint => 
                `<option value="${sprint.id}">${sprint.nombre}</option>`
            ).join('');
    }

    mostrarModalSprint(sprint = null) {
        const modal = new bootstrap.Modal(document.getElementById('modalSprint'));
        const form = document.getElementById('formSprint');
        
        if (sprint) {
            document.getElementById('sprintId').value = sprint.id;
            document.getElementById('nombreSprint').value = sprint.nombre;
            document.getElementById('fechaInicio').value = sprint.fecha_inicio;
            document.getElementById('fechaFin').value = sprint.fecha_fin;
        } else {
            form.reset();
            document.getElementById('sprintId').value = '';
        }
        
        modal.show();
    }

    async guardarSprint() {
        const form = document.getElementById('formSprint');
        const sprintId = document.getElementById('sprintId').value;
        
        const sprint = {
            nombre: document.getElementById('nombreSprint').value,
            fecha_inicio: document.getElementById('fechaInicio').value,
            fecha_fin: document.getElementById('fechaFin').value
        };

        try {
            const url = sprintId ? 
                `${this.API_URL}/sprints/${sprintId}` : 
                `${this.API_URL}/sprints`;
            
            const method = sprintId ? 'PUT' : 'POST';
            
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(sprint)
            });

            if (!response.ok) throw new Error('Error al guardar el sprint');

            await this.cargarSprints();
            bootstrap.Modal.getInstance(document.getElementById('modalSprint')).hide();
            this.mostrarExito('Sprint guardado exitosamente');
        } catch (error) {
            console.error('Error:', error);
            this.mostrarError('Error al guardar el sprint');
        }
    }

    async eliminarSprint(id) {
        if (!confirm('¿Estás seguro de que deseas eliminar este sprint?')) return;

        try {
            const response = await fetch(`${this.API_URL}/sprints/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) throw new Error('Error al eliminar el sprint');

            await this.cargarSprints();
            this.mostrarExito('Sprint eliminado exitosamente');
        } catch (error) {
            console.error('Error:', error);
            this.mostrarError('Error al eliminar el sprint');
        }
    }

    async editarSprint(id) {
        const sprint = this.sprints.find(s => s.id === id);
        if (sprint) {
            this.mostrarModalSprint(sprint);
        }
    }

    mostrarError(mensaje) {
        console.error(mensaje);
    }

    mostrarExito(mensaje) {
        console.log(mensaje);
    }
}

const sprintManager = new SprintManager();
document.addEventListener('DOMContentLoaded', () => {
    sprintManager.cargarSprints();
}); 