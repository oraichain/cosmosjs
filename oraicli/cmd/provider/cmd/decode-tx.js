import { Argv } from 'yargs';
import fs from 'fs';
import message from '../../../../src/messages/proto';
import sha256 from 'js-sha256';

function toHexString(byteArray) {
    return Array.prototype.map.call(byteArray, function (byte) {
        return ('0' + (byte & 0xFF).toString(16)).slice(-2);
    }).join('');
}

export default async (yargs: Argv) => {
    const { argv } = yargs
        .positional('script', {
            describe: 'the script type',
            type: 'string'
        })
        .positional('name', {
            describe: 'the script name',
            type: 'string'
        })

    const base64 = "Cp8BCpwBCjcvY29zbW9zLmRpc3RyaWJ1dGlvbi52MWJldGExLk1zZ1dpdGhkcmF3RGVsZWdhdG9yUmV3YXJkEmEKK29yYWkxMzBqc2w2NnJnc3M2ZXE3cXVyMDJ5ZnI2dHpwcGR2eGdrZzk2NDASMm9yYWl2YWxvcGVyMTMwanNsNjZyZ3NzNmVxN3F1cjAyeWZyNnR6cHBkdnhnbHo3bjdnEloKUgpGCh8vY29zbW9zLmNyeXB0by5zZWNwMjU2azEuUHViS2V5EiMKIQKJzoUdo6kFlyUrTtOQgNA6/NY+ulQeJGDc6eB42FbDmBIECgIIARie/wISBBDAmgwaQJLdDlaMg92tI0y1HSCsQWIw3Fr+SWtzVri1RU9ZTgGUTVQfWigHuh1kCVzqhXTsGMnXZ7DEEhnram73Upu0tT4=";

    const uintArr = Buffer.from(base64, 'base64');

    const msg = message.cosmos.tx.v1beta1.TxRaw.decode(uintArr);

    const hash = sha256.sha256(uintArr)
    console.log("msg: ", hash)

    //console.log("message: ", msg)
    const decode_body = message.cosmos.tx.v1beta1.TxBody.decode(msg.body_bytes);
    //console.log("decode body: ", decode_body)

    const typeUrl = decode_body.messages[0].type_url.substring(1);
    const urlArr = typeUrl.split(".");
    let msgType = message;
    for (let i = 0; i < urlArr.length; i++) {
        msgType = msgType[urlArr[i]]
    }
    const value = msgType.decode(decode_body.messages[0].value)
    console.log("value decoded: ", value)
};

// yarn oraicli provider get-script datasource nl008
