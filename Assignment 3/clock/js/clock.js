const canvas = document.getElementById("clockCanvas");
const ctx = canvas.getContext("2d");

const radius = canvas.height / 2;
ctx.translate(radius, radius);
const clockRadius = radius * 0.9;

const modeToggle = document.getElementById("modeToggle");
let isNightMode = false;

modeToggle.addEventListener("click", () => {
    isNightMode = !isNightMode;
    modeToggle.textContent = isNightMode ? "Switch to Day Mode" : "Switch to Night Mode";
});

/**
 * @returns {void}
 * @description Clears the canvas and redraws the analog clock on every animation frame.
 */
function animateClock() {
    ctx.clearRect(-radius, -radius, canvas.width, canvas.height);
    drawClock();
    requestAnimationFrame(animateClock);
}

/**
 * @returns {void}
 * @description Draws the complete clock face, numbers, and hands.
 */
function drawClock() {
    drawFace(ctx, clockRadius);
    drawNumbers(ctx, clockRadius);
    drawTime(ctx, clockRadius);
}

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} radius
 * @returns {void}
 * @description Draws the circular clock face and center point.
 */
function drawFace(ctx, radius) {
    const bgColor = isNightMode ? "#1f2937" : "#ffffff";
    const darkBorder = isNightMode ? "#d1d5db" : "#333333";
    const lightBorder = isNightMode ? "#374151" : "#ffffff";
    const centerColor = isNightMode ? "#f9fafb" : "#333333";

    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, 2 * Math.PI);
    ctx.fillStyle = bgColor;
    ctx.fill();

    const grad = ctx.createRadialGradient(0, 0, radius * 0.95, 0, 0, radius * 1.05);
    grad.addColorStop(0, darkBorder);
    grad.addColorStop(0.5, lightBorder);
    grad.addColorStop(1, darkBorder);

    ctx.strokeStyle = grad;
    ctx.lineWidth = radius * 0.1;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.05, 0, 2 * Math.PI);
    ctx.fillStyle = centerColor;
    ctx.fill();
}

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} radius
 * @returns {void}
 * @description Draws numbers 1 to 12 around the clock face.
 */
function drawNumbers(ctx, radius) {
    ctx.font = `${radius * 0.15}px Arial`;
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    ctx.fillStyle = isNightMode ? "#ffffff" : "#333333";

    for (let num = 1; num <= 12; num++) {
        const ang = num * Math.PI / 6;

        ctx.save();
        ctx.rotate(ang);
        ctx.translate(0, -radius * 0.85);
        ctx.rotate(-ang);
        ctx.fillText(num.toString(), 0, 0);
        ctx.restore();
    }
}

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} radius
 * @returns {void}
 * @description Calculates the current time and draws the hour, minute, and second hands.
 */
function drawTime(ctx, radius) {
    const now = new Date();

    let hour = now.getHours();
    let minute = now.getMinutes();
    let second = now.getSeconds();

    hour = hour % 12;
    hour =
        (hour * Math.PI / 6) +
        (minute * Math.PI / (6 * 60)) +
        (second * Math.PI / (360 * 60));

    drawHand(ctx, hour, radius * 0.5, radius * 0.07, isNightMode ? "#ffffff" : "#333333");

    minute =
        (minute * Math.PI / 30) +
        (second * Math.PI / (30 * 60));

    drawHand(ctx, minute, radius * 0.75, radius * 0.05, isNightMode ? "#d1d5db" : "#666666");

    second = second * Math.PI / 30;
    drawHand(ctx, second, radius * 0.85, radius * 0.02, "#ef4444");
}

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} pos
 * @param {number} length
 * @param {number} width
 * @param {string} color
 * @returns {void}
 * @description Draws a single clock hand based on its angle, length, width, and color.
 */
function drawHand(ctx, pos, length, width, color) {
    ctx.beginPath();
    ctx.lineWidth = width;
    ctx.lineCap = "round";
    ctx.strokeStyle = color;
    ctx.moveTo(0, 0);

    ctx.save();
    ctx.rotate(pos);
    ctx.lineTo(0, -length);
    ctx.stroke();
    ctx.restore();
}

animateClock();