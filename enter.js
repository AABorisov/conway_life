import { initRenderer } from './renderer-c2d.js';
import { initGameOfLife } from './gameOfLife-js.js';
import { setupControls, setupInputs, getCanvas, getStats } from './view.js';


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