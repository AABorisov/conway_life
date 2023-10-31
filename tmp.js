
function getShaderSource(shaderId) {
    const shaderScript = document.getElementById(shaderId);
    return shaderScript.text;
}
const V_SHADER_SCRIPT_ID = 'vshader';
const F_SHADER_SCRIPT_ID = 'fshader';
const CANVAS_ID = 'field';
function Start() {
    const canvas = document.getElementById(CANVAS_ID);
    const gl = canvas.getContext('webgl');
    const vShader = gl.createShader(gl.VERTEX_SHADER);
    const vShaderSource = getShaderSource(V_SHADER_SCRIPT_ID);
    console.log(vShaderSource)

    gl.shaderSource(vShader, vShaderSource)
    gl.compileShader(vShader);

    const fShader = gl.createShader(gl.FRAGMENT_SHADER);
    const fShaderSource = getShaderSource(F_SHADER_SCRIPT_ID);

    gl.shaderSource(fShader, fShaderSource)
    gl.compileShader(fShader);

    const program = gl.createProgram();
    gl.attachShader(program, vShader);
    gl.attachShader(program, fShader);
    gl.validateProgram(program);
    gl.linkProgram(program);
    gl.useProgram(program);
    gl.drawArrays(gl.POINTS, 0, 1);

}