export async function initGameOfLife() {
    let generationNumber = 0;
    let firstGeneration = createDataArray();
    let data = firstGeneration;
    let tmp = createDataArray();

    function getData() {
        return data;
    }

    function toggleCell(index) {
        if (generationNumber) {
            if (data[index]) {
                data[index] = 0;
            } else {
                data[index] = 1;
            }
        } else {
            if (firstGeneration[index]) {
                firstGeneration[index] = 0;
            } else {
                firstGeneration[index] = 1;
            }
        }
    }

    function onChangeDimensions(count) {
        firstGeneration = resizeArray(firstGeneration, count);
        if (generationNumber) {
            data = resizeArray(data, count);
        } else {
            data = firstGeneration
        }
    }

    function rewind() {
        data = firstGeneration;
        generationNumber = 0;
    }

    function tick(width, height) {
        if (!generationNumber) {
            data = copyDataArray(firstGeneration);
        }
        const count = width * height;

        tmp = createDataArray(count);

        for (let rowIndex = 0, tmpIndex = 0; rowIndex < height; rowIndex++) {
            for (let cellIndex = 0; cellIndex < width; cellIndex++, tmpIndex++) {
                const neighboursArray = getNeighbours(cellIndex, rowIndex, width, count);
                tmp[tmpIndex] = getAliveNeighbours(data, neighboursArray);
            }
        }

        for (let cellIndex = 0; cellIndex < count; cellIndex++) {
            data[cellIndex] = getAlive(data[cellIndex], tmp[cellIndex]);
        }
        generationNumber++

        return generationNumber;
    }

    // 453433
    function generateRandom(seed = Math.random(), threshold = 0.5) {
        const count = firstGeneration.length;
        firstGeneration = createDataArray(count).map((_, index) => random(seed + index) < threshold);
        data = firstGeneration;
        generationNumber = 0;
    }

    function clearData() {
        const count = firstGeneration.length;
        firstGeneration = createDataArray(count);
        data = firstGeneration;
        generationNumber = 0;
    }

    function getGenerationNumber() {
        return generationNumber;
    }

    return {
        getData,
        toggleCell,
        onChangeDimensions,
        rewind,
        tick,
        generateRandom,
        clearData,
        getGenerationNumber,
    }
}

function createDataArray(size = 0) {
    return new Int8Array(size);
}

function copyDataArray(sourceArray) {
    return Int8Array.from(sourceArray);
}

function resizeArray(sourceArray, targetLength) {
    if (sourceArray.length === targetLength) {
        return sourceArray;
    }
    if (sourceArray.length > targetLength) {
        return sourceArray.slice(0, targetLength);
    }
    const newArray = createDataArray(targetLength);
    newArray.set(sourceArray);
    return newArray;
}

function random(seed) {
    var x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
}

export function getNeighbours(cellIndex, rowIndex, width, count) {
    const point = rowIndex * width + cellIndex;
    const top = point - width >= 0 ? point - width : count + point - width;
    const bottom = point + width < count ? point + width : point + width - count;

    const left = cellIndex - 1 >= 0 ? - 1 : width - 1;
    const right = cellIndex + 1 < width ? 1 : 1 - width;

    return [
        top + left, top, top + right,
        point + left, point + right,
        bottom + left, bottom, bottom + right
    ]
}

export function getAliveNeighbours(data, neighbours) {
    return neighbours.reduce((acc, cellIndex) => acc + data[cellIndex], 0);
}

export function getAlive(alive, aliveNeighbours) {
    return Number(!alive && aliveNeighbours === 2 || alive && (aliveNeighbours === 3 || aliveNeighbours === 4));
}