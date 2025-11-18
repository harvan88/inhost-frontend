class Inspector {
    constructor() {
        this.isActive = false;
        this.currentElement = null;
        this.tooltip = document.getElementById('inspector-tooltip');
        this.init();
    }

    init() {
        const inspectorBtn = document.getElementById('toggle-inspector-btn');
        if (!inspectorBtn) {
            console.error('Botón de inspector no encontrado');
            return;
        }

        inspectorBtn.addEventListener('click', () => {
            this.toggleInspector();
        });

        document.addEventListener('mousemove', (e) => {
            if (!this.isActive) return;
            this.inspectElement(e.target);
        });

        document.addEventListener('click', (e) => {
            if (!this.isActive) return;
            e.preventDefault();
            e.stopPropagation();
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isActive) {
                this.toggleInspector();
            }
        });

        this.tooltip?.querySelector('.close-tooltip')?.addEventListener('click', () => {
            this.hideTooltip();
        });
    }

    toggleInspector() {
        // Verificar que hay temas cargados
        if (!window.themeManager || !window.themeManager.getThemes()) {
            alert('❌ No hay temas cargados. Verifica que themes.json esté disponible.');
            return;
        }

        this.isActive = !this.isActive;
        document.body.classList.toggle('inspector-active', this.isActive);
        
        const button = document.getElementById('toggle-inspector-btn');
        if (this.isActive) {
            button.textContent = '🔍 Desactivar Inspector';
            button.classList.add('active');
        } else {
            button.textContent = '🔍 Activar Inspector';
            button.classList.remove('active');
            this.hideTooltip();
            this.removeHighlights();
        }
    }

    inspectElement(element) {
        this.removeHighlights();
        
        const inspectableElement = this.findInspectableElement(element);
        if (!inspectableElement) {
            this.hideTooltip();
            return;
        }

        this.currentElement = inspectableElement;
        this.highlightElement(inspectableElement);
        this.showTooltip(inspectableElement);
    }

    findInspectableElement(element) {
        if (element.hasAttribute('data-inspector-type')) {
            return element;
        }

        let parent = element.parentElement;
        while (parent && parent !== document.body) {
            if (parent.hasAttribute('data-inspector-type')) {
                return parent;
            }
            parent = parent.parentElement;
        }

        return null;
    }

    highlightElement(element) {
        element.classList.add('inspector-highlight');
    }

    removeHighlights() {
        document.querySelectorAll('.inspector-highlight').forEach(el => {
            el.classList.remove('inspector-highlight');
        });
    }

    showTooltip(element) {
        if (!this.tooltip) return;

        const rect = element.getBoundingClientRect();
        const computedStyle = window.getComputedStyle(element);
        
        this.positionTooltip(rect);
        this.updateTooltipContent(element, computedStyle);
        
        this.tooltip.classList.add('visible');
        this.tooltip.classList.remove('hidden');
    }

    positionTooltip(rect) {
        const tooltipRect = this.tooltip.getBoundingClientRect();
        const viewport = {
            width: window.innerWidth,
            height: window.innerHeight
        };

        let x = rect.left + window.scrollX;
        let y = rect.bottom + window.scrollY + 10;

        if (x + tooltipRect.width > viewport.width) {
            x = viewport.width - tooltipRect.width - 20;
        }

        if (y + tooltipRect.height > viewport.height) {
            y = rect.top + window.scrollY - tooltipRect.height - 10;
        }

        this.tooltip.style.left = Math.max(10, x) + 'px';
        this.tooltip.style.top = Math.max(10, y) + 'px';
    }

    updateTooltipContent(element, computedStyle) {
        const elementName = element.tagName.toLowerCase();
        const elementRole = element.getAttribute('data-inspector-role') || 'element';
        
        this.tooltip.querySelector('.element-name').textContent = `${elementName} (${elementRole})`;
        
        // Color preview
        const bgColor = computedStyle.backgroundColor;
        const colorPreview = this.tooltip.querySelector('.color-preview');
        if (colorPreview) {
            colorPreview.style.backgroundColor = bgColor;
            colorPreview.textContent = bgColor;
            
            // Asegurar contraste
            const isLight = this.isLightColor(bgColor);
            colorPreview.style.color = isLight ? '#000000' : '#FFFFFF';
        }

        // Variables CSS
        this.showCSSVariables(computedStyle);

        // Información del tema desde JSON
        this.showThemeInfo();
    }

    isLightColor(color) {
        if (!color || color === 'rgba(0, 0, 0, 0)') return true;
        
        const hex = color.replace(/[^0-9A-F]/gi, '');
        if (hex.length === 3) {
            const r = parseInt(hex[0] + hex[0], 16);
            const g = parseInt(hex[1] + hex[1], 16);
            const b = parseInt(hex[2] + hex[2], 16);
            const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
            return luminance > 0.5;
        }
        return true;
    }

    showCSSVariables(computedStyle) {
        const variablesList = this.tooltip.querySelector('.variables-list');
        if (!variablesList) return;

        variablesList.innerHTML = '';

        const variables = this.extractCSSVariables(computedStyle);
        
        if (variables.length === 0) {
            variablesList.innerHTML = '<div class="variable-item">No se encontraron variables CSS</div>';
            return;
        }

        variables.forEach(({ name, value }) => {
            const item = document.createElement('div');
            item.className = 'variable-item';
            
            const isColor = value.startsWith('#') || value.startsWith('rgb');
            const colorSwatch = isColor ? 
                `<span class="color-swatch" style="background-color: ${value}"></span>` : '';
            
            // Verificar si es una variable del tema actual
            const isThemeVar = name.startsWith('--');
            const themeBadge = isThemeVar ? '<span class="theme-var">theme</span>' : '';
            
            item.innerHTML = `
                <span class="variable-name">
                    ${name}
                    ${themeBadge}
                </span>
                <span class="variable-value">
                    ${colorSwatch}
                    ${value}
                </span>
            `;
            variablesList.appendChild(item);
        });
    }

    extractCSSVariables(computedStyle) {
        const variables = [];
        
        // Obtener variables CSS específicas del tema
        const themeVariables = [
            '--bg-primary', '--bg-secondary', '--bg-elevated',
            '--text-primary', '--text-secondary', '--text-muted',
            '--border', '--accent', '--accent-hover',
            '--primary-500', '--gray-500', '--success-500',
            '--warning-500', '--error-500'
        ];

        themeVariables.forEach(varName => {
            try {
                const value = computedStyle.getPropertyValue(varName);
                if (value && value !== 'none' && value !== '0px') {
                    variables.push({
                        name: varName,
                        value: value.trim()
                    });
                }
            } catch (e) {
                // Ignorar errores
            }
        });

        return variables.slice(0, 10);
    }

    showThemeInfo() {
        const themeInfo = this.tooltip.querySelector('.theme-info');
        if (!themeInfo) return;

        const themeName = themeInfo.querySelector('.theme-name');
        const themeType = themeInfo.querySelector('.theme-type');

        if (themeName && themeType && window.themeManager) {
            const currentTheme = window.themeManager.getCurrentTheme();
            const themeData = window.themeManager.getCurrentThemeData();
            
            if (themeData) {
                themeName.textContent = `Tema: ${themeData.name}`;
                themeType.textContent = `Tipo: ${themeData.type === 'dark' ? 'Oscuro' : 'Claro'}`;
            } else {
                themeName.textContent = `Tema: ${currentTheme}`;
                themeType.textContent = 'Tipo: Desconocido';
            }
        }
    }

    hideTooltip() {
        if (!this.tooltip) return;
        this.tooltip.classList.remove('visible');
        this.tooltip.classList.add('hidden');
        this.removeHighlights();
    }
}

// Inicializar inspector
document.addEventListener('DOMContentLoaded', () => {
    new Inspector();
});