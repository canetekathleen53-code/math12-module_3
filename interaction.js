const typeButtons = document.querySelectorAll(".type-btn");
const inputArea = document.getElementById("inputArea");
const solverTitle = document.getElementById("solverTitle");
const modeNumber = document.getElementById("modeNumber");
const answer = document.getElementById("answer");
const canvas = document.getElementById("numberLine");
const ctx = canvas.getContext("2d");

let currentType = "linear";

const modes = {
    linear: {
        title: "Linear Inequality",
        number: "01"
    },
    compound: {
        title: "Compound Inequality",
        number: "02"
    },
    absolute: {
        title: "Absolute Value Inequality",
        number: "03"
    },
    quadratic: {
        title: "Quadratic Inequality",
        number: "04"
    }
};

function loadInputs(type) {
    if (type === "linear") {
        inputArea.innerHTML = `
            <div class="input-group">
                <label>Variable Expression</label>
                <input id="linearLeft" type="text" placeholder="e.g. 2x + 3">
            </div>

            <div class="input-row two">
                <div class="input-group">
                    <label>Inequality</label>
                    <select id="linearOperator">
                        <option value="<">&lt;</option>
                        <option value="<=">≤</option>
                        <option value=">">&gt;</option>
                        <option value=">=">≥</option>
                        <option value="=">=</option>
                    </select>
                </div>

                <div class="input-group">
                    <label>Value</label>
                    <input id="linearRight" type="text" placeholder="e.g. 9">
                </div>
            </div>
        `;
    }

    if (type === "compound") {
        inputArea.innerHTML = `
            <div class="input-group">
                <label>Lower Bound</label>
                <input id="compoundLeft" type="number" placeholder="e.g. 2">
            </div>

            <div class="input-row">
                <div class="input-group">
                    <label>Middle Variable</label>
                    <input value="x" disabled>
                </div>

                <div class="input-group">
                    <label>Relation</label>
                    <select id="compoundType">
                        <option value="between">AND</option>
                        <option value="or">OR</option>
                    </select>
                </div>

                <div class="input-group">
                    <label>Upper Bound</label>
                    <input id="compoundRight" type="number" placeholder="e.g. 8">
                </div>
            </div>
        `;
    }

    if (type === "absolute") {
        inputArea.innerHTML = `
            <div class="input-group">
                <label>Absolute Expression</label>
                <input id="absoluteExpression" type="text" placeholder="e.g. 2x - 3">
            </div>

            <div class="input-row two">
                <div class="input-group">
                    <label>Inequality</label>
                    <select id="absoluteOperator">
                        <option value="<">&lt;</option>
                        <option value="<=">≤</option>
                        <option value=">">&gt;</option>
                        <option value=">=">≥</option>
                    </select>
                </div>

                <div class="input-group">
                    <label>Value</label>
                    <input id="absoluteValue" type="number" placeholder="e.g. 5">
                </div>
            </div>
        `;
    }

    if (type === "quadratic") {
        inputArea.innerHTML = `
            <div class="input-group">
                <label>Quadratic Expression</label>
                <input id="quadraticExpression" type="text"
                    placeholder="e.g. x² - 5x + 6">
            </div>

            <div class="input-group">
                <label>Inequality</label>
                <select id="quadraticOperator">
                    <option value="<">&lt; 0</option>
                    <option value="<=">≤ 0</option>
                    <option value=">">&gt; 0</option>
                    <option value=">=">≥ 0</option>
                </select>
            </div>
        `;
    }
}

typeButtons.forEach(button => {
    button.addEventListener("click", () => {
        typeButtons.forEach(btn => btn.classList.remove("active"));
        button.classList.add("active");

        currentType = button.dataset.type;

        solverTitle.textContent = modes[currentType].title;
        modeNumber.textContent = modes[currentType].number;

        answer.textContent = "Enter an inequality to begin.";
        clearCanvas();

        loadInputs(currentType);
    });
});

function solve() {
    try {
        if (currentType === "linear") solveLinear();
        else if (currentType === "compound") solveCompound();
        else if (currentType === "absolute") solveAbsolute();
        else if (currentType === "quadratic") solveQuadratic();
    } catch (error) {
        answer.textContent = "Please check your input.";
        clearCanvas();
    }
}

/* =========================
   LINEAR INEQUALITIES
========================= */

function solveLinear() {
    const left = document.getElementById("linearLeft").value.trim();
    const operator = document.getElementById("linearOperator").value;
    const right = parseFloat(document.getElementById("linearRight").value);

    if (!left || isNaN(right)) {
        answer.textContent = "Please enter a valid inequality.";
        return;
    }

    const parsed = parseLinear(left);

    if (parsed === null) {
        answer.textContent =
            "Use a linear expression such as 2x + 3.";
        return;
    }

    let a = parsed.a;
    let b = parsed.b;

    // ax + b OP right
    let boundary = (right - b) / a;

    let finalOperator = operator;

    // Flip inequality when dividing by negative
    if (a < 0) {
        finalOperator = flipOperator(operator);
    }

    if (operator === "=") {
        answer.innerHTML =
            `x = ${formatNumber(boundary)}`;
        drawNumberLine(boundary, "=", boundary);
        return;
    }

    answer.innerHTML =
        `x ${displayOperator(finalOperator)} ${formatNumber(boundary)}`;

    drawNumberLine(boundary, finalOperator, boundary);
}

function parseLinear(expression) {
    expression = expression
        .replace(/\s/g, "")
        .replace(/−/g, "-");

    if (!expression.includes("x")) {
        return null;
    }

    let a = 0;
    let b = 0;

    const xIndex = expression.indexOf("x");

    let coefficient = expression.substring(0, xIndex);

    if (coefficient === "" || coefficient === "+") {
        a = 1;
    } else if (coefficient === "-") {
        a = -1;
    } else {
        a = parseFloat(coefficient);
    }

    if (isNaN(a)) return null;

    let remainder = expression.substring(xIndex + 1);

    if (remainder) {
        b = parseFloat(remainder);

        if (isNaN(b)) return null;
    }

    return { a, b };
}

/* =========================
   COMPOUND INEQUALITIES
========================= */

function solveCompound() {
    const left = parseFloat(
        document.getElementById("compoundLeft").value
    );

    const right = parseFloat(
        document.getElementById("compoundRight").value
    );

    const type = document.getElementById("compoundType").value;

    if (isNaN(left) || isNaN(right)) {
        answer.textContent = "Enter both bounds.";
        return;
    }

    if (type === "between") {
        const low = Math.min(left, right);
        const high = Math.max(left, right);

        answer.innerHTML =
            `${formatNumber(low)} &lt; x &lt; ${formatNumber(high)}`;

        drawCompound(low, high, "between");
    } else {
        const low = Math.min(left, right);
        const high = Math.max(left, right);

        answer.innerHTML =
            `x &lt; ${formatNumber(low)} &nbsp; OR &nbsp; x &gt; ${formatNumber(high)}`;

        drawCompound(low, high, "or");
    }
}

/* =========================
   ABSOLUTE VALUE
========================= */

function solveAbsolute() {
    const expression =
        document.getElementById("absoluteExpression")
            .value.trim();

    const operator =
        document.getElementById("absoluteOperator").value;

    const value =
        parseFloat(document.getElementById("absoluteValue").value);

    if (!expression || isNaN(value)) {
        answer.textContent = "Please complete all fields.";
        return;
    }

    const parsed = parseLinear(expression);

    if (!parsed || parsed.a === 0) {
        answer.textContent =
            "Use an expression such as 2x - 3.";
        return;
    }

    const a = parsed.a;
    const b = parsed.b;

    /*
        |ax + b| OP c

        ax + b = ±c
    */

    const x1 = (-value - b) / a;
    const x2 = (value - b) / a;

    const low = Math.min(x1, x2);
    const high = Math.max(x1, x2);

    if (operator === "<" || operator === "<=") {
        if (value < 0) {
            answer.textContent = "No real solution.";
            clearCanvas();
            return;
        }

        const brackets =
            operator === "<" ? "<" : "≤";

        answer.innerHTML =
            `${formatNumber(low)} ${brackets} x ${brackets} ${formatNumber(high)}`;

        drawCompound(
            low,
            high,
            operator === "<" ? "between" : "betweenClosed"
        );

    } else {
        const brackets =
            operator === ">" ? ">" : "≥";

        answer.innerHTML =
            `x ${brackets} ${formatNumber(high)} OR x ${brackets} ${formatNumber(low)}`;

        drawCompound(
            low,
            high,
            operator === ">" ? "or" : "orClosed"
        );
    }
}

/* =========================
   QUADRATIC
========================= */

function solveQuadratic() {
    let expression =
        document.getElementById("quadraticExpression")
            .value.trim();

    const operator =
        document.getElementById("quadraticOperator").value;

    if (!expression) {
        answer.textContent = "Enter a quadratic expression.";
        return;
    }

    expression = expression
        .replace(/\s/g, "")
        .replace(/²/g, "^2")
        .replace(/−/g, "-");

    const match = expression.match(
        /^([+-]?\d*\.?\d*)x\^2([+-]?\d*\.?\d*)x([+-]?\d+\.?\d*)$/
    );

    if (!match) {
        answer.textContent =
            "Use the format ax² + bx + c, e.g. x² - 5x + 6.";
        return;
    }

    let a = parseCoefficient(match[1], 1);
    let b = parseCoefficient(match[2], 0);
    let c = parseCoefficient(match[3], 0);

    const discriminant = b * b - 4 * a * c;

    if (discriminant < 0) {
        const alwaysPositive = a > 0;

        if (
            (alwaysPositive &&
                (operator === ">" || operator === ">=")) ||
            (!alwaysPositive &&
                (operator === "<" || operator === "<="))
        ) {
            answer.textContent = "All real numbers.";
        } else {
            answer.textContent = "No real solution.";
        }

        clearCanvas();
        return;
    }

    const root1 =
        (-b - Math.sqrt(discriminant)) / (2 * a);

    const root2 =
        (-b + Math.sqrt(discriminant)) / (2 * a);

    const low = Math.min(root1, root2);
    const high = Math.max(root1, root2);

    if (discriminant === 0) {
        answer.innerHTML =
            `x ${displayOperator(operator)} ${formatNumber(low)}`;

        drawNumberLine(low, operator, low);
        return;
    }

    /*
        For a > 0:
        positive outside roots
        negative between roots

        For a < 0:
        negative outside roots
        positive between roots
    */

    const wantsPositive =
        operator === ">" || operator === ">=";

    let inside;

    if (a > 0) {
        inside = !wantsPositive;
    } else {
        inside = wantsPositive;
    }

    if (inside) {
        answer.innerHTML =
            `${formatNumber(low)} ${operator === "<=" ? "≤" : "<"} x ${
                operator === "<=" ? "≤" : "<"
            } ${formatNumber(high)}`;

        drawCompound(
            low,
            high,
            operator === "<" ? "between" : "betweenClosed"
        );
    } else {
        answer.innerHTML =
            `x ${operator === ">=" ? "≥" : ">"} ${formatNumber(high)}
             OR
             x ${operator === ">=" ? "≥" : ">"} ${formatNumber(low)}`;

        drawCompound(
            low,
            high,
            operator === ">" ? "or" : "orClosed"
        );
    }
}

/* =========================
   HELPERS
========================= */

function parseCoefficient(value, defaultValue) {
    if (value === "" || value === "+") {
        return defaultValue;
    }

    if (value === "-") {
        return -defaultValue;
    }

    return parseFloat(value);
}

function flipOperator(operator) {
    const flipped = {
        "<": ">",
        ">": "<",
        "<=": ">=",
        ">=": "<=",
        "=": "="
    };

    return flipped[operator];
}

function displayOperator(operator) {
    return {
        "<": "&lt;",
        ">": "&gt;",
        "<=": "≤",
        ">=": "≥",
        "=": "="
    }[operator];
}

function formatNumber(number) {
    if (Math.abs(number) < 0.000001) {
        number = 0;
    }

    if (Number.isInteger(number)) {
        return number.toString();
    }

    return Number(number.toFixed(3)).toString();
}

/* =========================
   NUMBER LINE
========================= */

function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = "#292c35";
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(40, 75);
    ctx.lineTo(canvas.width - 40, 75);
    ctx.stroke();
}

function getX(value, min, max) {
    const left = 50;
    const right = canvas.width - 50;

    return left +
        ((value - min) / (max - min)) *
        (right - left);
}

function drawNumberLine(point, operator) {
    clearCanvas();

    let range = 10;

    if (Math.abs(point) > 10) {
        range = Math.abs(point) + 5;
    }

    let min = point - range;
    let max = point + range;

    drawAxis(min, max);

    const x = getX(point, min, max);

    const filled =
        operator === ">" ||
        operator === ">=" ||
        operator === "=";

    drawPoint(x, 75, filled);

    ctx.strokeStyle = "#b8ff5a";
    ctx.lineWidth = 5;

    ctx.beginPath();

    if (operator === "<" || operator === "<=") {
        ctx.moveTo(50, 75);
        ctx.lineTo(x, 75);
    } else if (operator === ">" || operator === ">=") {
        ctx.moveTo(x, 75);
        ctx.lineTo(canvas.width - 50, 75);
    }

    ctx.stroke();
}

function drawCompound(low, high, type) {
    clearCanvas();

    const padding = Math.max(
        5,
        (high - low) * 0.5
    );

    const min = low - padding;
    const max = high + padding;

    drawAxis(min, max);

    const x1 = getX(low, min, max);
    const x2 = getX(high, min, max);

    const closed =
        type === "betweenClosed" ||
        type === "orClosed";

    ctx.strokeStyle = "#b8ff5a";
    ctx.lineWidth = 5;

    if (
        type === "between" ||
        type === "betweenClosed"
    ) {
        ctx.beginPath();
        ctx.moveTo(x1, 75);
        ctx.lineTo(x2, 75);
        ctx.stroke();

        drawPoint(x1, 75, closed);
        drawPoint(x2, 75, closed);
    }

    if (type === "or" || type === "orClosed") {
        ctx.beginPath();
        ctx.moveTo(50, 75);
        ctx.lineTo(x1, 75);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(x2, 75);
        ctx.lineTo(canvas.width - 50, 75);
        ctx.stroke();

        drawPoint(x1, 75, closed);
        drawPoint(x2, 75, closed);
    }
}

function drawAxis(min, max) {
    ctx.strokeStyle = "#555a65";
    ctx.fillStyle = "#8d919d";
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(40, 75);
    ctx.lineTo(canvas.width - 40, 75);
    ctx.stroke();

    const steps = 10;

    for (let i = 0; i <= steps; i++) {
        const value =
            min + ((max - min) / steps) * i;

        const x = getX(value, min, max);

        ctx.beginPath();
        ctx.moveTo(x, 68);
        ctx.lineTo(x, 82);
        ctx.stroke();

        ctx.font = "11px DM Mono";
        ctx.textAlign = "center";

        ctx.fillText(
            formatNumber(value),
            x,
            105
        );
    }
}

function drawPoint(x, y, filled) {
    ctx.beginPath();
    ctx.arc(x, y, 8, 0, Math.PI * 2);

    if (filled) {
        ctx.fillStyle = "#b8ff5a";
        ctx.fill();
    } else {
        ctx.fillStyle = "#101219";
        ctx.fill();

        ctx.strokeStyle = "#b8ff5a";
        ctx.lineWidth = 3;
        ctx.stroke();
    }
}

/* =========================
   INITIALIZE
========================= */

loadInputs("linear");
clearCanvas();