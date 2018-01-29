const MSG_HEADER_LEN = 16;
class SocketParser {
    constructor(socketio) {
        this._socket = socketio;

        this._packetEnd = 0;
        this._msgID = 0;
        this._msgPara0 = 0;
        this._msgPara1 = 0;

        this._msgRestDataLen = 0;
        this._lastMsgHeader = new ArrayBuffer(MSG_HEADER_LEN);
        this._lastMsgHeaderLen = 0;

    }

    //handler(msgID, msgPara0, msgPara1, data, headerOffset, curDataLen, restDataLen, withHeader)
    recv(data, handler) {
        const dataLen = data.byteLength;
    
        if (this._packetEnd == 0) {//new message
            if (dataLen < MSG_HEADER_LEN) { //incompleted Msg header
                let dstBuffer = new Uint8Array(this._lastMsgHeader);
                let srcBuffer = new Uint8Array(data)
                for (let i = 0; i< dataLen; ++i) {
                    dstBuffer[i] = srcBuffer[i];
                }
                this._packetEnd = 2;
                this._lastMsgHeaderLen = dataLen;
                return;
            }
            let header = new Int32Array(data, 0, 4);
            this._msgID = header[0];
            this._msgPara0 = header[2];
            this._msgPara1 = header[3];
            const lastMsgDatalen = header[1];
    
            if (dataLen - MSG_HEADER_LEN == lastMsgDatalen) { // completed one Msg
                handler(this._msgID, this._msgPara0, this._msgPara1, data, MSG_HEADER_LEN, lastMsgDatalen, 0, true);
            } else if (dataLen - MSG_HEADER_LEN < lastMsgDatalen) { // not completed one Msg
                this._msgRestDataLen = lastMsgDatalen - (dataLen - MSG_HEADER_LEN);
                handler(this._msgID, this._msgPara0, this._msgPara1, data, MSG_HEADER_LEN, dataLen - MSG_HEADER_LEN, this._msgRestDataLen, true);
                this._packetEnd = 1;
            } else { // this buffer carry next Msg process current one
                handler(this._msgID, this._msgPara0, this._msgPara1, data, MSG_HEADER_LEN, lastMsgDatalen, 0, true);
                // recursion process rest
                let tcpBufferSub = data.slice(lastMsgDatalen + MSG_HEADER_LEN);
                this._packetEnd = 0;
                this.recv(tcpBufferSub, handler);
            }
        } else if (this._packetEnd == 1) { // data for last msg
            if (dataLen - this._msgRestDataLen == 0) { // complete last msg
                this._msgRestDataLen = 0;
                handler(this._msgID, this._msgPara0, this._msgPara1, data, 0, dataLen, 0, false);
            } else if (dataLen - this._msgRestDataLen < 0) { // not complete data yet
                this._msgRestDataLen -= dataLen;
                this._packetEnd = 1;
                handler(this._msgID, this._msgPara0, this._msgPara1, data, 0, dataLen, this._msgRestDataLen, false);
            } else { // this buffer carry next Msg
                handler(this._msgID, this._msgPara0, this._msgPara1, data, 0, this._msgRestDataLen, 0, false);
                let tcpBufferSub2 = data.slice(this._msgRestDataLen);
                this._msgRestDataLen = 0;
                this._packetEnd = 0;
                this.recv(tcpBufferSub2, handler);
            }
        } else if (this._packetEnd == 2) { // msg header for last msg header
            const lastRestHeaderLen = MSG_HEADER_LEN - this._lastMsgHeaderLen;
            if (dataLen < lastRestHeaderLen) { // msg header is not completed yet
                let dstBuffer = new Uint8Array(this._lastMsgHeader);
                let srcBuffer = new Uint8Array(data)
                for (let i = 0 ; i< dataLen; ++i) {
                    dstBuffer[i+this._lastMsgHeaderLen] = srcBuffer[i];
                }
                this._packetEnd = 2;
                this._lastMsgHeaderLen += dataLen;
                return;
            } else { // msg header is completed
                //fill header completed
                let dstBuffer = new Uint8Array(this._lastMsgHeader);
                let srcBuffer = new Uint8Array(data,0,lastRestHeaderLen);
                for (let i = 0; i< lastRestHeaderLen; ++i) {
                    dstBuffer[i+this._lastMsgHeaderLen] = srcBuffer[i];
                }
    
                let tcpBufferSub3 = data.slice(lastRestHeaderLen);
                let header2 = new Int32Array(this._lastMsgHeader, 0, 4);
                this._msgID = header2[2];
                this._msgPara0 = header2[3];
                this._msgPara1 = header2[4];
                this._msgRestDataLen = header2[7];
    
                this._packetEnd = 1;
                this._lastMsgHeaderLen = 0;
                this.recv(tcpBufferSub3, handler);
            }
        }

    }
}