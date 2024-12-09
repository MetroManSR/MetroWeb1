export function setTexts(language) {
    const texts = {
        en: {
            searchLabel: 'Search',
            rowsPerPageLabel: 'Rows per page:',
            toggleFiltersButton: 'Toggle Filters',
            applySettingsButton: 'Apply Settings',
            clearSettingsButton: 'Clear Settings',
            advancedSearchButton: 'Advanced Search',
            viewStatisticsButton: 'View Statistics',
            closeButton: 'Close'
        },
        es: {
            searchLabel: 'Buscar',
            rowsPerPageLabel: 'Filas por página:',
            toggleFiltersButton: 'Mostrar/Ocultar Filtros',
            applySettingsButton: 'Aplicar Configuración',
            clearSettingsButton: 'Borrar Configuración',
            advancedSearchButton: 'Búsqueda Avanzada',
            viewStatisticsButton: 'Ver Estadísticas',
            closeButton: 'Cerrar'
        }
    };

    const currentTexts = texts[language] || texts['en'];
    
    document.getElementById('dict-search-label').textContent = currentTexts.searchLabel;
    document.getElementById('dict-rows-per-page-label').textContent = currentTexts.rowsPerPageLabel;
    document.getElementById('dict-toggle-filter-button').textContent = currentTexts.toggleFiltersButton;
    document.getElementById('dict-apply-settings-button').textContent = currentTexts.applySettingsButton;
    document.getElementById('dict-clear-settings-button').textContent = currentTexts.clearSettingsButton;
    document.getElementById('dict-advanced-search-button').textContent = currentTexts.advancedSearchButton;
    document.getElementById('dict-view-statistics-button').textContent = currentTexts.viewStatisticsButton;
    document.getElementById('dict-close-popup-button').textContent = currentTexts.closeButton;
}
