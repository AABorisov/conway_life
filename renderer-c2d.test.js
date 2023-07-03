import { beforeAll, describe, expect, test } from '@jest/globals';
import { afterEach } from 'node:test';
import { initRenderer, MAX_RECTS_IN_PATH2D } from './renderer-c2d';

class Path2D {
    constructor() {
        this.__path = [];
    }
    rect(x, y) {
        this.__path.push({x, y});
    }
}

beforeAll(() => {
    if (!global.Path2D) global.Path2D = Path2D;
})

const defaultCanvas = {
    width: 100,
    height: 100,
    x: 0,
    y: 0,
    __lastContext: null,
}

const canvas = {
    width: 100,
    height: 100,
    x: 0,
    y: 0,
    __lastContext: null,
    getContext: function (name) {
        canvas.__lastContext = {
            name,
            fillStyle: 'black',
            __path: [], // [{ y1, x1 }]
            __transform: [1, 0, 0, 1, 0, 0],
            translate(x, y) {
                this.__transform[4] += x;
                this.__transform[5] += y;
            },
            clearRect(x, y, w, h) {
                this.__path = this.__path.filter(({ x: px, y: py }) => {
                    if (py >= y && py <= y + h && px >= x && px <= x + w) {
                        return false;
                    }
                    return true
                })
            },
            rect(x, y) {
                this.__path.push({ x, y });
            },
            fill(path=null) {
                if (path instanceof Path2D) {
                    this.__path = this.__path.concat(path.__path.slice());
                }
                // ignore
            },
            beginPath() {
                // ignore
            }
        };
        return canvas.__lastContext;
    }
};

describe('Test canvas mock', () => {
    afterEach(() => {
        Object.assign(canvas, defaultCanvas);
    })
    const name = '2d';

    test('set name', () => {
        canvas.getContext(name);
        expect(canvas.__lastContext.name).toBe(name);
    })

    test('set fillStyle', () => {
        const fillcolor = 'white';
        const ctx = canvas.getContext(name);
        ctx.fillcolor = fillcolor
        expect(canvas.__lastContext.fillcolor).toBe(fillcolor);
    })

    test('translate', () => {
        const initTransformMatrix = [1, 0, 0, 1, 0, 0];
        const expectedTransformMatrix1 = [1, 0, 0, 1, 20, 20];
        const expectedTransformMatrix2 = [1, 0, 0, 1, -20, -20];

        const ctx = canvas.getContext(name);
        expect(canvas.__lastContext.__transform).toEqual(initTransformMatrix);
        ctx.translate(20, 20);
        expect(canvas.__lastContext.__transform).toEqual(expectedTransformMatrix1);
        ctx.translate(-40, -40);
        expect(canvas.__lastContext.__transform).toEqual(expectedTransformMatrix2);
    })

    test('set rect', () => {
        const expected = { x: 1, y: 1};
        const ctx = canvas.getContext(name);
        ctx.rect(expected.x, expected.y);

        expect(canvas.__lastContext.__path.length).toBe(1);
        expect(canvas.__lastContext.__path).toEqual([expected]);
        expect(canvas.__lastContext.__path[0]).toEqual(expected);
    })

    test('clearRect', () => {
        const points = [
            { x: 0, y: 0 }, 
            { x: 1, y: 0 },
            { x: 0, y: 1 },
            { x: 1, y: 1 },
            { x: 3, y: 3 },
            { x: 4, y: 3 },
            { x: 3, y: 4 },
            { x: 4, y: 4 }
        ];
        const expected = [
            { x: 0, y: 0 },
            { x: 1, y: 0 },
            { x: 0, y: 1 },
            { x: 4, y: 3 },
            { x: 3, y: 4 },
            { x: 4, y: 4 }
        ]
        const ctx = canvas.getContext(name);
        for (let pi = 0, len = points.length; pi < len; pi++) {
            ctx.rect(points[pi].x, points[pi].y);
        }
        expect(canvas.__lastContext.__path.length).toBe(8);
        expect(canvas.__lastContext.__path).toEqual(points);

        ctx.clearRect(1, 1, 2, 2);
        expect(canvas.__lastContext.__path.length).toBe(6);
        expect(canvas.__lastContext.__path).toEqual(expected);
    })

    test('fill', () => {
        const ctx = canvas.getContext(name);
        ctx.fill();
        canvas.__lastContext = null;
        expect(JSON.stringify(ctx)).toEqual(JSON.stringify(canvas.getContext(name)));
    })

    test('fill with path', () => {
        const byContext = { x: 1, y: 1 };
        const byPath2D = [{ x: 2, y: 2 }, { x: 3, y: 3 }];
        const expected = [{ x: 1, y: 1 }, { x: 2, y: 2 }, { x: 3, y: 3 }];
        const ctx = canvas.getContext(name);
        ctx.rect(byContext.x, byContext.y);
        const path2D = new Path2D();
        path2D.rect(byPath2D[0].x, byPath2D[0].y);
        path2D.rect(byPath2D[1].x, byPath2D[1].y);
        ctx.fill(path2D);
        expect(canvas.__lastContext.__path).toEqual(expected);
    })

    test('beginPath', () => {
        const ctx = canvas.getContext(name);
        ctx.beginPath();
        canvas.__lastContext = null;
        expect(JSON.stringify(ctx)).toEqual(JSON.stringify(canvas.getContext(name)));
    })
});

const data4 = [
    0, 1, 0, 0,
    0, 0, 1, 0,
    1, 1, 1, 0,
    0, 0, 0, 0,
];
const canvasSizes = [1, 2, 3, 4, 5, 6, 7];

const dataWidth4 = 4;
const render4Table = canvasSizes.map((canvasSize) => ({
    width: dataWidth4,
    count: data4.length,
    canvasWidth: canvasSize,
    canvasHeight: canvasSize,
    cellSize: canvasSize / dataWidth4,
    expectedCount: 5,
    expectedCountInRow: [1, 1, 3, 0],
    expectedCountInCol: [1, 2, 2, 0]
}));

const dataWidth10 = 10;
const data10 = new Array(dataWidth10 * dataWidth10).fill(1);
const render10Table = canvasSizes.map(canvasSize => ({
    width: dataWidth10,
    count: data10.length,
    canvasWidth: canvasSize,
    canvasHeight: canvasSize,
    cellSize: canvasSize / dataWidth10,
    expectedCount: data10.length,
    expectedCountInRow: new Array(dataWidth10).fill(dataWidth10),
    expectedCountInCol: new Array(dataWidth10).fill(dataWidth10),
}));

const dataWidth1000 = 1000;
const data1000 = new Array(dataWidth1000 * 10).fill(1);
const render1000Table = [150, 151, 152, 153].map(canvasSize => ({
    width: dataWidth1000,
    count: data1000.length,
    canvasWidth: canvasSize,
    canvasHeight: canvasSize,
    cellSize: canvasSize / dataWidth1000,
    expectedCount: data1000.length,
    expectedCountInRow: new Array(10).fill(dataWidth1000),
    expectedCountInCol: new Array(dataWidth1000).fill(10),
}))

const dataWidthMax = Math.floor(MAX_RECTS_IN_PATH2D / 16);
const dataMax = new Int8Array(dataWidthMax * 2).fill(1);
const renderMaxTable = [100].map(canvasSize => ({
    width: dataWidthMax,
    count: dataMax.length,
    canvasWidth: canvasSize,
    canvasHeight: 2,
    cellSize: canvasSize / dataWidthMax,
    expectedCount: dataMax.length,
    expectedCountInRow: new Array(2).fill(dataWidthMax),
    expectedCountInCol: new Array(dataWidthMax).fill(2),
}))

const renderTable = [
    {
        width: dataWidth4,
        data: data4,
        renderTable: render4Table
    },
    {
        width: dataWidth10,
        data: data10,
        renderTable: render10Table
    },
    {
        width: dataWidth1000,
        data: data1000,
        renderTable: render1000Table
    },
    {
        width: 'Max',
        data: dataMax,
        renderTable: renderMaxTable
    }
]

describe.each(renderTable)('Render function with width=$width', ({ data, renderTable }) => {
    afterEach(() => {
        Object.assign(canvas, defaultCanvas);
    });

    test.each(renderTable)('count of points: canvas $canvasWidthX$canvasHeight with cell $cellSize', async ({
        count,
        canvasWidth,
        canvasHeight,
        cellSize,
        expectedCount,
    }) => {
        const { render } = await initRenderer(canvas);
        render(data, count, canvasWidth, canvasHeight, cellSize);
        const ctx = canvas.__lastContext
        expect(ctx.__path.length).toBe(expectedCount);
    })

    test.each(renderTable)('count in row: canvas $canvasWidthX$canvasHeight with cell $cellSize', async ({
        width,
        count,
        canvasWidth,
        canvasHeight,
        cellSize,
        expectedCountInRow,
    }) => {
        const { render } = await initRenderer(canvas);
        render(data, count, canvasWidth, canvasHeight, cellSize);
        const ctx = canvas.__lastContext;
        let rowY = 0;
        const actual = new Array(count / width).fill(0).map((_, index) => {
            if (index !== 0) {
                rowY += cellSize;
            }

            return ctx.__path.filter(({ y }) => y === rowY).length;
        })
        expect(actual).toEqual(expectedCountInRow);
    })


    test.skip.each(renderTable)('count in col: canvas $canvasWidthX$canvasHeight with cell $cellSize', async ({
        width,
        count,
        canvasWidth,
        canvasHeight,
        cellSize,
        expectedCountInCol,
    }) => {
        const { render } = await initRenderer(canvas);
        render(data, count, canvasWidth, canvasHeight, cellSize);
        const ctx = canvas.__lastContext;
        let rowX = 0;
        const actual = new Array(width).fill(0).map((_, index) => {
            if (index !== 0) {
                rowX += cellSize
            }

            return ctx.__path.filter(({ x }) => x === rowX).length;
        })
        expect(actual).toEqual(expectedCountInCol);
    })
})