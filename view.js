export function setupControls({
    getPlay, setPlay, rewind, generateRandom, clearData
}) {
    const resetControl = document.querySelector('#reset');
    const stopControl = document.querySelector('#stop');
    const startControl = document.querySelector('#start');
    const randomControl = document.querySelector('#random');
    const clearControl = document.querySelector('#clear');

    const reset = () => rewind();
    const stop = () => setPlay(false);
    const start = () => setPlay(true);
    const random = () => !getPlay() && generateRandom();
    const clear = () => !getPlay() && clearData();

    resetControl.addEventListener('click', reset);
    stopControl.addEventListener('click', stop);
    startControl.addEventListener('click', start);
    randomControl.addEventListener('click', random);
    clearControl.addEventListener('click', clear);
}
export function setupInputs({
    setDimensions
}) {
    const widthInput = document.querySelector('#width');
    const heightInput = document.querySelector('#height');

    const dimensionHandler = () => {
        const widthValue = Math.trunc(widthInput.value);
        const heightValue = Math.trunc(heightInput.value);
        if (widthValue > 0 && heightValue > 0) {
            setDimensions(widthValue, heightValue);
        }
    };
    widthInput.addEventListener('input', dimensionHandler);
    heightInput.addEventListener('input', dimensionHandler);
    dimensionHandler();
}
export function getCanvas({ setCanvasDimensions, toggleCell, getCellIndex }) {
    const canvas = document.querySelector('canvas');

    const resizeHandler = () => {
        setCanvasDimensions(canvas.clientWidth, canvas.clientHeight);
    };
    window.addEventListener('resize', resizeHandler);
    resizeHandler();

    const clickHandler = (e) => {
        const cellIndex = getCellIndex(e.offsetX, e.offsetY);
        toggleCell(cellIndex);
    };
    canvas.addEventListener('click', clickHandler);

    return canvas;
}
export function getStats() {
    const fpsInput = document.querySelector('#fps');
    const firstGenInput = document.querySelector('#first_performance');
    const performanceInput = document.querySelector('#performance');
    const generationInput = document.querySelector('#generation');
    const aliveCountInput = document.querySelector('#alive_count');

    function setFPS(value) {
        fpsInput.value = `${value.toFixed(1)} FPS`;
    }
    function setFirstGenPerformance(value) {
        firstGenInput.value = `${value.toFixed(4)} ms`;
    }
    function setPerformance(value) {
        performanceInput.value = `${value.toFixed(4)} ms`;
    }
    function setGenerationNumber(value) {
        generationInput.value = value;
    }
    function setAliveCount(value) {
        aliveCountInput.value = value;
    }

    return {
        setFPS,
        setFirstGenPerformance,
        setPerformance,
        setGenerationNumber,
        setAliveCount,
    };
}
