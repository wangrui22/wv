(function () {
    let canvas0 = document.getElementById('canvas-0');

    let showBtn = document.getElementById('btn-show');
    showBtn.onclick = function () {
        const ctx = canvas0.getContext('2d');
        ctx.clearRect(0,0,canvas0.width, canvas0.height);
        ctx.moveTo(0, 0);
        ctx.lineTo(canvas0.width, canvas0.height);
        ctx.strokeStyle = "red";
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    let showClear = document.getElementById('btn-clear');
    showClear.onclick = function () {
        const ctx = canvas0.getContext('2d');
        ctx.clearRect(0,0,canvas0.width, canvas0.height);
    }
})()