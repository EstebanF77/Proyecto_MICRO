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
            const token = localStorage.getItem('token');
            if (!token) {
                this.mostrarError('No hay sesión activa. Por favor, inicie sesión.');
                return;
            }

            const response = await fetch(`${this.API_URL}/sprints`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.status === 401) {
                this.mostrarError('Sesión expirada. Por favor, inicie sesión nuevamente.');
                return;
            }

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
                    <td colspan="6" class="text-center">No hay sprints disponibles</td>
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
                <td>${sprint.historias_count || 0}</td>
                <td>
                    <button class="btn btn-sm btn-primary me-1" onclick="sprintManager.editarSprint(${sprint.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="sprintManager.eliminarSprint(${sprint.id})" 
                            ${sprint.historias_count > 0 ? 'disabled' : ''}>
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
        const sprint = this.sprints.find(s => s.id === id);
        if (sprint.historias_count > 0) {
            this.mostrarError('No se puede eliminar un sprint que tiene historias vinculadas');
            return;
        }

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
        alert(mensaje);
    }

    mostrarExito(mensaje) {
        alert(mensaje);
    }
}

const sprintManager = new SprintManager();
document.addEventListener('DOMContentLoaded', () => {
    sprintManager.cargarSprints();
}); 