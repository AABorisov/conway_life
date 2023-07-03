import { describe, expect, test } from '@jest/globals';
import { getNeighbours, getAlive, getAliveNeighbours, initGameOfLife } from "./gameOfLife-js.js";

const neighboursTable = [{
        cellIndex: 0,
        rowIndex: 0,
        width: 4,
        height: 4,
        expected: [15, 12, 13, 3, 1, 7, 4, 5],
    }, {
        cellIndex: 1,
        rowIndex: 0,
        width: 4,
        height: 4,
        expected: [12, 13, 14, 0, 2, 4, 5, 6],
    }, {
        cellIndex: 3,
        rowIndex: 0,
        width: 4,
        height: 4,
        expected: [14, 15, 12, 2, 0, 6, 7, 4],
    }, {
        cellIndex: 1,
        rowIndex: 1,
        width: 4,
        height: 4,
        expected: [0, 1, 2, 4, 6, 8, 9, 10],
    }, {
        cellIndex: 0,
        rowIndex: 3,
        width: 4,
        height: 4,
        expected: [11, 8, 9, 15, 13, 3, 0, 1],
    }, {
        cellIndex: 3,
        rowIndex: 3,
        width: 4,
        height: 4,
        expected: [10, 11, 8, 14, 12, 2, 3, 0],
    },
];

describe('Get Neighbours function', () => {
    test.each(neighboursTable)('for cell($rowIndex, $cellIndex) in matrix$widthx$height', ({ 
        cellIndex,
        rowIndex,
        width,
        height,
        expected, 
    }) => {
        expect(getNeighbours(cellIndex, rowIndex, width, width * height)).toEqual(expected);
    })
});

const data = [
    0, 1, 0, 0,
    0, 0, 1, 0,
    1, 1, 1, 0,
    0, 0, 0, 0,
];
const aliveNeighboursTable = [{
        cellIndex: 0,
        rowIndex: 0,
        data,
        neighbours: [15, 12, 13, 3, 1, 7, 4, 5],
        expected: 1
    }, {
        cellIndex: 1,
        rowIndex: 0,
        data,
        neighbours: [12, 13, 14, 0, 2, 4, 5, 6],
        expected: 1
    }, {
        cellIndex: 3,
        rowIndex: 0,
        data,
        neighbours: [14, 15, 12, 2, 0, 6, 7, 4],
        expected: 1
    }, {
        cellIndex: 1,
        rowIndex: 1,
        data,
        neighbours: [0, 1, 2, 4, 6, 8, 9, 10],
        expected: 5
    }, {
        cellIndex: 0,
        rowIndex: 3,
        data,
        neighbours: [11, 8, 9, 15, 13, 3, 0, 1],
        expected: 3
    }, {
        cellIndex: 3,
        rowIndex: 3,
        data,
        neighbours: [10, 11, 8, 14, 12, 2, 3, 0],
        expected: 2
    },
];

describe('Get Alive Neighbours function', () => {
    test.each(aliveNeighboursTable)('for cell($rowIndex, $cellIndex) in data(4x4) returns $expected', ({
        data,
        neighbours,
        expected,
    }) => {
        expect(getAliveNeighbours(data, neighbours)).toEqual(expected);
    })
});

const aliveTable = [
    [0, 0, 0],
    [0, 1, 0],
    [0, 2, 0],
    [0, 3, 1],
    [0, 4, 0],
    [0, 5, 0],
    [0, 6, 0],
    [0, 7, 0],
    [0, 8, 0],
    [1, 0, 0],
    [1, 1, 0],
    [1, 2, 1],
    [1, 3, 1],
    [1, 4, 0],
    [1, 5, 0],
    [1, 6, 0],
    [1, 7, 0],
    [1, 8, 0],
];

describe('Get Alive function', () => {
    test.each(aliveTable)('for alive=%i and aliveNeighbours=%i should be %i', (
        alive,
        aliveNeighbours,
        expected,
    ) => {
        expect(getAlive(alive, aliveNeighbours)).toEqual(expected);
    })
});

describe('Init GOL function', () => {
    const expectedEmpty = new Int8Array(9);
    const expectedRandom = new Int8Array([0, 1, 1, 0, 0, 0, 1, 0, 0]);
    const expectedFull = new Int8Array([1, 1, 1, 1, 1, 1, 1, 1, 1]);
    const SEED = 0.453433;
    const THRESHOLD = 0.3;

    test('check default values', async () => {
        const {
            getData,
            getGenerationNumber, 
        } = await initGameOfLife();

        expect(getGenerationNumber()).toBe(0);
        expect(getData()).toEqual(new Int8Array(0));
    });

    test('change dimensions', async () => {
        const expected = new Int8Array(9)
        const {
            getData,
            onChangeDimensions,
            getGenerationNumber,
        } = await initGameOfLife();

        onChangeDimensions(9);

        expect(getGenerationNumber()).toBe(0);
        expect(getData()).toEqual(expected);
    });

    test('toggle cell first generation', async () => {
        const expected = new Int8Array(9)
        const {
            getData,
            onChangeDimensions,
            toggleCell,
            getGenerationNumber,
        } = await initGameOfLife();

        onChangeDimensions(9);
        expect(getData()).toEqual(expected);
        toggleCell(0);
        expected[0] = 1;
        expect(getData()).toEqual(expected);

        toggleCell(0);
        expected[0] = 0;
        expect(getData()).toEqual(expected);
        expect(getGenerationNumber()).toBe(0);
    });

    test('tick', async () => {
        const expected = new Int8Array(9)
        const {
            getData,
            onChangeDimensions,
            toggleCell,
            getGenerationNumber,
            tick
        } = await initGameOfLife();

        onChangeDimensions(9);
        expect(getData()).toEqual(expected);
        toggleCell(0);
        expected[0] = 1;
        expect(getData()).toEqual(expected);

        tick(3, 3);
        expected[0] = 0;

        expect(getGenerationNumber()).toBe(1);
        expect(getData()).toEqual(expected);
    });

    test('toggle cell in data', async () => {
        const expected = new Int8Array(9)
        const {
            getData,
            onChangeDimensions,
            toggleCell,
            getGenerationNumber,
            tick,
        } = await initGameOfLife();

        onChangeDimensions(9);
        expect(getData()).toEqual(expected);
        tick(3, 3);

        expect(getGenerationNumber()).toBe(1);

        toggleCell(0);
        expected[0] = 1;
        expect(getData()).toEqual(expected);

        toggleCell(0);
        expected[0] = 0;
        expect(getData()).toEqual(expected);
    });

    test('generate random', async () => {
        const {
            getData,
            onChangeDimensions,
            getGenerationNumber,
            generateRandom
        } = await initGameOfLife();

        onChangeDimensions(9);
        expect(getGenerationNumber()).toBe(0);
        expect(getData()).toEqual(expectedEmpty);

        generateRandom(SEED, THRESHOLD);
        expect(getGenerationNumber()).toBe(0);
        expect(getData()).toEqual(expectedRandom);
    });

    test('generate random ticks', async () => {
        const {
            getData,
            onChangeDimensions,
            getGenerationNumber,
            generateRandom,
            tick
        } = await initGameOfLife();

        onChangeDimensions(9);
        expect(getGenerationNumber()).toBe(0);
        expect(getData()).toEqual(expectedEmpty);

        generateRandom(SEED, THRESHOLD);
        expect(getGenerationNumber()).toBe(0);
        expect(getData()).toEqual(expectedRandom);

        tick(3, 3);
        expect(getGenerationNumber()).toBe(1);
        expect(getData()).toEqual(expectedFull);

        tick(3, 3);
        expect(getGenerationNumber()).toBe(2);
        expect(getData()).toEqual(expectedEmpty);
    });

    test('clear first generation data', async () => {
        const {
            getData,
            onChangeDimensions,
            getGenerationNumber,
            generateRandom,
            clearData
        } = await initGameOfLife();

        onChangeDimensions(9);
        expect(getGenerationNumber()).toBe(0);
        expect(getData()).toEqual(expectedEmpty);

        generateRandom(SEED, THRESHOLD);
        expect(getGenerationNumber()).toBe(0);
        expect(getData()).toEqual(expectedRandom);

        clearData();
        expect(getGenerationNumber()).toBe(0);
        expect(getData()).toEqual(expectedEmpty);
    });

    test('clear data after tick', async () => {
        const {
            getData,
            onChangeDimensions,
            getGenerationNumber,
            generateRandom,
            tick,
            clearData
        } = await initGameOfLife();

        onChangeDimensions(9);
        expect(getGenerationNumber()).toBe(0);
        expect(getData()).toEqual(expectedEmpty);

        generateRandom(SEED, THRESHOLD);
        expect(getGenerationNumber()).toBe(0);
        expect(getData()).toEqual(expectedRandom);

        tick(3, 3);
        expect(getGenerationNumber()).toBe(1);
        expect(getData()).toEqual(expectedFull);

        clearData();
        expect(getGenerationNumber()).toBe(0);
        expect(getData()).toEqual(expectedEmpty);
    });

    test('rewind', async () => {
        const {
            getData,
            onChangeDimensions,
            getGenerationNumber,
            generateRandom,
            tick,
            rewind
        } = await initGameOfLife();

        onChangeDimensions(9);
        expect(getGenerationNumber()).toBe(0);
        expect(getData()).toEqual(expectedEmpty);

        generateRandom(SEED, THRESHOLD);
        expect(getGenerationNumber()).toBe(0);
        expect(getData()).toEqual(expectedRandom);

        tick(3, 3);
        expect(getGenerationNumber()).toBe(1);
        expect(getData()).toEqual(expectedFull);

        rewind();
        expect(getGenerationNumber()).toBe(0);
        expect(getData()).toEqual(expectedRandom);
    });

    test('resize same size', async () => {
        const {
            getData,
            onChangeDimensions,
            getGenerationNumber,
            generateRandom,
        } = await initGameOfLife();

        onChangeDimensions(9);
        expect(getGenerationNumber()).toBe(0);
        expect(getData()).toEqual(expectedEmpty);

        generateRandom(SEED, THRESHOLD);
        expect(getGenerationNumber()).toBe(0);
        expect(getData()).toEqual(expectedRandom);

        onChangeDimensions(9);
        expect(getGenerationNumber()).toBe(0);
        expect(getData()).toEqual(expectedRandom);
    });

    test('resize with great size', async () => {
        const expected = new Int8Array(16);
        expected.set(expectedRandom);
        const {
            getData,
            onChangeDimensions,
            getGenerationNumber,
            generateRandom,
        } = await initGameOfLife();

        onChangeDimensions(9);
        expect(getGenerationNumber()).toBe(0);
        expect(getData()).toEqual(expectedEmpty);

        generateRandom(SEED, THRESHOLD);
        expect(getGenerationNumber()).toBe(0);
        expect(getData()).toEqual(expectedRandom);

        onChangeDimensions(16);
        expect(getGenerationNumber()).toBe(0);
        expect(getData()).toEqual(expected);
    });

    test('resize with less size', async () => {
        const expected = new Int8Array(16);
        expected.set(expectedRandom);
        expected[12] = expected[13] = expected[14] = 1;
        const {
            getData,
            onChangeDimensions,
            getGenerationNumber,
            generateRandom,
        } = await initGameOfLife();

        onChangeDimensions(16);
        expect(getGenerationNumber()).toBe(0);
        expect(getData()).toEqual(new Int8Array(16));

        generateRandom(SEED, THRESHOLD);
        expect(getGenerationNumber()).toBe(0);
        expect(getData()).toEqual(expected);

        onChangeDimensions(9);
        expect(getGenerationNumber()).toBe(0);
        expect(getData()).toEqual(expectedRandom);
    });

    test('resize after tick', async () => {
        const expected = new Int8Array(16);
        expected.set(expectedFull);
        const {
            getData,
            onChangeDimensions,
            getGenerationNumber,
            generateRandom,
            tick,
        } = await initGameOfLife();

        onChangeDimensions(9);
        expect(getGenerationNumber()).toBe(0);
        expect(getData()).toEqual(expectedEmpty);

        generateRandom(SEED, THRESHOLD);
        expect(getGenerationNumber()).toBe(0);
        expect(getData()).toEqual(expectedRandom);

        tick(3, 3);
        expect(getGenerationNumber()).toBe(1);
        expect(getData()).toEqual(expectedFull);

        onChangeDimensions(16);
        expect(getGenerationNumber()).toBe(1);
        expect(getData()).toEqual(expected);
    });
});
