class HistoriaManager {
    constructor() {
        this.API_URL = 'http://localhost:8000/api';
        this.historias = [];
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        // Botón para nueva historia
        document.getElementById('btnNuevaHistoria').addEventListener('click', () => {
            this.mostrarModalHistoria();
        });

        // Formulario de historia
        document.getElementById('btnGuardarHistoria').addEventListener('click', () => {
            this.guardarHistoria();
        });

        // Filtros
        document.getElementById('filtroSprint').addEventListener('change', () => this.filtrarHistorias());
        document.getElementById('filtroEstado').addEventListener('change', () => this.filtrarHistorias());
        document.getElementById('filtroResponsable').addEventListener('change', () => this.filtrarHistorias());
    }

    async cargarHistorias() {
        try {
            const response = await fetch(`${this.API_URL}/historias`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            this.historias = await response.json();
            this.renderizarHistorias();
        } catch (error) {
            console.error('Error al cargar historias:', error);
            this.mostrarError('Error al cargar las historias');
        }
    }

    renderizarHistorias(historiasFiltradas = null) {
        const tbody = document.getElementById('tablaHistorias');
        const historias = historiasFiltradas || this.historias;
        
        tbody.innerHTML = historias.map(historia => `
            <tr>
                <td>${historia.id}</td>
                <td>${historia.titulo}</td>
                <td>${historia.descripcion}</td>
                <td>${historia.sprint}</td>
                <td><span class="estado-${historia.estado}">${historia.estado}</span></td>
                <td>${historia.puntos}</td>
                <td>${historia.responsable}</td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="historiaManager.editarHistoria(${historia.id})">
                        Editar
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="historiaManager.eliminarHistoria(${historia.id})">
                        Eliminar
                    </button>
                </td>
            </tr>
        `).join('');
    }

    mostrarModalHistoria(historia = null) {
        const modal = new bootstrap.Modal(document.getElementById('modalHistoria'));
        const form = document.getElementById('formHistoria');
        
        if (historia) {
            document.getElementById('historiaId').value = historia.id;
            document.getElementById('titulo').value = historia.titulo;
            document.getElementById('descripcion').value = historia.descripcion;
            document.getElementById('sprint').value = historia.sprint;
            document.getElementById('estado').value = historia.estado;
            document.getElementById('puntos').value = historia.puntos;
            document.getElementById('responsable').value = historia.responsable;
        } else {
            form.reset();
            document.getElementById('historiaId').value = '';
        }
        
        modal.show();
    }

    async guardarHistoria() {
        const form = document.getElementById('formHistoria');
        const historiaId = document.getElementById('historiaId').value;
        
        const historia = {
            titulo: document.getElementById('titulo').value,
            descripcion: document.getElementById('descripcion').value,
            sprint: document.getElementById('sprint').value,
            estado: document.getElementById('estado').value,
            puntos: document.getElementById('puntos').value,
            responsable: document.getElementById('responsable').value
        };

        try {
            const url = historiaId ? 
                `${this.API_URL}/historias/${historiaId}` : 
                `${this.API_URL}/historias`;
            
            const method = historiaId ? 'PUT' : 'POST';
            
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(historia)
            });

            if (!response.ok) throw new Error('Error al guardar la historia');

            await this.cargarHistorias();
            bootstrap.Modal.getInstance(document.getElementById('modalHistoria')).hide();
            this.mostrarExito('Historia guardada exitosamente');
        } catch (error) {
            console.error('Error:', error);
            this.mostrarError('Error al guardar la historia');
        }
    }

    async eliminarHistoria(id) {
        if (!confirm('¿Estás seguro de que deseas eliminar esta historia?')) return;

        try {
            const response = await fetch(`${this.API_URL}/historias/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) throw new Error('Error al eliminar la historia');

            await this.cargarHistorias();
            this.mostrarExito('Historia eliminada exitosamente');
        } catch (error) {
            console.error('Error:', error);
            this.mostrarError('Error al eliminar la historia');
        }
    }

    async editarHistoria(id) {
        const historia = this.historias.find(h => h.id === id);
        if (historia) {
            this.mostrarModalHistoria(historia);
        }
    }

    filtrarHistorias() {
        const sprint = document.getElementById('filtroSprint').value;
        const estado = document.getElementById('filtroEstado').value;
        const responsable = document.getElementById('filtroResponsable').value;

        const historiasFiltradas = this.historias.filter(historia => {
            return (!sprint || historia.sprint === sprint) &&
                   (!estado || historia.estado === estado) &&
                   (!responsable || historia.responsable === responsable);
        });

        this.renderizarHistorias(historiasFiltradas);
    }

    mostrarError(mensaje) {
        // Implementar lógica para mostrar mensajes de error
        console.error(mensaje);
    }

    mostrarExito(mensaje) {
        // Implementar lógica para mostrar mensajes de éxito
        console.log(mensaje);
    }
}

// Inicializar el manager de historias
const historiaManager = new HistoriaManager();
document.addEventListener('DOMContentLoaded', () => {
    historiaManager.cargarHistorias();
}); 