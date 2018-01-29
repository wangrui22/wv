(function () {    
    let canvas0 = document.getElementById('canvas-0');
    let jpegImg = new Image();
    let jpegBase64 = '';
    jpegImg.onload = function(){
        canvas0.getContext('2d').drawImage(jpegImg, 0, 0, canvas0.width, canvas0.height);
    }

    let curPage = 0;
    let socket = io();
    let socketParser = new SocketParser(socket);

    socket.emit('message', {id:0, msg:'web ready'});
    socket.on('data', function(data) {
        console.log('data in');
        socketParser.recv(data, function(msgID, msgPara0, msgPara1, curData, headerOffset, curDataLen, restDataLen, withHeader) {
            if (withHeader) {
                jpegBase64 = '';
            }
            let imgBuffer = new Uint8Array(curData, headerOffset, curDataLen);
            jpegBase64 += String.fromCharCode.apply(null, imgBuffer);    
            if(restDataLen <= 0) {
                jpegImg.src =  'data:image/jpg;base64,' + btoa(jpegBase64);
            }
        });
    });

    document.getElementById('btn-next').onclick = function () {
        curPage ++;
        socket.emit('message', {id:1, page: curPage});       
    }

    document.getElementById('btn-previous').onclick = function () {
        curPage --;
        if (curPage < 0) {
            curPage = 0;
        }
        socket.emit('message', {id:1, page: curPage});       
    }

    let showClear = document.getElementById('btn-clear');
    showClear.onclick = function () {
        const ctx = canvas0.getContext('2d');
        ctx.clearRect(0,0,canvas0.width, canvas0.height);
    }
})()