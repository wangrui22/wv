(function () {    
    let canvas0 = document.getElementById('canvas-0');
    let jpegImg = new Image();

    let socket = io();
    socket.emit('message', {id:0, msg:'web ready'});
    socket.on('data', function(data) {
        console.log('data in');
        let imgBuffer = new Uint8Array(data, 0, data.byteLength);
        let jpegStr = String.fromCharCode.apply(null, imgBuffer);
        jpegImg.src =  'data:image/jpg;base64,' + btoa(jpegStr);
        jpegImg.onload = function(){
            canvas0.getContext('2d').drawImage(jpegImg, 0, 0, canvas0.width, canvas0.height);
        }
    });

    let showBtn = document.getElementById('btn-show');
    showBtn.onclick = function () {
        socket.emit('message', {id:1, msg:'image'});
        // const ctx = canvas0.getContext('2d');
        // ctx.clearRect(0,0,canvas0.width, canvas0.height);
        // ctx.moveTo(0, 0);
        // ctx.lineTo(canvas0.width, canvas0.height);
        // ctx.strokeStyle = "red";
        // ctx.lineWidth = 2;
        // ctx.stroke();
        
    }

    let showClear = document.getElementById('btn-clear');
    showClear.onclick = function () {
        const ctx = canvas0.getContext('2d');
        ctx.clearRect(0,0,canvas0.width, canvas0.height);
    }
})()