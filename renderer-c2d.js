export const MAX_RECTS_IN_PATH2D = 453433 * 16;
const MAX_RECTS_IN_OUR_PATH = Math.floor(MAX_RECTS_IN_PATH2D / 16);

export async function initRenderer(canvas) {
    const ctx = canvas.getContext('2d', { alpha: false });

    function render(data, count, canvasWidth, canvasHeight, cellSize) {
        if (canvasWidth !== canvas.width || canvasHeight !== canvas.height) {
            canvas.width = canvasWidth;
            canvas.height = canvasHeight;
            ctx.fillStyle = 'white';
            ctx.translate(0, 0);
        }

        ctx.clearRect(
            0,
            0,
            canvasWidth,
            canvasHeight
        );

        ctx.beginPath();
        let w = 0;
        let h = 0;
        const lastRightPoint = canvasWidth - cellSize + 0.000000001;
        let aliveCount = 0;
        const paths = [];
        let currentPath = createNewPath2();
        paths.push(currentPath);

        for (let ptr = 0; ptr < count; ptr++, w += cellSize) {
            if (w > lastRightPoint) {
                w = 0;
                h += cellSize;
            }
            if (data[ptr]) {
                currentPath.rect(
                    w,
                    h,
                    cellSize,
                    cellSize
                );
                aliveCount++;
                if (aliveCount % MAX_RECTS_IN_OUR_PATH === 0) {
                    currentPath = createNewPath2();
                    paths.push(currentPath);
                }
            }
        }
        
        paths.forEach((path) => {
            ctx.fill(path);
        })
        
        return aliveCount
    }

    return { render };
};

function createNewPath2() {
    return new Path2D();
}