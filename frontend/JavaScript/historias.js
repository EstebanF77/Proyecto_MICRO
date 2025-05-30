class HistoriaManager {
    constructor() {
        this.API_URL = 'http://localhost:8000/api';
        this.historias = [];
        this.sprintMap = {}; 
        this.puntosSeleccionados = 0; 
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        if (document.getElementById('btnNuevaHistoria')) {
            document.getElementById('btnNuevaHistoria').addEventListener('click', () => {
                this.mostrarModalHistoria();
            });
        }

        if (document.getElementById('btnGuardarHistoria')) {
            document.getElementById('btnGuardarHistoria').addEventListener('click', () => {
                this.guardarHistoria();
            });
        }

        if (window.location.pathname.endsWith('reportes.html')) {
            const btnConfirmar = document.getElementById('btnConfirmarFiltros');
            if (btnConfirmar) {
                btnConfirmar.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.filtrarHistorias();
                });
            }
        } else {
            if (document.getElementById('filtroSprint'))
                document.getElementById('filtroSprint').addEventListener('change', () => this.filtrarHistorias());
            if (document.getElementById('filtroEstado'))
                document.getElementById('filtroEstado').addEventListener('change', () => this.filtrarHistorias());
            if (document.getElementById('filtroResponsable'))
                document.getElementById('filtroResponsable').addEventListener('change', () => this.filtrarHistorias());
        }

        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('punto-circulo')) {
                const puntos = parseInt(e.target.dataset.puntos);
                this.seleccionarPuntos(puntos);
            }
        });
    }

    seleccionarPuntos(puntos) {
        this.puntosSeleccionados = puntos;
        const circulos = document.querySelectorAll('.punto-circulo');
        circulos.forEach(circulo => {
            const puntosCirculo = parseInt(circulo.dataset.puntos);
            if (puntosCirculo <= puntos) {
                circulo.classList.add('seleccionado');
            } else {
                circulo.classList.remove('seleccionado');
            }
        });
    }

    async cargarHistorias() {
    try {
        await this.actualizarSelectSprints();

        const response = await fetch(`${this.API_URL}/historias`);
        if (!response.ok) {
            throw new Error(`Error al cargar historias: ${response.status}`);
        }

        this.historias = await response.json();

        this.renderizarHistorias();
        this.actualizarFiltroResponsables();
    } catch (error) {
        console.error('Error al cargar historias:', error);
        this.mostrarError('Error al cargar las historias');
    }
}


    renderizarHistorias(historiasFiltradas = null) {
        const tbody = document.getElementById('tablaHistorias');
        const historias = historiasFiltradas || this.historias;
        const esPaginaReportes = window.location.pathname.endsWith('reportes.html');
        
        tbody.innerHTML = historias.map(historia => `
            <tr>
                <td>${historia.id}</td>
                <td>${historia.titulo}</td>
                <td>${historia.descripcion}</td>
                <td>${this.sprintMap[historia.sprint_id] || 'Sin Sprint'}</td>
                <td><span class="estado-${historia.estado}">${historia.estado}</span></td>
                <td>
                    <div class="d-flex gap-1 justify-content-center align-items-center">
                        ${[1,2,3,4,5].map(p => `
                            <div class="punto-circulo-table${p <= historia.puntos ? ' seleccionado' : ''}"></div>
                        `).join('')}
                    </div>
                </td>
                <td>${historia.responsable}</td>
                ${!esPaginaReportes ? `
                <td>
                    <button class="btn btn-sm btn-primary" onclick="historiaManager.editarHistoria(${historia.id})">
                        Editar
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="historiaManager.eliminarHistoria(${historia.id})">
                        Eliminar
                    </button>
                </td>
                ` : ''}
            </tr>
        `).join('');
    }
actualizarFiltroResponsables() {
    const select = document.getElementById('filtroResponsable');
    if (!select) return;

    const responsables = [...new Set(this.historias.map(h => h.responsable))];

    select.innerHTML = '<option value="">Todos los Responsables</option>' +
        responsables.map(r => `<option value="${r}">${r}</option>`).join('');
}

    async actualizarSelectSprints() {
        try {
            const response = await fetch(`${this.API_URL}/sprints`);
            if (!response.ok) {
                throw new Error(`Error al cargar sprints: ${response.status}`);
            }
            const sprints = await response.json();
            
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

        await this.actualizarSelectSprints();

        const contenedorPuntos = document.getElementById('contenedorPuntos');
        if (!contenedorPuntos.querySelector('.punto-circulo')) {
            contenedorPuntos.innerHTML = `
                <div class="d-flex justify-content-center gap-2">
                    ${[1, 2, 3, 4, 5].map(puntos => `
                        <div class="punto-circulo" data-puntos="${puntos}">
                            ${puntos}
                        </div>
                    `).join('')}
                </div>
            `;
        }

        if (historia) {
            document.getElementById('historiaId').value = historia.id;
            document.getElementById('titulo').value = historia.titulo;
            document.getElementById('descripcion').value = historia.descripcion;
            document.getElementById('sprint').value = historia.sprint_id || '';
            document.getElementById('estado').value = historia.estado;
            this.seleccionarPuntos(historia.puntos);
            document.getElementById('responsable').value = historia.responsable;

            document.getElementById('fechaCreacion').value = historia.fecha_creacion
                ? historia.fecha_creacion.split('T')[0]
                : '';

            document.getElementById('fechaLimite').value = historia.fecha_finalizacion
                ? historia.fecha_finalizacion.split('T')[0]
                : '';
        } else {
            form.reset();
            document.getElementById('historiaId').value = '';
            document.getElementById('fechaCreacion').value = new Date().toISOString().split('T')[0];
            document.getElementById('fechaLimite').value = '';
            this.seleccionarPuntos(0);
        }

        modal.show();
    }


    async guardarHistoria() {
        const form = document.getElementById('formHistoria');
        const historiaId = document.getElementById('historiaId').value;

        const titulo = document.getElementById('titulo').value;
        const descripcion = document.getElementById('descripcion').value;
        const sprint = document.getElementById('sprint').value;
        const estado = document.getElementById('estado').value;
        const puntos = this.puntosSeleccionados;
        const responsable = document.getElementById('responsable').value;
        const fechaCreacion = document.getElementById('fechaCreacion').value;
        const fechaFinalizacion = document.getElementById('fechaLimite').value;

        if (!titulo || !descripcion || !sprint || !estado || !puntos || !responsable || !fechaCreacion || !fechaFinalizacion) {
            this.mostrarError('Por favor, complete todos los campos requeridos');
            return;
        }
        if (new Date(fechaFinalizacion) < new Date(fechaCreacion)) {
            this.mostrarError('La fecha de finalización no puede ser anterior a la fecha de creación');
            return;
        }

        const historia = {
            titulo: titulo,
            descripcion: descripcion,
            responsable: responsable,
            estado: estado,
            puntos: puntos,
            sprint_id: sprint,
            fecha_creacion: fechaCreacion,
            fecha_finalizacion: fechaFinalizacion 
        };

        try {
            const url = historiaId ?
                `${this.API_URL}/historias/${historiaId}` :
                `${this.API_URL}/historias`;

            const response = await fetch(url, {
                method: historiaId ? 'PUT' : 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(historia)
            });

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
            console.error('Error al guardar historia:', error);
            if (error.message === 'Failed to fetch') {
                this.mostrarError('No se pudo conectar con el servidor. Asegúrate de que esté corriendo en http://localhost:8000');
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
            return (!sprint || historia.sprint_id == sprint) &&
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


const style = document.createElement('style');
style.textContent = `
    .punto-circulo {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        border: 2px solid #007bff;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.3s ease;
        font-weight: bold;
    }

    .punto-circulo:hover {
        background-color: #e9ecef;
    }

    .punto-circulo.seleccionado {
        background-color: #007bff;
        color: white;
    }
`;
document.head.appendChild(style);

const styleTable = document.createElement('style');
styleTable.textContent = `
    .punto-circulo-table {
        width: 18px;
        height: 18px;
        border-radius: 50%;
        border: 2px solid #007bff;
        display: inline-block;
        margin-right: 2px;
        background: #fff;
        transition: background 0.3s;
    }
    .punto-circulo-table.seleccionado {
        background: #007bff;
        border-color: #007bff;
    }
`;
document.head.appendChild(styleTable);

const historiaManager = new HistoriaManager();
document.addEventListener('DOMContentLoaded', () => {
    historiaManager.cargarHistorias();
});