class IceSimulation {
    constructor() {
        this.initialMass = 100;
        this.currentMass = this.initialMass;
        this.isSimulating = false;
        this.simulationInterval = null;
        this.elapsedTime = 0; // 經過的模擬時間（秒）

        this.initializeElements();
        this.initializeEventListeners();
    }

    initializeElements() {
        this.materialSelect = document.getElementById('material');
        this.temperatureInput = document.getElementById('temperature');
        this.temperatureValue = document.getElementById('temperature-value');
        this.startButton = document.getElementById('start-simulation');
        this.resetButton = document.getElementById('reset-simulation');
        this.iceBlock = document.getElementById('ice-block');
        this.surface = document.getElementById('surface');
        this.meltRateDisplay = document.getElementById('melt-rate');
        this.remainingMassDisplay = document.getElementById('remaining-mass');
        this.surfaceTempDisplay = document.getElementById('surface-temp');
    }

    initializeEventListeners() {
        this.materialSelect.addEventListener('change', () => this.updateSurfaceMaterial());
        this.temperatureInput.addEventListener('input', () => {
            this.temperatureValue.textContent = `${this.temperatureInput.value}°C`;
        });
        this.startButton.addEventListener('click', () => this.toggleSimulation());
        this.resetButton.addEventListener('click', () => this.resetSimulation());
    }

    updateSurfaceMaterial() {
        const material = this.materialSelect.value;
        this.surface.className = `surface ${material}`;
    }

    calculateMeltRate() {
        const temperature = parseFloat(this.temperatureInput.value);
        const material = this.materialSelect.value;

        const heatTransferFactor = {
            copper: 17.2,
            aluminum: 12.9,
            plastic: 3.6
        };

        const tempFactor = Math.max(0, temperature) / 30;
        const baseRate = 0.6;

        return baseRate * tempFactor * (heatTransferFactor[material] / 20);
    }

    updateSimulation() {
        if (!this.isSimulating) return;

        const meltRate = this.calculateMeltRate();
        this.currentMass = Math.max(0, this.currentMass - meltRate);

        this.meltRateDisplay.textContent = meltRate.toFixed(2);
        this.remainingMassDisplay.textContent = this.currentMass.toFixed(1);

        // 更新模擬時間（每次 update 為 0.1 秒）
        this.elapsedTime += 0.1;

        const material = this.materialSelect.value;
        const surfaceTemp = this.lookupSurfaceTemp(material, this.elapsedTime);
        this.surfaceTempDisplay.textContent = surfaceTemp.toFixed(1);

        const scale = this.currentMass / this.initialMass;
        this.iceBlock.style.transform = `translateX(-50%) scale(${scale})`;
        this.iceBlock.style.opacity = scale;

        if (this.currentMass <= 0) {
            this.stopSimulation();
        }
    }

    lookupSurfaceTemp(material, time) {
        const table = {
            aluminum: {
                0: 23.6, 60: 22.5, 120: 18, 180: 17.5, 240: 15.5,
                300: 14.5, 360: 13, 420: 13, 480: 12.5, 540: 12,
                600: 12, 660: 13.5, 720: 13, 780: 13, 840: 12, 900: 12
            },
            copper: {
                0: 25.5, 60: 18, 120: 15.5, 180: 17.5, 240: 11.5,
                300: 14.5, 360: 11, 420: 13, 480: 12.5, 540: 11.5,
                600: 9.5, 660: 9.5, 720: 12, 780: 11, 840: 9, 900: 9
            },
            plastic: {
                0: 25.5, 60: 25.5, 120: 25.0, 180: 25.5, 240: 25.5,
                300: 25.5, 360: 25.5, 420: 25, 480: 24.5, 540: 25,
                600: 24.5, 660: 24, 720: 23.5, 780: 23.5, 840: 23, 900: 23
            }
        };

        const data = table[material];
        const timePoints = Object.keys(data).map(t => parseInt(t)).sort((a, b) => a - b);

        for (let i = 0; i < timePoints.length - 1; i++) {
            const t1 = timePoints[i];
            const t2 = timePoints[i + 1];
            if (time >= t1 && time <= t2) {
                const v1 = data[t1];
                const v2 = data[t2];
                const ratio = (time - t1) / (t2 - t1);
                return v1 + (v2 - v1) * ratio;
            }
        }

        // 超過最大時間就返回最後一筆值
        return data[timePoints[timePoints.length - 1]];
    }

    toggleSimulation() {
        if (this.isSimulating) {
            this.stopSimulation();
        } else {
            this.startSimulation();
        }
    }

    startSimulation() {
        if (this.currentMass <= 0) {
            this.resetSimulation();
        }
        this.isSimulating = true;
        this.elapsedTime = 0;
        this.startButton.textContent = 'stop simulation';
        this.simulationInterval = setInterval(() => this.updateSimulation(), 100);
    }

    stopSimulation() {
        this.isSimulating = false;
        this.startButton.textContent = 'start simulation';
        clearInterval(this.simulationInterval);
    }

    resetSimulation() {
        this.stopSimulation();
        this.currentMass = this.initialMass;
        this.elapsedTime = 0;
        this.iceBlock.style.transform = 'translateX(-50%) scale(1)';
        this.iceBlock.style.opacity = 1;
        this.meltRateDisplay.textContent = '0';
        this.remainingMassDisplay.textContent = this.initialMass.toString();
        this.surfaceTempDisplay.textContent = '0';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new IceSimulation();
});