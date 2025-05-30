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
            const response = await fetch(`${this.API_URL}/sprints`);

            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }

            const data = await response.json();
            this.sprints = data;
            this.actualizarTablaSprints();
        } catch (error) {
            console.error('Error al cargar sprints:', error);
            this.mostrarError('Error al cargar los sprints. Por favor, intente nuevamente.');
        }
    }

    actualizarTablaSprints() {
        const tbody = document.getElementById('tablaSprints');
        if (!tbody) {
            console.error('No se encontró el elemento tablaSprints');
            return;
        }

        if (!Array.isArray(this.sprints) || this.sprints.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center">No hay sprints disponibles</td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = this.sprints.map(sprint => `
            <tr>
                <td>${sprint.id}</td>
                <td>${sprint.nombre || 'Sin nombre'}</td>
                <td>${this.formatearFecha(sprint.fecha_inicio)}</td>
                <td>${this.formatearFecha(sprint.fecha_fin)}</td>
                <td>
                    <button class="btn btn-sm btn-primary me-1" onclick="sprintManager.editarSprint(${sprint.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="sprintManager.eliminarSprint(${sprint.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    formatearFecha(fecha) {
        return new Date(fecha).toLocaleDateString('es-ES');
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
                    'Content-Type': 'application/json'
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
        // Validar si hay historias asociadas a este sprint
        try {
            const historiasResponse = await fetch(`${this.API_URL}/historias`);
            if (!historiasResponse.ok) throw new Error('No se pudieron obtener las historias');
            const historias = await historiasResponse.json();
            const asociadas = historias.some(historia => String(historia.sprint_id) === String(id));
            if (asociadas) {
                this.mostrarError('No se puede eliminar un sprint que tiene historias vinculadas');
                return;
            }
        } catch (error) {
            console.error('Error al validar historias asociadas:', error);
            this.mostrarError('Error al validar historias asociadas');
            return;
        }

        try {
            const response = await fetch(`${this.API_URL}/sprints/${id}`, {
                method: 'DELETE'
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

    mostrarAlertaBootstrap(mensaje, tipo = 'danger') {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${tipo} alert-dismissible fade show`;
        alertDiv.role = 'alert';
        alertDiv.innerHTML = `
            ${mensaje}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;
        const container = document.querySelector('.container');
        container.insertBefore(alertDiv, container.firstChild);
        setTimeout(() => {
            alertDiv.remove();
        }, 5000);
    }

    mostrarError(mensaje) {
        this.mostrarAlertaBootstrap(mensaje, 'danger');
    }

    mostrarExito(mensaje) {
        this.mostrarAlertaBootstrap(mensaje, 'success');
    }
}

const sprintManager = new SprintManager();
document.addEventListener('DOMContentLoaded', () => {
    sprintManager.cargarSprints();
}); 