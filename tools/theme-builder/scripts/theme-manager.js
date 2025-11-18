class ThemeManager {
    constructor() {
        this.themes = {};
        this.currentTheme = '';
        this.init();
    }

    async init() {
        try {
            await this.loadThemes();
            this.setupEventListeners();
        } catch (error) {
            this.handleThemeError('No se pudieron cargar los temas', error);
        }
    }

    async loadThemes() {
        const response = await fetch('themes.json');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!data.themes || Object.keys(data.themes).length === 0) {
            throw new Error('No hay temas definidos en el JSON');
        }

        this.themes = data.themes;
        this.currentTheme = data.currentTheme || Object.keys(this.themes)[0];
        
        this.updateThemeSelector();
        this.applyTheme(this.currentTheme);
    }

    updateThemeSelector() {
        const themeSelect = document.getElementById('theme-select');
        if (!themeSelect) return;

        themeSelect.innerHTML = '';

        Object.entries(this.themes).forEach(([themeId, theme]) => {
            const option = document.createElement('option');
            option.value = themeId;
            option.textContent = theme.name;
            themeSelect.appendChild(option);
        });

        themeSelect.value = this.currentTheme;
    }

    setupEventListeners() {
        const themeSelect = document.getElementById('theme-select');
        if (themeSelect) {
            themeSelect.addEventListener('change', (e) => {
                this.applyTheme(e.target.value);
            });
        }

        document.getElementById('edit-theme-btn')?.addEventListener('click', () => {
            this.openThemeEditor();
        });

        document.getElementById('new-theme-btn')?.addEventListener('click', () => {
            this.createNewTheme();
        });
    }

    applyTheme(themeName) {
        if (!this.themes[themeName]) {
            throw new Error(`Tema "${themeName}" no encontrado en JSON`);
        }

        this.currentTheme = themeName;
        const theme = this.themes[themeName];

        // Aplicar TODAS las variables CSS desde JSON
        this.applyCSSVariables(theme);

        localStorage.setItem('chat-theme', themeName);

        const themeSelect = document.getElementById('theme-select');
        if (themeSelect) {
            themeSelect.value = themeName;
        }

        console.log(`✅ Tema aplicado desde JSON: ${themeName}`);
    }

    applyCSSVariables(theme) {
        const root = document.documentElement;

        // Limpiar variables previas
        this.clearCSSVariables(root);

        // Aplicar colores base del JSON
        Object.entries(theme.colors).forEach(([colorName, colorValue]) => {
            if (!colorValue) {
                console.warn(`Color vacío para ${colorName} en tema ${this.currentTheme}`);
                return;
            }
            root.style.setProperty(`--${colorName}`, colorValue);
        });

        // Aplicar variables de aplicación del JSON
        if (theme.variables) {
            Object.entries(theme.variables).forEach(([varName, varValue]) => {
                if (varValue.startsWith('var(')) {
                    // Resolver referencias a variables
                    const referencedVar = varValue.match(/var\((--[^)]+)\)/)?.[1];
                    if (referencedVar) {
                        const resolvedValue = getComputedStyle(root).getPropertyValue(referencedVar);
                        if (resolvedValue) {
                            root.style.setProperty(`--${varName}`, resolvedValue.trim());
                        }
                    }
                } else {
                    root.style.setProperty(`--${varName}`, varValue);
                }
            });
        } else {
            // Si no hay variables definidas, generar desde colores
            this.generateVariablesFromColors(theme, root);
        }

        root.setAttribute('data-theme', theme.type);
    }

    clearCSSVariables(root) {
        // Obtener todas las variables CSS actuales
        const styles = getComputedStyle(root);
        const variables = [];
        
        for (let i = 0; i < styles.length; i++) {
            const name = styles[i];
            if (name.startsWith('--')) {
                variables.push(name);
            }
        }

        // Limpiar todas las variables
        variables.forEach(variable => {
            root.style.removeProperty(variable);
        });
    }

    generateVariablesFromColors(theme, root) {
        // Generar variables básicas basadas en la estructura del tema
        const isDark = theme.type === 'dark';
        
        const generatedVars = {
            'bg-primary': isDark ? theme.colors['gray-900'] : '#ffffff',
            'bg-secondary': isDark ? theme.colors['gray-800'] : theme.colors['gray-50'],
            'bg-elevated': isDark ? theme.colors['gray-700'] : theme.colors['gray-100'],
            'text-primary': isDark ? theme.colors['gray-50'] : theme.colors['gray-900'],
            'text-secondary': isDark ? theme.colors['gray-400'] : theme.colors['gray-600'],
            'text-muted': isDark ? theme.colors['gray-500'] : theme.colors['gray-500'],
            'border': isDark ? theme.colors['gray-700'] : theme.colors['gray-200'],
            'accent': theme.colors['primary-500'],
            'accent-hover': theme.colors['primary-600'] || theme.colors['primary-400']
        };

        Object.entries(generatedVars).forEach(([varName, varValue]) => {
            if (varValue) {
                root.style.setProperty(`--${varName}`, varValue);
            }
        });
    }

    handleThemeError(message, error) {
        console.error('❌ Error de temas:', message, error);
        
        // Mostrar estado de error en la UI
        const themeControls = document.querySelector('.theme-controls');
        if (themeControls) {
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error-state';
            errorDiv.innerHTML = `
                <h3>❌ Error Cargando Temas</h3>
                <p>${message}</p>
                <p><small>${error?.message || ''}</small></p>
            `;
            themeControls.appendChild(errorDiv);
        }

        // Deshabilitar controles
        document.getElementById('theme-select')?.setAttribute('disabled', 'true');
        document.getElementById('edit-theme-btn')?.setAttribute('disabled', 'true');
        document.getElementById('new-theme-btn')?.setAttribute('disabled', 'true');
        document.getElementById('toggle-inspector-btn')?.setAttribute('disabled', 'true');
    }

    openThemeEditor() {
        const modal = document.getElementById('theme-editor');
        const palette = document.getElementById('color-palette');
        
        if (!modal || !palette) return;

        palette.innerHTML = '';
        const currentTheme = this.themes[this.currentTheme];
        
        Object.entries(currentTheme.colors).forEach(([colorName, colorValue]) => {
            const colorInput = document.createElement('div');
            colorInput.className = 'color-input';
            colorInput.innerHTML = `
                <label>${colorName}</label>
                <input type="color" value="${colorValue}" data-color="${colorName}">
                <span class="color-value">${colorValue}</span>
            `;
            palette.appendChild(colorInput);
        });

        modal.classList.remove('hidden');
    }

    createNewTheme() {
        const newThemeName = prompt('Nombre del nuevo tema:');
        if (!newThemeName) return;

        // Esto es solo para demo - en producción necesitarías guardar en el JSON
        console.warn('Crear nuevo tema requiere guardar en themes.json (necesita backend)');
        alert('En una implementación real, esto guardaría en themes.json');
    }

    getCurrentTheme() {
        return this.currentTheme;
    }

    getThemes() {
        return this.themes;
    }

    getCurrentThemeData() {
        return this.themes[this.currentTheme];
    }
}

// Inicializar con manejo de errores global
document.addEventListener('DOMContentLoaded', () => {
    try {
        window.themeManager = new ThemeManager();
    } catch (error) {
        console.error('❌ Error fatal inicializando ThemeManager:', error);
        document.body.innerHTML = `
            <div style="padding: 20px; text-align: center; background: #dc2626; color: white;">
                <h1>❌ Error Crítico</h1>
                <p>No se pudieron cargar los temas: ${error.message}</p>
                <p>Verifica que themes.json exista y tenga el formato correcto.</p>
            </div>
        `;
    }
});