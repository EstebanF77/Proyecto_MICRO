class HistoriaManager {
    constructor() {
        this.API_URL = 'http://localhost:8000/api';
        this.historias = [];
        this.sprintMap = {}; // Mapa de id a nombre de sprint
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
            console.log('Intentando cargar historias desde:', `${this.API_URL}/historias`);
            const response = await fetch(`${this.API_URL}/historias`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });
            
            console.log('Respuesta del servidor:', response.status);
            
            if (!response.ok) {
                throw new Error(`Error al cargar historias: ${response.status}`);
            }
            
            this.historias = await response.json();
            console.log('Historias cargadas:', this.historias);
            this.renderizarHistorias();
        } catch (error) {
            console.error('Error detallado al cargar historias:', error);
            this.mostrarError('Error al cargar las historias. Detalles: ' + error.message);
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
                <td>${this.sprintMap[historia.sprint_id] || 'Sin Sprint'}</td>
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

    async actualizarSelectSprints() {
        try {
            const response = await fetch(`${this.API_URL}/sprints`);
            if (!response.ok) {
                throw new Error(`Error al cargar sprints: ${response.status}`);
            }
            const sprints = await response.json();
            
            // Guardar el mapa de id a nombre
            this.sprintMap = {};
            sprints.forEach(sprint => {
                this.sprintMap[sprint.id] = sprint.nombre;
            });
            
            const select = document.getElementById('sprint');
            if (!select) return;

            select.innerHTML = '<option value="">Seleccione un Sprint</option>' +
                sprints.map(sprint => 
                    `<option value="${sprint.id}">${sprint.nombre}</option>`
                ).join('');
        } catch (error) {
            console.error('Error al cargar sprints:', error);
            this.mostrarError('Error al cargar los sprints');
        }
    }

    async mostrarModalHistoria(historia = null) {
        const modal = new bootstrap.Modal(document.getElementById('modalHistoria'));
        const form = document.getElementById('formHistoria');
        
        // Cargar los sprints antes de mostrar el modal
        await this.actualizarSelectSprints();
        
        if (historia) {
            document.getElementById('historiaId').value = historia.id;
            document.getElementById('titulo').value = historia.titulo;
            document.getElementById('descripcion').value = historia.descripcion;
            document.getElementById('sprint').value = historia.sprint_id || historia.sprint || '';
            document.getElementById('estado').value = historia.estado;
            document.getElementById('puntos').value = historia.puntos;
            document.getElementById('responsable').value = historia.responsable;
            document.getElementById('fechaCreacion').value = historia.fecha_creacion ? historia.fecha_creacion.split('T')[0] : '';
            document.getElementById('fechaLimite').value = historia.fecha_limite ? historia.fecha_limite.split('T')[0] : '';
        } else {
            form.reset();
            document.getElementById('historiaId').value = '';
            // Establecer la fecha de creación actual para nuevas historias
            document.getElementById('fechaCreacion').value = new Date().toISOString().split('T')[0];
        }
        
        modal.show();
    }

    async guardarHistoria() {
        const form = document.getElementById('formHistoria');
        const historiaId = document.getElementById('historiaId').value;
        
        // Validar que todos los campos requeridos estén llenos
        const titulo = document.getElementById('titulo').value;
        const descripcion = document.getElementById('descripcion').value;
        const sprint = document.getElementById('sprint').value;
        console.log('Sprint seleccionado:', sprint);
        const estado = document.getElementById('estado').value;
        const puntos = document.getElementById('puntos').value;
        const responsable = document.getElementById('responsable').value;
        const fechaCreacion = document.getElementById('fechaCreacion').value;
        const fechaLimite = document.getElementById('fechaLimite').value;

        if (!titulo || !descripcion || !sprint || !estado || !puntos || !responsable || !fechaCreacion || !fechaLimite) {
            this.mostrarError('Por favor, complete todos los campos requeridos');
            return;
        }
        
        // Solo enviar los campos que espera la base de datos
        const historia = {
            titulo: titulo,
            descripcion: descripcion,
            responsable: responsable,
            estado: estado,
            puntos: puntos,
            sprint_id: sprint,
            fecha_creacion: fechaCreacion,
            fecha_limite: fechaLimite
        };

        console.log('Objeto historia a enviar:', historia);

        // Si la historia está finalizada, puedes agregar la fecha de finalización
        if (estado === 'finalizada') {
            historia.fecha_finalizacion = new Date().toISOString().slice(0, 19).replace('T', ' ');
        }

        try {
            const url = historiaId ? 
                `${this.API_URL}/historias/${historiaId}` : 
                `${this.API_URL}/historias`;
            
            console.log('Intentando guardar historia en:', url);
            console.log('Datos a enviar:', historia);
            
            const response = await fetch(url, {
                method: historiaId ? 'PUT' : 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(historia)
            });

            console.log('Respuesta del servidor:', response.status);
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `Error del servidor: ${response.status}`);
            }

            await this.cargarHistorias();
            const modal = bootstrap.Modal.getInstance(document.getElementById('modalHistoria'));
            if (modal) {
                modal.hide();
            }
            this.mostrarExito('Historia guardada exitosamente');
            form.reset();
        } catch (error) {
            console.error('Error detallado al guardar historia:', error);
            if (error.message === 'Failed to fetch') {
                this.mostrarError('No se pudo conectar con el servidor. Por favor, verifique que el servidor esté en ejecución en http://localhost:8000');
            } else {
                this.mostrarError(error.message || 'Error al guardar la historia');
            }
        }
    }

    async eliminarHistoria(id) {
        if (!confirm('¿Estás seguro de que deseas eliminar esta historia?')) return;

        try {
            const response = await fetch(`${this.API_URL}/historias/${id}`, {
                method: 'DELETE'
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
        console.error('Error:', mensaje);
        const alertDiv = document.createElement('div');
        alertDiv.className = 'alert alert-danger alert-dismissible fade show';
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

    mostrarExito(mensaje) {
        const alertDiv = document.createElement('div');
        alertDiv.className = 'alert alert-success alert-dismissible fade show';
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
}

// Inicializar el manager de historias
const historiaManager = new HistoriaManager();
document.addEventListener('DOMContentLoaded', () => {
    historiaManager.cargarHistorias();
});