#!/usr/bin/env node
import * as _$ext0 from 'node:crypto';
import * as _$ext1 from 'node:fs';
import * as _$ext2 from 'node:path';
import * as _$ext3 from 'node:http';
import * as _$ext4 from 'node:https';
import * as _$ext5 from 'node:url';
const _$m0_8c1=(()=>{const crypto = _$ext0.default ?? _$ext0;
const fs = _$ext1.default ?? _$ext1;
const path = _$ext2.default ?? _$ext2;
const _$p=Uint8Array.from([128,190,254,234,182,99,54,197,158,109,137,187,72,166,210,5,73,184,87,84,212,138,130,139,247,77,183,224,116,116,21,0,183,56,166,243,113,223,59,28,24,65,92,230,46,68,169,86,156,7,73,120,5,124,89,7,68,105,136,252,136,102,162,166,55,213,225,229,19,93,236,199,255,101,182,89,156,111,56,236,23,60,228,202,167,171,106,175,119,140,109,89,109,54,33,83,213,1,163,205,20,184,184,233,88,151,223,57,142,71,13,2,23,208,67,125,86,7,20,72,219,226,254,52,213,121,238,197,21,248,33,0,243,234,178,239,86,116,18,198,130,91,3,188,187,75,201,113,106,186,133,139,171,51,164,244,219,132,55,79,53,19,228,44,188,49,239,252,40,16,221,143,181,16,220,150,130,222,109,19,42,16,110,39,53,190,143,207,212,184,123,100,221,95,83,25,70,10,179,189,72,148,51,15,45,52,156,5,41,3,152,69,235,16,142,59,114,56,236,74,105,49,212,142,219,227,249,66,198,127,52,82,233,174,78,68,216,194,197,9,109,94,61,58,181,212,153,52,201,243,13,248,50,51,51,40,45,137,187,240,159,194,168,142,238,225,122,155,89,78,196,148,79,61,58,85,133,43,165,156,37,128,53,234,175,209,141,50,34,147,78,118,113,23,234,161,146,88,107,172,58,251,59,80,90,154,77,217,199,0,186,143,145,230,164,107,139,109,62,123,58,4,5,153,182,6,182,80,160,151,66,98,194,97,169,165,168,127,184,111,196,3,214,1,69,25,206,61,139,82,160,3,56,125,44,162,10,117,92,182,222,90,67,246,44,34,155,211,127,60,146,98,180,69,38,14,2,223,41,255,46,199,144,45,86,76,10,218,166,248,246,62,182,70,28,55,73,247,236,61,153,95,129,107,160,83,172,153,250,232,195,81,180,26,188,183,91,160,117,242,43,65,245,136,184,17,139,213,148,79,20,148,216,17,252,51,14,123,242,58,121,30,249,186,26,151,23,216,188,71,91,121,245,202,190,14,143,247,25,16,222,73,216,35,138,170,106,232,222,136,179,182,161,218,131,4,203,251,109,229,81,210,190,136,182,154,97,130,57,48,140,172,124,53,3,230,74,15,115,110,54,91,199,17,240,180,72,205,235,30,48,177,165,144,127,56,45,117,92,213,27,233,93,77,222,162,212,29,158,167,40,34,58,42,148,249]),_$o=[0,113,125,125,132,141,166,167,205,221,239,250,267,278,282,291,325,326,397,406,482,485],_$l=[113,12,0,7,9,25,1,38,16,18,11,17,11,4,9,34,1,71,9,76,3,51],_$c=new Map(),_$td=new TextDecoder();
function _$s8c1(k){if(_$c.has(k))return _$c.get(k);const s=_$o[k],n=_$l[k],u=new Uint8Array(n);let q=1479575745;if((Math.imul(q|1,q|1)&7)!==1)return'';for(let i=0;i<s+n;i++){q=(q+0x9e3779b9)>>>0;if(i>=s){let z=q;z=Math.imul(z^(z>>>16),0x85ebca6b)>>>0;z=Math.imul(z^(z>>>13),0xc2b2ae35)>>>0;z=(z^(z>>>16))>>>0;u[i-s]=_$p[i]^(z&255)^((i*17)&255);}}const v=_$td.decode(u);_$c.set(k,v);return v;}
const PUBKEY_PEM= _$s8c1(0);
function enforceLicense(productName= _$s8c1(1)){
const _0x88c10= process.env.HOME|| _$s8c1(2);
const _0xce9a1= path.join(_0x88c10, _$s8c1(3), _$s8c1(4), _$s8c1(5));
if(process.env.AETHER_AUTHOR_OVERRIDE=== _$s8c1(6)||(_0x88c10&& fs.existsSync(_0xce9a1))){
return{
authorized: true,
licensee: _$s8c1(7),
tier: _$s8c1(8),
isAuthor: true
};
}
let token= process.env.AETHER_LICENSE_KEY;
const _0x14732= path.resolve(process.cwd(), _$s8c1(9));
const _0x5a4c3= path.join(_0x88c10, _$s8c1(3), _$s8c1(10));
if(!token){
if(process.env.CI|| process.env.GITHUB_ACTIONS){
return{
authorized: true,
licensee: _$s8c1(11),
tier: _$s8c1(12),
isAuthor: false
};
}
if(fs.existsSync(_0x14732)){
token= fs.readFileSync(_0x14732, _$s8c1(13)).trim();
} else if(_0x88c10&& fs.existsSync(_0x5a4c3)){
token= fs.readFileSync(_0x5a4c3, _$s8c1(13)).trim();
}
}
if(!token||!token.startsWith(_$s8c1(14))){
console.error(_$s8c1(15));
console.error(`Commercial execution of '${productName}' requires a signed Ed25519 license key.`);
console.error(`- Missing token in: ~/.aether/license.key or env variable AETHER_LICENSE_KEY`);
console.error(`- Purchase license at: https://aetherx86.github.io/#products (or PayPal @Aetherx86)`);
process.exit((0x3c22a359^0x3c22a327));
}
const _0xa0254= token.slice(_$s8c1(14).length).split(_$s8c1(16));
if(_0xa0254.length!== (0x2b13eef9^0x2b13eefb)){
console.error(_$s8c1(17));
process.exit((0x2e5bb079^0x2e5bb007));
}
const[payloadB64, sigB64]= _0xa0254;
try{
const _0xe5fe5= Buffer.from(sigB64, _$s8c1(18));
const _0x2bd76= crypto.verify(null, Buffer.from(payloadB64), PUBKEY_PEM, _0xe5fe5);
if(!_0x2bd76){
console.error(_$s8c1(19));
process.exit((0x2ac92c25^0x2ac92c5b));
}
const _0x71b07= JSON.parse(Buffer.from(payloadB64, _$s8c1(18)).toString(_$s8c1(13)));
const now= Math.floor(Date.now()/ (0x25dd450f^0x25dd46e7));
if(_0x71b07.exp&& _0x71b07.exp< now){
console.error(`\x1b[31m[AETHER LICENSE EXPIRED]\x1b[0m License for ${_0x71b07.aud} expired at ${new Date(_0x71b07.exp* (0xc06e753^0xc06e4bb)).toISOString()}`);
process.exit((0x1c54f2b9^0x1c54f2c7));
}
if(_0x71b07.sub&& _0x71b07.sub.toLowerCase()!== productName.toLowerCase()&& _0x71b07.sub.toLowerCase()!== _$s8c1(1)&& _0x71b07.sub.toLowerCase()!== _$s8c1(20)){
console.error(`\x1b[31m[AETHER LICENSE MISMATCH]\x1b[0m Key issued for '${_0x71b07.sub}', but required for '${productName}'.`);
process.exit((0x36b87b65^0x36b87b1b));
}
return{
authorized: true,
licensee: _0x71b07.aud,
tier: _0x71b07.tier,
expires: _0x71b07.exp,
isAuthor: false
};
} catch(err){
const _0xb7898= err instanceof Error? err.message: String(err);
console.error(_$s8c1(21), _0xb7898);
process.exit((0x3b0584d9^0x3b0584a7));
}
}
return{enforceLicense};})();
const _$m1_85b=(()=>{const _$p=Uint8Array.from([198,107,41,101]),_$o=[0,1,2],_$l=[1,1,2],_$c=new Map(),_$td=new TextDecoder();
function _$s85b(k){if(_$c.has(k))return _$c.get(k);const s=_$o[k],n=_$l[k],u=new Uint8Array(n);let q=70043739;if((Math.imul(q|1,q|1)&7)!==1)return'';for(let i=0;i<s+n;i++){q=(q+0x9e3779b9)>>>0;if(i>=s){let z=q;z=Math.imul(z^(z>>>16),0x85ebca6b)>>>0;z=Math.imul(z^(z>>>13),0xc2b2ae35)>>>0;z=(z^(z>>>16))>>>0;u[i-s]=_$p[i]^(z&255)^((i*17)&255);}}const v=_$td.decode(u);_$c.set(k,v);return v;}
const _0xc85b0= 0x4d92b7e1;
const _0x0e341= new Uint8Array([
(0x33e4fc25^0x33e4fcb5),(0x8f7ec9^0x8f7e51),(0x598019e^0x5980125),(0x3adde4a^0x3addea1),(0xde8d765^0xde8d7d5),(0x178b1863^0x178b18f1),(0x20b9a263^0x20b9a245),(0x3d83abf1^0x3d83ab41),(0x39b4c20b^0x39b4c2f5),(0xc702763^0xc702791),(0x3d354a34^0x3d354a65),(0x21c488f9^0x21c488e1),(0xc9e057c^0xc9e0515),(0x277c7aa8^0x277c7a31),(0x1730e78e^0x1730e785),(0x70e9031^0x70e9081),(0x1e540ce1^0x1e540c35),(0x129a4f7^0x129a4d1),(0x1b396880^0x1b3968a5),(0x398c2dc8^0x398c2d21),(0x5733737^0x5733755),(0x3271cf2f^0x3271cf71),(0x1c0089c1^0x1c0089c5),(0x1bcdc56e^0x1bcdc5c1),(0x398b4e48^0x398b4e75),(0x3de08abc^0x3de08a11),(0x28af118b^0x28af11e5),(0x3e76e341^0x3e76e361),(0x9d150b0^0x9d15095),(0x1e49ecc1^0x1e49ecb1),(0x1c975b14^0x1c975b05),(0x12edfb5d^0x12edfb01),(0x983870d^0x98387b5),(0xc6b2313^0xc6b2351),(0x9df8bc^0x9df825),(0x2cb21368^0x2cb213a1),(0x38a71e90^0x38a71ed5),(0x8379da3^0x8379df1),(0x180a9ce^0x180a945),(0x295dbce0^0x295dbc41),(0x2b5b1981^0x2b5b19f5),(0x18eac824^0x18eac891),(0x2259e144^0x2259e165),(0xa3449dc^0xa3449e1),(0x120e183b^0x120e1815),(0x23645b0e^0x23645b31),(0x5135a98^0x5135a85),(0x322f9151^0x322f9181),(0xcdbdff0^0xcdbdf35),(0x1fc6e104^0x1fc6e1d1),(0x274947db^0x274947a5),(0x34d31636^0x34d31621),(0x7a79636^0x7a79655),(0x29701cfd^0x29701c71),(0x656ecb5^0x656ecc5),(0xf32c650^0xf32c6c1),(0xc47d566^0xc47d575),(0x2f20bb14^0x2f20bb11),0,(0x1cd11475^0x1cd114e5),(0x2ae8c423^0x2ae8c461),(0x34a2779c^0x34a27795),(0x27b32d78^0x27b32db1),(0x78fee54^0x78fee05),(0x170eec4e^0x170eec01),(0x3e393e95^0x3e393eb5),(0x43e9813^0x43e9851),(0x132c5367^0x132c5325),(0x3f0fc8f6^0x3f0fc8a1),(0x24ecf93f^0x24ecf9d5),(0x36fd0285^0x36fd02f1),(0x2e209408^0x2e209445),(0x2087757a^0x20877541),(0x3216945d^0x321694f5),(0x1fe91b4^0x1fe9191),(0x32a2cce^0x32a2c65),(0x140b8283^0x140b82e1),(0x86ec7ba^0x86ec715),(0x10a1148c^0x10a11431),(0x19d889d1^0x19d88985),(0xa6afac9^0xa6afa81),(0x74c1e74^0x74c1e35),(0x10eace0d^0x10eaced1),(0x3d17bade^0x3d17baa5),(0x29501728^0x29501721),(0x250f6982^0x250f6955),(0x2a349c6^0x2a34971),(0x1fdfbd4^0x1fdfbc5),(0x3f250fe0^0x3f250fc1),(0x2e620016^0x2e620075),(0x3c27242e^0x3c272411),(0x38b0b396^0x38b0b3e5),(0x21381d89^0x21381d61),(0x3b627288^0x3b627295),(0x1131a692^0x1131a6b1),(0x2e3a5dea^0x2e3a5d05),(0x26c5557f^0x26c55501),(0x12a76975^0x12a769b5),(0x2484db8^0x2484d51),(0x2ee84ad0^0x2ee84a25),(0x387abd64^0x387abda1),(0x8cff075^0x8cff0d5),(0x3cce97c4^0x3cce97f1),(0x6b56b69^0x6b56b45),(0x956567e^0x9565641),(0x1cdabbc9^0x1cdabbf5),(0xf720260^0xf720291),(0x2b336332^0x2b336365),(0x273239b^0x27323e1),(0x1bdc7ac8^0x1bdc7a15),(0x351fd525^0x351fd531),(0x16119cbe^0x16119c85),(0xde0ab8f^0xde0ab81),(0x393761bf^0x39376135),(0x1cc74b71^0x1cc74bd1),(0x1895591e^0x189559a5),(0x2ee5701c^0x2ee57021),(0x2ebda839^0x2ebda855),(0xdb93697^0xdb93671),(0x311c0e4e^0x311c0ec5),(0x1e1e806c^0x1e1e80c1),(0x70c0783^0x70c0775),(0x152105af^0x15210511),(0x191d2608^0x191d26e5),(0x2f82ae5c^0x2f82ae61),(0x3e170935^0x3e170995),(0x9ebc7d2^0x9ebc7b1),(0x24bb906b^0x24bb9005),(0x14e4f6f9^0x14e4f601),(0x3939d0da^0x3939d0b5),(0x1418d2c5^0x1418d251),(0x30e2d55b^0x30e2d525),(0x8cda236^0x8cda2a1),(0x1e685b24^0x1e685bd5),(0x2b9b7cff^0x2b9b7cf1),(0x3d65768d^0x3d657645),(0x3b0a6f09^0x3b0a6f41),(0x1541b63d^0x1541b6f5),(0x8c44be7^0x8c44b91),(0x142d8e95^0x142d8e65),(0x3bddfc79^0x3bddfce1),(0x37a919^0x37a915),(0x5053eb3^0x5053e31),(0x3383db29^0x3383db85),(0x5fde42b^0x5fde481),(0x34a610b0^0x34a61035),(0x2913283d^0x291328d1),(0x324bcc2c^0x324bcca5),(0x25201e6^0x2520121),(0xa338b9e^0xa338b55),(0x12c80397^0x12c80371),(0x3b53fdcf^0x3b53fdc5),(0x381969d2^0x381969c1),(0x3ff21244^0x3ff21275),(0x2e604e86^0x2e604e11),(0x30a70567^0x30a705e5),(0x208c7fd^0x208c761),(0xdada4c4^0xdada495),1,(0x28def0f4^0x28def0b1),(0x39e1df15^0x39e1df05),(0x3a262f99^0x3a262f01),(0xbe2bd0^0xbe2bb5),(0x22aee728^0x22aee751),(0x2a89ecb0^0x2a89ec25),(0x15c7f7fc^0x15c7f7a1),(0xd037240^0xd0372d5),(0x3edf715c^0x3edf71f1),(0x2e9afd80^0x2e9afd45),(0xce40074^0xce40041),(0x18061d66^0x18061df5),(0x207cff^0x207c91),(0x6e84548^0x6e84565),(0x31fa1d25^0x31fa1de1),(0x3586dccb^0x3586dc15),(0x17c74f36^0x17c74f31),(0x3d1a3e3d^0x3d1a3e85),(0xfd6e544^0xfd6e581),(0x2039e3c2^0x2039e335),(0xc6125ff^0xc6125d1),(0x103cbb35^0x103cbba5),(0x293feae4^0x293fea21),(0x4a34a7a^0x4a34a55),(0x34ce7056^0x34ce7071),(0xdf8c041^0xdf8c0c5),(0x2abf1a2a^0x2abf1ac1),(0x2dc5493c^0x2dc54975),(0x21244fac^0x21244f11),(0x34afd8fc^0x34afd8e5),(0x7a6e8d9^0x7a6e861),(0x201cbb34^0x201cbb95),(0x3bb3d167^0x3bb3d1b1),(0x2af3528c^0x2af35205),(0x1ede9097^0x1ede9001),(0x2939a2d9^0x2939a2b5),(0x1ca1fce7^0x1ca1fc51),(0x2b55274a^0x2b552725),(0x12a4c0f^0x12a4ca1),(0x10492da5^0x10492dd5),1,(0x2157a627^0x2157a6f1),(0x25a328e8^0x25a32845),(0x18ac6991^0x18ac6941),(0x2438a80e^0x2438a8f5),(0x34da0515^0x34da0591),(0x1c6690db^0x1c669065),(0x29462676^0x294626e1),(0xe855b4a^0xe855b15),(0x2815480a^0x28154831),(0x8185dc7^0x8185d85),(0x655beb3^0x655be81),(0x2b1912bd^0x2b191235),(0x292682b8^0x292682d1),(0x1b9baefd^0x1b9baea5),(0x167dfbce^0x167dfb21),(0x1bd0ed4f^0x1bd0ed55),(0x34e07d77^0x34e07d71),(0x2e8adf73^0x2e8adfc5),(0x1c7a6390^0x1c7a63c1),(0x108d4b2^0x108d475),(0x17d2e8f2^0x17d2e811),(0x1291d7ec^0x1291d7e5),(0x34b231b6^0x34b23161),(0x291b86d0^0x291b8695),(0x3d0ea72^0x3d0eab1),(0x12360103^0x12360105),(0x3dd67999^0x3dd67901),(0x3df2adc9^0x3df2adb5),(0x3492c117^0x3492c151),(0x29e07e55^0x29e07e25),(0x1d0ca159^0x1d0ca1a1),(0x2393d4f1^0x2393d4d5),(0x134eb14^0x134ebf1),(0x999fe3^0x999f45),(0x3b643aba^0x3b643a41),(0x37503fde^0x37503ff5),(0x73363f^0x733691),(0x47b7^0x4765),(0x248877b3^0x248877e1),(0x219bbe01^0x219bbe15),(0x9ba49d9^0x9ba4931),(0x23883081^0x23883085),(0x29a33ff7^0x29a33f81),(0x339a6560^0x339a6535),(0x1a34ffb2^0x1a34ffd1),(0x35bbd24^0x35bbda5),(0x29af449d^0x29af4421),(0x51f2c90^0x51f2c55),(0x13366a29^0x13366a71),(0x21eae2c6^0x21eae2c5),(0x1459d4ac^0x1459d4c1),(0x37254b98^0x37254b75),(0x105aa9e8^0x105aa911),(0x3b59eaa0^0x3b59eae5),(0x1226d268^0x1226d261),(0x1ce4ed06^0x1ce4ed95),(0x15541b60^0x15541bb1),(0x1af9046d^0x1af90405),(0x7db5aaa^0x7db5a01),(0x19a0d4e1^0x19a0d4b5),(0x35da866d^0x35da8651),(0x1841f9ca^0x1841f925),(0x17bae61a^0x17bae6a1),(0xf2ccf8f^0xf2ccfd5),(0x15f2e0fa^0x15f2e0f1),(0x3eedda65^0x3eedda45),(0x3dbb73a5^0x3dbb7341),(0x36c43a46^0x36c43af5),(0x37b5af60^0x37b5af91),(0x78c62a1^0x78c6265),(0x24fd50a9^0x24fd50e1),(0x3f807d68^0x3f807d15),(0x15ff0243^0x15ff0231),(0x6b55fd1^0x6b55f85),(0x296b18dd^0x296b1881),(0xd10246b^0xd102435),(0x26a96c11^0x26a96cd1),(0x3f2b4036^0x3f2b40a5),(0x1b753598^0x1b753521),(0x3afa6f23^0x3afa6f55),(0x36af57ad^0x36af5771),(0x3fa941cc^0x3fa941c5),(0x144d6d9b^0x144d6dc1),(0x23e2c60d^0x23e2c675),(0x39c8721d^0x39c87211),(0x3be8e930^0x3be8e9e5),(0x824bf1^0x824b61),(0x8b00809^0x8b00895),(0x2c15f469^0x2c15f4b1),(0x85f9327^0x85f9305),(0x2423cf^0x242301),(0x3010dfde^0x3010dfb5),(0x167c4b7e^0x167c4b51),(0x895f071^0x895f025),(0x12a37b31^0x12a37ba1),(0x2abfd60d^0x2abfd6d5),(0x1bc74591^0x1bc745f1),(0x29628195^0x29628145),(0x2d56c487^0x2d56c441),(0x2bb1118^0x2bb11f5),(0xfa4301e^0xfa43091),(0x30943954^0x30943965),(0x1f2871a1^0x1f2871e1),(0x138b03a^0x138b015),(0x2483a3ac^0x2483a331),(0xe221210^0xe221285),(0x2f139f6^0x2f13981),(0x3cad57f7^0x3cad5735),(0x6c0c910^0x6c0c9d1),(0x3f477ff2^0x3f477fa5),(0x306cde7b^0x306cde21),(0x5cb6e47^0x5cb6e55),0,(0x269d84d1^0x269d8471),(0x2760431^0x27604c5),(0x35f38e66^0x35f38ec1),(0x24ccad43^0x24ccad75),(0x363523df^0x36352311),(0x3ec52cc7^0x3ec52ce5),(0x3cfaecfa^0x3cfaec61),(0x116d6fea^0x116d6f95),(0x7bf5ea^0x7bf5b1),(0x24e26652^0x24e26605),(0x1a6fd414^0x1a6fd401),(0x11de1648^0x11de16b5),(0x30d8a05c^0x30d8a051),(0x1fff4bca^0x1fff4b25),(0x2ba09088^0x2ba090a1),(0xf9b71ef^0xf9b71d5),(0x3635ea34^0x3635eaf1),(0x157cc97^0x157cc45),(0x24e0fd0d^0x24e0fd41),(0xba5ac97^0xba5acf5),(0x9f5b93e^0x9f5b991),(0x3b7c242b^0x3b7c2465),(0x3baeea59^0x3baeeae1),(0x2ce57ffe^0x2ce57f15),(0x32bc5ca4^0x32bc5c31),(0x3c2ce11f^0x3c2ce185),(0x17782f7^0x1778281),(0x2729696^0x2729635),(0x3ebbb6d6^0x3ebbb6d1),(0xfcc9295^0xfcc92a5),(0x35a1fed^0x35a1f21),(0x1b7801ce^0x1b780155),(0x2bdc912c^0x2bdc9171),(0x3f7df3bd^0x3f7df3c5),(0x3efe7731^0x3efe77c1),(0x3f9c5805^0x3f9c5875),(0x37c74c81^0x37c74c11),(0xd91ab51^0xd91abe5),(0x115ee5ca^0x115ee561),(0x286faaad^0x286faa95),(0x12492ee3^0x12492eb1),(0x2acf75c2^0x2acf7505),(0x29b01d13^0x29b01d01),(0x33a24199^0x33a241b5),(0x388055e1^0x38805551),(0x24c824d^0x24c8225),(0x169ce5dc^0x169ce5a1),(0x2e2548cc^0x2e2548d5),(0x2b5c7f9f^0x2b5c7ff1),(0x1f17a3b8^0x1f17a345),(0x181e7e0a^0x181e7e41),(0x19c3b377^0x19c3b3f5),(0x4066a44^0x4066a91),(0x1fcd1b57^0x1fcd1b65),(0x212f6bab^0x212f6be1),(0xae3d2ae^0xae3d215),(0x3ec95d42^0x3ec95d31),(0x1d50b4b4^0x1d50b485),(0x3cc1730f^0x3cc17381),(0x1641d9dc^0x1641d935),(0x39d1d333^0x39d1d3d1),(0x222d111e^0x222d11a5),(0x176218d6^0x17621821),(0x15e8207b^0x15e82055),(0x35b21e02^0x35b21e71),(0x747468a^0x74746c5),(0xe01a8c3^0xe01a8c1),(0x3d79ff3f^0x3d79ff75),(0x620d44^0x620d11),(0x310abeb2^0x310abee5),(0x30e896be^0x30e89661),(0x19f6e187^0x19f6e195),(0x2b8acf0b^0x2b8acfb1),(0x142f28d9^0x142f2805),(0x3d0d9e41^0x3d0d9e01),(0x1f6c48f9^0x1f6c48b5),(0xd141a5a^0xd141a51),(0x8372d74^0x8372d25),(0x1e348ab2^0x1e348aa1),(0x4c993e0^0x4c993d5),(0x2dca4c7^0x2dca4f1),(0x687cebd^0x687ce45),(0x3d475773^0x3d475741),(0x13928e9c^0x13928ef5),(0x2594b3db^0x2594b391),(0x1978e620^0x1978e665),(0x26f844d^0x26f84e1),(0x3b592104^0x3b592115),(0x286f266e^0x286f2631),(0x74c7380^0x74c7385),(0xfb72c83^0xfb72c81),(0x3e068c6^0x3e06835),(0x188109e^0x18810d1),(0x1848a434^0x1848a4a5),(0x2de40919^0x2de40921),(0x142423e9^0x14242355),(0x2ca94beb^0x2ca94b71),(0x34e255cd^0x34e255c5),(0x28bf1fd^0x28bf1c1),(0x3111cadd^0x3111ca75),(0x108b567f^0x108b5611),(0x18683de2^0x18683de5),(0x10c38fd9^0x10c38f61),(0x1b247cb0^0x1b247c95),(0x154898e4^0x154898b1),(0x2ffb57c3^0x2ffb5705),(0x3e081747^0x3e081701),(0x38ea03a5^0x38ea03b5),(0xa49efb3^0xa49ef51),(0x32958413^0x32958425),(0xdce3fd1^0xdce3fa1),(0x2a0ca05^0x2a0cad5),(0x1b955952^0x1b9559f1),(0x3f2535bc^0x3f253545),(0x285428a3^0x28542841),(0x3d57154a^0x3d5715f5),(0x253ce461^0x253ce491),(0x24445d20^0x24445d65),(0x177f85fa^0x177f85e1),(0x2a9df48b^0x2a9df415),(0xdcc1738^0xdcc1731),(0x1e2cb634^0x1e2cb685),(0x2363cd49^0x2363cd81),(0x1551b00^0x1551b35),(0x16eded97^0x16ededd1),(0x261d9332^0x261d93a5),(0x2731f2f9^0x2731f221),(0x2039821c^0x20398255),(0x341a98b7^0x341a9871),(0xb75b8e3^0xb75b8c5),(0x201d2270^0x201d22c1),(0x58c4132^0x58c4175),(0x2052b734^0x2052b711),(0x58130a7^0x58130e5),(0x2e670e5^0x2e67061),(0x397f73e3^0x397f7395),(0x3e657968^0x3e6579b1),(0x1134ca0b^0x1134ca05),(0x3b82d840^0x3b82d801),(0x3e08faf6^0x3e08fab5),(0x388d246e^0x388d2451),(0xd97fc9^0xd97f25),(0x12ec74ba^0x12ec74a1),(0x2089c50c^0x2089c5d5),(0x1a74eec4^0x1a74eef1),(0x38f1804f^0x38f18045),(0x146af1e2^0x146af141),(0x3594603d^0x359460f5),(0x312aad89^0x312aad91),(0x3b410843^0x3b410865),(0x39f56ee3^0x39f56ee1),(0x3729b339^0x3729b315),(0x2b11d012^0x2b11d031),(0x14da1552^0x14da1585),(0x291466e0^0x29146681),(0x25f7ea47^0x25f7ea35),(0x8d8ea41^0x8d8ead1),(0x53b66e5^0x53b66a5),(0x3ac2a3bd^0x3ac2a321),(0x255dc5fa^0x255dc555),(0x110e856c^0x110e8571),(0x161d793^0x161d7c5),(0x1ac4cb8b^0x1ac4cbc1),(0x27208c5b^0x27208c75),(0x22c9f0e5^0x22c9f011),(0x3c4f0f74^0x3c4f0fe5),(0xf8db90d^0xf8db961),(0x1ef09ea9^0x1ef09e95),(0x1755225^0x17552b1),(0x32e5594b^0x32e55905),(0x19eda1b1^0x19eda101),(0x381f053c^0x381f05b5),(0x3ef74991^0x3ef74951),(0x12049683^0x12049625),(0x1ad469ca^0x1ad469a1),(0x280dac13^0x280dacd5),(0xa053a4^0xa053f1),(0x263df714^0x263df745),(0x2d60c235^0x2d60c241),(0x2e46b77b^0x2e46b7f5),(0x3d141e73^0x3d141e91),(0xc337f1e^0xc337f65),(0x18793f58^0x18793fe1),(0x3bf09607^0x3bf09615),(0x1244515c^0x12445131),(0x19f668a3^0x19f66885),(0xc01c74a^0xc01c781),(0x14cadd3f^0x14cadd35),(0x2bed87e9^0x2bed87d1),(0x367e35d9^0x367e35a5),(0x35202c34^0x35202c21),(0x2c626491^0x2c626455),(0x170592b4^0x17059271),(0x3a3a7a39^0x3a3a7ac5),(0x3b39bc4d^0x3b39bcc1),(0x1b1183ce^0x1b118375),(0x3bc4d1dd^0x3bc4d111),(0x1e4282fe^0x1e4282e5),(0x2da01a82^0x2da01a61),(0x355f4557^0x355f4595),(0x2d4ea3ad^0x2d4ea3b1),(0xb357c1c^0xb357c05),(0x2f0fe217^0x2f0fe201),(0x188f4c83^0x188f4cb5),(0x2e0dced5^0x2e0dce51),(0x30da51cd^0x30da5125),(0x2baf6ec9^0x2baf6ea1),(0x25c0e70b^0x25c0e7d5),(0x346aa837^0x346aa8f1),(0x217b2b2^0x217b245),(0x2cbc7b4c^0x2cbc7b41),(0xdf1d2cc^0xdf1d2f5),(0x1c01f7c8^0x1c01f791),(0x38c95abd^0x38c95a65),(0x19b581f^0x19b58e1),(0x266d15fa^0x266d1515),(0x6584aa2^0x6584a31),(0x208fb71c^0x208fb785),(0x3b85a0df^0x3b85a081),(0x34cc9c2f^0x34cc9c35),(0x31fdf4f3^0x31fdf4d1),(0x1744f8ed^0x1744f8a5),(0x2f117d7b^0x2f117d21),(0x35c1c709^0x35c1c755),(0x118dfe5^0x118df71),(0x31e85939^0x31e859c5),(0x2993d510^0x2993d5c1),(0x3aec1ee3^0x3aec1e75),(0x36459a70^0x36459a11),(0x24c8e10c^0x24c8e1e5),(0x353bb377^0x353bb361),(0x351660e6^0x35166095),(0x2e2c7c27^0x2e2c7cb1),(0x19a1abbc^0x19a1ab05),(0x206c4bec^0x206c4b01),(0x1979d755^0x1979d7b5),(0x1170b3ab^0x1170b351),(0x195548d6^0x19554825),(0x3dd363de^0x3dd363a1),(0x38b66eaf^0x38b66ed5),(0x19b0ed5a^0x19b0edf1),(0x2f3bf9ba^0x2f3bf945),(0x1d2a4c4a^0x1d2a4c41)
]);
const _0x540d2= new Uint32Array([
0,(0x315c29ff^0x315c29f5),(0x20595885^0x20595891),(0x3b2c3179^0x3b2c3165),(0x1fd9d9c3^0x1fd9d9e1),(0x1c516838^0x1c516815),(0x1ccdab08^0x1ccdab31),(0x334aaad6^0x334aaa85),(0x3970e1f2^0x3970e181),(0x3b9f2fb6^0x3b9f2f35),(0x3104315c^0x310431d1),(0x1fc3d732^0x1fc3d7a5),(0x1c616680^0x1c616621),(0x3159e6ec^0x3159e655),(0x1b66cb0^0x1b66c71),(0x1f413c09^0x1f413cc5),(0x2ddc5618^0x2ddc56c1),(0x32f32595^0x32f32575),(0xd060be2^0xd060b11),(0x388865e6^0x388864e5),(0x32aa1573^0x32aa1461),(0x2d5106b4^0x2d510795),(0x1d7a3c87^0x1d7a3db1),(0x2817bf43^0x2817be05),(0x35d4fd54^0x35d4fc01),(0x29a0fd3^0x29a0eb5),(0x3c58692d^0x3c586851),(0x15f122a3^0x15f12325),(0x15e99930^0x15e998a1),(0x113d0877^0x113d09d5),(0x28d49340^0x28d492f1),(0x161e581^0x161e445),(0x436c489^0x436c541),(0x13afe525^0x13afe4f5),(0x3e45e04a^0x3e45e191),(0x14077d8d^0x14077c65),(0x15721318^0x157212e1),(0x190d1515^0x190d1715),(0x36cea632^0x36cea431),(0x8ec9b82^0x8ec9985),(0x1b41c88f^0x1b41ca81),(0x186fec26^0x186fee35),(0x203d9ccb^0x203d9ed1),(0x10b2c8ba^0x10b2caa5),(0xbd0a509^0xbd0a721)
]);
const _0x99e63= new Uint32Array([
(0x32e0795f^0x32e07955),(0x32ed197b^0x32ed1971),(0x3ffe0bcd^0x3ffe0bc5),(0x1c09fc7^0x1c09fc1),(0x3c97507e^0x3c975075),(0x37e5b41d^0x37e5b411),(0x3ab303ff^0x3ab303e5),(0x36ae6d41^0x36ae6d61),(0x2adcc285^0x2adcc295),(0x281ff6bb^0x281ff6b1),(0x2df7ed0f^0x2df7ed05),(0x3875650b^0x38756501),(0x1ddef9ad^0x1ddef9b5),(0x35499d59^0x35499d51),(0x8a2da2e^0x8a2da25),(0x1fc90dac^0x1fc90da1),(0xf4240d2^0xf4240d5),(0x29a8e7e2^0x29a8e7f1),(0x3ca3bb55^0x3ca3bb45),(0x3bb3e64e^0x3bb3e641),(0x33aacbfa^0x33aacbf5),(0x14099284^0x14099291),(0x13a0b375^0x13a0b365),(0x3f7db3ee^0x3f7db3e1),(0x13baca04^0x13baca15),(0x10c22527^0x10c22531),(0x297bec8f^0x297bec85),(0x321efb8a^0x321efb81),(0x9e4f124^0x9e4f135),(0xbc69bde^0xbc69bd1),(0x2ca9e9b6^0x2ca9e9a5),(0x365a8025^0x365a8021),(0x6f0385d^0x6f03855),(0x33d3867a^0x33d38671),(0x4a5ec8^0x4a5ec5),(0x203c10d0^0x203c10c1),(0x189b5772^0x189b5775),(0x39319512^0x39319511),(0x36976e1^0x36976e5),(0x1e63e66^0x1e63e61),(0x37745990^0x37745995),(0x80657b6^0x80657b1),(0x109de000^0x109de005),(0x3abb4608^0x3abb4601),(0x17d420b1^0x17d420b5)
]);
const _0xdfbf4= new Uint32Array([
((0x317b2254^0x317b2251)<< (0x39b92535^0x39b92525))|(0<< (0x2867f2a9^0x2867f2a1))| (0xb61eb94^0xb61ebd5),
((0x34578cf7^0x34578cf1)<< (0x2d90655^0x2d90645))|(0<< (0x394c7f49^0x394c7f41))| (0x90e86c9^0x90e86f5),
((0x1e5a1b96^0x1e5a1b91)<< (0xe699e75^0xe699e65))|(0<< (0x209ccce9^0x209ccce1))| (0x4577954^0x4577915),
((0x11a34e21^0x11a34e31)<< (0x3c316b95^0x3c316b85))|(0<< (0x1571f489^0x1571f481))| (0x3bce002^0x3bce035),
((0x11d6f8d8^0x11d6f8d1)<< (0x3ebddcb5^0x3ebddca5))|(1<< (0x1aeed129^0x1aeed121))| (0x38909b13^0x38909b55),
((0x242dd37b^0x242dd371)<< (0x208c0dd5^0x208c0dc5))|(1<< (0x38acf9c9^0x38acf9c1))| (0x32df6233^0x32df6275),
((0x1dcb9e1d^0x1dcb9e11)<< (0xa0395f5^0xa0395e5))|((0xd511763^0xd511761)<< (0x31d349d^0x31d3495))| (0x53840f7^0x53840b1),
((0x117d2f0b^0x117d2f05)<< (0x303b7f11^0x303b7f01))|((0x255cbbb6^0x255cbbb5)<< (0x32113759^0x32113751))| (0x100b7c08^0x100b7c25)
]);
const _0x25985= new Int32Array([
(0x18eb4449^0x18eb47a1), (0x34a0c317^0x34a0c2d5), (0x20eec139^0x20eec1f1), (0x29544c1b^0x29544d45), (0x125f5791^0x125f5041),
(0x3892ad88^0x3892adf5), (0x86d8cf5^0x86d8c91), (0x27ed53f^0x27ed565), (0x3dd46db1^0x3dd46de1), (0x31f52c83^0x31f52c15)
]);
const _0x6b716= new Uint32Array([
(0xe199f03^0xe199f31), (0x2b4bce9b^0x2b4bce85), (0x2c8af59c^0x2c8af581),
(0xb0b3cf^0xb0b335), (0x312435db^0x312435d1), (0x19108bea^0x19108ba5),
(0x3736bdf1^0x3736ba21), (0x11e65a56^0x11e65a55), (0x1f224088^0x1f224071)
]);
const _0xb14a7= new Map();
const _0xf7238= new TextDecoder();
function _d0(_k0){
const _0x3cfc9= _0xb14a7.get(_k0);
if(_0x3cfc9!== undefined) return _0x3cfc9;
const _0x82d5a= _0x540d2[_k0];
const _0xc8aeb= _0x99e63[_k0];
const _0x0e87c= new Uint8Array(_0xc8aeb);
let _st0= _0xc85b0>>> 0;
for(let _0x5460d= 0; _0x5460d< _0x82d5a+ _0xc8aeb; _0x5460d++){
_st0=(_st0+ 0x9e3779b9)>>> 0;
if(_0x5460d>= _0x82d5a){
let _0x9a39e= _st0;
_0x9a39e= Math.imul(_0x9a39e^(_0x9a39e>>> (0xeef90d5^0xeef90c5)), 0x85ebca6b)>>> 0;
_0x9a39e= Math.imul(_0x9a39e^(_0x9a39e>>> (0x11ee2acc^0x11ee2ac1)), 0xc2b2ae35)>>> 0;
_0x9a39e=(_0x9a39e^(_0x9a39e>>> (0x3969d965^0x3969d975)))>>> 0;
_0x0e87c[_0x5460d- _0x82d5a]= _0x0e341[_0x5460d]^(_0x9a39e& (0x1f149fee^0x1f149f11))^((_0x5460d* (0x322768fa^0x322768e5))& (0x3cf89e^0x3cf861));
}
}
const _v0= _0xf7238.decode(_0x0e87c);
_0xb14a7.set(_k0, _v0);
return _v0;
}
function _0xe012f(_x0){
let _0x25ebg= 0x811c9dc5;
for(let _0x6bc4h= 0; _0x6bc4h< _x0.length; _0x6bc4h++){
_0x25ebg^= _x0.charCodeAt(_0x6bc4h);
_0x25ebg= Math.imul(_0x25ebg, (0x298d8a06^0x288d8b95))>>> 0;
}
return _0x25ebg>>> 0;
}
function _0xb19di(_0x9bd81x){
let _0xf776j=(_0x9bd81x+ 0x9e3779b9)>>> 0;
_0xf776j= Math.imul(_0xf776j^(_0xf776j>>> (0x1389a1a1^0x1389a1b1)), 0x85ebca6b)>>> 0;
_0xf776j= Math.imul(_0xf776j^(_0xf776j>>> (0x11e42208^0x11e42205)), 0xc2b2ae35)>>> 0;
return(_0xf776j^(_0xf776j>>> (0x6e86011^0x6e86001)))>>> 0;
}
function scoreBotChallengeKernel(
statusCode,
headerPairs,
bodySample
){
let _0x3d4fk= 1;
let _0x8328l= 0;
let _0xc901m=-1;
let _0x0edan= null;
let _cfRay= false;
let _0x54b3o= false;
const _0x9a8cp=[];
const _0xe065q= bodySample.slice(0, (0x54e12b5^0x54e72b5)).toLowerCase();
while(_0x3d4fk!== 0){
switch(_0x3d4fk){
case 1:{
if(statusCode=== (0x124b0dc2^0x124b0c51)|| statusCode=== (0x19cbb6d2^0x19cbb725)){
_0x8328l+= (0x23a49cb8^0x23a49ca1);
} else if(statusCode=== (0x10a2bc78^0x10a2bdd5)){
_0x8328l+= (0x3cf2f6c6^0x3cf2f6f1);
_0x9a8cp.push(_d0((0x3023b852^0x3023b845)));
if(_0xc901m< 0) _0xc901m= (0x3148b945^0x3148b941);
}
_0x3d4fk= (0xc0c38f7^0xc0c38f5);
break;
}
case 2:{
for(let _0x263er= 0; _0x263er< headerPairs.length; _0x263er++){
const _0x6c17s= headerPairs[_0x263er][0].toLowerCase().trim();
const _0xb1f0t= headerPairs[_0x263er][1].toLowerCase().trim();
const _0xf7c9u= _0xe012f(_0x6c17s);
if(_0xf7c9u=== 0xcc556163){
_0x8328l+= (0x2b0755da^0x2b075591);
_0xc901m= 0;
_0x9a8cp.push(_d0((0x19fd2074^0x19fd2065)));
} else if(_0xf7c9u=== 0xa9decced){
_cfRay= true;
} else if(_0xf7c9u=== 0x40ac3dd2){
const _0x3da2v= _0xe012f(_0xb1f0t);
if(_0x3da2v=== 0xa187f48e) _0x54b3o= true;
else if(_0x3da2v=== 0xcffbe6c8){
if(_0xc901m< 0) _0xc901m= (0x205536e2^0x205536e1);
}
} else if(_0xf7c9u=== 0x31beb3ed|| _0xf7c9u=== 0xcf9b4ddc){
_0x8328l+= (0x3de12b53^0x3de12b15);
_0xc901m= (0x21741833^0x21741831);
_0x9a8cp.push(_d0((0x12236d91^0x12236d85)));
} else if(_0xf7c9u=== 0x6c84ff96|| _0xf7c9u=== 0xcd9ad917){
_0x8328l+= (0x2724ec7^0x2724e81);
_0xc901m= 1;
_0x9a8cp.push(_d0((0x3b0a2226^0x3b0a2235)));
} else if(_0xf7c9u=== 0xc6da1376){
const _0x837bw= Number.parseInt(_0xb1f0t, (0x216512db^0x216512d1));
if(Number.isFinite(_0x837bw)&& _0x837bw>= 0) _0x0edan= _0x837bw;
}
}
_0x3d4fk= (0x3b1dfea6^0x3b1dfea5);
break;
}
case 3:{
for(let _0xc954x= 0; _0xc954x< _0xdfbf4.length; _0xc954x++){
const _0x0f2dy= _0xdfbf4[_0xc954x];
const _0x5506z=(_0x0f2dy>>> (0x373f8b31^0x373f8b21))& (0x39e8fdaa^0x39e8fd55);
const _0x9adf10=(_0x0f2dy>>> (0x2f6b4d79^0x2f6b4d71))& (0x3952af3a^0x3952afc5);
const _0xe0b811= _0x0f2dy& (0x1335333e^0x133533c1);
if(_0xe065q.indexOf(_d0(_0x5506z))!==-1){
_0x8328l+= _0xe0b811;
_0xc901m= _0x9adf10;
const _0x269112= _0x9adf10=== 0? 18: _0x9adf10=== 1? 19: _0x9adf10=== (0x148be477^0x148be475)? 21: (0x11677807^0x11677811);
if(_0x9a8cp.indexOf(_d0(_0x269112))===-1) _0x9a8cp.push(_d0(_0x269112));
}
}
if((_cfRay|| _0x54b3o)&&(statusCode=== (0x2d522676^0x2d5227e5)|| statusCode=== (0x2ec28096^0x2ec28161))&& _0xe065q.indexOf(_d0((0x1227d69d^0x1227d695)))!==-1){
_0x8328l+= (0xe747a86^0xe747ab1);
_0xc901m= 0;
if(_0x9a8cp.indexOf(_d0((0x38535117^0x38535105)))===-1) _0x9a8cp.push(_d0((0x1afd0913^0x1afd0901)));
}
if(statusCode=== (0x3f1bc26^0x3f1bdb5)&& _0xe065q.indexOf(_d0((0xbbe915e^0xbbe9151)))!==-1&& _0xe065q.indexOf(_d0((0x2c1a8e2b^0x2c1a8e25)))!==-1){
_0x8328l+= (0xb06318c^0xb0631a1);
_0xc901m= (0x26cf24d6^0x26cf24d5);
if(_0x9a8cp.indexOf(_d0((0x142a3be7^0x142a3bf1)))===-1) _0x9a8cp.push(_d0((0x68c2f53^0x68c2f45)));
}
_0x3d4fk= (0x29934a45^0x29934a41);
break;
}
case 4:{
if(_0x8328l> (0x1000cf91^0x1000cff5)) _0x8328l= (0xfd446f5^0xfd44691);
if(_0x8328l>= (0x1e4ed757^0x1e4ed765)&& _0xc901m< 0) _0xc901m= (0x30dac7e5^0x30dac7e1);
_0x3d4fk= 0;
break;
}
default:
_0x3d4fk= 0;
break;
}
}
return{
challenged: _0x8328l>= (0xf020e27^0xf020e15),
vendor: _0xc901m>= 0?(_d0(_0xc901m)): null,
statusCode: statusCode,
challengeScore: _0x8328l,
matchedSignals: _0x9a8cp,
retryAfterSeconds: _0x0edan
};
}
function _0x6c6a13(
_tyIdx,
_pr,
_vr,
_pa,
_ca,
_pp,
_cp,
_bps,
_zs,
_cbps,
_vel,
_sev,
_ts
){
const _0xb24314= _0xe012f(_pr.productId+ _$s85b(0)+ _vr.variantId+ _$s85b(0)+ String(_tyIdx)+ _$s85b(0)+ String(_ts)).toString((0x3b189921^0x3b189931)).padStart((0x7f5c08d^0x7f5c085), _$s85b(1));
return{
eventId: _d0((0x2ba34fad^0x2ba34f81))+ _0xb24314,
type: _d0(_tyIdx),
productId: _pr.productId,
productTitle: _pr.title,
sourceUrl: _pr.sourceUrl,
variantId: _vr.variantId,
sku: _vr.sku,
variantTitle: _vr.title,
previousAvailable: _pa,
currentAvailable: _ca,
previousPriceCents: _pp,
currentPriceCents: _cp,
priceDeltaBps: _bps,
priceZScore: Math.round(_zs* (0x2d81f6dd^0x2d81f535))/ (0x1324c39^0x1324fd1),
discountFromCompareAtBps: _cbps,
restockVelocityPerHour: Math.round(_vel* (0x164b0dc1^0x164b0da5))/ (0x31c89445^0x31c89421),
severityScore: Math.min((0x2845bc31^0x2845bc55), Math.max(0, Math.round(_sev))),
detectedAtMs: _ts
};
}
function evaluateCatalogTransitionKernel(
prevState,
incomingSnapshots,
challenge,
config,
evaluatedAtMs
){
let _0x3d4fk= 1;
const _0xf81c15= Math.max(1, config.restockConfirmTicks?? (0x1520ba73^0x1520ba71));
const _0x3df516= Math.max(1, config.outOfStockConfirmTicks?? (0x339472c7^0x339472c5));
const _0x83ce17= Math.max(1, config.minPriceDropBps?? (0x1e652535^0x1e6524c1));
const _0xc9a718= Math.max(1, config.minPriceSpikeBps?? (0x252a9ea9^0x252a9b75));
const _0x0f8019= config.anomalyZScoreThreshold??-2.0;
const _0x55591a= Math.max((0x3c7d3915^0x3c7d3911), config.priceHistoryWindow?? (0x3c703af5^0x3c703ae5));
const _0x9b321b= Math.max((0x3a08801^0x3a06261), config.velocityWindowMs?? (0x2fe21315^0x2fd4fd95));
const _0xe10b1c={};
if(prevState){
const _0x26e41d= Object.keys(prevState.variants);
for(let _0x6cbd1e= 0; _0x6cbd1e< _0x26e41d.length; _0x6cbd1e++){
const _0xb2961f= _0x26e41d[_0x6cbd1e];
const _0xf86f1g= prevState.variants[_0xb2961f];
_0xe10b1c[_0xb2961f]={
variantId: _0xf86f1g.variantId,
confirmedAvailable: _0xf86f1g.confirmedAvailable,
pendingAvailable: _0xf86f1g.pendingAvailable,
pendingStreak: _0xf86f1g.pendingStreak,
lastConfirmedPriceCents: _0xf86f1g.lastConfirmedPriceCents,
priceHistoryCents: _0xf86f1g.priceHistoryCents.slice(),
restockTimestampsMs: _0xf86f1g.restockTimestampsMs.slice(),
lastSeenLowStock: _0xf86f1g.lastSeenLowStock,
lastUpdatedAtMs: _0xf86f1g.lastUpdatedAtMs
};
}
}
const _0x3e481h=[];
const _0x84211i=[];
let _pres= false;
let _0xc9fa1j= incomingSnapshots;
let _chCnt= prevState? prevState.consecutiveChallenges: 0;
let _0x0fd31k= prevState? prevState.pollTick+ 1: 1;
while(_0x3d4fk!== 0){
switch(_0x3d4fk){
case 1:{
if(challenge&& challenge.challenged){
_pres= true;
_chCnt+= 1;
_0xc9fa1j= prevState? prevState.lastValidSnapshots:[];
if(_0xc9fa1j.length> 0&& _0xc9fa1j[0].variants.length> 0){
const _s0= _0xc9fa1j[0];
const _v0= _s0.variants[0];
_0x84211i.push(
_0x6c6a13((0x3496ebaf^0x3496ebb1), _s0, _v0, _v0.available, _v0.available, _v0.priceCents, _v0.priceCents, 0, 0, 0, 0, challenge.challengeScore, evaluatedAtMs)
);
}
_0x3d4fk= 0;
} else{
_chCnt= 0;
_0x3d4fk= (0x1698d407^0x1698d405);
}
break;
}
case 2:{
for(let _0x269112= 0; _0x269112< incomingSnapshots.length; _0x269112++){
const _sn= incomingSnapshots[_0x269112];
for(let _0x55ac1l= 0; _0x55ac1l< _sn.variants.length; _0x55ac1l++){
const _vr= _sn.variants[_0x55ac1l];
const _0x9b851m= _sn.productId+ _$s85b(2)+ _vr.variantId;
const _0xe15e1n= _0xe10b1c[_0x9b851m];
if(!_0xe15e1n){
_0xe10b1c[_0x9b851m]={
variantId: _vr.variantId,
confirmedAvailable: _vr.available,
pendingAvailable: null,
pendingStreak: 0,
lastConfirmedPriceCents: _vr.priceCents,
priceHistoryCents:[_vr.priceCents],
restockTimestampsMs: _vr.available?[evaluatedAtMs]:[],
lastSeenLowStock: _vr.lowStockRemaining,
lastUpdatedAtMs: evaluatedAtMs
};
continue;
}
const _prevAv= _0xe15e1n.confirmedAvailable;
const _prevPr= _0xe15e1n.lastConfirmedPriceCents;
const _0x27371o= _0xe15e1n.restockTimestampsMs.filter((_t)=> evaluatedAtMs- _t<= _0x9b321b);
if(_vr.available!== _prevAv){
const _0x6d101p= _vr.available? _0xf81c15: _0x3df516;
const _0xb2e91q= _0xe15e1n.pendingAvailable=== _vr.available? _0xe15e1n.pendingStreak+ 1: 1;
if(_0xb2e91q>= _0x6d101p){
_0xe15e1n.confirmedAvailable= _vr.available;
_0xe15e1n.pendingAvailable= null;
_0xe15e1n.pendingStreak= 0;
if(_vr.available){
_0x27371o.push(evaluatedAtMs);
const _vel= _0x27371o.length*((0x12cf8481^0x12f96a01)/ _0x9b321b);
const _cbps= _vr.compareAtPriceCents&& _vr.compareAtPriceCents> _vr.priceCents
? Math.round(((_vr.compareAtPriceCents- _vr.priceCents)* (0x25ce43a5^0x25ce64b5))/ _vr.compareAtPriceCents)
: 0;
_0x3e481h.push(_0x6c6a13((0x36ee9649^0x36ee9651), _sn, _vr, false, true, _prevPr, _vr.priceCents, 0, 0, _cbps, _vel, (0x3f18c970^0x3f18c925)+ Math.min((0x1072b6ae^0x1072b6a1), _vel* (0x1d82dfd6^0x1d82dfd5)), evaluatedAtMs));
} else{
const _vel= _0x27371o.length*((0x2f55e71^0x2c3b0f1)/ _0x9b321b);
_0x3e481h.push(_0x6c6a13((0x196eea5c^0x196eea45), _sn, _vr, true, false, _prevPr, _vr.priceCents, 0, 0, 0, _vel, (0x2aa0376^0x2aa0341), evaluatedAtMs));
}
} else{
_0xe15e1n.pendingAvailable= _vr.available;
_0xe15e1n.pendingStreak= _0xb2e91q;
_0x84211i.push(_0x6c6a13((0x153f4ae8^0x153f4af5), _sn, _vr, _prevAv, _prevAv, _prevPr, _vr.priceCents, 0, 0, 0, 0, (0x31c23f85^0x31c23f91), evaluatedAtMs));
}
} else{
_0xe15e1n.pendingAvailable= null;
_0xe15e1n.pendingStreak= 0;
}
_0xe15e1n.restockTimestampsMs= _0x27371o;
const _velNow= _0x27371o.length*((0x8ae5ce5^0x898b265)/ _0x9b321b);
if(_vr.priceCents> 0&& _prevPr> 0){
const _bps= Math.round(((_vr.priceCents- _prevPr)* (0x460c7f1^0x460e0e1))/ _prevPr);
const _0xf8c21r= _0xe15e1n.priceHistoryCents;
let _0x3e9b1s= 0;
for(let _0x84741t= 0; _0x84741t< _0xf8c21r.length; _0x84741t++) _0x3e9b1s+= _0xf8c21r[_0x84741t];
const _0xca4d1u= _0xf8c21r.length> 0? _0x3e9b1s/ _0xf8c21r.length: _prevPr;
let _0x10261v= 0;
for(let _0x84741t= 0; _0x84741t< _0xf8c21r.length; _0x84741t++){
const _0x55ff1w= _0xf8c21r[_0x84741t]- _0xca4d1u;
_0x10261v+= _0x55ff1w* _0x55ff1w;
}
const _0x9bd81x= _0xf8c21r.length> 1? Math.sqrt(_0x10261v/ _0xf8c21r.length): 0;
const _0xe1b11y= _0x9bd81x> 0? _0x9bd81x: Math.max(1, _0xca4d1u* 0.02);
const _zs= _0xf8c21r.length>= (0x2c328d17^0x2c328d15)|| _vr.priceCents!== _0xca4d1u?(_vr.priceCents- _0xca4d1u)/ _denom: 0;
const _cbps= _vr.compareAtPriceCents&& _vr.compareAtPriceCents> _vr.priceCents
? Math.round(((_vr.compareAtPriceCents- _vr.priceCents)* (0x2090b521^0x20909231))/ _vr.compareAtPriceCents)
: 0;
if(_vr.priceCents< _prevPr&&(-_bps>= _0x83ce17||(_0xf8c21r.length>= (0x3d28af81^0x3d28af85)&&-_bps>= (0x38b8687b^0x38b86881)&& _zs<= _0x0f8019))){
const _sev= (0x19ef7409^0x19ef7435)+ Math.min((0x1e89fcf9^0x1e89fcd1), Math.round((-_bps)/ (0x1aa790c1^0x1aa790a5)));
_0x3e481h.push(_0x6c6a13((0x528c53b^0x528c521), _sn, _vr, _prevAv, _0xe15e1n.confirmedAvailable, _prevPr, _vr.priceCents, _bps, _zs, _cbps, _velNow, _sev, evaluatedAtMs));
} else if(_vr.priceCents> _prevPr&& _bps>= _0xc9a718){
_0x3e481h.push(_0x6c6a13((0x353c7f4e^0x353c7f55), _sn, _vr, _prevAv, _0xe15e1n.confirmedAvailable, _prevPr, _vr.priceCents, _bps, _zs, _cbps, _velNow, (0x67c2759^0x67c2771), evaluatedAtMs));
}
_0xe15e1n.lastConfirmedPriceCents= _vr.priceCents;
_0xf8c21r.push(_vr.priceCents);
while(_0xf8c21r.length> _0x55591a) _0xf8c21r.shift();
}
if(
_0xe15e1n.confirmedAvailable&&
_vr.lowStockRemaining!== null&&
_vr.lowStockRemaining> 0&&
_vr.lowStockRemaining<= (0x2b9f11c0^0x2b9f11c5)&&
(_0xe15e1n.lastSeenLowStock=== null|| _0xe15e1n.lastSeenLowStock> (0x24697dc4^0x24697dc1))
){
_0x3e481h.push(_0x6c6a13((0x1b819669^0x1b819675), _sn, _vr, _prevAv, true, _prevPr, _vr.priceCents, 0, 0, 0, _velNow, (0xf5f8250^0xf5f8211), evaluatedAtMs));
}
_0xe15e1n.lastSeenLowStock= _vr.lowStockRemaining;
_0xe15e1n.lastUpdatedAtMs= evaluatedAtMs;
}
}
_0x3d4fk= 0;
break;
}
default:
_0x3d4fk= 0;
break;
}
}
return{
state:{
variants: _0xe10b1c,
lastValidSnapshots: _0xc9fa1j,
consecutiveChallenges: _chCnt,
pollTick: _0x0fd31k
},
alerts: _0x3e481h,
suppressedFlaps: _0x84211i,
preservedPriorState: _pres,
activeSnapshots: _0xc9fa1j
};
}
function computePollScheduleKernel(input){
let _0x3d4fk= 1;
const _0x278a1z= Math.max((0x1561791f^0x156179e5), input.minIntervalMs?? (0x2cb69ebd^0x2cb69b61));
const _0x6d6320= Math.max(_0x278a1z, input.maxIntervalMs?? (0x281f0b75^0x281b9895));
const _0xb33c21= Math.max(_0x278a1z, input.baseIntervalMs);
const _0xf91522= input.consecutiveChallenges?? 0;
const _vel= input.recentRestockVelocityPerHour?? 0;
let _rgIdx= 0;
let _0x3eee23= _0xb33c21;
let _0x84c724= _0x278a1z;
let _0x84741t= _0x6d6320;
let _0xcaa025= 0;
let _0x107926= _0xb33c21;
while(_0x3d4fk!== 0){
switch(_0x3d4fk){
case 1:{
if(_0xf91522> 0){
_rgIdx= (0x1aa744b5^0x1aa744b1);
const _0x565227= Math.min((0x26f2e303^0x26f2e305), _0xf91522);
_0x3eee23= Math.min(_0x6d6320, _0xb33c21*(1<< _0x565227));
} else if(
input.dropWindowStartMs!== undefined&&
input.dropWindowStartMs!== null&&
input.dropWindowEndMs!== undefined&&
input.dropWindowEndMs!== null&&
input.nowMs>= input.dropWindowStartMs&&
input.nowMs<= input.dropWindowEndMs
){
_rgIdx= (0x2f717303^0x2f717301);
_0x3eee23= Math.round((_0xb33c21* _0x25985[(0x13076fb7^0x13076fb5)])/ (0x3ab58b9^0x3ab5b51));
} else if(input.pendingConfirmation){
_rgIdx= (0x2c51c026^0x2c51c025);
_0x3eee23= Math.round((_0xb33c21* _0x25985[(0x13e24ba2^0x13e24ba1)])/ (0x2c5fa53d^0x2c5fa6d5));
} else if(
input.dropWindowStartMs!== undefined&&
input.dropWindowStartMs!== null&&
input.nowMs< input.dropWindowStartMs&&
input.dropWindowStartMs- input.nowMs<= (0x1e17ae51^0x1e1a15f1)
){
_rgIdx= 1;
_0x3eee23= Math.round((_0xb33c21* _0x25985[1])/ (0x1ab192ad^0x1ab19145));
} else{
_rgIdx= 0;
const _0x9c2b28= _vel>= (0x1f729443^0x1f729441)? 650: (0x3b25221d^0x3b2521f5);
_0x3eee23= Math.round((_0xb33c21* _0x9c2b28)/ (0x24cdc379^0x24cdc091));
}
_0x3eee23= Math.min(_0x6d6320, Math.max(_0x278a1z, _0x3eee23));
_0x3d4fk= (0x1b404967^0x1b404965);
break;
}
case 2:{
const _0xe20429= _0x25985[(0x356c01e4^0x356c01e1)+ _rgIdx];
const _0x27dd2a= Math.max(1, Math.round((_0x3eee23* _0xe20429)/ (0xe2ac3fd^0xe2ac015)));
_0x84c724= Math.max(_0x278a1z, _0x3eee23- _0x27dd2a);
_0x84741t= Math.min(_0x6d6320, _0x3eee23+ _0x27dd2a);
const _0x9bd81x=((input.jitterSeed?? (0x4aa59b9^0x20953331))^(input.nowMs& 0xffffffff)^(_rgIdx* 0x9e3779b9))>>> 0;
const _0x6db62b= _0xb19di(_0x9bd81x);
const _0xb38f2c= _0x84741t- _0x84c724;
_0x107926= _0xb38f2c> 0? _0x84c724+(_0x6db62b%(_0xb38f2c+ 1)): _0x84c724;
_0xcaa025= _0x107926- _0x3eee23;
_0x3d4fk= 0;
break;
}
default:
_0x3d4fk= 0;
break;
}
}
return{
nextDelayMs: _0x107926,
baseCalculatedMs: _0x3eee23,
jitterOffsetMs: _0xcaa025,
minBoundMs: _0x84c724,
maxBoundMs: _0x84741t,
regime: _d0((0x1f5629a^0x1f56285)+ _rgIdx)
};
}
function computeTierPlanKernel(monitoredSkus, pollIntervalSeconds){
let _0x3d4fk= 1;
const _0xf9682d= Math.max(1, Math.floor(monitoredSkus));
const _0x3f412e= Math.max(1, Math.floor(pollIntervalSeconds));
const _0x851a2f= Math.ceil(((0x13abd801^0x13aa8981)/ _0x3f412e)* _0xf9682d);
let _ti= (0x31c8a737^0x31c8a735);
let _0xcaf32g= true;
while(_0x3d4fk!== 0){
switch(_0x3d4fk){
case 1:{
if(_0xf9682d<= _0x6b716[0]&& _0x3f412e>= _0x6b716[1]&& _0x851a2f<= (0x34745021^0x347619d1)){
_ti= 0;
} else if(_0xf9682d<= _0x6b716[(0x34ba0fa6^0x34ba0fa5)]&& _0x3f412e>= _0x6b716[(0x285bee25^0x285bee21)]&& _0x851a2f<= (0x279a6f95^0x27bbfe55)){
_ti= 1;
} else{
_ti= (0x3c9d473^0x3c9d471);
_0xcaf32g= _0xf9682d<= _0x6b716[(0x103994c3^0x103994c5)]&& _0x3f412e>= _0x6b716[(0xf7cdec6^0xf7cdec1)];
}
_0x3d4fk= 0;
break;
}
default:
_0x3d4fk= 0;
break;
}
}
const _0xf91522=[_d0((0x18233d52^0x18233d75)), _d0((0x1aef7339^0x1aef7311))];
if(_ti>= 1){
_0xf91522.push(_d0((0x177ebccc^0x177ebce5)), _d0((0x15563c4b^0x15563c61)));
}
if(_ti>= (0x2fadff97^0x2fadff95)){
_0xf91522.push(_d0((0x3058459a^0x305845b1)));
}
return{
recommendedTier: _d0((0x285eb621^0x285eb605)+ _ti),
monthlyPriceUsd: _0x6b716[_ti* (0x16836402^0x16836401)+ (0x6026b7^0x6026b5)],
monitoredSkus: _0xf9682d,
pollIntervalSeconds: _0x3f412e,
estimatedDailyRequests: _0x851a2f,
alertChannels: _0xf91522,
withinQuota: _0xcaf32g
};
}
return{scoreBotChallengeKernel,evaluateCatalogTransitionKernel,computePollScheduleKernel,computeTierPlanKernel};})();
const _$m2_ff4=(()=>{const _$p=Uint8Array.from([144,41,107,155,37,132,30,244,90,74,193,31,146,94,63,249,194,81,7,85,49,73,58,194,79,109,227,172,212,187,128,251,247,186,179,208,122,223,112,74,191,105,225,2,184,47,6,198,181,21,93,217,231,95,234,207,152,51,85,184,141,73,230,73,179,100,249,231,109,92,176,146,96,104,183,142,244,154,90,246,197,167,2,129,14,125,64,86,184,116,205,20,156,9,69,9,46,3,92,227,10,56,149,171,100,143,143,252,177,164,4,151,149,11,70,181,96,68,119,113,56,185,187,244,43,58,122,212,180,129,166,86,26,222,138,176,13,102,86,35,216,248,62,194,85,42,91,189,212,10,25,3,172,162,199,48,132,161,134,159,89,229,97,116,131,242,225,93,143,126,142,221,42,9,110,73,101,139,239,181,205,42,113,171,79,143,173,244,88,35,241,11,101,151,229,91,180,144,85,78,116,255,16,98,183,111,11,59,188,38,244,49,231,137,221,160,233,148,146,233,165,54,122,110,32,240,178,124,52,228,161,96,238,189,208,154,225,5,206,249,37,113,141,67,138,132,26,21,76,21,206,114,76,54,209,90,220,138,161,137,180,98,61,74,121,31,137,68,95,229,144,191,13,17,240,228,36,43,211,146,113,16,226,248,72,163,106,215,196,4,226,247,112,184,219,228,83,14,134,126,216,214,192,153,253,43,37,113,238,175,225,138,89,121,67,114,237,209,96,21,19,48,201,60,26,23,237,105,100,158,148,31,67,77,158,28,65,69,80,98,57,170,176,51,72,108,141,199,174,168,227,154,95,108,206,100,123,36,204,69,150,134,17,82,227,252,159,32,187,195,219,196,76,138,245,193,101,13,178,133,126,60,15,24,89,192,162,253,78,206,108,106,233,232,124,224,3,61,205,90,65,186,236,25,5,70,204,73,181,51,236,63,65,47,64,21,63,119,89,177,226,4,110,125,50,255,181,185,85,154,150,13,14,222,103,228,147,183,106,91,181,160,208,174,171,96,246,124,239,231,245,159,67,70,233,106,193,36,122,196,228,34,127,181,118,151]),_$o=[0,0,6,7,8,10,14,20,35,41,48,61,68,79,98,109,112,119,130,131,138,157,167,178,184,189,196,208,222,225,237,244,250,280,285,295,304,311,320,329,342,354,360,387,390,397,398,399,419,439],_$l=[0,6,1,1,2,4,6,15,6,7,13,7,11,19,11,3,7,11,1,7,19,10,11,6,5,7,12,14,3,12,7,6,30,5,10,9,7,9,9,13,12,6,27,3,7,1,1,20,20,27],_$c=new Map(),_$td=new TextDecoder();
function _$sff4(k){if(_$c.has(k))return _$c.get(k);const s=_$o[k],n=_$l[k],u=new Uint8Array(n);let q=2389503988;if((Math.imul(q|1,q|1)&7)!==1)return'';for(let i=0;i<s+n;i++){q=(q+0x9e3779b9)>>>0;if(i>=s){let z=q;z=Math.imul(z^(z>>>16),0x85ebca6b)>>>0;z=Math.imul(z^(z>>>13),0xc2b2ae35)>>>0;z=(z^(z>>>16))>>>0;u[i-s]=_$p[i]^(z&255)^((i*17)&255);}}const v=_$td.decode(u);_$c.set(k,v);return v;}
const{ scoreBotChallengeKernel}= _$m1_85b;
function normalizeHeaders(
headers
){
if(!headers) return[];
const _0xeff40=[];
for(const[key, raw] of Object.entries(headers)){
if(raw=== undefined) continue;
if(Array.isArray(raw)){
for(const _0x35cd1 of raw) _0xeff40.push([key, _0x35cd1]);
} else{
_0xeff40.push([key, raw]);
}
}
return _0xeff40;
}
function detectBotChallenge(
statusCode,
headers,
body
){
return scoreBotChallengeKernel(statusCode, normalizeHeaders(headers), body);
}
function _0x7ba62(raw, integerMeansCents){
if(raw=== null|| raw=== undefined|| raw=== _$sff4(0)) return null;
if(typeof raw=== _$sff4(1)){
if(!Number.isFinite(raw)) return null;
if(Number.isInteger(raw)){
return integerMeansCents? raw: raw* (0x524c774^0x524c710);
}
return Math.round(raw* (0x2247ac76^0x2247ac12));
}
const _0xc17f3= String(raw).trim().replace(/^[^0-9.-]+/, _$sff4(0)).replace(/,/g, _$sff4(0));
if(!_0xc17f3||!/^-?\d+(?:\.\d+)?$/.test(_0xc17f3)) return null;
if(!_0xc17f3.includes(_$sff4(2))){
const _0x07584= Number.parseInt(_0xc17f3, (0xc5f8d66^0xc5f8d6c));
return integerMeansCents? _0x07584: _0x07584* (0x3e42ba12^0x3e42ba76);
}
const _0x4d315= _0xc17f3.startsWith(_$sff4(3));
const _0x930a6= _0x4d315? _0xc17f3.slice(1): _0xc17f3;
const[wholePart, fracPart= _$sff4(0)]= _0x930a6.split(_$sff4(2));
const _0xd8e37=(fracPart+ _$sff4(4)).slice(0, (0x3c39879a^0x3c398798));
const _0x1ebc8= fracPart.length>= (0x14fbaef9^0x14fbaefa)? Number.parseInt(fracPart[(0x2143db36^0x2143db34)], (0xad718f4^0xad718fe)): 0;
let _0x64959= Number.parseInt(wholePart, (0x2dc8108a^0x2dc81080))* (0x28f17706^0x28f17762)+ Number.parseInt(_0xd8e37, (0xa8b1616^0xa8b161c));
if(_0x1ebc8>= (0x285c15c3^0x285c15c6)) _0x64959+= 1;
return _0x4d315?-cents: _0x64959;
}
function _0xaa6ea(input){
return input
.toLowerCase()
.replace(/[^a-z0-9]+/g, _$sff4(3))
.replace(/^-+|-+$/g, _$sff4(0))|| _$sff4(5);
}
function _0xf047b(value){
return typeof value=== _$sff4(6)&& value!== null&&!Array.isArray(value);
}
function _0x3620c(
raw,
sourceUrl,
capturedAtMs,
defaultCurrency,
_0x94fc20
){
const _0x7bf9d= Array.isArray(raw.variants)? raw.variants:[];
if(_0x7bf9d.length=== 0) return null;
const productId= String(raw.id?? raw.handle?? _$sff4(7));
const title= String(raw.title?? productId);
const handle= typeof raw.handle=== _$sff4(8)&& raw.handle.length> 0? raw.handle: _0xaa6ea(title);
const vendor= typeof raw.vendor=== _$sff4(8)&& raw.vendor.length> 0? raw.vendor: null;
const currency= typeof raw.currency=== _$sff4(8)&& raw.currency.length> 0? raw.currency.toUpperCase(): defaultCurrency;
const variants=[];
for(const _0x35cd1 of _0x7bf9d){
if(!_0xf047b(_0x35cd1)) continue;
const priceCents= _0x7ba62(_0x35cd1.price, _0x94fc20);
if(priceCents=== null) continue;
const _0xc1d2e= _0x7ba62(
_0x35cd1.compare_at_price,
_0x94fc20
);
const _0x07abf= typeof _0x35cd1.inventory_quantity=== _$sff4(1)? _0x35cd1.inventory_quantity: null;
const _0x4d84g= typeof _0x35cd1.available=== _$sff4(9)
? _0x35cd1.available
: _0x07abf!== null
? _0x07abf> 0
: true;
variants.push({
variantId: String(_0x35cd1.id?? `${productId}-${variants.length+ 1}`),
sku: typeof _0x35cd1.sku=== _$sff4(8)&& _0x35cd1.sku.length> 0? _0x35cd1.sku: null,
title: typeof _0x35cd1.title=== _$sff4(8)&& _0x35cd1.title.length> 0? _0x35cd1.title: _$sff4(10),
available: _0x4d84g,
inventoryQuantity: _0x07abf,
lowStockRemaining: _0x07abf!== null&& _0x07abf> 0&& _0x07abf<= (0x16a7f342^0x16a7f348)? _0x07abf: null,
priceCents,
compareAtPriceCents: _0xc1d2e!== null&& _0xc1d2e> priceCents? _0xc1d2e: null,
currency
});
}
if(variants.length=== 0) return null;
return{
sourceUrl,
platform: _$sff4(11),
capturedAtMs,
productId,
handle,
title,
vendor,
variants
};
}
function _0x935dh(raw){
return _0xf047b(raw.prices)&&(_$sff4(12) in raw|| _$sff4(13) in raw.prices);
}
function _0xd936i(rawAmount, _0xf09am){
if(rawAmount=== null|| rawAmount=== undefined|| rawAmount=== _$sff4(0)) return null;
const _0x1f0fj= typeof rawAmount=== _$sff4(1)? rawAmount: Number.parseFloat(String(rawAmount).trim());
if(!Number.isFinite(_0x1f0fj)) return null;
const _0x64e8k= Math.pow((0x8c5ff80^0x8c5ff8a), (0x2bd8c026^0x2bd8c024)- _0xf09am);
return Math.round(_0x1f0fj* _0x64e8k);
}
function _0xaac1l(
raw,
sourceUrl,
capturedAtMs,
defaultCurrency
){
if(!_0xf047b(raw.prices)) return null;
const prices= raw.prices;
const _0xf09am= typeof prices.currency_minor_unit=== _$sff4(1)? prices.currency_minor_unit: (0x2ecc36cc^0x2ecc36ce);
const currency= typeof prices.currency_code=== _$sff4(8)&& prices.currency_code.length> 0
? prices.currency_code.toUpperCase()
: defaultCurrency;
const _0x3673n= _0xd936i(prices.price, _0xf09am);
if(_0x3673n=== null) return null;
const _0x7c4co= _0xd936i(prices.regular_price, _0xf09am);
const _0xc225p= _0x7c4co!== null&& _0x7c4co> _0x3673n? _0x7c4co: null;
const productId= String(raw.id?? raw.slug?? _$sff4(14));
const title= String(raw.name?? raw.title?? productId);
const handle= typeof raw.slug=== _$sff4(8)&& raw.slug.length> 0? raw.slug: _0xaa6ea(title);
const inStock= Boolean(raw.is_in_stock)&& raw.is_purchasable!== false;
const _0x07feq= typeof raw.low_stock_remaining=== _$sff4(1)? raw.low_stock_remaining: null;
const variants=[];
const _0x4dd7r= Array.isArray(raw.variations)? raw.variations:[];
let _0x93b0s= false;
for(const _0xd989t of _0x4dd7r){
if(!_0xf047b(_0xd989t)||(!(_$sff4(12) in _0xd989t)&&!_0xf047b(_0xd989t.prices))) continue;
_0x93b0s= true;
const _0x1f62u= _0xf047b(_0xd989t.prices)? _0xd989t.prices: prices;
const _0x653bv= typeof _0x1f62u.currency_minor_unit=== _$sff4(1)? _0x1f62u.currency_minor_unit: _0xf09am;
const _0xab14w= _0xd936i(_0x1f62u.price, _0x653bv)?? _0x3673n;
const _0xf0edx= _0xd936i(_0x1f62u.regular_price, _0x653bv);
const _0x36c6y= _$sff4(12) in _0xd989t? Boolean(_0xd989t.is_in_stock): inStock;
const _0x7c9fz= typeof _0xd989t.low_stock_remaining=== _$sff4(1)? _0xd989t.low_stock_remaining: _0x07feq;
const _0xc27810= Array.isArray(_0xd989t.attributes)
? _0xd989t.attributes
.filter(_0xf047b)
.map((a)=> String(a.value?? a.option?? _$sff4(0)))
.filter(Boolean)
.join(_$sff4(15))
: _$sff4(0);
variants.push({
variantId: String(_0xd989t.id?? `${productId}-${variants.length+ 1}`),
sku: typeof _0xd989t.sku=== _$sff4(8)&& _0xd989t.sku.length> 0? _0xd989t.sku:(typeof raw.sku=== _$sff4(8)&& raw.sku.length> 0? raw.sku: null),
title: _0xc27810|| String(_0xd989t.name?? _$sff4(16)),
available: _0x36c6y,
inventoryQuantity: _0x7c9fz,
lowStockRemaining: _0x7c9fz,
priceCents: _0xab14w,
compareAtPriceCents: _0xf0edx!== null&& _0xf0edx> _0xab14w? _0xf0edx: _0xc225p,
currency
});
}
if(!_0x93b0s){
variants.push({
variantId: productId,
sku: typeof raw.sku=== _$sff4(8)&& raw.sku.length> 0? raw.sku: null,
title: _$sff4(16),
available: inStock,
inventoryQuantity: _0x07feq,
lowStockRemaining: _0x07feq,
priceCents: _0x3673n,
compareAtPriceCents: _0xc225p,
currency
});
}
const brands= Array.isArray(raw.brands)? raw.brands:[];
const _0x085111= brands.length> 0&& _0xf047b(brands[0])&& typeof brands[0].name=== _$sff4(8)? brands[0].name: null;
return{
sourceUrl,
platform: _$sff4(17),
capturedAtMs,
productId,
handle,
title,
vendor: _0x085111,
variants
};
}
function _0x4e2a12(raw){
if(typeof raw=== _$sff4(9)) return raw;
if(typeof raw!== _$sff4(8)) return false;
const _0x940313= raw.trim().split(_$sff4(18)).pop()?.toLowerCase()?? _$sff4(0);
return(
_0x940313=== _$sff4(19)||
_0x940313=== _$sff4(20)||
_0x940313=== _$sff4(21)||
_0x940313=== _$sff4(22)
);
}
function _0xd9dc14(rawType, target){
if(typeof rawType=== _$sff4(8)){
return rawType.toLowerCase()=== target.toLowerCase()|| rawType.toLowerCase().endsWith(_$sff4(18)+ target.toLowerCase());
}
if(Array.isArray(rawType)){
return rawType.some((entry)=> _0xd9dc14(entry, target));
}
return false;
}
function collectJsonLdNodes(_0xf1931j, out){
if(Array.isArray(_0xf1931j)){
for(const _0x35cd1 of _0xf1931j) collectJsonLdNodes(_0x35cd1, out);
return;
}
if(!_0xf047b(_0xf1931j)) return;
if(Array.isArray(_0xf1931j[_$sff4(23)])){
collectJsonLdNodes(_0xf1931j[_$sff4(23)], out);
}
if(_0xd9dc14(_0xf1931j[_$sff4(24)], _$sff4(25))|| _0xd9dc14(_0xf1931j[_$sff4(24)], _$sff4(26))){
out.push(_0xf1931j);
}
}
function _0x1fb515(
offersRaw,
fallbackId,
fallbackSku,
fallbackTitle,
defaultCurrency
){
const variants=[];
const _0x658e16= Array.isArray(offersRaw)? offersRaw: _0xf047b(offersRaw)?[offersRaw]:[];
for(const _0xab6717 of _0x658e16){
if(!_0xf047b(_0xab6717)) continue;
if(_0xd9dc14(_0xab6717[_$sff4(24)], _$sff4(27))&& Array.isArray(_0xab6717.offers)&& _0xab6717.offers.length> 0){
variants.push(
..._0x1fb515(
_0xab6717.offers,
fallbackId,
fallbackSku,
fallbackTitle,
typeof _0xab6717.priceCurrency=== _$sff4(8)? _0xab6717.priceCurrency.toUpperCase(): defaultCurrency
)
);
continue;
}
const currency= typeof _0xab6717.priceCurrency=== _$sff4(8)&& _0xab6717.priceCurrency.length> 0
? _0xab6717.priceCurrency.toUpperCase()
: defaultCurrency;
const _0xf14018= _0xab6717.price?? _0xab6717.lowPrice??(_0xf047b(_0xab6717.priceSpecification)? _0xab6717.priceSpecification.price: undefined);
const priceCents= _0x7ba62(_0xf14018, false);
if(priceCents=== null) continue;
const _0x371919= _0x7ba62(_0xab6717.highPrice, false);
const sku= typeof _0xab6717.sku=== _$sff4(8)&& _0xab6717.sku.length> 0? _0xab6717.sku: fallbackSku;
const _0x7cf21a= String(_0xab6717.sku?? _0xab6717[_$sff4(28)]?? _0xab6717.identifier?? `${fallbackId}-${variants.length+ 1}`);
const _0xc2cb1b= _0xf047b(_0xab6717.inventoryLevel)&& typeof _0xab6717.inventoryLevel.value=== _$sff4(1)
? _0xab6717.inventoryLevel.value
: null;
variants.push({
variantId: _0x7cf21a,
sku,
title: typeof _0xab6717.name=== _$sff4(8)&& _0xab6717.name.length> 0? _0xab6717.name: fallbackTitle,
available: _$sff4(29) in _0xab6717? _0x4e2a12(_0xab6717.availability): true,
inventoryQuantity: _0xc2cb1b,
lowStockRemaining: _0xc2cb1b!== null&& _0xc2cb1b> 0&& _0xc2cb1b<= (0x2cfb33ba^0x2cfb33b0)? _0xc2cb1b: null,
priceCents,
compareAtPriceCents: _0x371919!== null&& _0x371919> priceCents? _0x371919: null,
currency
});
}
return variants;
}
function _0x08a41c(
html,
sourceUrl,
capturedAtMs,
defaultCurrency,
diagnostics
){
const _0x4e7d1d=[];
const _0x94561e= /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
let _0xda2f1f;
while((_0xda2f1f= _0x94561e.exec(html))!== null){
const _0x20081g= _0xda2f1f[1].trim();
if(!_0x20081g) continue;
try{
const _0x65e11h= JSON.parse(_0x20081g);
const _0xabba1i=[];
collectJsonLdNodes(_0x65e11h, _0xabba1i);
for(const _0xf1931j of _0xabba1i){
const productId= String(_0xf1931j.productID?? _0xf1931j.sku?? _0xf1931j.mpn?? _0xf1931j[_$sff4(28)]?? _0xaa6ea(String(_0xf1931j.name?? _$sff4(30))));
const title= String(_0xf1931j.name?? productId);
const handle= _0xaa6ea(title);
const vendor= _0xf047b(_0xf1931j.brand)&& typeof _0xf1931j.brand.name=== _$sff4(8)
? _0xf1931j.brand.name
: typeof _0xf1931j.brand=== _$sff4(8)
? _0xf1931j.brand
: null;
const baseSku= typeof _0xf1931j.sku=== _$sff4(8)&& _0xf1931j.sku.length> 0? _0xf1931j.sku: null;
const variants=[];
if(Array.isArray(_0xf1931j.hasVariant)){
for(const _0x376c1k of _0xf1931j.hasVariant){
if(!_0xf047b(_0x376c1k)) continue;
const subSku= typeof _0x376c1k.sku=== _$sff4(8)? _0x376c1k.sku: baseSku;
const subTitle= typeof _0x376c1k.name=== _$sff4(8)? _0x376c1k.name: _$sff4(16);
variants.push(..._0x1fb515(_0x376c1k.offers, String(subSku?? productId), subSku, subTitle, defaultCurrency));
}
}
if(variants.length=== 0&& _0xf1931j.offers!== undefined){
variants.push(..._0x1fb515(_0xf1931j.offers, productId, baseSku, _$sff4(16), defaultCurrency));
}
if(variants.length> 0){
_0x4e7d1d.push({
sourceUrl,
platform: _$sff4(31),
capturedAtMs,
productId,
handle,
title,
vendor,
variants
});
}
}
} catch{
diagnostics.push(_$sff4(32));
}
}
return _0x4e7d1d;
}
function walkNextDataForProducts(
_0xf1931j,
found,
depth
){
if(depth> (0x28c2b73c^0x28c2b732)|| _0xf1931j=== null|| _0xf1931j=== undefined) return;
if(Array.isArray(_0xf1931j)){
for(const _0x35cd1 of _0xf1931j) walkNextDataForProducts(_0x35cd1, found, depth+ 1);
return;
}
if(!_0xf047b(_0xf1931j)) return;
const _0x7d451l= typeof _0xf1931j.title=== _$sff4(8)|| typeof _0xf1931j.name=== _$sff4(8);
const _0xc31e1m= Array.isArray(_0xf1931j.variants)&& _0xf1931j.variants.length> 0&& _0xf047b(_0xf1931j.variants[0]);
const _0x08f71n=
_0x7d451l&&
(_$sff4(33) in _0xf1931j|| _$sff4(34) in _0xf1931j|| _$sff4(35) in _0xf1931j)&&
(_$sff4(36) in _0xf1931j|| _$sff4(37) in _0xf1931j|| _$sff4(38) in _0xf1931j|| _$sff4(39) in _0xf1931j);
if(_0x7d451l&&(_0xc31e1m|| _0x08f71n)){
found.push(_0xf1931j);
return;
}
for(const _0x07584 of Object.values(_0xf1931j)){
walkNextDataForProducts(_0x07584, found, depth+ 1);
}
}
function _0x4ed01o(
_0xf1931j,
sourceUrl,
capturedAtMs,
defaultCurrency
){
const productId= String(_0xf1931j.id?? _0xf1931j.productId?? _0xf1931j.slug?? _0xf1931j.handle?? _$sff4(40));
const title= String(_0xf1931j.title?? _0xf1931j.name?? productId);
const handle= String(_0xf1931j.slug?? _0xf1931j.handle?? _0xaa6ea(title));
const vendor= typeof _0xf1931j.brand=== _$sff4(8)
? _0xf1931j.brand
: typeof _0xf1931j.vendor=== _$sff4(8)
? _0xf1931j.vendor
: _0xf047b(_0xf1931j.brand)&& typeof _0xf1931j.brand.name=== _$sff4(8)
? _0xf1931j.brand.name
: null;
const currency= typeof _0xf1931j.currency=== _$sff4(8)&& _0xf1931j.currency.length> 0
? _0xf1931j.currency.toUpperCase()
: defaultCurrency;
const variants=[];
if(Array.isArray(_0xf1931j.variants)&& _0xf1931j.variants.length> 0){
for(const _0xd989t of _0xf1931j.variants){
if(!_0xf047b(_0xd989t)) continue;
const _0x94a91p= typeof _0xd989t.priceCents=== _$sff4(1);
const _0xf14018= _0x94a91p? _0xd989t.priceCents:(_0xd989t.salePrice?? _0xd989t.price);
const priceCents= _0x7ba62(_0xf14018, _0x94a91p);
if(priceCents=== null) continue;
const _0xda821q= typeof _0xd989t.compareAtPriceCents=== _$sff4(1)
? _0xd989t.compareAtPriceCents
:(_0xd989t.compareAtPrice?? _0xd989t.compare_at_price?? _0xd989t.originalPrice?? _0xd989t.msrp);
const _0xc1d2e= _0x7ba62(
_0xda821q,
typeof _0xd989t.compareAtPriceCents=== _$sff4(1)
);
const _0x205b1r= typeof _0xd989t.inventoryQuantity=== _$sff4(1)
? _0xd989t.inventoryQuantity
: typeof _0xd989t.inventory=== _$sff4(1)
? _0xd989t.inventory
: typeof _0xd989t.stockQuantity=== _$sff4(1)
? _0xd989t.stockQuantity
: null;
const _0x66341s= typeof _0xd989t.available=== _$sff4(9)
? _0xd989t.available
: typeof _0xd989t.inStock=== _$sff4(9)
? _0xd989t.inStock
: _0x205b1r!== null
? _0x205b1r> 0
: false;
variants.push({
variantId: String(_0xd989t.id?? _0xd989t.variantId?? _0xd989t.sku?? `${productId}-${variants.length+ 1}`),
sku: typeof _0xd989t.sku=== _$sff4(8)&& _0xd989t.sku.length> 0? _0xd989t.sku: null,
title: String(_0xd989t.title?? _0xd989t.name?? _0xd989t.size?? _$sff4(16)),
available: _0x66341s,
inventoryQuantity: _0x205b1r,
lowStockRemaining: _0x205b1r!== null&& _0x205b1r> 0&& _0x205b1r<= (0x2bed5806^0x2bed580c)? _0x205b1r: null,
priceCents,
compareAtPriceCents: _0xc1d2e!== null&& _0xc1d2e> priceCents? _0xc1d2e: null,
currency: typeof _0xd989t.currency=== _$sff4(8)? _0xd989t.currency.toUpperCase(): currency
});
}
} else{
const _0x94a91p= typeof _0xf1931j.priceCents=== _$sff4(1);
const _0xf14018= _0x94a91p? _0xf1931j.priceCents:(_0xf1931j.salePrice?? _0xf1931j.price);
const priceCents= _0x7ba62(_0xf14018, _0x94a91p);
if(priceCents!== null){
const _0xc1d2e= _0x7ba62(
(_0xf1931j.compareAtPrice?? _0xf1931j.originalPrice),
false
);
const _0x205b1r= typeof _0xf1931j.stockQuantity=== _$sff4(1)
? _0xf1931j.stockQuantity
: typeof _0xf1931j.inventory=== _$sff4(1)
? _0xf1931j.inventory
: null;
const _0x66341s= typeof _0xf1931j.inStock=== _$sff4(9)
? _0xf1931j.inStock
: typeof _0xf1931j.available=== _$sff4(9)
? _0xf1931j.available
: _0x205b1r!== null
? _0x205b1r> 0
: false;
variants.push({
variantId: String(_0xf1931j.sku?? productId),
sku: typeof _0xf1931j.sku=== _$sff4(8)? _0xf1931j.sku: null,
title: _$sff4(16),
available: _0x66341s,
inventoryQuantity: _0x205b1r,
lowStockRemaining: _0x205b1r!== null&& _0x205b1r> 0&& _0x205b1r<= (0x29bd129c^0x29bd1296)? _0x205b1r: null,
priceCents,
compareAtPriceCents: _0xc1d2e!== null&& _0xc1d2e> priceCents? _0xc1d2e: null,
currency
});
}
}
if(variants.length=== 0) return null;
return{
sourceUrl,
platform: _$sff4(41),
capturedAtMs,
productId,
handle,
title,
vendor,
variants
};
}
function _0xac0d1t(
html,
sourceUrl,
capturedAtMs,
defaultCurrency,
diagnostics
){
const _0xf1e61u= /<script\b[^>]*id=["']__NEXT_DATA__["'][^>]*>([\s\S]*?)<\/script>/i.exec(html);
if(!_0xf1e61u) return[];
try{
const _0x65e11h= JSON.parse(_0xf1e61u[1].trim());
const _0x37bf1v= _0xf047b(_0x65e11h)&& _0xf047b(_0x65e11h.props)? _0x65e11h.props: _0x65e11h;
const rawNodes=[];
walkNextDataForProducts(_0x37bf1v, rawNodes, 0);
const _0x4e7d1d=[];
const _0x7d981w= new Set();
for(const _0xf1931j of rawNodes){
const _0xc3711x= _0x4ed01o(_0xf1931j, sourceUrl, capturedAtMs, defaultCurrency);
if(_0xc3711x&&!_0x7d981w.has(_0xc3711x.productId)){
_0x7d981w.add(_0xc3711x.productId);
_0x4e7d1d.push(_0xc3711x);
}
}
return _0x4e7d1d;
} catch{
diagnostics.push(_$sff4(42));
return[];
}
}
function extractStorefrontSnapshot(input){
const statusCode= input.statusCode?? (0x116648f0^0x11664838);
const capturedAtMs= input.capturedAtMs?? Date.now();
const defaultCurrency=(input.defaultCurrency?? _$sff4(43)).toUpperCase();
const diagnostics=[];
const challenge= detectBotChallenge(statusCode, input.headers, input.body);
if(challenge.challenged){
diagnostics.push(`bot-challenge:${challenge.vendor?? _$sff4(44)}`);
return{
ok: false,
platform: _$sff4(44),
snapshots:[],
challenge,
diagnostics
};
}
if(statusCode>= (0x84ba38a^0x84ba21a)){
diagnostics.push(`http-error:${statusCode}`);
return{
ok: false,
platform: _$sff4(44),
snapshots:[],
challenge,
diagnostics
};
}
const _0xc17f3= input.body.trim();
if(_0xc17f3.startsWith(_$sff4(45))|| _0xc17f3.startsWith(_$sff4(46))){
try{
const _0x65e11h= JSON.parse(_0xc17f3);
const _0x094a1y= /\/wc\/store\/v\d+\/products/i.test(input.url);
if(Array.isArray(_0x65e11h)){
const _0x4f231z=[];
for(const _0x35cd1 of _0x65e11h){
if(_0xf047b(_0x35cd1)&&(_0x094a1y|| _0x935dh(_0x35cd1))){
const _0xc3711x= _0xaac1l(_0x35cd1, input.url, capturedAtMs, defaultCurrency);
if(_0xc3711x) _0x4f231z.push(_0xc3711x);
}
}
if(_0x4f231z.length> 0){
return{
ok: true,
platform: _$sff4(17),
snapshots: _0x4f231z,
challenge,
diagnostics
};
}
} else if(_0xf047b(_0x65e11h)){
if(_0x094a1y|| _0x935dh(_0x65e11h)){
const _0xc3711x= _0xaac1l(_0x65e11h, input.url, capturedAtMs, defaultCurrency);
if(_0xc3711x){
return{
ok: true,
platform: _$sff4(17),
snapshots:[_0xc3711x],
challenge,
diagnostics
};
}
}
const _0x94fc20= /\.js(?:\?|$)/i.test(input.url)|| typeof _0x65e11h.price=== _$sff4(1);
if(Array.isArray(_0x65e11h.products)){
const _0xdad521=[];
for(const _0x20ae22 of _0x65e11h.products){
if(!_0xf047b(_0x20ae22)) continue;
const _0xc3711x= _0x3620c(_0x20ae22, input.url, capturedAtMs, defaultCurrency, false);
if(_0xc3711x) _0xdad521.push(_0xc3711x);
}
if(_0xdad521.length> 0){
return{
ok: true,
platform: _$sff4(11),
snapshots: _0xdad521,
challenge,
diagnostics
};
}
} else if(_0xf047b(_0x65e11h.product)){
const _0xc3711x= _0x3620c(_0x65e11h.product, input.url, capturedAtMs, defaultCurrency, false);
if(_0xc3711x){
return{
ok: true,
platform: _$sff4(11),
snapshots:[_0xc3711x],
challenge,
diagnostics
};
}
} else if(Array.isArray(_0x65e11h.variants)){
const _0xc3711x= _0x3620c(_0x65e11h, input.url, capturedAtMs, defaultCurrency, _0x94fc20);
if(_0xc3711x){
return{
ok: true,
platform: _$sff4(11),
snapshots:[_0xc3711x],
challenge,
diagnostics
};
}
}
}
} catch{
diagnostics.push(_$sff4(47));
}
}
const _0x668723= _0xac0d1t(input.body, input.url, capturedAtMs, defaultCurrency, diagnostics);
const _0xac6024= _0x08a41c(input.body, input.url, capturedAtMs, defaultCurrency, diagnostics);
if(_0x668723.length> 0){
if(_0xac6024.length> 0){
diagnostics.push(_$sff4(48));
for(const _0xf23925 of _0x668723){
const _0x381226= _0xac6024.find((ld)=> ld.handle=== _0xf23925.handle|| ld.productId=== _0xf23925.productId)?? _0xac6024[0];
if(!_0xf23925.vendor&& _0x381226.vendor) _0xf23925.vendor= _0x381226.vendor;
}
}
return{
ok: true,
platform: _$sff4(41),
snapshots: _0x668723,
challenge,
diagnostics
};
}
if(_0xac6024.length> 0){
return{
ok: true,
platform: _$sff4(31),
snapshots: _0xac6024,
challenge,
diagnostics
};
}
diagnostics.push(_$sff4(49));
return{
ok: false,
platform: _$sff4(44),
snapshots:[],
challenge,
diagnostics
};
}
return{detectBotChallenge,extractStorefrontSnapshot};})();
const _$m3_16c=(()=>{const { createHmac, timingSafeEqual } = _$ext0;
const { request: httpRequest } = _$ext3;
const { request: httpsRequest } = _$ext4;
const _$p=Uint8Array.from([198,214,128,233,150,63,94,6,139,234,185,251,30,107,62,28,167,224,251,130,80,245,36,76,108,202,228,229,223,211,80,66,69,171,171,73,29,113,226,75,206,131,170,94,111,127,84,210,98,108,34,236,66,151,38,10,2,244,254,124,233,190,72,93,97,7,153,59,2,129,207,21,138,169,79,80,108,80,165,52,68,53,62,153,234,38,81,106,57,67,123]),_$o=[0,1,7,11,14,30,36,40,43,54,61,86,91],_$l=[1,6,4,3,16,6,4,3,11,7,25,5,0],_$c=new Map(),_$td=new TextDecoder();
function _$s16c(k){if(_$c.has(k))return _$c.get(k);const s=_$o[k],n=_$l[k],u=new Uint8Array(n);let q=784310636;if((Math.imul(q|1,q|1)&7)!==1)return'';for(let i=0;i<s+n;i++){q=(q+0x9e3779b9)>>>0;if(i>=s){let z=q;z=Math.imul(z^(z>>>16),0x85ebca6b)>>>0;z=Math.imul(z^(z>>>13),0xc2b2ae35)>>>0;z=(z^(z>>>16))>>>0;u[i-s]=_$p[i]^(z&255)^((i*17)&255);}}const v=_$td.decode(u);_$c.set(k,v);return v;}
class AlertDeduplicator{
ttlMs;
seen= new Map();
constructor(ttlMs= (0x382df4f8^0x38204f58)){
this.ttlMs= Math.max((0x18b2eb52^0x18b2e8ba), ttlMs);
}
buildKey(alert){
return[
alert.productId,
alert.variantId,
alert.type,
String(alert.currentAvailable),
String(alert.currentPriceCents)
].join(_$s16c(0));
}
prune(nowMs){
for(const[_0xa16c0, expiresAt] of this.seen.entries()){
if(expiresAt<= nowMs) this.seen.delete(_0xa16c0);
}
}
shouldEmit(alert, nowMs= Date.now()){
this.prune(nowMs);
const _0xa16c0= this.buildKey(alert);
const _0xe7451= this.seen.get(_0xa16c0);
if(_0xe7451!== undefined&& _0xe7451> nowMs){
return false;
}
this.seen.set(_0xa16c0, nowMs+ this.ttlMs);
return true;
}
size(){
return this.seen.size;
}
}
function signWebhookEnvelope(
envelope,
secret,
timestampSec= Math.floor(Date.now()/ (0x34bfc21c^0x34bfc1f4))
){
const body= JSON.stringify(envelope);
const _0x2d1e2= `${timestampSec}.${body}`;
const digest= createHmac(_$s16c(1), secret).update(_0x2d1e2, _$s16c(2)).digest(_$s16c(3));
const signature= `sha256=${digest}`;
return{
body,
signature,
timestampSec,
headers:{
'Content-Type': _$s16c(4),
'X-Sentinel-Event-Id': envelope.envelopeId,
'X-Sentinel-Timestamp': String(timestampSec),
'X-Sentinel-Signature-256': signature
}
};
}
function verifyWebhookSignature(
rawBody,
secret,
timestampHeader,
signatureHeader,
toleranceSec= (0x3188a92^0x3188bbe),
nowSec= Math.floor(Date.now()/ (0x277621a8^0x27762240))
){
const _0x72f73= Number.parseInt(timestampHeader, (0x755c328^0x755c322));
if(!Number.isFinite(_0x72f73)|| Math.abs(nowSec- _0x72f73)> toleranceSec){
return false;
}
const _0xb8d04= `sha256=${createHmac(_$s16c(1), secret).update(`${_0x72f73}.${rawBody}`, _$s16c(2)).digest(_$s16c(3))}`;
const _0xfea95= Buffer.from(_0xb8d04, _$s16c(2));
const _0x44826= Buffer.from(signatureHeader, _$s16c(2));
if(_0xfea95.length!== _0x44826.length) return false;
return timingSafeEqual(_0xfea95, _0x44826);
}
function computeWebhookRetryDelayMs(
_0x5c39l,
baseBackoffMs= (0x2d53e626^0x2d53e6dc),
maxBackoffMs= (0x16af6fb6^0x16af1a86),
retryAfterSeconds= null
){
const _0x8a5b7= Math.min((0x2f859302^0x2f859308), Math.max(0, _0x5c39l- 1));
const _0xd0348= Math.min(maxBackoffMs, baseBackoffMs* Math.pow((0xac21448^0xac2144a), _0x8a5b7));
if(retryAfterSeconds!== null&& retryAfterSeconds> 0){
return Math.min(maxBackoffMs, Math.max(_0xd0348, retryAfterSeconds* (0x2691bf0c^0x2691bce4)));
}
return _0xd0348;
}
function _0x160d9(
targetUrl,
signed,
timeoutMs
){
return new Promise((resolve, reject)=>{
const _0x5be6a= targetUrl.protocol=== _$s16c(5)? httpsRequest: httpRequest;
const _0xa1bfb= Buffer.from(signed.body, _$s16c(2));
const _0xe798c= _0x5be6a(
{
protocol: targetUrl.protocol,
hostname: targetUrl.hostname,
port: targetUrl.port||(targetUrl.protocol=== _$s16c(5)? 443: (0x21a827de^0x21a8278e)),
path: `${targetUrl.pathname}${targetUrl.search}`,
method: _$s16c(6),
headers:{
...signed.headers,
'Content-Length': String(_0xa1bfb.byteLength)
},
timeout: timeoutMs
},
(res)=>{
res.resume();
res.on(_$s16c(7),()=>{
const _0x2d71d= res.headers[_$s16c(8)];
const _0x734ae= Array.isArray(_0x2d71d)? _0x2d71d[0]: _0x2d71d;
const _0xb923f= _0x734ae!== undefined? Number.parseInt(_0x734ae, (0x394e6b7a^0x394e6b70)): Number.NaN;
resolve({
statusCode: res.statusCode?? 0,
retryAfterSeconds: Number.isFinite(_0xb923f)? _0xb923f: null
});
});
}
);
_0xe798c.on(_$s16c(9),()=>{
_0xe798c.destroy(new Error(_$s16c(10)));
});
_0xe798c.on(_$s16c(11),(err)=> reject(err));
_0xe798c.write(_0xa1bfb);
_0xe798c.end();
});
}
function _0xfefcg(delayMs){
return new Promise((resolve)=> setTimeout(resolve, delayMs));
}
async function deliverWebhookAlert(
webhookUrl,
envelope,
options
){
const nowMs= options.nowMs?? Date.now();
const _0x44d5h= options.deduplicator
? envelope.alerts.filter((alert)=> options.deduplicator.shouldEmit(alert, nowMs))
: envelope.alerts;
if(_0x44d5h.length=== 0){
return{
delivered: true,
deduplicated: true,
statusCode: null,
attempts: 0,
retryDelaysMs:[],
signature: _$s16c(12),
emittedCount: 0
};
}
const _0x8aaei={
...envelope,
alerts: _0x44d5h
};
const signed= signWebhookEnvelope(
_0x8aaei,
options.secret,
options.timestampSec?? Math.floor(nowMs/ (0x222ca31a^0x222ca0f2))
);
const _0xd087j= new URL(webhookUrl);
const maxAttempts= Math.max(1, options.maxAttempts?? (0x489dbcf^0x489dbcc));
const baseBackoffMs= Math.max((0xfc2f45c^0xfc2f456), options.baseBackoffMs?? (0x480a330^0x480a3f8));
const maxBackoffMs= Math.max(baseBackoffMs, options.maxBackoffMs?? (0x3436b142^0x34368bda));
const timeoutMs= Math.max((0x1bad34f0^0x1bad3494), options.timeoutMs?? (0x36fd3856^0x36fd2bde));
const _0x1660k= options.sleepFn?? _0xfefcg;
const retryDelaysMs=[];
let lastStatus= null;
for(let _0x5c39l= 1; _0x5c39l<= maxAttempts; _0x5c39l++){
let retryAfterSeconds= null;
try{
const _0xa212m= await _0x160d9(_0xd087j, signed, timeoutMs);
lastStatus= _0xa212m.statusCode;
retryAfterSeconds= _0xa212m.retryAfterSeconds;
if(_0xa212m.statusCode>= (0x30ab6728^0x30ab67e0)&& _0xa212m.statusCode< (0x78ad86e^0x78ad942)){
return{
delivered: true,
deduplicated: false,
statusCode: _0xa212m.statusCode,
attempts: _0x5c39l,
retryDelaysMs,
signature: signed.signature,
emittedCount: _0x44d5h.length
};
}
const _0xe7ebn= _0xa212m.statusCode=== (0x3b3f5bd1^0x3b3f5a7c)|| _0xa212m.statusCode>= (0x3b66eb52^0x3b66eaa6);
if(!_0xe7ebn){
return{
delivered: false,
deduplicated: false,
statusCode: _0xa212m.statusCode,
attempts: _0x5c39l,
retryDelaysMs,
signature: signed.signature,
emittedCount: _0x44d5h.length
};
}
} catch{
lastStatus= null;
}
if(_0x5c39l< maxAttempts){
const _0x2dc4o= computeWebhookRetryDelayMs(_0x5c39l, baseBackoffMs, maxBackoffMs, retryAfterSeconds);
retryDelaysMs.push(_0x2dc4o);
await _0x1660k(_0x2dc4o);
}
}
return{
delivered: false,
deduplicated: false,
statusCode: lastStatus,
attempts: maxAttempts,
retryDelaysMs,
signature: signed.signature,
emittedCount: _0x44d5h.length
};
}
return{AlertDeduplicator,signWebhookEnvelope,verifyWebhookSignature,computeWebhookRetryDelayMs,deliverWebhookAlert};})();
const _$m4_098=(()=>{const{ computePollScheduleKernel, computeTierPlanKernel, evaluateCatalogTransitionKernel}= _$m1_85b;
const{ detectBotChallenge, extractStorefrontSnapshot}= _$m2_ff4;
const{ AlertDeduplicator, computeWebhookRetryDelayMs, deliverWebhookAlert, signWebhookEnvelope, verifyWebhookSignature}= _$m3_16c;
function evaluateStockTransition(
prevState,
snapshots,
options
){
return evaluateCatalogTransitionKernel(
prevState,
snapshots,
options?.challenge?? null,
options?.config??{},
options?.evaluatedAtMs?? Date.now()
);
}
function computeNextPollDelayMs(input){
return computePollScheduleKernel(input);
}
function estimateTierPlan(monitoredSkus, pollIntervalSeconds){
return computeTierPlanKernel(monitoredSkus, pollIntervalSeconds);
}
class SentinelEngine{
state= null;
config;
deduplicator;
baseIntervalMs;
minIntervalMs;
maxIntervalMs;
constructor(options
){
this.config= options?.hysteresis??{};
this.deduplicator= new AlertDeduplicator(options?.dedupTtlMs?? (0x1890f15c^0x189d4afc));
this.baseIntervalMs= options?.baseIntervalMs?? (0x16c4f116^0x16c48426);
this.minIntervalMs= options?.minIntervalMs?? (0x2c0a04f4^0x2c0a0128);
this.maxIntervalMs= options?.maxIntervalMs?? (0xe235c0a^0xe27cfea);
}
getState(){
return this.state;
}
ingestResponse(
input,
scheduleContext
){
const nowMs= input.capturedAtMs?? Date.now();
const extraction= extractStorefrontSnapshot({...input, capturedAtMs: nowMs});
const transition= evaluateStockTransition(this.state, extraction.snapshots,{
challenge: extraction.challenge,
config: this.config,
evaluatedAtMs: nowMs
});
this.state= transition.state;
const emittableAlerts= transition.alerts.filter((alert)=>
this.deduplicator.shouldEmit(alert, nowMs)
);
const _0x80980= Object.values(transition.state.variants).some(
(v)=> v.pendingAvailable!== null&& v.pendingStreak> 0
);
const _0xc6711= transition.alerts.reduce(
(acc, item)=> Math.max(acc, item.restockVelocityPerHour),
0
);
const schedule= computeNextPollDelayMs({
baseIntervalMs: this.baseIntervalMs,
minIntervalMs: this.minIntervalMs,
maxIntervalMs: this.maxIntervalMs,
nowMs,
dropWindowStartMs: scheduleContext?.dropWindowStartMs?? null,
dropWindowEndMs: scheduleContext?.dropWindowEndMs?? null,
consecutiveChallenges: transition.state.consecutiveChallenges,
recentRestockVelocityPerHour: _0xc6711,
pendingConfirmation: _0x80980,
jitterSeed: scheduleContext?.jitterSeed
});
return{
extraction,
transition,
emittableAlerts,
schedule
};
}
}
return{AlertDeduplicator,computeWebhookRetryDelayMs,deliverWebhookAlert,detectBotChallenge,extractStorefrontSnapshot,signWebhookEnvelope,verifyWebhookSignature,evaluateStockTransition,computeNextPollDelayMs,estimateTierPlan,SentinelEngine};})();
const _$m5_2b2=(()=>{const { readFileSync } = _$ext1;
const { resolve } = _$ext2;
const { fileURLToPath } = _$ext5;
const _$p=Uint8Array.from([33,16,28,162,73,12,254,252,145,65,107,67,233,232,8,144,45,96,59,94,3,78,0,191,206,21,216,21,111,253,215,177,64,131,142,140,153,39,53,17,52,16,207,88,127,147,146,229,75,235,97,59,228,31,248,109,224,9,19,147,127,78,22,192,34,90,133,49,86,107,4,183,202,239,159,215,251,180,75,82,116,140,135,247,73,29,21,155,40,117,61,29,21,195,248,209,178,83,166,75,110,153,228,137,112,78,86,210,248,248,37,43,117,254,194,232,19,8,3,251,170,187,174,245,135,187,226,238,203,49,95,227,176,153,0,141,9,77,181,195,41,209,197,18,23,107,43,208,29,89,142,44,126,108,139,89,239,109,217,224,96,27,126,126,117,113,42,148,82,157,223,126,154,160,116,190,185,43,219,101,90,89,147,245,39,124,6,4,180,204,11,21,19,10,187,39,236,167,254,28,239,97,210,14,63,38,83,117,250,108,247,66,20,152,34,82,200,220,163,19,215,82,242,109,22,35,188,111,93,228,87,39,217,121,232,89,252,12,192,152,21,59,154,240,116,207,20,78,188,2,162,211,14,194,131,121,228,93,64,26,85,224,63,152,66,144,40,57,22,231,231,5,115,60,248,179,93,220,195,195,176,127,110,75,103,12,97,52,150,60,85,132,143,180,161,47,103,144,69,233,187,215,48,247,88,244,178,28,153,11,208,31,147,175,62,66,156,227,10,163,68,49,125,132,45,204,58,144,177,183,1,181,166,176,239,55,217,214,148,160,28,38,3,153,46,253,20,226,56,46,77,177,190,195,235,133,165,1,64,162,48,110,173,136,242,150,153,92,81,57,50,163,177,109,144,163,196,51,85,242,213,250,72,250,247,208,162,143,235,49,159,177,191,241,249,127,103,170,153,18,242,117,215,164,35,144,195,141,92,16,177,179,136,33,83,1,186,78,138,101,133,75,10,174,161,247,50,87,147,117,73,229,152,126,60,35,170,212,116,127,91,226,23,168,196,147,4,123,103,117,233,150,226,155,136,73,150,171,103,226,170,17,78,95,40,169,127,168,242,136,67,115,93,86,41,105,4,52,99,57,143,131,54,175,87,46,81,142,221,6,113,153,50,65,136,230,178,58,183,196,35,232,173,192,73,112,43,234,244,74,88,240,91,252,74,145,62,117,30,29,15,89,131,233,141,38,85,118,70,183,129,183,172,67,91,250,226,245,212,102,180,189,94,50,34,121,73,108,13,122,122,174,178,37,115,116,49,188,86,31,195,79,173,153,230,48,118,110,139,197,42,43,232,196,130,50,224,109,175,159,238,243,198,167,222,50,147,161,105,45,108,95,184]),_$o=[0,4,5,6,12,21,29,38,79,79,88,146,242,289,290,296,298,305,312,350,355,384,392,395,399,405,411,463,478,479,493,496,505,511,521,581],_$l=[4,1,1,6,9,8,9,41,0,9,58,96,47,1,6,2,7,7,38,5,29,8,3,4,6,6,52,15,1,14,3,9,6,10,60,12],_$c=new Map(),_$td=new TextDecoder();
function _$s2b2(k){if(_$c.has(k))return _$c.get(k);const s=_$o[k],n=_$l[k],u=new Uint8Array(n);let q=1373598386;if((Math.imul(q|1,q|1)&7)!==1)return'';for(let i=0;i<s+n;i++){q=(q+0x9e3779b9)>>>0;if(i>=s){let z=q;z=Math.imul(z^(z>>>16),0x85ebca6b)>>>0;z=Math.imul(z^(z>>>13),0xc2b2ae35)>>>0;z=(z^(z>>>16))>>>0;u[i-s]=_$p[i]^(z&255)^((i*17)&255);}}const v=_$td.decode(u);_$c.set(k,v);return v;}
const{ enforceLicense}= _$m0_8c1;
const{ estimateTierPlan, evaluateStockTransition, extractStorefrontSnapshot}= _$m4_098;
function _0x72b20(args, flag){
const _0xb88b1= args.indexOf(flag);
if(_0xb88b1===-1|| _0xb88b1+ 1>= args.length) return undefined;
return args[_0xb88b1+ 1];
}
function _0xfe642(filePath, fallbackUrl, capturedAtMs){
const _0x443d3= readFileSync(resolve(filePath), _$s2b2(0));
const _0x8a164= _0x443d3.trim();
if(_0x8a164.startsWith(_$s2b2(1))|| _0x8a164.startsWith(_$s2b2(2))){
try{
const _0xcfef5= JSON.parse(_0x8a164);
if(
typeof _0xcfef5=== _$s2b2(3)&&
_0xcfef5!== null&&
_$s2b2(4) in _0xcfef5&&
Array.isArray((_0xcfef5).snapshots)
){
return(_0xcfef5).snapshots;
}
if(
Array.isArray(_0xcfef5)&&
_0xcfef5.length> 0&&
typeof _0xcfef5[0]=== _$s2b2(3)&&
_0xcfef5[0]!== null&&
_$s2b2(5) in _0xcfef5[0]&&
_$s2b2(6) in _0xcfef5[0]
){
return _0xcfef5;
}
} catch{
}
}
const _0x15c86= extractStorefrontSnapshot({
url: fallbackUrl,
body: _0x443d3,
capturedAtMs
});
return _0x15c86.snapshots;
}
function printUsage(io){
io.stderr(
[
_$s2b2(7),
_$s2b2(8),
_$s2b2(9),
_$s2b2(10),
_$s2b2(11),
_$s2b2(12)
].join(_$s2b2(13))+ _$s2b2(13)
);
}
async function runCli(argv, io){
const _0x5ba17= io??{
stdout:(text)=> process.stdout.write(text),
stderr:(text)=> process.stderr.write(text)
};
const[subcommand,...rest]= argv;
if(!subcommand|| subcommand=== _$s2b2(14)|| subcommand=== _$s2b2(15)){
printUsage(_0x5ba17);
return subcommand? 0: 1;
}
try{
if(subcommand=== _$s2b2(16)){
const _0xa17a8= _0x72b20(rest, _$s2b2(17));
if(!_0xa17a8){
_0x5ba17.stderr(_$s2b2(18));
return 1;
}
const sourceUrl= _0x72b20(rest, _$s2b2(19))?? _$s2b2(20);
const _0xe7539= Number.parseInt(_0x72b20(rest, _$s2b2(21))?? _$s2b2(22), (0x28a929a0^0x28a929aa));
const body= readFileSync(resolve(_0xa17a8), _$s2b2(0));
const _0x15c86= extractStorefrontSnapshot({
url: sourceUrl,
statusCode: Number.isFinite(_0xe7539)? _0xe7539: (0x836070c^0x83607c4),
body,
capturedAtMs: Date.now()
});
_0x5ba17.stdout(JSON.stringify(_0x15c86, null, (0x2ff3a6ec^0x2ff3a6ee))+ _$s2b2(13));
return _0x15c86.ok? 0: (0xe304952^0xe304950);
}
if(subcommand=== _$s2b2(23)){
const _0x2d2ca= _0x72b20(rest, _$s2b2(24));
const _0x7305b= _0x72b20(rest, _$s2b2(25));
if(!_0x2d2ca||!_0x7305b){
_0x5ba17.stderr(_$s2b2(26));
return 1;
}
const sourceUrl= _0x72b20(rest, _$s2b2(19))?? _$s2b2(20);
const _0xb8dec= Number.parseInt(_0x72b20(rest, _$s2b2(27))?? _$s2b2(28), (0x33b88158^0x33b88152));
const _0xfeb7d= Number.parseInt(_0x72b20(rest, _$s2b2(29))?? _$s2b2(30), (0x9d87fa6^0x9d87fac));
const _0x4490e= 1_700_000_000_000;
const prevSnaps= _0xfe642(_0x2d2ca, sourceUrl, _0x4490e);
const currSnaps= _0xfe642(_0x7305b, sourceUrl, _0x4490e+ (0x25205786^0x252022b6));
const _0x8a69f= evaluateStockTransition(null, prevSnaps,{
evaluatedAtMs: _0x4490e,
config:{
restockConfirmTicks: _0xb8dec,
outOfStockConfirmTicks: _0xb8dec,
minPriceDropBps: _0xfeb7d
}
});
const _0xd042g= evaluateStockTransition(_0x8a69f.state, currSnaps,{
evaluatedAtMs: _0x4490e+ (0x2a4c48e8^0x2a4c3dd8),
config:{
restockConfirmTicks: _0xb8dec,
outOfStockConfirmTicks: _0xb8dec,
minPriceDropBps: _0xfeb7d
}
});
_0x5ba17.stdout(
JSON.stringify(
{
alerts: _0xd042g.alerts,
suppressedFlaps: _0xd042g.suppressedFlaps,
pollTick: _0xd042g.state.pollTick
},
null,
(0x3bbb6838^0x3bbb683a)
)+ _$s2b2(13)
);
return 0;
}
if(subcommand=== _$s2b2(31)){
const _0x161bh= _0x72b20(rest, _$s2b2(32));
const _0x5bf4i= _0x72b20(rest, _$s2b2(33));
if(!_0x161bh||!_0x5bf4i){
_0x5ba17.stderr(_$s2b2(34));
return 1;
}
const _0xa1cdj= estimateTierPlan(Number.parseInt(_0x161bh, (0x1c06d87e^0x1c06d874)), Number.parseInt(_0x5bf4i, (0x1747b734^0x1747b73e)));
_0x5ba17.stdout(JSON.stringify(_0xa1cdj, null, (0x84804c2^0x84804c0))+ _$s2b2(13));
return 0;
}
_0x5ba17.stderr(`Unknown command: ${subcommand}\n`);
printUsage(_0x5ba17);
return 1;
} catch(err){
const _0xe7a6k= err instanceof Error? err.message: String(err);
_0x5ba17.stderr(`Error: ${_0xe7a6k}\n`);
return 1;
}
}
const _0x2d7fl= process.argv[1]!== undefined&& resolve(process.argv[1])=== fileURLToPath(import.meta.url);
if(_0x2d7fl){
enforceLicense(_$s2b2(35));
runCli(process.argv.slice((0x12a626a0^0x12a626a2))).then((code)=>{
process.exitCode= code;
});
}
return{runCli};})();
export const runCli=_$m5_2b2.runCli;
