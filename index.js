import { initRenderer } from './renderer-c2d.js';
import { initGameOfLife } from './gameOfLife-js.js';


function setupControls({
    getPlay,
    setPlay,
    rewind,
    generateRandom,
    clearData
}) {
    const resetControl = document.querySelector('#reset');
    const stopControl = document.querySelector('#stop');
    const startControl = document.querySelector('#start');
    const randomControl = document.querySelector('#random');
    const clearControl = document.querySelector('#clear');

    const reset = () => rewind()
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

function setupInputs({
    setDimensions
}) {
    const widthInput = document.querySelector('#width');
    const heightInput = document.querySelector('#height');

    const dimensionHandler = () => {
        const widthValue = Math.trunc(widthInput.value);
        const heightValue = Math.trunc(heightInput.value);
        if (widthValue > 0 && heightValue > 0) {
            setDimensions(widthValue, heightValue)
        }
    }
    widthInput.addEventListener('input', dimensionHandler);
    heightInput.addEventListener('input', dimensionHandler);
    dimensionHandler();
}

function getCanvas({ setCanvasDimensions, toggleCell, getCellIndex }) {
    const canvas = document.querySelector('canvas');

    const resizeHandler = () => {
        setCanvasDimensions(canvas.clientWidth, canvas.clientHeight);
    }
    window.addEventListener('resize', resizeHandler);
    resizeHandler();

    const clickHandler = (e) => {
        const cellIndex = getCellIndex(e.offsetX, e.offsetY);
        toggleCell(cellIndex);
    }
    canvas.addEventListener('click', clickHandler);

    return canvas
}

function getStats() {
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
    }
}

async function main() {
    let canvasWidth;
    let canvasHeight;
    let width = 0;
    let height = 0;
    let play = false;

    const setCanvasDimensions = (width, height) => {
        canvasWidth = width;
        canvasHeight = height;
    }

    const setPlay = (isPlaying) => {
        play = isPlaying;
    }

    const getPlay = () => {
        return play;
    }

    const getCellIndexByOffset = (offsetX, offsetY) => {
        return getCellIndex(offsetX, offsetY, width, height, canvasWidth, canvasHeight);
    }

    const {
        getData,
        toggleCell,
        onChangeDimensions,
        rewind,
        tick,
        generateRandom,
        clearData,
        getGenerationNumber,
    } = await initGameOfLife();

    setupControls({
        getPlay,
        setPlay,
        rewind,
        generateRandom,
        clearData
    });

    const setDimensions = (w, h) => {
        width = w;
        height = h;
        onChangeDimensions(width * height);
    }

    setupInputs({
        setDimensions
    });

    const canvas = getCanvas({
        setCanvasDimensions,
        toggleCell,
        getCellIndex: getCellIndexByOffset
    });

    const { render } = await initRenderer(canvas);

    const {
        setFPS,
        setFirstGenPerformance,
        setPerformance,
        setGenerationNumber,
        setAliveCount,
    } = getStats();

    let lastTs = performance.now();
    let commulitivePerformanceMs = 0;
    let framesDrawn = 0;
    let generationNumber = getGenerationNumber();
    let aliveCount = 0;

    const frame = (timestamp) => {
        requestAnimationFrame(frame);

        if (play) {
            const startTickTs = performance.now();
            generationNumber = tick(width, height);
            commulitivePerformanceMs += performance.now() - startTickTs;
            if (generationNumber === 1) {
                setFirstGenPerformance(commulitivePerformanceMs);
            }
        } else {
            commulitivePerformanceMs = 0;
            generationNumber = getGenerationNumber();
        }
        aliveCount = render(getData(), width * height, canvasWidth, canvasHeight, getCellSize(width, height, canvasWidth, canvasHeight));

        framesDrawn++;
        if (timestamp > lastTs + 2000) {
            setFPS(1000 * framesDrawn / (timestamp - lastTs));
            setPerformance(commulitivePerformanceMs / framesDrawn);
            setGenerationNumber(generationNumber);
            setAliveCount(aliveCount);
            lastTs = timestamp;
            commulitivePerformanceMs = 0;
            framesDrawn = 0;
        }
    }
    requestAnimationFrame(frame);
}

function getCellSize(width, height, canvasWidth, canvasHeight) {
    return canvasWidth / width;
}

function getCellIndex(offsetX, offsetY, width, height, canvasWidth, canvasHeight) {
    const cellSize = getCellSize(width, height, canvasWidth, canvasHeight);
    return Math.floor(offsetX / cellSize) + Math.floor(offsetY / cellSize) * width;
}

main();