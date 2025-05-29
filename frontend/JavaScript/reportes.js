class ReporteManager {
    constructor() {
        this.API_URL = 'http://localhost:8000/api';
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        // Botón para generar reportes
        document.getElementById('btnReportes')?.addEventListener('click', () => {
            this.mostrarModalReportes();
        });
    }

    async generarReportes() {
        try {
            const response = await fetch(`${this.API_URL}/reportes`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const reportes = await response.json();
            this.renderizarReportes(reportes);
        } catch (error) {
            console.error('Error al generar reportes:', error);
            this.mostrarError('Error al generar los reportes');
        }
    }

    renderizarReportes(reportes) {
        const resumenGeneral = document.getElementById('resumenGeneral');
        const resumenResponsables = document.getElementById('resumenResponsables');

        if (resumenGeneral) {
            resumenGeneral.innerHTML = `
                <div class="reporte-card">
                    <div class="reporte-titulo">Historias Finalizadas</div>
                    <div class="reporte-valor">${reportes.finalizadas}</div>
                </div>
                <div class="reporte-card">
                    <div class="reporte-titulo">Historias Pendientes</div>
                    <div class="reporte-valor">${reportes.pendientes}</div>
                </div>
                <div class="reporte-card">
                    <div class="reporte-titulo">Historias con Impedimentos</div>
                    <div class="reporte-valor">${reportes.impedimentos}</div>
                </div>
            `;
        }

        if (resumenResponsables) {
            resumenResponsables.innerHTML = reportes.porResponsable.map(responsable => `
                <div class="reporte-card">
                    <div class="reporte-titulo">${responsable.nombre}</div>
                    <div class="row">
                        <div class="col-4">
                            <small>Finalizadas</small>
                            <div class="reporte-valor">${responsable.finalizadas}</div>
                        </div>
                        <div class="col-4">
                            <small>Pendientes</small>
                            <div class="reporte-valor">${responsable.pendientes}</div>
                        </div>
                        <div class="col-4">
                            <small>Impedimentos</small>
                            <div class="reporte-valor">${responsable.impedimentos}</div>
                        </div>
                    </div>
                </div>
            `).join('');
        }
    }

    mostrarModalReportes() {
        const modal = new bootstrap.Modal(document.getElementById('modalReportes'));
        this.generarReportes();
        modal.show();
    }

    async exportarReporte() {
        try {
            const response = await fetch(`${this.API_URL}/reportes/exportar`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'reporte_historias.xlsx';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Error al exportar reporte:', error);
            this.mostrarError('Error al exportar el reporte');
        }
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

// Inicializar el manager de reportes
const reporteManager = new ReporteManager(); 