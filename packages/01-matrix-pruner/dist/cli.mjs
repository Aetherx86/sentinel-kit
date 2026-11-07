#!/usr/bin/env node
import * as _$ext0 from 'node:buffer';
import * as _$ext1 from 'node:crypto';
import * as _$ext2 from 'node:fs';
import * as _$ext3 from 'node:path';
import * as _$ext4 from 'node:url';
const _$m0_7d6=(()=>{const _0x87d60= 1833005723;
const _0xcdaf1= new Uint8Array([
(0x1d1d83d3^0x1d1d8316), (0x178761c5^0x178761b8), (0x10d1a6b3^0x10d1a69a), (0xf6312ec^0xf631254), (0x29bad334^0x29bad39e), (0x1f93b40b^0x1f93b4a0), (0x4747105^0x4747102), (0x790d7f2^0x790d73c), (0x15478e96^0x15478e66), (0x126ebed3^0x126ebe68), (0x1b421edc^0x1b421e2a), (0x7f14918^0x7f14944), (0x3fc687ed^0x3fc6876e), (0x1631525a^0x163152d0), (0x2ae3a98b^0x2ae3a9d2), (0x28f8e1df^0x28f8e12c),
(0x27c2c3c5^0x27c2c336), (0x21d4870a^0x21d48758), (0x2c51016^0x2c510ba), (0x3b059bd^0x3b059f4), (0x23bf73b6^0x23bf73be), (0x1e8fa12^0x1e8fa40), (0x36f76bf1^0x36f76b22), (0xa55e33^0xa55edc), (0x358ea2c4^0x358ea286), (0x7bd0b57^0x7bd0b08), (0x1e845c85^0x1e845c4a), (0xa071442^0xa0714e4), (0x2c5baf81^0x2c5baf8e), (0x335b83ca^0x335b8370), (0x2f6f6804^0x2f6f68f2), (0x16e8b302^0x16e8b3cc),
(0x300efc48^0x300efc56), (0x10033b47^0x10033bf8), (0xed37358^0xed373da), (0x3dde0c13^0x3dde0c94), 1, (0x2a2d9379^0x2a2d93de), (0x1716bf14^0x1716bfe0), (0x3da20114^0x3da20142), (0x127fb292^0x127fb27c), (0x344f7248^0x344f72a6), (0x18eb80b3^0x18eb80a8), (0x37b9e6df^0x37b9e66a), (0x37c4c31^0x37c4c84), (0x1c7706e6^0x1c7706ae), (0x6259e1d^0x6259e10), (0x12a81b3^0x12a8112),
(0x3e47b47b^0x3e47b46c), (0x3b3c7f75^0x3b3c7f76), (0x2984ec3^0x2984e98), (0x3665b30f^0x3665b3fa), (0x3afa3246^0x3afa3234), (0x15fccd75^0x15fccdfe), (0x3a5007ef^0x3a500780), (0x1c1e8898^0x1c1e8862), (0x16445dc2^0x16445d1c), (0x6d4e66e^0x6d4e6c6), (0x2b074a28^0x2b074a48), (0x12811458^0x1281148a), (0x289a5bf8^0x289a5b24), (0x9414b36^0x9414bce), (0x2f287a3b^0x2f287ab0), (0x3dec3c64^0x3dec3c32),
(0x31a14331^0x31a1430c), (0xe72d7a2^0xe72d796), (0xd710f31^0xd710f38), (0x26a3c348^0x26a3c31a), (0x37e527dd^0x37e527d4), (0x9c854e7^0x9c8541e), (0x9f752a7^0x9f75220), (0x1a588dc0^0x1a588d82), (0x1e6a1c71^0x1e6a1cbc), (0x276122ac^0x276122e6), (0xc68bb90^0xc68bbe8), (0x3b26a6d0^0x3b26a6aa), (0x20ba2a2b^0x20ba2ac4), (0xaa71783^0xaa717ee), (0x1eb80c07^0x1eb80c50), (0xa03a2c8^0xa03a252),
(0x15a9665b^0x15a966ac), (0x1734e748^0x1734e7b6), (0x2890048b^0x289004d8), (0x1c86cd50^0x1c86cd3a), (0x29407f6f^0x29407f74), (0x18c2789a^0x18c2783e), (0x61afb65^0x61afbc0), (0x1e40a706^0x1e40a7a2), (0x1a39a4db^0x1a39a45c), (0x35079736^0x35079706), (0x2ef798b4^0x2ef79888), (0xef1e8ff^0xef1e8ca), (0x9e4dacc^0x9e4da64), (0x1af2c424^0x1af2c40e), (0x35beb480^0x35beb4f0), (0x35498920^0x35498972),
(0x185f7da0^0x185f7d4c), (0x2bbdc465^0x2bbdc4d6), (0x1762dd08^0x1762dd78), (0x2b04453^0x2b0445a), (0x2f7afab5^0x2f7afa14), (0x312440f9^0x3124405e), (0x2f7e99b3^0x2f7e9960), (0x3c2291f^0x3c229c2), (0x3c6b136b^0x3c6b13fc), (0x1406cfa0^0x1406cf26), (0x30ea86ad^0x30ea8628), (0x12df8a7b^0x12df8aea), (0x215f7a59^0x215f7a04), (0xdf0731a^0xdf0732e), (0x332443ef^0x33244390), (0x1bbbe112^0x1bbbe192),
(0x35243d98^0x35243dec), (0x24cbd38f^0x24cbd3f6), (0x30878c14^0x30878c18), (0x1782b0bc^0x1782b07a), (0x27779b5e^0x27779bb4), (0x14b0c213^0x14b0c27e), (0x2957d90d^0x2957d900), (0x14e9b89e^0x14e9b8e2), (0xd90f607^0xd90f69c), (0x19ba1fae^0x19ba1f46), (0x2aa07bcf^0x2aa07bc8), (0x28ac81d7^0x28ac810a), (0x1f17c09f^0x1f17c0a4), (0x288fa02c^0x288fa04e), (0x32116c3c^0x32116c30), (0x37805c7a^0x37805cb2),
(0x174a0cf8^0x174a0c8c), (0x30bfa0e5^0x30bfa016), (0xbb094e9^0xbb094b8), (0x39a5b7fc^0x39a5b79a), (0x248eb545^0x248eb554), (0x3b12e0d9^0x3b12e09e), (0xc081774^0xc0817a0), (0x3ae6be1e^0x3ae6be02), (0x4846a2f^0x4846a3c), (0x1f2eaf89^0x1f2eaf66), (0x1392f1a9^0x1392f168), (0x1e960b71^0x1e960b2a), (0x204a984a^0x204a9844), (0x1a384456^0x1a38446e), (0x3ffb657e^0x3ffb65d0), (0x2cb86633^0x2cb866d2),
(0x3236c41f^0x3236c42c), (0x3726447d^0x37264436), (0x3a408ee2^0x3a408e58), (0x27f2d58c^0x27f2d5ba), (0xb32087^0xb320f4), (0x20e3d876^0x20e3d8be), (0x15e785f7^0x15e78540), (0x1f3310d7^0x1f331022), (0x3a03497a^0x3a0349dc), (0x3cf397c8^0x3cf39786), (0x2dde02b7^0x2dde0208), (0x3d6ff1ad^0x3d6ff14a), (0x38417b2a^0x38417be4), (0x9c1e0bc^0x9c1e08e), (0x22dfcaca^0x22dfca70), (0x3569edd6^0x3569edf2),
(0xf05baa4^0xf05bacc), (0x3cdfc1cc^0x3cdfc156), (0x29ba9290^0x29ba92f8), (0x2ecc288b^0x2ecc28da), (0x1b70e724^0x1b70e794), (0xa54c8ea^0xa54c8de), (0x1f691a5d^0x1f691ae0), (0x22399ab0^0x22399a42), (0x159521f0^0x1595217c), (0x1ccf9bef^0x1ccf9ba6), (0x20c14ba5^0x20c14ba8), (0x22b4eb95^0x22b4eb6a), (0x3b040336^0x3b040384), (0x26e22738^0x26e227ae), (0x2c9dd19c^0x2c9dd110), (0x17c26e8c^0x17c26e12),
(0x2ffa2763^0x2ffa276c), (0xe3c5c00^0xe3c5c76), (0x1c12c151^0x1c12c198), (0x3f2c6037^0x3f2c60fa), (0xcfc75c7^0xcfc7534), (0x476baae^0x476bafe), (0x21ef4aa4^0x21ef4a80), (0x1371596b^0x13715962), (0xa9440cc^0xa94401c), (0x16a9f7f5^0x16a9f7c6), (0x3a05ed85^0x3a05ed48), (0x1b16210b^0x1b16218a), (0x10d50aa4^0x10d50a24), (0x8c9e850^0x8c9e8ce), (0x37292db8^0x37292db0), (0x2bc2d9b2^0x2bc2d932),
(0x22ab4254^0x22ab420c), (0x362004d2^0x36200496), (0x39ead21f^0x39ead238), (0xcbb445^0xcbb41a), (0x11471ee8^0x11471ed4), (0x30ac89e2^0x30ac891e), (0x331bf98c^0x331bf920), (0x28157e9c^0x28157e82), (0x6a313b3^0x6a313bc), (0x382403eb^0x382403e6), (0x13042e80^0x13042ee8), (0x208e3744^0x208e37aa), (0x2c604d04^0x2c604dc4), (0x1c7aa4f7^0x1c7aa4ee), (0x166eeffb^0x166eef50), (0x3a456f05^0x3a456f52),
(0x2f6c52f^0x2f6c5ac), (0x605807d^0x60580b6), (0x372c03a5^0x372c03d8), (0x17d146b8^0x17d1463a), (0x39a6ee0a^0x39a6ee74), (0x36d255d9^0x36d2553e), (0x38cb8af6^0x38cb8ac0), (0x308ce4b8^0x308ce4a2), (0x335f375f^0x335f375c)
]);
const _0x13882= new Uint16Array([0, (0x3b6a1405^0x3b6a1406), (0xbe3eb8f^0xbe3eb88), (0x21565d0^0x21565ca), (0x26a494b^0x26a4964), (0x17a2ed46^0x17a2ed0e), (0x9247fac^0x9247ff0), (0xb348e1e^0xb348e72), (0x2156b830^0x2156b84c), (0x2ef5fd5d^0x2ef5fdd6), (0x8c378e5^0x8c37878), (0x2fd29deb^0x2fd29d5a), (0x2b97f5de^0x2b97f514)]);
const _0x59613= new Uint8Array([(0x30a7d55d^0x30a7d55e), (0x9097064^0x9097060), (0xda15ed1^0xda15ec2), (0x157f7ee9^0x157f7efc), (0x11f8683f^0x11f86826), (0x26ed853c^0x26ed8528), (0x294b03fa^0x294b03ea), (0x3b003514^0x3b003504), (0x3fc74821^0x3fc7482e), (0x20a37e82^0x20a37e90), (0xd408a86^0xd408a92), (0x16983cf5^0x16983cec), (0x2a7b00f9^0x2a7b00f6)]);
const _0x9f3a4= new Int32Array([
(0x109b4ebc^0x109b4f18), (0x11d1dce^0x11d1d7a), (0x3020dbe0^0x3020dab4), (0x17ffaffc^0x17ffaf7e), (0x3d2e9922^0x3d2e9800), (0x30e525b8^0x30e525e2), (0x19db954e^0x19db959c), (0x287e7906^0x287e7846), (0x3ecbba14^0x3ecbbac8), (0x3a816dbc^0x3a816e0a), (0x26a933f1^0x26a933a4), (0x3c73bc56^0x3c73bd4e), (0x34205af2^0x34205b30), (0x36744d2a^0x367445b2), (0x32c977f4^0x32c9778c), (0x247f2546^0x247f2516)
]);
const _0xe5135= new Uint32Array([
0x18a7beee, 0xfc00fdbf, 0xfbb661f4, 0xe28e5ee5,
0xecbb951d, 0x42747f82, 0xd59726ea, 0x83e35fb5, 0xb3715d77,
0xe8b51a07, 0x60063106, (0x99260dc^0xf489bb8), 0xd88f165f, 0x9fbda08d, 0x7c36ee89,
(0x30144a38^0x3962c89a), 0x60670884, (0x12efd1eb^0x897fc54), 0x70b773a8, 0xf69257eb,
0x3f520f5e, (0xa8f581^0x3a74659e), (0x3c88e10b^0x1e1a1ea0), 0x5851d227, 0x1d3fbde7, 0x4220774b
]);
const _0x2aec6= new Map();
const _0x70c57= new TextDecoder();
function _0xb69e8(_k0){
const _0xfc779= _0x2aec6.get(_k0);
if(_0xfc779!== undefined){
return _0xfc779;
}
const _0x4250a= _0x13882[_k0];
const _0x8829b= _0x59613[_k0];
const _0xce02c= new Uint8Array(_0x8829b);
let _q0= _0x87d60>>> 0;
let _0x13dbd= 0;
let _st= 1;
while(_st!== 0){
switch(_st){
case 1:{
if(_0x13dbd>= _0x4250a+ _0x8829b){
_st= (0x22028301^0x22028302);
} else{
_q0=(_q0+ 0x9e3779b9)>>> 0;
_st= _0x13dbd>= _0x4250a? 2: (0x1964c138^0x1964c13c);
}
break;
}
case 2:{
let _0x59b4e= _q0;
_0x59b4e= Math.imul(_0x59b4e^(_0x59b4e>>> (0x775b076^0x775b066)), 0x85ebca6b)>>> 0;
_0x59b4e= Math.imul(_0x59b4e^(_0x59b4e>>> (0x84865^0x84868)), 0xc2b2ae35)>>> 0;
_0x59b4e=(_0x59b4e^(_0x59b4e>>> (0x33cf203a^0x33cf202a)))>>> 0;
_0xce02c[_0x13dbd- _0x4250a]= _0xcdaf1[_0x13dbd]^(_0x59b4e& (0x121e33bb^0x121e3344))^((_0x13dbd* (0x29d1b971^0x29d1b96e))& (0x37970c2f^0x37970cd0));
_st= (0x13670bd6^0x13670bd2);
break;
}
case 3:{
const _0x9f8df= _0x70c57.decode(_0xce02c);
_0x2aec6.set(_k0, _0x9f8df);
return _0x9f8df;
}
case 4:{
_0x13dbd++;
_st= 1;
break;
}
}
}
return _0x70c57.decode(_0xce02c);
}
function hashKernelToken(_v0){
let _0xe566g= 0x811c9dc5;
for(let _0x2b3fh= 0; _0x2b3fh< _v0.length; _0x2b3fh++){
let _0x7118i= _v0.charCodeAt(_0x2b3fh);
if(_0x7118i>= (0x33ff5b6d^0x33ff5b2c)&& _0x7118i<= (0x34cfa56c^0x34cfa536)){
_0x7118i+= (0x3aff8178^0x3aff8158);
}
_0xe566g^= _0x7118i;
_0xe566g= Math.imul(_0xe566g, (0xb770329^0xa7702ba))>>> 0;
}
return _0xe566g>>> 0;
}
function propagateImpactBitset(
_pc,
_dr,
_ed
){
const _hp= new Int32Array(_pc);
_hp.fill(-1);
if(_pc<= 0){
return{ impactedIndices:[], hopDistances: _hp};
}
const _0xb6f1j=(_pc+ (0x167de3eb^0x167de3f4))>>> (0xa6f45bb^0xa6f45be);
const _0xfccak= new Uint32Array(_pc* _0xb6f1j);
const _0x42a3l= new Uint32Array(_0xb6f1j);
const _0x887cm= new Uint32Array(_0xb6f1j);
const _0xce55n= new Uint32Array(_0xb6f1j);
let _0x142eo= 0;
let _st= 1;
while(_st!== 0){
switch(_st){
case 1:{
for(let _0x5a07p= 0; _0x5a07p< _ed.length; _0x5a07p++){
const _0x9fe0q= _ed[_0x5a07p][0];
const _0xe5b9r= _ed[_0x5a07p][1];
if(_0x9fe0q>= 0&& _0x9fe0q< _pc&& _0xe5b9r>= 0&& _0xe5b9r< _pc){
_0xfccak[_0xe5b9r* _0xb6f1j+(_0x9fe0q>>> (0x1d822445^0x1d822440))]|=(1<<(_0x9fe0q& (0x8681d3d^0x8681d22)))>>> 0;
}
}
_st= (0xa3668de^0xa3668dc);
break;
}
case 2:{
let _0x2b92s= 0;
for(let _0x716bt= 0; _0x716bt< _dr.length; _0x716bt++){
const _0xb744u= _dr[_0x716bt];
if(_0xb744u>= 0&& _0xb744u< _pc){
const _0xfd1dv=(1<<(_0xb744u& (0x2f2a2499^0x2f2a2486)))>>> 0;
const _0x42f6w= _0xb744u>>> (0x495e50d^0x495e508);
if((_0x887cm[_0x42f6w]& _0xfd1dv)=== 0){
_0x887cm[_0x42f6w]|= _0xfd1dv;
_0x42a3l[_0x42f6w]|= _0xfd1dv;
_hp[_0xb744u]= 0;
_0x2b92s= 1;
}
}
}
_0x142eo= 1;
_st= _0x2b92s=== 1? 3: (0x29e4be4f^0x29e4be4a);
break;
}
case 3:{
_0xce55n.fill(0);
for(let _0x88cfx= 0; _0x88cfx< _pc; _0x88cfx++){
if((_0x42a3l[_0x88cfx>>> (0x1f0c8ee1^0x1f0c8ee4)]&((1<<(_0x88cfx& (0xfca5191^0xfca518e)))>>> 0))!== 0){
const _0xcea8y= _0x88cfx* _0xb6f1j;
for(let _0x1481z= 0; _0x1481z< _0xb6f1j; _0x1481z++){
_0xce55n[_0x1481z]|= _0xfccak[_0xcea8y+ _0x1481z]&~_0x887cm[_0x1481z];
}
}
}
_st= (0x24928d74^0x24928d70);
break;
}
case 4:{
let _0x5a5a10= 0;
for(let _0x1481z= 0; _0x1481z< _0xb6f1j; _0x1481z++){
const _0xa03311= _0xce55n[_0x1481z];
_0x42a3l[_0x1481z]= _0xa03311;
if(_0xa03311!== 0){
_0x887cm[_0x1481z]|= _0xa03311;
_0x5a5a10= 1;
for(let _0xe60c12= 0; _0xe60c12< (0x3715ad2^0x3715af2); _0xe60c12++){
const _0x2be513=(_0x1481z<< (0x31917dc9^0x31917dcc))+ _0xe60c12;
if(_0x2be513< _pc&&(_0xa03311&((1<< _0xe60c12)>>> 0))!== 0){
_hp[_0x2be513]= _0x142eo;
}
}
}
}
_0x142eo++;
_st= _0x5a5a10=== 1? 3: (0x34922e53^0x34922e56);
break;
}
case 5:{
_st= 0;
break;
}
}
}
const _0x71be14=[];
for(let _0xb79715= 0; _0xb79715< _pc; _0xb79715++){
if(_hp[_0xb79715]>= 0){
_0x71be14.push(_0xb79715);
}
}
return{ impactedIndices: _0x71be14, hopDistances: _hp};
}
function _0xfd7016(_tr, _fl, _fk, _rg){
const _0x434917= new Float64Array((0x1c85fa^0x1c85f8));
if(_tr<= 0){
return _0x434917;
}
const _0x892218= _rg>= 0? _rg:(_fl> _fk? _fl- _fk: 0);
const _0xcefb19= _fl> 0? Math.min(1, _fk/(_fl+ 1.5)): 0;
const _0x14d41a= Math.min(1, Math.max(0, _0x892218/ _tr));
const _0x5aad1b= 3.8416;
const _0xa0861c= 1+ _0x5aad1b/ _tr;
const _0xe65f1d= _0x14d41a+ _0x5aad1b/((0x313e85d8^0x313e85da)* _tr);
const _0x2c381e= 1.96* Math.sqrt((_0x14d41a*(1- _0x14d41a)+ _0x5aad1b/((0x2544f690^0x2544f694)* _tr))/ _tr);
const _0x72111f= Math.max(0,(_0xe65f1d- _0x2c381e)/ _0xa0861c);
_0x434917[0]= _0x72111f;
_0x434917[1]= _0xcefb19;
return _0x434917;
}
function executePruningKernel(
_md,
_cl,
_hp,
_hasPkg,
_unm,
_plt,
_thr,
_smk
){
const _0xb7ea1g= hashKernelToken(_md);
const _0xfdc31h= _cl.length;
const _0x439c1i= new Array(_0xfdc31h);
const _0x89751j= _thr> 0? Math.round(_thr* (0xdd6c636^0xdd6c5de)): _0x9f3a4[(0x265e09eb^0x265e09e0)];
let _0xcf4e1k= 0;
for(let _0xb79715= 0; _0xb79715< _plt.length; _0xb79715++){
const _0x14d41a= hashKernelToken(_plt[_0xb79715]);
if(_0x14d41a=== _0xe5135[(0x2f90434d^0x2f904342)]|| _0x14d41a=== _0xe5135[(0x8c0cc79^0x8c0cc7c)]){
_0xcf4e1k|= 1;
} else if(_0x14d41a=== _0xe5135[(0x121af4b6^0x121af4a6)]|| _0x14d41a=== _0xe5135[(0x36145aae^0x36145aa8)]|| _0x14d41a=== _0xe5135[(0x1723e87b^0x1723e86a)]|| _0x14d41a=== _0xe5135[(0x4e1d696^0x4e1d684)]|| _0x14d41a=== _0xe5135[(0x2cca18bd^0x2cca18ae)]){
_0xcf4e1k|= (0x2e8cf812^0x2e8cf810);
} else if(
_0x14d41a=== _0xe5135[(0x2beb9306^0x2beb9312)]||
_0x14d41a=== _0xe5135[(0x7e3de79^0x7e3de6c)]||
_0x14d41a=== _0xe5135[(0x2dbfd160^0x2dbfd176)]||
_0x14d41a=== _0xe5135[(0x6eac88f^0x6eac898)]||
_0x14d41a=== _0xe5135[(0x1ad625e2^0x1ad625fa)]||
_0x14d41a=== _0xe5135[(0x224b3c2d^0x224b3c34)]
){
_0xcf4e1k|= (0x8fcbffa^0x8fcbffe);
}
}
const _0x15271l= new Map();
const _0x5b001m= new Set();
for(let _0xa0d91n= 0; _0xa0d91n< _0xfdc31h; _0xa0d91n++){
const _0xe6b21o= _cl[_0xa0d91n];
const _0x2c8b1p= hashKernelToken(_0xe6b21o.os);
const _0x72641q= hashKernelToken(_0xe6b21o.arch);
const _0xb83d1r= hashKernelToken(_0xe6b21o.suite);
if(_0x2c8b1p=== _0xe5135[(0x313ed184^0x313ed180)]&& _0x72641q=== _0xe5135[(0x1f428a65^0x1f428a62)]&& _0xb83d1r!== _0xe5135[(0x1a8eb712^0x1a8eb71c)]){
_0x5b001m.add(_0xe6b21o.pkgIdx);
if(!_0x15271l.has(_0xe6b21o.pkgIdx)){
_0x15271l.set(_0xe6b21o.pkgIdx, _0xe6b21o.runtime);
}
}
}
for(let _0xa0d91n= 0; _0xa0d91n< _0xfdc31h; _0xa0d91n++){
const _0xe6b21o= _cl[_0xa0d91n];
if(!_0x15271l.has(_0xe6b21o.pkgIdx)&& hashKernelToken(_0xe6b21o.os)=== _0xe5135[(0x855c8c2^0x855c8c6)]){
_0x15271l.set(_0xe6b21o.pkgIdx, _0xe6b21o.runtime);
}
}
for(let _0xa0d91n= 0; _0xa0d91n< _0xfdc31h; _0xa0d91n++){
const _0xe6b21o= _cl[_0xa0d91n];
if(!_0x15271l.has(_0xe6b21o.pkgIdx)){
_0x15271l.set(_0xe6b21o.pkgIdx, _0xe6b21o.runtime);
}
}
let _anc=-1;
let _st= 1;
while(_st!== 0){
switch(_st){
case 1:{
if(_0xfdc31h=== 0){
_st= 0;
} else if(_0xb7ea1g=== _0xe5135[0]){
_st= (0xce3744a^0xce37448);
} else if(_0xb7ea1g=== _0xe5135[1]){
_st= (0x72a0689^0x72a068a);
} else if(_0xb7ea1g=== _0xe5135[(0x31cce526^0x31cce524)]){
_st= (0x21ac1dca^0x21ac1dce);
} else{
_st= (0x3625e4b5^0x3625e4b0);
}
break;
}
case 2:{
for(let _0xfe161s= 0; _0xfe161s< _0xfdc31h; _0xfe161s++){
const _0x43ef1t= _cl[_0xfe161s];
const _0x89c81u= _0x43ef1t.required;
_0x439c1i[_0xfe161s]={
idx: _0x43ef1t.idx,
action:(_0x89c81u? _0xb69e8(0): _0xb69e8(1)),
reason:(_0x89c81u? _0xb69e8((0x37f1ae3a^0x37f1ae32)): _0xb69e8((0x1154d00^0x1154d0c))),
riskScore: _0x89c81u? 1: 0,
flakeIndex: 0,
wilsonScore: 0
};
}
_st= 0;
break;
}
case 3:{
let _0xcfa11v=-1;
let _bestRank= 1e12;
if(_smk){
for(let _0x157a1w= 0; _0x157a1w< _0xfdc31h; _0x157a1w++){
const _0x5b531x= _cl[_0x157a1w];
const _0x2c8b1p= hashKernelToken(_0x5b531x.os);
const _0x72641q= hashKernelToken(_0x5b531x.arch);
const _0xb83d1r= hashKernelToken(_0x5b531x.suite);
let _0xa12c1y= _0x5b531x.costUsd* (0x2bb3ca7e^0x2bb3c996)+ _0x5b531x.minutes;
if(_0x2c8b1p!== _0xe5135[(0x2274c93c^0x2274c938)]){
_0xa12c1y+= 1e6;
}
if(_0x72641q!== _0xe5135[(0x379ff51d^0x379ff51a)]){
_0xa12c1y+= 1e4;
}
if(_0xb83d1r=== _0xe5135[(0x3b4b1da^0x3b4b1d4)]|| _0xb83d1r=== _0xe5135[(0x24fe9613^0x24fe961e)]){
_0xa12c1y+= 5e4;
} else if(_0xb83d1r=== _0xe5135[(0x17e06c2a^0x17e06c20)]){
_0xa12c1y-= (0x3dac0e76^0x3dac0f82);
}
if(_0xa12c1y< _bestRank){
_bestRank= _0xa12c1y;
_0xcfa11v= _0x157a1w;
}
}
}
_anc= _0xcfa11v;
for(let _0x157a1w= 0; _0x157a1w< _0xfdc31h; _0x157a1w++){
const _0x5b531x= _cl[_0x157a1w];
if(_0x5b531x.required){
_0x439c1i[_0x157a1w]={
idx: _0x5b531x.idx,
action: _0xb69e8(0),
reason: _0xb69e8((0x38baf6b4^0x38baf6bc)),
riskScore: 1,
flakeIndex: 0,
wilsonScore: 0
};
} else if(_0x157a1w=== _0xcfa11v){
_0x439c1i[_0x157a1w]={
idx: _0x5b531x.idx,
action: _0xb69e8(0),
reason: _0xb69e8((0x32b984e1^0x32b984e6)),
riskScore: 0.05,
flakeIndex: 0,
wilsonScore: 0
};
} else{
_0x439c1i[_0x157a1w]={
idx: _0x5b531x.idx,
action: _0xb69e8(1),
reason: _0xb69e8((0x226635e4^0x226635e8)),
riskScore: 0.01,
flakeIndex: 0,
wilsonScore: 0
};
}
}
_st= 0;
break;
}
case 4:{
for(let _0xe7051z= 0; _0xe7051z< _0xfdc31h; _0xe7051z++){
const _0x2cde20= _cl[_0xe7051z];
const _0x72b721= _0x2cde20.hasTelemetry
? _0xfd7016(_0x2cde20.totalRuns, _0x2cde20.failures, _0x2cde20.flakeRetriesPassed, _0x2cde20.trueRegressions)
: new Float64Array((0x2592e8a8^0x2592e8aa));
if(_anc===-1&& hashKernelToken(_0x2cde20.os)=== _0xe5135[(0x2b6e74c0^0x2b6e74c4)]){
_anc= _0xe7051z;
}
_0x439c1i[_0xe7051z]={
idx: _0x2cde20.idx,
action: _0xb69e8(0),
reason: _0xb69e8((0x2b8269ec^0x2b8269ee)),
riskScore: _0x9f3a4[(0x1ed0e659^0x1ed0e650)]/ (0x32407ba^0x3240452),
flakeIndex: Math.round(_0x72b721[1]* (0x34a2c7bc^0x34a2e0ac))/ (0x193a7ea6^0x193a59b6),
wilsonScore: Math.round(_0x72b721[0]* (0x267059c8^0x26707ed8))/ (0x865882a^0x865af3a)
};
}
if(_anc===-1&& _0xfdc31h> 0){
_anc= 0;
}
_st= 0;
break;
}
case 5:{
let _anyTouch= false;
for(let _0xb89022= 0; _0xb89022< _hp.length; _0xb89022++){
if(_hp[_0xb89022]>= 0){
_anyTouch= true;
break;
}
}
for(let _0xfe6923= 0; _0xfe6923< _0xfdc31h; _0xfe6923++){
const _0x444224= _cl[_0xfe6923];
const _0x72b721= _0x444224.hasTelemetry
? _0xfd7016(_0x444224.totalRuns, _0x444224.failures, _0x444224.flakeRetriesPassed, _0x444224.trueRegressions)
: new Float64Array((0x3bd57976^0x3bd57974));
const _0x72111f= _0x72b721[0];
const _0xcefb19= _0x72b721[1];
if(_0x444224.required){
_0x439c1i[_0xfe6923]={
idx: _0x444224.idx,
action: _0xb69e8(0),
reason: _0xb69e8((0x29766a36^0x29766a3e)),
riskScore: 1,
flakeIndex: Math.round(_0xcefb19* (0x1a42a2d0^0x1a4285c0))/ (0x1b165eb2^0x1b1679a2),
wilsonScore: Math.round(_0x72111f* (0x3959194c^0x39593e5c))/ (0x17edfe16^0x17edd906)
};
continue;
}
let _hop= 0;
if(_hasPkg&& _0x444224.pkgIdx>= 0&& _0x444224.pkgIdx< _hp.length){
_hop= _hp[_0x444224.pkgIdx];
if(_hop< 0&&(_anyTouch|| _unm=== 0)){
_0x439c1i[_0xfe6923]={
idx: _0x444224.idx,
action: _0xb69e8(1),
reason: _0xb69e8((0x1c3de281^0x1c3de288)),
riskScore: 0.02,
flakeIndex: Math.round(_0xcefb19* (0x80bddda^0x80bfaca))/ (0x7202374^0x7200464),
wilsonScore: Math.round(_0x72111f* (0x4dd511e^0x4dd760e))/ (0x2b6d99e0^0x2b6dbef0)
};
continue;
}
if(_hop< 0){
_hop= 1;
}
}
const _0x2c8b1p= hashKernelToken(_0x444224.os);
const _0x72641q= hashKernelToken(_0x444224.arch);
const _0xb83d1r= hashKernelToken(_0x444224.suite);
const _0x8a1b25= _0x15271l.get(_0x444224.pkgIdx)?? _0x444224.runtime;
const _0xcff426= _0x5b001m.has(_0x444224.pkgIdx);
const _0x15cd27=
_0x2c8b1p=== _0xe5135[(0xe4f7b76^0xe4f7b72)]&&
(!_0xcff426|| _0x72641q=== _0xe5135[(0xc5c474b^0xc5c474c)])&&
_0x444224.runtime=== _0x8a1b25&&
_0xb83d1r!== _0xe5135[(0x247356d8^0x247356d6)];
let _bps= 0;
if(_0xb83d1r=== _0xe5135[(0x4008776^0x4008778)]){
_bps= _0x9f3a4[(0x263e765c^0x263e765a)]+(_hop=== 0? _0x9f3a4[(0x1194841b^0x11948414)]: 0);
} else if(_hop=== 0){
_bps= _0x15cd27? _0x9f3a4[0]: _0x9f3a4[1];
} else if(_hop=== 1){
_bps= _0x15cd27? _0x9f3a4[(0x35e4125c^0x35e4125e)]: _0x9f3a4[(0x35130363^0x35130360)];
} else{
_bps= _0x15cd27? _0x9f3a4[(0x222c9bc6^0x222c9bc2)]: _0x9f3a4[(0x20e55df9^0x20e55dfc)];
}
if(_0x2c8b1p=== _0xe5135[(0x62a8123^0x62a8126)]&&(_0xcf4e1k& 1)!== 0){
_bps+= _0x9f3a4[(0x1de0202f^0x1de02028)];
} else if(_0x2c8b1p=== _0xe5135[(0x3ccb5cec^0x3ccb5cea)]&&(_0xcf4e1k& (0x20cfe406^0x20cfe404))!== 0){
_bps+= _0x9f3a4[(0x2426e529^0x2426e52e)];
}
if((_0xcf4e1k& (0x254f4d94^0x254f4d90))!== 0&&!_0x15cd27){
_bps+= _0x9f3a4[(0xfedd39a^0xfedd392)];
}
let _0x5ba628= Math.round(Math.min(_0x9f3a4[(0xcfd07e0^0xcfd07ec)], _0x72111f* _0x9f3a4[(0x135965fb^0x135965f6)]));
if(
_0x444224.hasTelemetry&&
_0x72111f> 0.02&&
_0x444224.recentFailureAgeHours>= 0&&
_0x444224.recentFailureAgeHours<= (0x631f650^0x631f618)
){
_0x5ba628+= Math.round(_0x9f3a4[(0x2f766274^0x2f76627a)]*(1- _0x444224.recentFailureAgeHours/ (0x302a65d4^0x302a65b4)));
}
_bps+= _0x5ba628;
if(_0xcefb19>= 0.55&&!_0x15cd27){
_bps-= _0x9f3a4[(0xd845474^0xd84547e)];
}
const _0xa17f29= Math.max((0xc5b830a^0xc5b8300), Math.min((0x3fe5e93c^0x3fe5eae2), _bps));
const _0xe7582a= _0xa17f29>= _0x89751j;
let _rIdx= (0x32354096^0x3235409c);
if(_0xe7582a){
if(!_0x15cd27&& _0x5ba628>= (0x35276122^0x35276146)){
_rIdx= (0x1b0225cd^0x1b0225c8);
} else if(_hop=== 0){
_rIdx= (0x102eb309^0x102eb30a);
} else{
_rIdx= (0x1f154aa0^0x1f154aa4);
}
} else{
_rIdx= _0xcefb19>= 0.5? 11: (0xa491244^0xa49124e);
}
_0x439c1i[_0xfe6923]={
idx: _0x444224.idx,
action:(_0xe7582a? _0xb69e8(0): _0xb69e8(1)),
reason: _0xb69e8(_rIdx),
riskScore: Math.round(_0xa17f29)/ (0xbc8b5d8^0xbc8b630),
flakeIndex: Math.round(_0xcefb19* (0xd3c89a2^0xd3caeb2))/ (0xba8919c^0xba8b68c),
wilsonScore: Math.round(_0x72111f* (0x35ac3506^0x35ac1216))/ (0x25d8f9a8^0x25d8deb8)
};
}
_st= (0x3fdf699c^0x3fdf699a);
break;
}
case 6:{
let _linuxRunning=-1;
let _anyRunning=-1;
for(let _0x2d312b= 0; _0x2d312b< _0xfdc31h; _0x2d312b++){
if(_0x439c1i[_0x2d312b].action=== _0xb69e8(0)){
if(_anyRunning===-1){
_anyRunning= _0x2d312b;
}
if(hashKernelToken(_cl[_0x2d312b].os)=== _0xe5135[(0x11dcaf50^0x11dcaf54)]){
_linuxRunning= _0x2d312b;
break;
}
}
}
if(_linuxRunning!==-1){
_anc= _linuxRunning;
} else{
let _0x730a2c=-1;
let _candScore= 1e12;
for(let _0x2d312b= 0; _0x2d312b< _0xfdc31h; _0x2d312b++){
const _0xb8e32d= _cl[_0x2d312b];
const _0x2c8b1p= hashKernelToken(_0xb8e32d.os);
const _0x72641q= hashKernelToken(_0xb8e32d.arch);
let _0xfebc2e= _0xb8e32d.costUsd* (0x9730176^0x973029e)+ _0xb8e32d.minutes;
if(_0x2c8b1p!== _0xe5135[(0x3cd8d1a4^0x3cd8d1a0)]){
_0xfebc2e+= 1e6;
}
if(_hasPkg&& _0xb8e32d.pkgIdx>= 0&& _0xb8e32d.pkgIdx< _hp.length&& _hp[_0xb8e32d.pkgIdx]< 0){
_0xfebc2e+= 5e5;
}
if(_0x72641q!== _0xe5135[(0x871f005^0x871f002)]){
_0xfebc2e+= 1e4;
}
if(_0xfebc2e< _candScore){
_candScore= _0xfebc2e;
_0x730a2c= _0x2d312b;
}
}
if(_0x730a2c!==-1&&(hashKernelToken(_cl[_0x730a2c].os)=== _0xe5135[(0x33048438^0x3304843c)]|| _anyRunning===-1)){
_anc= _0x730a2c;
_0x439c1i[_0x730a2c]={
idx: _cl[_0x730a2c].idx,
action: _0xb69e8(0),
reason: _0xb69e8((0x3e78d160^0x3e78d166)),
riskScore: Math.max(_0x439c1i[_0x730a2c].riskScore, _0x89751j/ (0x3a987880^0x3a987b68)),
flakeIndex: _0x439c1i[_0x730a2c].flakeIndex,
wilsonScore: _0x439c1i[_0x730a2c].wilsonScore
};
} else{
_anc= _anyRunning;
}
}
_st= 0;
break;
}
}
}
return{ decisions: _0x439c1i, anchorIdx: _anc};
}
return{hashKernelToken,propagateImpactBitset,executePruningKernel};})();
const _$m1_7ea=(()=>{const _$p=Uint8Array.from([12,195,133,103,139,123,40,50,115,20,207,113,48,97,229,111,110,79,169,195,61,196,198,164,178,224,66,15,51,194,69,199,80,105,197,220,176,111,210,161,167,8,116,55,240,243,93,109,15,251,208,72,47,89,70,157,124,59,141,46,89,41,184,78,57,134,136,147,122,102,175,86,150,29,199,211,225,217,19,7,238,56,185,199,176,66,157,244,254,176,102,109,158,37,241,125,148,244,39,29,95,112,123,157,235,215,55,136,236,196,9,59,235,61,93,173,129,192,172,45,130,16,58,85,155,79,177,203,141,175,166,200,168,244,210,39,187,20,136,58,152,40,215,216,110,252,35,79,143,4,233,23,156,112,182,149,163,252,43,164,17,161,248,41,23,101,121,32,168,195,237,247,199,132,10,38,118,91,9,13,16,12,158,106,185,169,227,154,99,120,68,101,116,187,87,254,163,106,132,141,225,168,100,192,74,174,54,221,212,77,4,16,222,4,186,135,180,211,17,128,83,213,236,116,72,13,12,48,193,176,176,210,158,75,200,97,63,196,100,3,88,167,233,214,95,38,225,148,241,254,238,173,87,42,93,158,223,110,126,165,59,161,49,6,148,213,154,249,10,72,28,149,242,226,61,85,253,124,203,165,253,148,142,233,60,176,38,195,125,22,196,155,99,18,239,168,250,92,180,131,11,2,73,1,29,31,44,164,224,168,148,59,248,120,160,173,242,85,174,100,0,191,195,35,10,160,52,123,219,175,166,52,57,158,12,66,15,198,81,173,178,153,26,247,205,197,134,105,1,131,171,228,233,100,75,11,40,2,37,82,104,225,33,84,9,157,127,240,196,186,212,185,232,253,44,25,168,224,172,4,125,39,35,62,54,159,169,169,124,11,185,17,97,156,96,143,179,168,179,29,84,80,187,56,95,47,48,7,62,111,237,5,71,158,7,117,134,9,147,35,167,87,230,213,245,39,192,80,157,160,19,72,151,16,110,211,161,41,126,120,58,237,25,153,129,186,252,6,253,98,154,75,9,182,26,49,47,48,196,89,87,155,135,100,249,187,51,5,84,217,14,33,118,217,38,122,239,105,4,94,86,14,230,75,112,20,73,102,121,200,128,26,122,47,136,168,134,162,225,10,136,13,5,229,34,17,116,208,189,86,43,35,28,5,180,148,152,1,192,204,7,72,243,58,54,248,188,148,74,148,35,47,95,69,168,34,160,86,120,169,192,0,151,203,135,180,191,103,53,29,218,205,178,13,112,39,105,177,118,25,154,69,170,108,13,143,208,248,97,120,60,35,117,243,193,104,216,151,219,161,188,166,217,128,66,43,51,208,130,22,67,33,126,124,218,159,241,109,244,191,174,164,129,103,248,42,7,117,48,36,111,124,133,52,40,103,48,97,93,155,48,25,185,198,203,163,16,140,163,60,183,9,142,213,31,158,248,210,202,66,89,38,173,138,155,126,199,125,139,122,212,226,208,203,117,216,252,203,198,119,7,9,186,244,132,10,196,111,43,148,23,122,2,199,28,31,158,50,109,51,25,242,183,60,252,99,253,108,164,223,227,178,95,216,45,72,32,174,234,135,164,119,11,11,169,243,76,48,4,104,198,218,238,237,188,87,153,78,247,197,214,18,27,72,110,168,167,66,236,182,107,51,201,19,26,36,135,40,19,163,190,234,59,188,85,189,165,250,221,151,78,170,122,55,80,86,129,95,182,150,145,54,189,99,155,249,119,127,229,207,171,203,45,103,132,65,116,225,118,190,251,174,212,174,97,178,15,202,79,35,179,233,59,100,92,253,222,47,185,177,161,201,178,170,109,198,240,94,234,217,105,243,189,122,196,55,11,28,242,20,180,128,23,250]),_$o=[0,12,29,43,62,71,80,88,107,117,128,134,147,165,175,182,192,202,220,239,253,264,270,277,284,290,297,306,313,325,335,341,349,352,356,360,364,369,373,377,382,386,391,395,400,406,410,414,417,421,424,428,432,436,439,442,447,450,452,455,459,461,465,471,474,477,480,485,489,493,498,499,499,500,504,506,508,509,511,512,514,516,534,550,570,583,587,590,595,607,611,616,625,628,632,640,651,655,664,669,682,699,706,718,725,735,739,742,743,746,747,750,756,761,766,773,777,779,782,787,804,815],_$l=[12,17,14,19,9,9,8,19,10,11,6,13,18,10,7,10,10,18,19,14,11,6,7,7,6,7,9,7,12,10,6,8,3,4,4,4,5,4,4,5,4,5,4,5,6,4,4,3,4,3,4,4,4,3,3,5,3,2,3,4,2,4,6,3,3,3,5,4,4,5,1,0,1,4,2,2,1,2,1,2,2,18,16,20,13,4,3,5,12,4,5,9,3,4,8,11,4,9,5,13,17,7,12,7,10,4,3,1,3,1,3,6,5,5,7,4,2,3,5,17,11,9],_$c=new Map(),_$td=new TextDecoder();
function _$s7ea(k){if(_$c.has(k))return _$c.get(k);const s=_$o[k],n=_$l[k],u=new Uint8Array(n);let q=2233026538;if((Math.imul(q|1,q|1)&7)!==1)return'';for(let i=0;i<s+n;i++){q=(q+0x9e3779b9)>>>0;if(i>=s){let z=q;z=Math.imul(z^(z>>>16),0x85ebca6b)>>>0;z=Math.imul(z^(z>>>13),0xc2b2ae35)>>>0;z=(z^(z>>>16))>>>0;u[i-s]=_$p[i]^(z&255)^((i*17)&255);}}const v=_$td.decode(u);_$c.set(k,v);return v;}
const{ propagateImpactBitset}= _$m0_7d6;
const _0x47ea0= new Set([
_$s7ea(0),
_$s7ea(1),
_$s7ea(2),
_$s7ea(3),
_$s7ea(4),
_$s7ea(5),
_$s7ea(6),
_$s7ea(7),
_$s7ea(8),
_$s7ea(9),
_$s7ea(10),
_$s7ea(11),
_$s7ea(12),
_$s7ea(13),
_$s7ea(14),
_$s7ea(15),
_$s7ea(16),
_$s7ea(17),
_$s7ea(18),
_$s7ea(19),
_$s7ea(20)
]);
const _0x8dc31= new Set([
_$s7ea(21),
_$s7ea(22),
_$s7ea(23),
_$s7ea(24),
_$s7ea(25),
_$s7ea(26),
_$s7ea(27),
_$s7ea(28),
_$s7ea(29),
_$s7ea(30),
_$s7ea(31)
]);
const _0xd39c2= new Set([_$s7ea(32), _$s7ea(33), _$s7ea(34), _$s7ea(35), _$s7ea(36)]);
const _0x19753= new Set([
_$s7ea(37),
_$s7ea(38),
_$s7ea(39),
_$s7ea(40),
_$s7ea(41),
_$s7ea(42),
_$s7ea(43),
_$s7ea(44),
_$s7ea(45),
_$s7ea(46)
]);
const _0x5f4e4= new Set([
_$s7ea(47),
_$s7ea(48),
_$s7ea(49),
_$s7ea(50),
_$s7ea(51),
_$s7ea(52),
_$s7ea(53),
_$s7ea(54),
_$s7ea(55),
_$s7ea(56),
_$s7ea(57),
_$s7ea(58),
_$s7ea(59),
_$s7ea(60),
_$s7ea(61),
_$s7ea(62)
]);
const _0xa5275= new Set([_$s7ea(63), _$s7ea(64), _$s7ea(65), _$s7ea(66), _$s7ea(67), _$s7ea(68), _$s7ea(69)]);
function _0xeb006(rawPath){
return rawPath
.trim()
.replace(/\\/g, _$s7ea(70))
.replace(/^(a|b)\//, _$s7ea(71))
.replace(/^\.\//, _$s7ea(71))
.replace(/^\/+/, _$s7ea(71));
}
function _0x30d97(filePath){
const _0x76b28= filePath.slice(filePath.lastIndexOf(_$s7ea(70))+ 1);
const _0xbc8b9= _0x76b28.lastIndexOf(_$s7ea(72));
return _0xbc8b9> 0? _0x76b28.slice(_0xbc8b9).toLowerCase(): _$s7ea(71);
}
function _0x0264a(filePath){
const _0x76b28= filePath.slice(filePath.lastIndexOf(_$s7ea(70))+ 1).toLowerCase();
const _0xbc8b9= _0x76b28.indexOf(_$s7ea(72));
return _0xbc8b9> 0? _0x76b28.slice(0, _0xbc8b9): _0x76b28;
}
function _0x483db(_0x312ci, _0xbd31v){
if(_0xbd31v.length=== 0){
return false;
}
const _0x8e16c= _0x5f4e4.has(_0x312ci);
const _0xd3efd= _0xa5275.has(_0x312ci);
const _0x19c8e= _0x312ci=== _$s7ea(73);
if(!_0x8e16c&&!_0xd3efd&&!_0x19c8e){
return false;
}
for(const _0x5fa1f of _0xbd31v){
const _0xa57ag= _0x5fa1f.trim();
if(_0xa57ag.length=== 0){
continue;
}
if(_0x8e16c){
if(
_0xa57ag.startsWith(_$s7ea(74))||
_0xa57ag.startsWith(_$s7ea(75))||
_0xa57ag.startsWith(_$s7ea(76))||
_0xa57ag.startsWith(_$s7ea(77))
){
continue;
}
return false;
}
if(_0xd3efd){
if(_0xa57ag.startsWith(_$s7ea(78))&&!_0xa57ag.startsWith(_$s7ea(79))){
continue;
}
return false;
}
if(_0x19c8e){
if(_0xa57ag.startsWith(_$s7ea(80))|| _0xa57ag.startsWith(_$s7ea(75))|| _0xa57ag.startsWith(_$s7ea(76))){
continue;
}
return false;
}
}
return true;
}
function classifyChangedFile(
filePath,
addedLines=[],
removedLines=[]
){
const _0xeb53h= filePath.toLowerCase();
const _0x312ci= _0x30d97(_0xeb53h);
const _0x7705j= _0x0264a(_0xeb53h);
const _0xbcdek= _0xeb53h.split(_$s7ea(70));
if(
(_0xbcdek.length=== 1&& _0x47ea0.has(_0xbcdek[0]))||
_0xeb53h.startsWith(_$s7ea(81))||
_0xeb53h.startsWith(_$s7ea(82))||
_0xeb53h=== _$s7ea(83)
){
return _$s7ea(84);
}
if(
_0xd39c2.has(_0x312ci)||
_0x8dc31.has(_0x7705j)||
_0xbcdek[0]=== _$s7ea(85)||
_0xbcdek[0]=== _$s7ea(86)
){
return _$s7ea(86);
}
if(_0x19753.has(_0x312ci)){
return _$s7ea(87);
}
const _0x02b7l=[...addedLines,...removedLines];
if(_0x02b7l.length> 0&& _0x483db(_0x312ci, _0x02b7l)){
return _$s7ea(88);
}
if(
/(\.|_)(test|spec)\.[a-z0-9]+$/i.test(_0xeb53h)||
_0xbcdek.includes(_$s7ea(89))||
_0xbcdek.includes(_$s7ea(90))||
_0xbcdek.includes(_$s7ea(91))||
_0xbcdek.includes(_$s7ea(92))
){
return _$s7ea(89);
}
return _$s7ea(93);
}
function _0x4890m(
filePath,
_0xa5cdr
){
for(const _0x8e69n of _0xa5cdr){
if(_0x8e69n.normPath=== _$s7ea(71)|| _0x8e69n.normPath=== _$s7ea(72)){
return _0x8e69n.name;
}
if(filePath=== _0x8e69n.normPath|| filePath.startsWith(`${pkg.normPath}/`)){
return _0x8e69n.name;
}
}
return undefined;
}
function _0xd442o(_0x604711){
const _0x1a1bp= _0x604711.match(/^diff --git "?a\/([^"]+)"? "?b\/([^"]+)"?$/);
if(_0x1a1bp){
return{ prevPath: _0x1a1bp[1], nextPath: _0x1a1bp[(0x96c4930^0x96c4932)]};
}
const _0x5ff4q= _0x604711.match(/^diff --git a\/(\S+) b\/(\S+)$/);
if(_0x5ff4q){
return{ prevPath: _0x5ff4q[1], nextPath: _0x5ff4q[(0x2f70f20e^0x2f70f20c)]};
}
return null;
}
function parseGitDiff(
diff,
packages=[]
){
const _0xa5cdr= packages
.map((p)=>({
name: p.name,
normPath: p.path.replace(/\\/g, _$s7ea(70)).replace(/^\.\//, _$s7ea(71)).replace(/\/+$/, _$s7ea(71))
}))
.sort((a, b)=> b.normPath.length- a.normPath.length);
if(Array.isArray(diff)){
return diff
.map((entry)=> _0xeb006(entry))
.filter((entry)=> entry.length> 0)
.map((cleanPath)=>({
path: cleanPath,
kind: _$s7ea(94),
addedLines:[],
removedLines:[],
classification: classifyChangedFile(cleanPath),
packageName: _0x4890m(cleanPath, _0xa5cdr)
}));
}
const _0xa57ag= diff.trim();
if(_0xa57ag.length=== 0){
return[];
}
if(!_0xa57ag.includes(_$s7ea(95))&&!_0xa57ag.startsWith(_$s7ea(96))){
const _0xeba6s= _0xa57ag
.split(/\r?\n/)
.map((_0x604711)=> _0x604711.trim())
.filter((_0x604711)=> _0x604711.length> 0)
.map((_0x604711)=>{
const _0x317ft= _0x604711.match(/^[ACDMRTUXB]\d*\s+(.+)$/);
if(_0x317ft){
const _0x7758u= _0x317ft[1].split(/\t+/);
return _0x7758u[_0x7758u.length- 1];
}
return _0x604711;
});
return parseGitDiff(_0xeba6s, packages);
}
const _0xbd31v= diff.split(/\r?\n/);
const _0x030aw=[];
let currentPath= _$s7ea(71);
let _0x48e3x;
let kind= _$s7ea(94);
let addedLines=[];
let removedLines=[];
let inHunk= false;
let _0x8ebcy= false;
const flushCurrent=()=>{
if(!_0x8ebcy||!currentPath){
return;
}
const _0xd495z= _0xeb006(currentPath);
const _0x1a6e10= _0x48e3x? _0xeb006(_0x48e3x): undefined;
_0x030aw.push({
path: _0xd495z,
previousPath: _0x1a6e10&& _0x1a6e10!== _0xd495z? _0x1a6e10: undefined,
kind,
addedLines,
removedLines,
classification: classifyChangedFile(_0xd495z, addedLines, removedLines),
packageName: _0x4890m(_0xd495z, _0xa5cdr)
});
};
for(const _0x604711 of _0xbd31v){
if(_0x604711.startsWith(_$s7ea(95))){
flushCurrent();
const _0xa62012= _0xd442o(_0x604711);
currentPath= _0xa62012? _0xa62012.nextPath: _$s7ea(71);
_0x48e3x= _0xa62012? _0xa62012.prevPath: undefined;
kind= _$s7ea(94);
addedLines=[];
removedLines=[];
inHunk= false;
_0x8ebcy= true;
continue;
}
if(!_0x8ebcy){
if(_0x604711.startsWith(_$s7ea(96))){
const _0xebf913= _0x604711.slice((0x24b1b492^0x24b1b496)).trim();
_0x48e3x= _0xebf913=== _$s7ea(97)? undefined: _0xebf913;
kind= _0xebf913=== _$s7ea(97)? _$s7ea(98): _$s7ea(94);
addedLines=[];
removedLines=[];
inHunk= false;
_0x8ebcy= true;
}
continue;
}
if(!inHunk){
if(_0x604711.startsWith(_$s7ea(99))){
kind= _$s7ea(98);
} else if(_0x604711.startsWith(_$s7ea(100))){
kind= _$s7ea(101);
} else if(_0x604711.startsWith(_$s7ea(102))){
kind= _$s7ea(103);
_0x48e3x= _0x604711.slice(_$s7ea(102).length).trim();
} else if(_0x604711.startsWith(_$s7ea(104))){
kind= _$s7ea(103);
currentPath= _0x604711.slice(_$s7ea(104).length).trim();
} else if(_0x604711.startsWith(_$s7ea(105))){
const _0x31d214= _0x604711.slice((0x2b24823c^0x2b248238)).trim();
if(_0x31d214=== _$s7ea(97)){
kind= _$s7ea(101);
if(!currentPath&& _0x48e3x){
currentPath= _0x48e3x;
}
} else{
currentPath= _0x31d214;
}
} else if(_0x604711.startsWith(_$s7ea(106))){
inHunk= true;
}
continue;
}
if(_0x604711.startsWith(_$s7ea(106))){
inHunk= true;
continue;
}
if(_0x604711.startsWith(_$s7ea(107))&&!_0x604711.startsWith(_$s7ea(108))){
addedLines.push(_0x604711.slice(1));
} else if(_0x604711.startsWith(_$s7ea(109))&&!_0x604711.startsWith(_$s7ea(110))){
removedLines.push(_0x604711.slice(1));
}
}
flushCurrent();
return _0x030aw;
}
function _0x77ab15(files){
const _0xbd8416= new Set();
for(const _0x035d17 of files){
if(_0x035d17.classification=== _$s7ea(86)|| _0x035d17.classification=== _$s7ea(88)){
continue;
}
const _0x493618= _0x035d17.path.toLowerCase();
const _0x312ci= _0x30d97(_0x493618).slice(1);
if(_0x312ci){
_0xbd8416.add(_0x312ci);
}
for(const _0x8f0f19 of _0x493618.split(/[\/._-]+/)){
if(
_0x8f0f19=== _$s7ea(111)||
_0x8f0f19=== _$s7ea(112)||
_0x8f0f19=== _$s7ea(113)||
_0x8f0f19=== _$s7ea(114)||
_0x8f0f19=== _$s7ea(16)||
_0x8f0f19=== _$s7ea(115)||
_0x8f0f19=== _$s7ea(116)||
_0x8f0f19=== _$s7ea(117)
){
_0xbd8416.add(_0x8f0f19);
}
}
}
return Array.from(_0xbd8416);
}
function analyzeDiffImpact(
diff,
packages=[]
){
const files= parseGitDiff(diff, packages);
const _0xd4e81a= new Map();
packages.forEach((_0x8e69n, _0xa6731d)=>{
_0xd4e81a.set(_0x8e69n.name, _0xa6731d);
});
const _0x1ac11b= new Set();
const globalTriggers=[];
const unmappedCodeFiles=[];
for(const _0x035d17 of files){
if(_0x035d17.classification=== _$s7ea(84)){
globalTriggers.push(_0x035d17.path);
}
const _0x609a1c= _0x035d17.classification=== _$s7ea(93)|| _0x035d17.classification=== _$s7ea(89);
if(_0x609a1c){
if(_0x035d17.packageName!== undefined){
const _0xa6731d= _0xd4e81a.get(_0x035d17.packageName);
if(_0xa6731d!== undefined){
_0x1ac11b.add(_0xa6731d);
}
} else{
unmappedCodeFiles.push(_0x035d17.path);
}
}
}
const _0xec4c1e=[];
packages.forEach((_0x8e69n, childIdx)=>{
for(const _0x32251f of _0x8e69n.dependencies??[]){
const _0x77fe1g= _0xd4e81a.get(_0x32251f);
if(_0x77fe1g!== undefined){
_0xec4c1e.push([childIdx, _0x77fe1g]);
}
}
});
const directIndices= Array.from(_0x1ac11b).sort((a, b)=> a- b);
const{ impactedIndices, hopDistances}= propagateImpactBitset(
packages.length,
directIndices,
_0xec4c1e
);
const directlyTouchedPackages= directIndices.map((_0xa6731d)=> packages[_0xa6731d].name);
const transitivelyImpactedPackages= impactedIndices.map((_0xa6731d)=> packages[_0xa6731d].name);
const packageHopDistances={};
for(const _0xa6731d of impactedIndices){
packageHopDistances[packages[_0xa6731d].name]= hopDistances[_0xa6731d];
}
let changeMode;
if(files.length=== 0){
changeMode= _$s7ea(118);
} else if(globalTriggers.length> 0){
changeMode= _$s7ea(119);
} else{
const _0xbdd71h= files.some(
(f)=> f.classification=== _$s7ea(93)|| f.classification=== _$s7ea(89)
);
changeMode= _0xbdd71h? _$s7ea(120): _$s7ea(121);
}
return{
files,
directlyTouchedPackages,
transitivelyImpactedPackages,
packageHopDistances,
changeMode,
globalTriggers,
platformSignals: _0x77ab15(files),
unmappedCodeFiles
};
}
return{classifyChangedFile,parseGitDiff,analyzeDiffImpact};})();
const _$m2_0ad=(()=>{const _$p=Uint8Array.from([46,159,70,125,29,255,12,54,140,170,188,15,68,116,72,99,87,12,206,62,197,114,210,122,234,103,32,125,250,132,31,242,220,252,227,33,210,17,8,140,219,251,197,251,1,115,228,207,228,166,18,200,19,101,59,202,198,76,101,149,123,254,130,224,177,11,244,125,170,184,224,63,199,206,38,193,252,5,53,221,228,24,134,155,201,143,138,181,216,40,17,31,90,129,90,207,50,120,121,230,67,68,19,195,241,219,143,240,52,227,242,203,170,236,49,228,41,11,232,41,83,149,228,106,33,89,35,223,54,148,85,31,182,121,183,143,52,116,117,140,14,163,1,43,87,187,51,106,133,149,162,188,195,73,242,211,105,61,64,240,86,81,171,8,170,56,102,69,52,123,136,161,21,58,136,135,216,244,87,162,30,189,3,113,233,73,208,140,212,211,111,246,81,121,232,52,53,21,8,150,52,8,65,225,185,192,224,138,69,188,112,242,126,249,162,14,140,191,152,3,21,157,116,15,162,68,90,246,188,69,107,69,141,171,28,67,82,210,47,221,148,16,167,148,242,84,249,198,124,36,222,174,162,44,111,119,82,114,40,235,172,57,143,248,224,211,208,109,5,207,55,44,80,224,114,254,0,14,224,67,175,161,32,67,233,228,201,162,57,238,187,2,199,229,17,16,2,62,170,32,116,83,115,58,28,152,255,137,7,97,248,106,210,67,101,173,79,130,206,156,130,211,64,129,31]),_$o=[0,1,2,3,4,8,13,13,14,15,16,17,18,19,25,31,37,43,46,53,60,65,72,73,80,85,88,94,97,102,105,112,115,118,125,130,135,143,145,147,153,155,157,162,166,175,179,190,193,205,219,229,230,234,240,250,254,262,288,305],_$l=[1,1,1,1,4,5,0,1,1,1,1,1,1,6,6,6,6,3,7,7,5,7,1,7,5,3,6,3,5,3,7,3,3,7,5,5,8,2,2,6,2,2,5,4,9,4,11,3,12,14,10,1,4,6,10,4,8,26,17,20],_$c=new Map(),_$td=new TextDecoder();
function _$sad(k){if(_$c.has(k))return _$c.get(k);const s=_$o[k],n=_$l[k],u=new Uint8Array(n);let q=2013806765;if((Math.imul(q|1,q|1)&7)!==1)return'';for(let i=0;i<s+n;i++){q=(q+0x9e3779b9)>>>0;if(i>=s){let z=q;z=Math.imul(z^(z>>>16),0x85ebca6b)>>>0;z=Math.imul(z^(z>>>13),0xc2b2ae35)>>>0;z=(z^(z>>>16))>>>0;u[i-s]=_$p[i]^(z&255)^((i*17)&255);}}const v=_$td.decode(u);_$c.set(k,v);return v;}
function _0x40ad0(_0x4153m){
let inSingle= false;
let inDouble= false;
for(let _0x86861= 0; _0x86861< _0x4153m.length; _0x86861++){
const _0xcc5f2= _0x4153m[_0x86861];
if(_0xcc5f2=== _$sad(0)&&!inDouble){
inSingle=!inSingle;
} else if(_0xcc5f2=== _$sad(1)&&!inSingle&& _0x4153m[_0x86861- 1]!== _$sad(2)){
inDouble=!inDouble;
} else if(_0xcc5f2=== _$sad(3)&&!inSingle&&!inDouble){
if(_0x86861=== 0|| /\s/.test(_0x4153m[_0x86861- 1])){
return _0x4153m.slice(0, _0x86861).trimEnd();
}
}
}
return _0x4153m.trimEnd();
}
function _0x12383(raw){
const _0x58114= raw.trim();
if((_0x58114.startsWith(_$sad(1))&& _0x58114.endsWith(_$sad(1)))||(_0x58114.startsWith(_$sad(0))&& _0x58114.endsWith(_$sad(0)))){
return _0x58114.slice(1,-1);
}
if(_0x58114=== _$sad(4)){
return true;
}
if(_0x58114=== _$sad(5)){
return false;
}
if(/^-?\d+(\.\d+)?$/.test(_0x58114)){
return Number(_0x58114);
}
return _0x58114;
}
function _0x9dea5(inner){
const _0xe3c36=[];
let _0x299c7= _$sad(6);
let _0x6f758= 0;
let quote= null;
for(let _0x86861= 0; _0x86861< inner.length; _0x86861++){
const _0xcc5f2= inner[_0x86861];
if(quote){
_0x299c7+= _0xcc5f2;
if(_0xcc5f2=== quote&& inner[_0x86861- 1]!== _$sad(2)){
quote= null;
}
continue;
}
if(_0xcc5f2=== _$sad(1)|| _0xcc5f2=== _$sad(0)){
quote= _0xcc5f2;
_0x299c7+= _0xcc5f2;
continue;
}
if(_0xcc5f2=== _$sad(7)|| _0xcc5f2=== _$sad(8)){
_0x6f758++;
_0x299c7+= _0xcc5f2;
continue;
}
if(_0xcc5f2=== _$sad(9)|| _0xcc5f2=== _$sad(10)){
_0x6f758--;
_0x299c7+= _0xcc5f2;
continue;
}
if(_0xcc5f2=== _$sad(11)&& _0x6f758=== 0){
if(_0x299c7.trim().length> 0){
_0xe3c36.push(_0x299c7.trim());
}
_0x299c7= _$sad(6);
continue;
}
_0x299c7+= _0xcc5f2;
}
if(_0x299c7.trim().length> 0){
_0xe3c36.push(_0x299c7.trim());
}
return _0xe3c36;
}
function _0xb54e9(raw){
const _0xfb27a= raw.trim().slice(1,-1).trim();
if(!_0xfb27a){
return[];
}
return _0x9dea5(_0xfb27a).map(_0x12383);
}
function _0x4100b(raw){
const _0xfb27a= raw.trim().slice(1,-1).trim();
const _0x86d9c={};
if(!_0xfb27a){
return _0x86d9c;
}
for(const _0xccb2d of _0x9dea5(_0xfb27a)){
const _0x128be= _0xccb2d.indexOf(_$sad(12));
if(_0x128be> 0){
const _0x5864f= _0xccb2d.slice(0, _0x128be).trim().replace(/^['"]|['"]$/g, _$sad(6));
const _0x9e3dg= _0x12383(_0xccb2d.slice(_0x128be+ 1));
_0x86d9c[_0x5864f]= _0x9e3dg;
}
}
return _0x86d9c;
}
function _0xe416h(_0x6fc8j){
if(_0x6fc8j.axes&& typeof _0x6fc8j.axes=== _$sad(13)&&!Array.isArray(_0x6fc8j.axes)){
return{
name: typeof _0x6fc8j.name=== _$sad(14)? _0x6fc8j.name: undefined,
axes: _0x6fc8j.axes,
include: Array.isArray(_0x6fc8j.include)
?(_0x6fc8j.include)
: undefined,
exclude: Array.isArray(_0x6fc8j.exclude)
?(_0x6fc8j.exclude)
: undefined,
defaultEstimatedMinutes:
typeof _0x6fc8j.defaultEstimatedMinutes=== _$sad(15)
? _0x6fc8j.defaultEstimatedMinutes
: undefined,
provider:
_0x6fc8j.provider=== _$sad(16)|| _0x6fc8j.provider=== _$sad(17)? _0x6fc8j.provider: undefined
};
}
let matrixObj;
let workflowName=
typeof _0x6fc8j.name=== _$sad(14)? _0x6fc8j.name: undefined;
if(_0x6fc8j.jobs&& typeof _0x6fc8j.jobs=== _$sad(13)){
const jobs= _0x6fc8j.jobs;
for(const[jobName, jobDef] of Object.entries(jobs)){
const strategy= jobDef?.strategy;
if(strategy?.matrix&& typeof strategy.matrix=== _$sad(13)){
matrixObj= strategy.matrix;
if(!workflowName){
workflowName= jobName;
}
break;
}
}
} else if(_0x6fc8j.matrix&& typeof _0x6fc8j.matrix=== _$sad(13)){
matrixObj= _0x6fc8j.matrix;
} else{
matrixObj= _0x6fc8j;
}
const axes={};
let include;
let exclude;
for(const[_0x2a42t, _0x877fy] of Object.entries(matrixObj??{})){
if(_0x2a42t=== _$sad(18)&& Array.isArray(_0x877fy)){
include= _0x877fy;
} else if(_0x2a42t=== _$sad(19)&& Array.isArray(_0x877fy)){
exclude= _0x877fy;
} else if(Array.isArray(_0x877fy)){
axes[_0x2a42t]= _0x877fy;
}
}
return{ name: workflowName, axes, include, exclude};
}
function parseWorkflowSpec(raw){
const _0x29efi= raw.trim();
if(_0x29efi.startsWith(_$sad(8))){
const _0x6fc8j= JSON.parse(_0x29efi);
return _0xe416h(_0x6fc8j);
}
const _0xb5a1k= raw
.split(/\r?\n/)
.map(_0x40ad0)
.filter((_0x4153m)=> _0x4153m.trim().length> 0);
let workflowName;
let matrixStartIdx=-1;
let _0xfb7al=-1;
for(let _0x86861= 0; _0x86861< _0xb5a1k.length; _0x86861++){
const _0x4153m= _0xb5a1k[_0x86861];
const _0x872cn= _0x4153m.search(/\S/);
const _0xcd05o= _0x4153m.trim();
if(_0x872cn=== 0&& _0xcd05o.startsWith(_$sad(20))){
workflowName= String(_0x12383(_0xcd05o.slice((0x28e025ee^0x28e025eb))));
}
if(_0xcd05o=== _$sad(21)){
matrixStartIdx= _0x86861+ 1;
_0xfb7al= _0x872cn;
break;
}
}
const _0x12dep= matrixStartIdx>= 0? matrixStartIdx: 0;
const _0x58b7q= matrixStartIdx>= 0? _0xfb7al:-1;
const axes={};
const include=[];
const exclude=[];
let keyIndent= null;
let _0x9e90r= null;
let activeObj= null;
let _0xe469s=-1;
for(let _0x86861= _0x12dep; _0x86861< _0xb5a1k.length; _0x86861++){
const _0x4153m= _0xb5a1k[_0x86861];
const _0x872cn= _0x4153m.search(/\S/);
const _0xcd05o= _0x4153m.trim();
if(_0x58b7q>= 0&& _0x872cn<= _0x58b7q){
break;
}
if(keyIndent=== null&&!_0xcd05o.startsWith(_$sad(22))){
keyIndent= _0x872cn;
}
if(keyIndent!== null&& _0x872cn=== keyIndent&&!_0xcd05o.startsWith(_$sad(22))){
activeObj= null;
const _0x128be= _0xcd05o.indexOf(_$sad(12));
if(_0x128be< 0){
continue;
}
const _0x2a42t= _0xcd05o.slice(0, _0x128be).trim();
const _0x701bu= _0xcd05o.slice(_0x128be+ 1).trim();
_0x9e90r= _0x2a42t;
if(_0x2a42t=== _$sad(18)|| _0x2a42t=== _$sad(19)){
if(_0x701bu.startsWith(_$sad(7))){
const _0xb5f4v= _0x9dea5(_0x701bu.slice(1,-1)).map(_0x4100b);
if(_0x2a42t=== _$sad(18)){
include.push(..._0xb5f4v);
} else{
exclude.push(..._0xb5f4v);
}
_0x9e90r= null;
}
} else if(_0x701bu.startsWith(_$sad(7))){
axes[_0x2a42t]= _0xb54e9(_0x701bu);
_0x9e90r= null;
} else if(_0x701bu.length=== 0){
axes[_0x2a42t]=[];
}
continue;
}
if(!_0x9e90r){
continue;
}
if(_0x9e90r=== _$sad(18)|| _0x9e90r=== _$sad(19)){
const _0xfbcdw= _0x9e90r=== _$sad(18)? include: exclude;
if(_0xcd05o.startsWith(_$sad(22))){
const _0x41a6x= _0xcd05o.slice(1).trim();
if(_0x41a6x.startsWith(_$sad(8))){
_0xfbcdw.push(_0x4100b(_0x41a6x));
activeObj= null;
} else{
activeObj={};
_0xfbcdw.push(activeObj);
_0xe469s= _0x872cn;
const _0x128be= _0x41a6x.indexOf(_$sad(12));
if(_0x128be> 0){
const _0x5864f= _0x41a6x.slice(0, _0x128be).trim();
const _0x9e3dg= _0x12383(_0x41a6x.slice(_0x128be+ 1));
activeObj[_0x5864f]= _0x9e3dg;
}
}
} else if(activeObj&& _0x872cn> _0xe469s){
const _0x128be= _0xcd05o.indexOf(_$sad(12));
if(_0x128be> 0){
const _0x5864f= _0xcd05o.slice(0, _0x128be).trim();
const _0x9e3dg= _0x12383(_0xcd05o.slice(_0x128be+ 1));
activeObj[_0x5864f]= _0x9e3dg;
}
}
} else if(_0xcd05o.startsWith(_$sad(22))){
const _0x877fy= _0x12383(_0xcd05o.slice(1));
if(!axes[_0x9e90r]){
axes[_0x9e90r]=[];
}
axes[_0x9e90r].push(_0x877fy);
}
}
return{
name: workflowName,
axes,
include: include.length> 0? include: undefined,
exclude: exclude.length> 0? exclude: undefined
};
}
function _0xcd58z(vars){
const _0x133110= String(
vars.os?? vars[_$sad(23)]?? vars.runner?? vars.platform?? _$sad(24)
).toLowerCase();
const _0x590a11= vars.arch!== undefined? String(vars.arch).toLowerCase(): _$sad(6);
let os= _$sad(24);
if(_0x133110.includes(_$sad(25))|| _0x133110.includes(_$sad(26))|| _0x133110.includes(_$sad(27))){
os= _$sad(28);
} else if(_0x133110.includes(_$sad(29))){
os= _$sad(30);
}
let arch= _$sad(31);
if(_0x590a11.includes(_$sad(32))|| _0x590a11.includes(_$sad(33))){
arch= _$sad(34);
} else if(_0x590a11.includes(_$sad(31))|| _0x590a11.includes(_$sad(35))){
arch= _$sad(31);
} else if(_0x133110.includes(_$sad(32))|| _0x133110.includes(_$sad(33))|| _0x133110.includes(_$sad(36))){
arch= _$sad(34);
} else if(
os=== _$sad(28)&&
(_0x133110.includes(_$sad(37))|| _0x133110.includes(_$sad(38))|| _0x133110.includes(_$sad(39))|| _0x133110.includes(_$sad(40))|| _0x133110.includes(_$sad(41)))
){
arch= _$sad(34);
}
return{ os, arch};
}
function _0x9ee312(suite, fallback){
const _0x58114=(suite?? _$sad(6)).toLowerCase();
if(_0x58114=== _$sad(42)|| _0x58114=== _$sad(43)|| _0x58114=== _$sad(44)){
return (0x172703d4^0x172703d7);
}
if(_0x58114=== _$sad(45)){
return (0x13702b4d^0x13702b4b);
}
if(_0x58114=== _$sad(46)){
return (0xa7f72bb^0xa7f72b7);
}
if(_0x58114=== _$sad(47)){
return (0x2097e2b9^0x2097e2ab);
}
return fallback;
}
function _0xe4bc13(
_0x88251k,
pattern
){
const keys= Object.keys(pattern);
if(keys.length=== 0){
return false;
}
for(const _0x5864f of keys){
if(!(_0x5864f in _0x88251k)|| String(_0x88251k[_0x5864f])!== String(pattern[_0x5864f])){
return false;
}
}
return true;
}
function _0x2a9514(
vars,
index,
defaultMinutes,
defaultProvider
){
const{ os, arch}= _0xcd58z(vars);
const _0x706e15=
vars.runtime??
vars.node??
vars[_$sad(48)]??
vars.python??
vars[_$sad(49)]??
vars.go;
const runtime= _0x706e15!== undefined? String(_0x706e15): undefined;
const _0xb64716= vars.suite?? vars[_$sad(50)]?? vars.group;
const suite= _0xb64716!== undefined? String(_0xb64716): undefined;
const _0xfc2017= vars.targetPackage?? vars.package?? vars.workspace?? vars.scope;
const targetPackage= _0xfc2017!== undefined? String(_0xfc2017): undefined;
const provider=
vars.provider=== _$sad(17)|| vars.provider=== _$sad(16)? vars.provider: defaultProvider;
const vcpu= typeof vars.vcpu=== _$sad(15)? vars.vcpu: undefined;
const estimatedMinutes=
typeof vars.estimatedMinutes=== _$sad(15)
? vars.estimatedMinutes
: _0x9ee312(suite, defaultMinutes);
const required= Boolean(vars.required);
const _0x41f918=[os, arch];
if(runtime){
_0x41f918.push(`rt-${runtime}`);
}
if(suite){
_0x41f918.push(suite);
}
if(targetPackage){
_0x41f918.push(targetPackage.replace(/[^a-zA-Z0-9_-]/g, _$sad(51)));
}
const _0x87d219= typeof vars.id=== _$sad(14)&& vars.id.length> 0? vars.id: null;
const id= _0x87d219?? `${idParts.join('-')}-${index}`;
return{
id,
os,
arch,
runtime,
suite,
targetPackage,
provider,
vcpu,
estimatedMinutes,
required,
variables:{...vars}
};
}
function expandWorkflowMatrix(
input,
defaultProvider= _$sad(16)
){
if(Array.isArray(input)){
return input.map((cell)=>({
...cell,
provider: cell.provider?? defaultProvider,
estimatedMinutes:
cell.estimatedMinutes?? _0x9ee312(cell.suite, (0xf504b9f^0xf504b97)),
variables:{...(cell.variables??{})}
}));
}
const _0xcdab1a= typeof input=== _$sad(14)? parseWorkflowSpec(input): input;
const _0x13841b= Object.entries(_0xcdab1a.axes).filter(([, vals])=> vals.length> 0);
const provider= _0xcdab1a.provider?? defaultProvider;
const fallbackMinutes= _0xcdab1a.defaultEstimatedMinutes?? (0x287fb803^0x287fb80b);
let combinations=[];
if(_0x13841b.length> 0){
combinations=[{}];
for(const[axisKey, axisValues] of _0x13841b){
const _0x595d1c=[];
for(const _0x9f361d of combinations){
for(const _0x877fy of axisValues){
_0x595d1c.push({..._0x9f361d,[axisKey]: _0x877fy});
}
}
combinations= _0x595d1c;
}
}
if(_0xcdab1a.exclude&& _0xcdab1a.exclude.length> 0){
combinations= combinations.filter(
(_0x88251k)=>!_0xcdab1a.exclude.some((ex)=> _0xe4bc13(_0x88251k, ex))
);
}
const _0xe50f1e= _0x13841b.map(([_0x5864f])=> _0x5864f);
if(_0xcdab1a.include&& _0xcdab1a.include.length> 0){
const _0x2ae81f=[];
for(const _0x70c11g of _0xcdab1a.include){
const _0xb69a1h={};
let _0xfc731i= false;
for(const _0x5864f of _0xe50f1e){
if(_0x5864f in _0x70c11g){
_0xb69a1h[_0x5864f]= _0x70c11g[_0x5864f];
_0xfc731i= true;
}
}
let _0x424c1j= false;
if(_0xfc731i&& combinations.length> 0){
for(const _0x88251k of combinations){
if(_0xe4bc13(_0x88251k, _0xb69a1h)){
Object.assign(_0x88251k, _0x70c11g);
_0x424c1j= true;
}
}
}
if(!_0x424c1j){
_0x2ae81f.push({..._0x70c11g});
}
}
combinations.push(..._0x2ae81f);
}
return combinations.map((_0x88251k, idx)=>
_0x2a9514(_0x88251k, idx, fallbackMinutes, provider)
);
}
function _0xcdfe1l(branch){
const _0x13d71m= branch.replace(/^refs\/heads\//, _$sad(6)).toLowerCase();
return(
_0x13d71m=== _$sad(52)||
_0x13d71m=== _$sad(53)||
_0x13d71m=== _$sad(54)||
_0x13d71m=== _$sad(55)||
_0x13d71m.startsWith(_$sad(56))
);
}
function _0x59b01n(_0x71141r){
if(typeof _0x71141r.remainingEstimatedMinutes=== _$sad(15)&& _0x71141r.remainingEstimatedMinutes>= 0){
return _0x71141r.remainingEstimatedMinutes;
}
const _0x9f891o= _0x71141r.p95DurationMinutes?? (0x19beca78^0x19beca77);
const _0xe5621p= _0x71141r.elapsedMinutes?? 0;
return Math.max(1, Math.round((_0x9f891o- _0xe5621p)* (0x2ef82c0f^0x2ef82c6b))/ (0x2fc65f33^0x2fc65f57));
}
function detectZombieRuns(
runs,
options={}
){
const p95Multiplier= options.p95Multiplier?? 1.5;
const stallThresholdMinutes= options.stallThresholdMinutes?? (0x29ed9dc4^0x29ed9dcb);
const cancelProtectedBranches= options.cancelProtectedBranches?? false;
const _0x2b3b1q= new Map();
for(const _0x71141r of runs){
const _0xb6ed1s=
_0x71141r.pullRequestNumber!== undefined
? `pr:${run.pullRequestNumber}`
: `branch:${run.branch}`;
const _0x2a42t= `${run.workflowName}::${scopeKey}`;
const _0xfcc61t= _0x2b3b1q.get(_0x2a42t)??[];
_0xfcc61t.push(_0x71141r);
_0x2b3b1q.set(_0x2a42t, _0xfcc61t);
}
const cancelActions=[];
const _0x429f1u=[];
const _0x88781v= new Set();
for(const _0xfcc61t of _0x2b3b1q.values()){
const _0xce511w=[..._0xfcc61t].sort(
(a, b)=> Date.parse(b.startedAtIso)- Date.parse(a.startedAtIso)
);
const _0x142a1x= _0xce511w[0];
_0x429f1u.push(_0x142a1x.runId);
const _0x5a031y=
Boolean(_0x142a1x.isProtectedBranch)|| _0xcdfe1l(_0x142a1x.branch);
if(_0x5a031y&&!cancelProtectedBranches){
for(let _0x86861= 1; _0x86861< _0xce511w.length; _0x86861++){
_0x429f1u.push(_0xce511w[_0x86861].runId);
}
continue;
}
for(let _0x86861= 1; _0x86861< _0xce511w.length; _0x86861++){
const _0x9fdc1z= _0xce511w[_0x86861];
_0x88781v.add(_0x9fdc1z.runId);
cancelActions.push({
runId: _0x9fdc1z.runId,
reason: _$sad(57),
supersededByRunId: _0x142a1x.runId,
wastedMinutesAvoided: _0x59b01n(_0x9fdc1z)
});
}
}
for(const _0x71141r of runs){
if(_0x88781v.has(_0x71141r.runId)){
continue;
}
let flaggedViaJobs= false;
if(_0x71141r.jobs&& _0x71141r.jobs.length> 0){
for(const _0xe5b520 of _0x71141r.jobs){
if(
_0xe5b520.lastLogOutputAgoMinutes!== undefined&&
_0xe5b520.lastLogOutputAgoMinutes>= stallThresholdMinutes
){
flaggedViaJobs= true;
cancelActions.push({
runId: _0x71141r.runId,
jobId: _0xe5b520.jobId,
reason: _$sad(58),
wastedMinutesAvoided: Math.max(
1,
Math.round(((_0xe5b520.p95DurationMinutes?? (0x19a12623^0x19a12637))* 0.5)* (0x32ec9d4f^0x32ec9d2b))/ (0x1fa65773^0x1fa65717)
)
});
} else if(
_0xe5b520.p95DurationMinutes!== undefined&&
_0xe5b520.p95DurationMinutes> 0&&
_0xe5b520.elapsedMinutes> _0xe5b520.p95DurationMinutes* p95Multiplier
){
flaggedViaJobs= true;
cancelActions.push({
runId: _0x71141r.runId,
jobId: _0xe5b520.jobId,
reason: _$sad(59),
wastedMinutesAvoided: Math.max(
1,
Math.round((_0xe5b520.p95DurationMinutes* 0.5)* (0x1cec3aef^0x1cec3a8b))/ (0x3d90d93^0x3d90df7)
)
});
}
}
}
if(
!flaggedViaJobs&&
_0x71141r.elapsedMinutes!== undefined&&
_0x71141r.p95DurationMinutes!== undefined&&
_0x71141r.p95DurationMinutes> 0&&
_0x71141r.elapsedMinutes> _0x71141r.p95DurationMinutes* p95Multiplier
){
cancelActions.push({
runId: _0x71141r.runId,
reason: _$sad(59),
wastedMinutesAvoided: Math.max(
1,
Math.round((_0x71141r.p95DurationMinutes* 0.5)* (0x8b4828f^0x8b482eb))/ (0xf2ef6b3^0xf2ef6d7)
)
});
}
}
const _0x2b8e21= new Set(
cancelActions.filter((a)=>!a.jobId).map((a)=> a.runId)
);
const _0x716722= _0x429f1u.filter((id)=>!_0x2b8e21.has(id));
const totalWastedMinutesAvoided=
Math.round(
cancelActions.reduce((acc, item)=> acc+ item.wastedMinutesAvoided, 0)* (0x29887c2f^0x29887c4b)
)/ (0x1a8089d3^0x1a8089b7);
return{
cancelActions,
activeHeadRuns: _0x716722,
totalWastedMinutesAvoided
};
}
return{parseWorkflowSpec,expandWorkflowMatrix,detectZombieRuns};})();
const _$m3_44d=(()=>{const _$p=Uint8Array.from([0,15,31,111,223,145,205,77,32,44,71,118,102,34,138,114,96,118,136,98,243,249,92,140,82,143,112,195,27,208,174,131,91,215,62,79,109,22,63,36,104,177,226,175,195,205,23,51,21,112,172,215,227,183,242,184,100,7,107,36,54,188,201,156,207,163,139,235]),_$o=[0,5,11,18,24,29,46,59],_$l=[5,6,7,6,5,17,13,9],_$c=new Map(),_$td=new TextDecoder();
function _$s44d(k){if(_$c.has(k))return _$c.get(k);const s=_$o[k],n=_$l[k],u=new Uint8Array(n);let q=2936284237;if((Math.imul(q|1,q|1)&7)!==1)return'';for(let i=0;i<s+n;i++){q=(q+0x9e3779b9)>>>0;if(i>=s){let z=q;z=Math.imul(z^(z>>>16),0x85ebca6b)>>>0;z=Math.imul(z^(z>>>13),0xc2b2ae35)>>>0;z=(z^(z>>>16))>>>0;u[i-s]=_$p[i]^(z&255)^((i*17)&255);}}const v=_$td.decode(u);_$c.set(k,v);return v;}
const _0x244d0= 0.20;
const _0x6a261={
github:{
linux:{ x64: 0.008, arm64: 0.005},
windows:{ x64: 0.016, arm64: 0.010},
macos:{ x64: 0.080, arm64: 0.080}
},
aws:{
linux:{ x64: 0.004, arm64: 0.003},
windows:{ x64: 0.010, arm64: 0.008},
macos:{ x64: 0.050, arm64: 0.065}
}
};
const _0xafff2={
starter: (0x7dd5fba^0x7dd5f8b),
growth: (0x1297f462^0x1297f4f7),
scale: (0x17ca86c0^0x17ca87eb)
};
function _0xf5d83(amount){
return Math.round((amount+ Number.EPSILON)* (0x17ee7db3^0x17ee7dd7))/ (0x2f440d2f^0x2f440d4b);
}
function _0x3bb14(amount){
return Math.round((amount+ Number.EPSILON)* (0x79f4ba7^0x79f6cb7))/ (0x128223bb^0x128204ab);
}
function getRunnerMinuteRateUsd(
provider,
os,
arch,
vcpu
){
const _0x818a5= _0x6a261[provider]?.[os]?.[arch]?? 0.008;
const _0xc7636= os=== _$s44d(0)? 3: (0x2e370595^0x2e370597);
if(vcpu!== undefined&& vcpu> _0xc7636){
return _0x3bb14(_0x818a5*(vcpu/ _0xc7636));
}
return _0x818a5;
}
function estimateCellCostUsd(cell){
const provider= cell.provider?? _$s44d(1);
const _0x0d3c7= cell.estimatedMinutes?? (0xa3bba03^0xa3bba0b);
const _0x53158= getRunnerMinuteRateUsd(provider, cell.os, cell.arch, cell.vcpu);
return _0x3bb14(_0x0d3c7* _0x53158);
}
function resolveRepoTier(
activeContributors= (0x28212472^0x28212477),
explicitTier
){
let tier;
if(explicitTier){
tier= explicitTier;
} else if(activeContributors<= (0x31d10e61^0x31d10e6b)){
tier= _$s44d(2);
} else if(activeContributors<= (0x1dcd5965^0x1dcd5957)){
tier= _$s44d(3);
} else{
tier= _$s44d(4);
}
return{
tier,
flatTierFeeUsd: _0xafff2[tier]
};
}
function computeSavingsInvoice(input){
const{ tier, flatTierFeeUsd}= resolveRepoTier(
input.activeContributors,
input.repoSizeTier
);
const pricingModel= input.pricingModel?? _$s44d(5);
const breakdownByOs={
linux:{ savedMinutes: 0, executedMinutes: 0, savedCostUsd: 0},
macos:{ savedMinutes: 0, executedMinutes: 0, savedCostUsd: 0},
windows:{ savedMinutes: 0, executedMinutes: 0, savedCostUsd: 0}
};
let _0x98ee9= 0;
let _0xdec7a= 0;
for(const _0x24a0b of input.events){
const _0x6a79c= Math.max(0, _0x24a0b.savedMinutes);
const _0xb052d= Math.max(0, _0x24a0b.executedMinutes?? 0);
const _0x53158= getRunnerMinuteRateUsd(_0x24a0b.provider, _0x24a0b.os, _0x24a0b.arch, _0x24a0b.vcpu);
const _0xf62be= _0x6a79c* _0x53158;
const _0x3c04f= _0xb052d* _0x53158;
_0x98ee9+= _0xf62be;
_0xdec7a+= _0x3c04f;
const _0x81ddg= breakdownByOs[_0x24a0b.os];
_0x81ddg.savedMinutes= _0xf5d83(_0x81ddg.savedMinutes+ _0x6a79c);
_0x81ddg.executedMinutes= _0xf5d83(_0x81ddg.executedMinutes+ _0xb052d);
_0x81ddg.savedCostUsd= _0xf5d83(_0x81ddg.savedCostUsd+ _0xf62be);
}
const grossComputeSavedUsd= _0xf5d83(_0x98ee9);
const grossExecutedCostUsd= _0xf5d83(_0xdec7a);
const grossBaselineCostUsd= _0xf5d83(_0x98ee9+ _0xdec7a);
const savingsShareFeeUsd= _0xf5d83(grossComputeSavedUsd* _0x244d0);
const netCustomerSavingsOnShareUsd= _0xf5d83(
grossComputeSavedUsd- savingsShareFeeUsd
);
const netCustomerSavingsOnFlatUsd= _0xf5d83(
grossComputeSavedUsd- flatTierFeeUsd
);
let billingModeApplied;
if(pricingModel=== _$s44d(6)){
billingModeApplied= _$s44d(6);
} else if(pricingModel=== _$s44d(7)){
billingModeApplied= _$s44d(7);
} else{
billingModeApplied=
savingsShareFeeUsd<= flatTierFeeUsd? _$s44d(6): _$s44d(7);
}
const effectiveFeeUsd=
billingModeApplied=== _$s44d(6)? savingsShareFeeUsd: flatTierFeeUsd;
return{
month: input.month,
tier,
flatTierFeeUsd,
grossBaselineCostUsd,
grossExecutedCostUsd,
grossComputeSavedUsd,
savingsShareRate: _0x244d0,
savingsShareFeeUsd,
netCustomerSavingsOnShareUsd,
netCustomerSavingsOnFlatUsd,
effectiveFeeUsd,
billingModeApplied,
breakdownByOs
};
}
return{getRunnerMinuteRateUsd,estimateCellCostUsd,resolveRepoTier,computeSavingsInvoice};})();
const _$m4_1a1=(()=>{const { Buffer } = _$ext0;
const { createHmac, timingSafeEqual } = _$ext1;
const _$p=Uint8Array.from([30,86,223,196,207,178,53,153,232,239,40,243,171,234,156,234,83,112,228,42,57,182,93,96,136,85,76,56,253,158,78,85,143,200,46,49,29,47,251,253,180,56,64,251,14,201,21,76,175,231,48,1,21,214,7,154,191,179,91,244,232,22,98,148,167,223,78,49,98,185,139,248,215,241,198,19,90,16,121,94,109,10,66,178,42,106,85,116,28,221,246,252,54,212,189,226,13,48,126,9,142,85,232,130,183,97,33,84,138,214,76,110,220,212,249,222,4,252,237,25,64,127,76,118,188,128,98,102,34,69,215,172,47,13,207,215,205,134,196,203,57,243,225,170,84,175,132,2,189,209,164,0,232,68,75,186,11,222,66,236,127,53,43,171,157,43,53,102,2,111,112,29,126,12,57,187,207,81,8,109,2,153,74,136,192,251,91,76,197,130,198,52,85,180,61,27,163,33,203,9,194,56,245,158,9,172,191,112,85,119,61,11,25,199,24,3,2,229,218,134,162,228,237,239,222,128,86,133,37,60,250,213,86,153,94,255,193,69,215,229,147,214,155,155,54,21,246,79,15,129,149,74,111,171,222,83,90,134,226,31,132,121,138,19,11,67,186,39,227,174,71,66,250,112,244]),_$o=[0,6,13,17,20,27,33,36,50,57,74,93,111,115,168,215,245,249,255,260,268],_$l=[6,7,4,3,7,6,3,14,7,17,19,18,4,53,47,30,4,6,5,8,7],_$c=new Map(),_$td=new TextDecoder();
function _$s1a1(k){if(_$c.has(k))return _$c.get(k);const s=_$o[k],n=_$l[k],u=new Uint8Array(n);let q=2509533601;if((Math.imul(q|1,q|1)&7)!==1)return'';for(let i=0;i<s+n;i++){q=(q+0x9e3779b9)>>>0;if(i>=s){let z=q;z=Math.imul(z^(z>>>16),0x85ebca6b)>>>0;z=Math.imul(z^(z>>>13),0xc2b2ae35)>>>0;z=(z^(z>>>16))>>>0;u[i-s]=_$p[i]^(z&255)^((i*17)&255);}}const v=_$td.decode(u);_$c.set(k,v);return v;}
const{ executePruningKernel}= _$m0_7d6;
const{ analyzeDiffImpact, classifyChangedFile, parseGitDiff}= _$m1_7ea;
const{ detectZombieRuns, expandWorkflowMatrix, parseWorkflowSpec}= _$m2_0ad;
const{ computeSavingsInvoice, estimateCellCostUsd, getRunnerMinuteRateUsd, resolveRepoTier}= _$m3_44d;
function _0x71a10(_0x437fe, telemetryList){
for(const _0xb77a1 of telemetryList){
if(_0xb77a1.cellId&& _0xb77a1.cellId=== _0x437fe.id){
return _0xb77a1;
}
}
for(const _0xb77a1 of telemetryList){
if(
!_0xb77a1.cellId&&
_0xb77a1.targetPackage&&
_0xb77a1.suite&&
_0xb77a1.targetPackage=== _0x437fe.targetPackage&&
_0xb77a1.suite=== _0x437fe.suite
){
return _0xb77a1;
}
}
for(const _0xb77a1 of telemetryList){
if(!_0xb77a1.cellId&&!_0xb77a1.targetPackage&& _0xb77a1.suite&& _0xb77a1.suite=== _0x437fe.suite){
return _0xb77a1;
}
}
for(const _0xb77a1 of telemetryList){
if(!_0xb77a1.cellId&&!_0xb77a1.suite&& _0xb77a1.targetPackage&& _0xb77a1.targetPackage=== _0x437fe.targetPackage){
return _0xb77a1;
}
}
return undefined;
}
function _0xfd532(n){
return Math.round((n+ Number.EPSILON)* (0x246ba817^0x246b8f07))/ (0x152a524b^0x152a755b);
}
function _0x432c3(n){
return Math.round((n+ Number.EPSILON)* (0x2e1a1183^0x2e1a11e7))/ (0x24a9b9df^0x24a9b9bb);
}
function planMatrixExecution(input){
const packages= input.packages??[];
const provider= input.defaultProvider?? _$s1a1(0);
const impact= analyzeDiffImpact(input.diff, packages);
const _0x89054= expandWorkflowMatrix(input.matrix, provider);
const telemetry= input.telemetry??[];
const _0xcede5= new Map();
packages.forEach((pkg, idx)=>{
_0xcede5.set(pkg.name, idx);
});
const hopDistances= new Int32Array(packages.length);
hopDistances.fill(-1);
for(const[pkgName, dist] of Object.entries(impact.packageHopDistances)){
const idx= _0xcede5.get(pkgName);
if(idx!== undefined){
hopDistances[idx]= dist;
}
}
const kernelInputs= _0x89054.map((_0x437fe, idx)=>{
const _0x14b76= _0x71a10(_0x437fe, telemetry);
const minutes= _0x437fe.estimatedMinutes?? _0x14b76?.p95DurationMinutes?? (0x182eb9cf^0x182eb9c7);
const _0x5a907={..._0x437fe, estimatedMinutes: minutes, provider: _0x437fe.provider?? provider};
const costUsd= estimateCellCostUsd(_0x5a907);
const pkgIdx= _0x437fe.targetPackage!== undefined?(_0xcede5.get(_0x437fe.targetPackage)??-1):-1;
return{
idx,
id: _0x437fe.id,
os: _0x437fe.os,
arch: _0x437fe.arch,
runtime: _0x437fe.runtime?? _$s1a1(1),
suite: _0x437fe.suite?? _$s1a1(2),
pkgIdx,
required: Boolean(_0x437fe.required),
minutes,
costUsd,
hasTelemetry: _0x14b76!== undefined,
totalRuns: _0x14b76?.totalRuns?? 0,
failures: _0x14b76?.failures?? 0,
flakeRetriesPassed: _0x14b76?.flakeRetriesPassed?? 0,
trueRegressions: _0x14b76?.trueRegressions??-1,
recentFailureAgeHours: _0x14b76?.recentFailureAgeHours??-1
};
});
const _0xa0698= executePruningKernel(
impact.changeMode,
kernelInputs,
hopDistances,
packages.length> 0,
impact.unmappedCodeFiles.length,
impact.platformSignals,
input.riskThreshold?? 0.28,
input.keepSmokeOnDocsOnly?? true
);
const decisions=[];
const selectedCells=[];
const skippedCells=[];
let _0xe6429= 0;
let _0x2c1ba= 0;
let _0x71f4b= 0;
let _0xb7cdc= 0;
for(let _0xfda6d= 0; _0xfda6d< _0x89054.length; _0xfda6d++){
const _0x437fe= _0x89054[_0xfda6d];
const _0x8958f= kernelInputs[_0xfda6d];
const _0xcf31g= _0xa0698.decisions[_0xfda6d];
const _0x150ah={
..._0x437fe,
estimatedMinutes: _0x8958f.minutes,
provider: _0x437fe.provider?? provider
};
_0xe6429+= _0x8958f.minutes;
_0x71f4b+= _0x8958f.costUsd;
if(_0xcf31g.action=== _$s1a1(3)){
selectedCells.push(_0x150ah);
_0x2c1ba+= _0x8958f.minutes;
_0xb7cdc+= _0x8958f.costUsd;
} else{
skippedCells.push(_0x150ah);
}
decisions.push({
cell: _0x150ah,
action: _0xcf31g.action,
reason: _0xcf31g.reason,
riskScore: _0xcf31g.riskScore,
flakeIndex: _0xcf31g.flakeIndex,
wilsonScore: _0xcf31g.wilsonScore,
estimatedMinutes: _0x8958f.minutes,
estimatedCostUsd: _0x8958f.costUsd
});
}
const savedMinutes= _0x432c3(_0xe6429- _0x2c1ba);
const savedCostUsd= _0xfd532(_0x71f4b- _0xb7cdc);
const pruneRatio= _0x89054.length> 0? _0xfd532(skippedCells.length/ _0x89054.length): 0;
return{
changeMode: impact.changeMode,
impact,
selectedCells,
skippedCells,
decisions,
anchorCellId: _0xa0698.anchorIdx>= 0? _0x89054[_0xa0698.anchorIdx].id: null,
summary:{
totalCells: _0x89054.length,
selectedCount: selectedCells.length,
skippedCount: skippedCells.length,
pruneRatio,
baselineMinutes: _0x432c3(_0xe6429),
selectedMinutes: _0x432c3(_0x2c1ba),
savedMinutes,
baselineCostUsd: _0xfd532(_0x71f4b),
selectedCostUsd: _0xfd532(_0xb7cdc),
savedCostUsd
}
};
}
function _0x5ae3i(headers, target){
const _0xa0bcj= target.toLowerCase();
for(const[k, v] of Object.entries(headers)){
if(k.toLowerCase()=== _0xa0bcj){
return v;
}
}
return undefined;
}
function _0xe695k(rawBody, secret, signatureHeader){
if(!secret||!signatureHeader||!signatureHeader.startsWith(_$s1a1(4))){
return false;
}
const _0x2c6el= signatureHeader.slice(_$s1a1(4).length).trim();
if(!/^[0-9a-fA-F]{64}$/.test(_0x2c6el)){
return false;
}
const _0x7247m= createHmac(_$s1a1(5), secret).update(rawBody).digest(_$s1a1(6));
const _0xb820n= Buffer.from(_0x2c6el, _$s1a1(6));
const _0xfdf9o= Buffer.from(_0x7247m, _$s1a1(6));
if(_0xb820n.length!== _0xfdf9o.length){
return false;
}
return timingSafeEqual(_0xb820n, _0xfdf9o);
}
function handleGitHubWebhook(request){
const event= _0x5ae3i(request.headers, _$s1a1(7))?? _$s1a1(8);
const deliveryId= _0x5ae3i(request.headers, _$s1a1(9))?? null;
const _0x43d2p= _0x5ae3i(request.headers, _$s1a1(10));
const _0x89abq= _0x5ae3i(request.headers, _$s1a1(11));
const _0xcf84r= Buffer.isBuffer(request.rawBody)
? request.rawBody
: Buffer.from(request.rawBody, _$s1a1(12));
if(!_0xe695k(_0xcf84r, request.secret, _0x43d2p)){
return{
status: (0x2adacd8a^0x2adacc1b),
verified: false,
event,
deliveryId,
error: _$s1a1(13)
};
}
if(_0x89abq!== undefined&& request.nowMs!== undefined){
const _0x155ds= /^\d+$/.test(_0x89abq.trim())
? Number(_0x89abq.trim())*(_0x89abq.trim().length<= (0x2c5d5bad^0x2c5d5ba7)? 1000: 1)
: Date.parse(_0x89abq);
const _0x5b36t= request.maxSkewMs?? (0x3109339b^0x310da07b);
if(!Number.isFinite(_0x155ds)|| Math.abs(request.nowMs- _0x155ds)> _0x5b36t){
return{
status: (0x1204e11e^0x1204e087),
verified: true,
event,
deliveryId,
error: _$s1a1(14)
};
}
}
if(deliveryId&& request.seenDeliveries){
if(request.seenDeliveries.has(deliveryId)){
return{
status: (0x21048442^0x210485db),
verified: true,
event,
deliveryId,
error: `Replay detected for delivery ${deliveryId}`
};
}
request.seenDeliveries.add(deliveryId);
}
let payload;
try{
payload= JSON.parse(_0xcf84r.toString(_$s1a1(12)));
} catch{
return{
status: (0x2ade0af7^0x2ade0b67),
verified: true,
event,
deliveryId,
error: _$s1a1(15)
};
}
if(event=== _$s1a1(16)){
return{
status: (0x19dd72f1^0x19dd723b),
verified: true,
event,
deliveryId
};
}
let diffSource=[];
if(typeof payload.diff=== _$s1a1(17)){
diffSource= payload.diff;
} else if(Array.isArray(payload.changed_files)){
diffSource= payload.changed_files.map((_0xb77a1)=> String(_0xb77a1));
} else if(Array.isArray(payload.commits)){
const _0xa10fu= new Set();
for(const _0xe6e8v of payload.commits){
for(const _0x2cc1w of[_$s1a1(18), _$s1a1(19), _$s1a1(20)]){
const _0x729ax= _0xe6e8v[_0x2cc1w];
if(Array.isArray(_0x729ax)){
for(const _0xb873y of _0x729ax){
_0xa10fu.add(String(_0xb873y));
}
}
}
}
diffSource= Array.from(_0xa10fu);
}
const _0xfe4cz=
request.workflowMatrix??
(payload.matrix);
const plan=
_0xfe4cz!== undefined
? planMatrixExecution({
diff: diffSource,
packages: request.workspacePackages,
matrix: _0xfe4cz,
telemetry: request.telemetry
})
: undefined;
const _0x442510=
request.inFlightRuns??
(Array.isArray(payload.in_flight_runs)
?(payload.in_flight_runs)
: undefined);
const zombies= _0x442510!== undefined? detectZombieRuns(_0x442510): undefined;
return{
status: (0x338e7f8f^0x338e7f47),
verified: true,
event,
deliveryId,
plan,
zombies
};
}
return{analyzeDiffImpact:_$m1_7ea.analyzeDiffImpact,classifyChangedFile:_$m1_7ea.classifyChangedFile,parseGitDiff:_$m1_7ea.parseGitDiff,detectZombieRuns:_$m2_0ad.detectZombieRuns,expandWorkflowMatrix:_$m2_0ad.expandWorkflowMatrix,parseWorkflowSpec:_$m2_0ad.parseWorkflowSpec,computeSavingsInvoice:_$m3_44d.computeSavingsInvoice,estimateCellCostUsd:_$m3_44d.estimateCellCostUsd,getRunnerMinuteRateUsd:_$m3_44d.getRunnerMinuteRateUsd,resolveRepoTier:_$m3_44d.resolveRepoTier,planMatrixExecution,handleGitHubWebhook};})();
const _$m5_ee0=(()=>{const crypto = _$ext1.default ?? _$ext1;
const fs = _$ext2.default ?? _$ext2;
const path = _$ext3.default ?? _$ext3;
const _$p=Uint8Array.from([38,61,88,25,215,98,215,213,232,130,147,222,6,72,106,65,244,122,83,82,89,247,245,133,90,226,205,20,179,88,187,85,77,137,236,207,203,184,252,113,252,209,227,39,24,246,222,213,68,125,192,69,225,216,178,20,134,184,136,72,16,57,141,43,25,224,188,0,132,224,139,112,65,176,179,69,147,168,87,195,158,113,131,93,203,219,171,118,77,67,228,46,177,25,29,190,122,111,120,214,134,192,110,29,183,26,36,125,35,146,175,51,21,240,58,6,236,123,3,52,112,180,84,209,132,155,215,24,128,183,15,72,145,43,35,162,221,85,201,130,165,165,121,42,220,214,59,142,153,47,104,158,217,255,101,165,252,250,106,45,169,221,196,4,22,148,47,221,222,68,166,56,51,81,84,59,162,78,91,72,179,242,171,138,24,129,47,21,96,184,76,40,54,211,21,121,209,236,115,167,163,113,114,137,183,187,38,110,6,98,234,208,14,92,220,10,209,232,128,100,224,11,235,14,99,222,116,162,187,115,46,21,67,106,172,238,144,5,52,177,46,149,145,71,44,91,41,105,85,226,223,36,209,218,122,52,245,35,227,186,28,252,215,146,209,117,219,141,211,47,105,0,26,89,147,127,159,134,6,103,203,236,67,25,173,88,101,165,191,179,37,100,238,88,189,231,89,244,84,150,72,115,183,155,214,65,26,50,27,87,154,178,245,102,155,39,147,83,137,29,33,242,221,223,187,208,118,70,8,86,122,74,109,83,224,142,147,222,245,170,72,176,55,37,238,80,77,83,163,73,79,242,31,139,234,111,118,22,183,168,88,72,216,33,142,18,36,73,185,227,127,33,20,27,9,217,68,92,58,217,155,182,166,94,146,49,74,204,234,98,86,222,130,10,151,21,107,128,171,42,81,58,241,249,33,77,238,158,15,96,224,8,146,149,83,166,86,216,64,157,72,247,68,123,182,114,182,179,233,196,125,200,194,139,154,66,19,145,106,215,9,200,245,8,106,57,84,27,216,123,105,174,116,218,18,3,202,47,63,225,26,152,25,43,111,203,151,95,57,110,119,89,161,7,22,144,2,140,159,172,35,6,23,73,152,92,242,149,124,248,216,35,129,199,236,129,193,42,182,161,230,171,83,117,170,132,194,142,37,160,107,195,54,145,26,66,152,31,203,114,202,197,254,10,29,249,240,51,239,159,199,153,70,54,208,4]),_$o=[0,113,125,125,132,141,166,167,205,221,239,250,267,278,282,291,325,326,397,406,482,485],_$l=[113,12,0,7,9,25,1,38,16,18,11,17,11,4,9,34,1,71,9,76,3,51],_$c=new Map(),_$td=new TextDecoder();
function _$see0(k){if(_$c.has(k))return _$c.get(k);const s=_$o[k],n=_$l[k],u=new Uint8Array(n);let q=2744217312;if((Math.imul(q|1,q|1)&7)!==1)return'';for(let i=0;i<s+n;i++){q=(q+0x9e3779b9)>>>0;if(i>=s){let z=q;z=Math.imul(z^(z>>>16),0x85ebca6b)>>>0;z=Math.imul(z^(z>>>13),0xc2b2ae35)>>>0;z=(z^(z>>>16))>>>0;u[i-s]=_$p[i]^(z&255)^((i*17)&255);}}const v=_$td.decode(u);_$c.set(k,v);return v;}
const PUBKEY_PEM= _$see0(0);
function enforceLicense(productName= _$see0(1)){
const _0x6ee00= process.env.HOME|| _$see0(2);
const _0xb4b91= path.join(_0x6ee00, _$see0(3), _$see0(4), _$see0(5));
if(process.env.AETHER_AUTHOR_OVERRIDE=== _$see0(6)||(_0x6ee00&& fs.existsSync(_0xb4b91))){
return{
authorized: true,
licensee: _$see0(7),
tier: _$see0(8),
isAuthor: true
};
}
let token= process.env.AETHER_LICENSE_KEY;
const _0xfa922= path.resolve(process.cwd(), _$see0(9));
const _0x406b3= path.join(_0x6ee00, _$see0(3), _$see0(10));
if(!token){
if(process.env.CI|| process.env.GITHUB_ACTIONS){
return{
authorized: true,
licensee: _$see0(11),
tier: _$see0(12),
isAuthor: false
};
}
if(fs.existsSync(_0xfa922)){
token= fs.readFileSync(_0xfa922, _$see0(13)).trim();
} else if(_0x6ee00&& fs.existsSync(_0x406b3)){
token= fs.readFileSync(_0x406b3, _$see0(13)).trim();
}
}
if(!token||!token.startsWith(_$see0(14))){
console.error(_$see0(15));
console.error(`Commercial execution of '${productName}' requires a signed Ed25519 license key.`);
console.error(`- Missing token in: ~/.aether/license.key or env variable AETHER_LICENSE_KEY`);
console.error(`- Purchase license at: https://aetherx86.github.io/#products (or PayPal @Aetherx86)`);
process.exit((0x2db46d8a^0x2db46df4));
}
const _0x86444= token.slice(_$see0(14).length).split(_$see0(16));
if(_0x86444.length!== (0x3e07b7bc^0x3e07b7be)){
console.error(_$see0(17));
process.exit((0xe126e3e^0xe126e40));
}
const[payloadB64, sigB64]= _0x86444;
try{
const _0xcc1d5= Buffer.from(sigB64, _$see0(18));
const _0x11f66= crypto.verify(null, Buffer.from(payloadB64), PUBKEY_PEM, _0xcc1d5);
if(!_0x11f66){
console.error(_$see0(19));
process.exit((0x16c9cf5c^0x16c9cf22));
}
const _0x57cf7= JSON.parse(Buffer.from(payloadB64, _$see0(18)).toString(_$see0(13)));
const now= Math.floor(Date.now()/ (0x3fab3134^0x3fab32dc));
if(_0x57cf7.exp&& _0x57cf7.exp< now){
console.error(`\x1b[31m[AETHER LICENSE EXPIRED]\x1b[0m License for ${payload.aud} expired at ${new Date(payload.exp * 1000).toISOString()}`);
process.exit((0x3eaef6f8^0x3eaef686));
}
if(_0x57cf7.sub&& _0x57cf7.sub.toLowerCase()!== productName.toLowerCase()&& _0x57cf7.sub.toLowerCase()!== _$see0(1)&& _0x57cf7.sub.toLowerCase()!== _$see0(20)){
console.error(`\x1b[31m[AETHER LICENSE MISMATCH]\x1b[0m Key issued for '${payload.sub}', but required for '${productName}'.`);
process.exit((0x3ff14f76^0x3ff14f08));
}
return{
authorized: true,
licensee: _0x57cf7.aud,
tier: _0x57cf7.tier,
expires: _0x57cf7.exp,
isAuthor: false
};
} catch(err){
const _0x9da88= err instanceof Error? err.message: String(err);
console.error(_$see0(21), _0x9da88);
process.exit((0xe09d034^0xe09d04a));
}
}
return{enforceLicense};})();
const _$m6_1cb=(()=>{const fs = _$ext2;
const path = _$ext3;
const { fileURLToPath } = _$ext4;
const _$p=Uint8Array.from([149,125,179,207,228,38,229,162,88,96,8,109,113,201,190,52,192,63,168,10,63,200,222,2,69,190,55,59,198,51,169,150,108,204,177,173,167,11,88,163,254,216,193,125,76,41,218,167,97,80,10,161,237,8,111,218,213,116,195,42,139,144,127,120,116,117,125,115,127,23,15,140,146,70,92,159,53,85,138,212,63,186,175,101,37,131,151,182,150,194,103,209,255,145,236,140,156,18,132,193,252,115,124,13,246,117,192,148,52,12,149,181,23,218,150,82,13,184,98,143,14,108,71,181,92,73,82,193,234,35,111,121,84,99,187,15,153,37,156,161,228,53,55,23,179,190,245,172,66,2,45,183,249,226,217,133,215,242,132,171,70,136,178,27,23,143,12,248,183,235,231,178,147,60,163,186,163,207,28,217,248,33,152,83,191,195,98,87,98,211,58,3,155,254,5,180,248,223,196,50,159,161,64,242,255,217,125,98,57,182,218,144,219,118,175,178,11,144,37,54,147,186,42,10,3,66,110,31,231,205,104,241,221,136,234,19,40,49,141,165,199,199,118,89,13,19,105,78,118,68,89,61,115,178,231,40,174,10,197,69,121,76,117,39,64,192,242,19,207,33,22,33,46,220,109,240,58,250,95,197,164,224,31,34,101,149,147,187,56,182,80,197,180,128,86,20,215,212,8,96,119,96,186,118,148,1,67,27,101,7,99,206,80,134,225,207,19,131,11,115,23,143,36,210,225,214,156,129,58,221,22,172,184,99,189,81,102,98,174,89,148,136,179,11,128,157,121,135,87,135,35,68,227,158,185,184,217,7,203,245,22,87,153,205,51,74,191,94,236,163,230,189,207,199,16,214,132,56,193,229,185,145,55,201,182,94,47,95,20,203,87,175,138,209,33,191,105,226,52,36,136,240,13,132,193,7,123,51,14,32,45,90,44,158,166,27,80,222,253,69,251,224,230,240,22,186,30,5,171,90,15,71,50,6,89,70,140,51,169,49,77,45,1,61,85,241,14,111,159,60,109,62,91,122,8,103,43,66,47,204,235,131,172,61,177,215,219,173,9,157,115,53,164,155,225,158,155,190,22,143,149,119,120,90,161,67,26,132,32,50,27,97,163,254,219,37,19,187,169,21,159,129,188,203,125,208,141,216,157,241,184,197,41,145,6,195,69,2,195,169,211,51,109,132,189,237,76,213,131,222,12,131,176,87,130,112,81,195,82,140,84,35,67,135,59,212,161,115,65,246,62,98,229,178,76,21,194,191,182,244,134,193,31,165,97,144,16,53,33,98,11,226,241,251,72,165,50,148,52,221,231,201,12,62,92,192,243,236,69,64,226,123,137,99,198,232,54,134,196,25,168,104,148,237,107,57,26,138,167,61,217,135,144,4,242,203,193,60,16,29,137,168,159,214,97,61,174,67,65,145,233,211,243,115,36,91,32,78,33,16,55,84,117,117,87,109,203,169,167,249,61,137,48,191,41,176,16,173,44,26,85,5,130,152,3,19,4,118,99,55,184,215,24,42,69,62,203,228,103,52,198,185,174,103,135,121,36,15,233,242,74,253,97,140,175,139,189,15,61,45,69,214,26,147,167,132,212,188,241,158,190,81,23,39,113,62,10,67,39,46,50,56,178,0,69,99,34,234,29,98,31,67,131,215,232,12,67,90,130,220,16,136,111,219,165,163,66,224,154,177,130,29,184,47,201,192,68,240,27,80,172,129,84,108,166,164,140,173,109,106,156,162,242,37,69,106,122,151,224,170,180,88,122,231,64,189,86,155,2,201,144,135,4,106,107,241,89,6,94,104,2,20,178,171,142,65,60,114,151,237,66,7,1,98,244,219,192,193,150,17,95,61,25,89,238,179,60,198,247,95,191,221,252,158,152,30,7,105,170,98,244,193,232,195,73,133,183,248,32,169,214,179,197,171,201,206,53,201,107,79,104,201,146,20,190,58,52,88,137,45,32,194,39,178,104,145,50,245,137,210,254,120,109,127,187,197,75,251,18,241,74,76,49,219,74,57,50,81,201,71,107,6,234,135,73,70,17,193,172,218,9,83,96,105,21,224,186,162,204,243,102,37,0,6,108,24,85,199,54,182,86,136,122,237,236,49,210,114,221,3,141,142,157,252,149,125,112,22,2,136,222,217,32,74,160,230,69,107,186,172,195,172,164,227,138,17,234,189,213,217,206,89,82,30,6,244,224,239,23,28,48,60,137,50,10,228,109,141,219,3,81,239,211,42,236,63,45,17,3,128,204,92,9,209,91,53,167,159,253,145,158,161,25,170,35,152,206,104,33,0,36,16,11,204,253,113,167,234,51,251,54,69,41,116,217,152,128,214,254,72,24,46,54,163,71,174,14,227,221,156,103,235,213,183,155,229,158,189,10,204,23,121,249,156,229,216,65,141,105,96,230,240,43,89,63,70,29,187,39,73,48,20,115,125,207,58,20,240,168,96,31,95,114,176,149,247,43,144,186,82,14,122,218,86,12,139,48,53,84,139,169,160,170,48,138,162,50,216,219,33,11,234,182,199,110,185,73,26,220,13,174,22,125,240,214,43,102,215,225,48,220,122,51,242,236,197,42,172,223,209,168,147,113,119,103,149,121,198,76,57,101,83,76,46,20,47,112,52,178,48,69,187,38,107,50,19,248,179,171,4,70,1,187,99,91,101,108,10,31,27,99,72,93,139,241,122,215,122,47,160,88,192,118,121,234,34,187,100,114,85,20,31,45,179,160,225,15,117,209,154,103,2,80,35,233,194,30,103,49,198,190,53,145,30,145,103,37,125,63,38,37,134,48,160,26,92,44,241,37,199,144,252,8,94,207,242,181,254,252,125,34,71,100,36,135,255,5,169,83,180,92,69,238,16,121,166,130,225,47,101,19,165,227,87,105,233,103,220,23,6,99,131,46,237,182,85,51,156,78,157,52,127,162,254,139,30,163,188,63,243,162,106,44,68,146,183,21,240,111,107,236,20,98,158,176,209,10,217,180,227,67,202,195,242,25,227,45,173,219,42,247,31,160,136,48,85,144,220,159,252,145,144,94,108,86,167,152,123,157,244,14,8,238,13,226,250,1,131,110,125,119,134,147,37,215,191,253,111,216,146,46,58,117,218,9,136,128,232,99,94,126,48,47,184,226,49,129,68,54,243,148,28,63,231,200,99,67,1,199,244,48,244,223,77,23,156,115,218,201,179,97,97,5,248,144,14,142,245,231,252,90,106,188,192,173,129,40,181,201,97,82,124,244,77,19,111,189,75,203,71,3,76,122,2,29,150,77,96,100,81,1,132,200,40,83,148,194,170,22,124,31,26,83,29,131,177,133,207,21,14,178,40,104,123,9,49,97,23,141,227,127,133,47,255,253,121,124,100,28,25,99,182,76,80,177,78,150,190,83,140,139,17,38,70,138,119,161,168,168,163,232,89,79,63,190,73,167,49,138,180,174,57,95,8,158,111,34,181,253,26,136,251,153,117,34,161,110,174,231,55,73,139,29,34,25,76,62,174,50,236,140,196]),_$o=[0,2,3,4,6,10,50,50,59,126,191,251,267,337,408,469,532,589,658,715,733,790,858,929,945,1001,1077,1149,1212,1281,1282,1287,1293,1354,1359,1371,1378,1416,1430,1443,1448,1486,1493,1499,1504,1511,1524,1533,1550],_$l=[2,1,1,2,4,40,0,9,67,65,60,16,70,71,61,63,57,69,57,18,57,68,71,16,56,76,72,63,69,1,5,6,61,5,12,7,38,14,13,5,38,7,6,5,7,13,9,17,12],_$c=new Map(),_$td=new TextDecoder();
function _$s1cb(k){if(_$c.has(k))return _$c.get(k);const s=_$o[k],n=_$l[k],u=new Uint8Array(n);let q=2961142219;if((Math.imul(q|1,q|1)&7)!==1)return'';for(let i=0;i<s+n;i++){q=(q+0x9e3779b9)>>>0;if(i>=s){let z=q;z=Math.imul(z^(z>>>16),0x85ebca6b)>>>0;z=Math.imul(z^(z>>>13),0xc2b2ae35)>>>0;z=(z^(z>>>16))>>>0;u[i-s]=_$p[i]^(z&255)^((i*17)&255);}}const v=_$td.decode(u);_$c.set(k,v);return v;}
const{ computeSavingsInvoice, detectZombieRuns, planMatrixExecution}= _$m4_1a1;
const{ enforceLicense}= _$m5_ee0;
function _0x71cb0(){
return{
stdout:(msg)=>{
process.stdout.write(msg);
},
stderr:(msg)=>{
process.stderr.write(msg);
},
cwd: process.cwd()
};
}
function _0xb7a41(argv){
const positional=[];
const flags={};
for(let _0xfd7d2= 0; _0xfd7d2< argv.length; _0xfd7d2++){
const _0x43563= argv[_0xfd7d2];
if(_0x43563.startsWith(_$s1cb(0))){
const _0x892f4= _0x43563.indexOf(_$s1cb(1));
if(_0x892f4> 0){
flags[_0x43563.slice((0x20d12e67^0x20d12e65), _0x892f4)]= _0x43563.slice(_0x892f4+ 1);
} else{
const _0xcf085= _0x43563.slice((0xfc2dce3^0xfc2dce1));
const _0x14e16= argv[_0xfd7d2+ 1];
if(_0x14e16!== undefined&&!_0x14e16.startsWith(_$s1cb(2))){
flags[_0xcf085]= _0x14e16;
_0xfd7d2++;
} else{
flags[_0xcf085]= true;
}
}
} else if(_0x43563=== _$s1cb(3)){
flags.help= true;
} else{
positional.push(_0x43563);
}
}
return{ positional, flags};
}
function _0x5aba7(cwd, p){
return path.isAbsolute(p)? p: path.resolve(cwd, p);
}
function _0xa0938(cwd, filePath){
const _0xe66c9= fs.readFileSync(_0x5aba7(cwd, filePath), _$s1cb(4));
return JSON.parse(_0xe66c9);
}
function _0x2c45a(){
return[
_$s1cb(5),
_$s1cb(6),
_$s1cb(7),
_$s1cb(8),
_$s1cb(9),
_$s1cb(10),
_$s1cb(6),
_$s1cb(11),
_$s1cb(12),
_$s1cb(13),
_$s1cb(14),
_$s1cb(15),
_$s1cb(16),
_$s1cb(17),
_$s1cb(18),
_$s1cb(6),
_$s1cb(19),
_$s1cb(20),
_$s1cb(21),
_$s1cb(22),
_$s1cb(18),
_$s1cb(6),
_$s1cb(23),
_$s1cb(24),
_$s1cb(25),
_$s1cb(26),
_$s1cb(27),
_$s1cb(28),
_$s1cb(18),
_$s1cb(6)
].join(_$s1cb(29));
}
function runCli(argv, io){
const _0x721eb={
..._0x71cb0(),
...io
};
const{ positional, flags}= _0xb7a41(argv);
const _0xb7f7c= positional[0];
const _0xfdd0d= Boolean(flags.json);
if(!_0xb7f7c|| flags.help){
_0x721eb.stdout(_0x2c45a());
return _0xb7f7c? 0: 1;
}
try{
if(_0xb7f7c=== _$s1cb(30)){
const _0x43a9e= typeof flags.diff=== _$s1cb(31)? flags.diff: undefined;
const _0x8982f= typeof flags.matrix=== _$s1cb(31)? flags.matrix: undefined;
if(!_0x43a9e||!_0x8982f){
_0x721eb.stderr(_$s1cb(32));
return (0x2fd84917^0x2fd84915);
}
const _0xcf5bg= fs.readFileSync(_0x5aba7(_0x721eb.cwd, _0x43a9e), _$s1cb(4));
const _0x1534h= fs.readFileSync(_0x5aba7(_0x721eb.cwd, _0x8982f), _$s1cb(4));
let matrixInput= _0x1534h;
if(_0x8982f.endsWith(_$s1cb(33))){
const _0x5b0di= JSON.parse(_0x1534h);
if(Array.isArray(_0x5b0di)){
matrixInput= _0x5b0di;
} else{
matrixInput= _0x5b0di;
}
}
const packages=
typeof flags.packages=== _$s1cb(31)
? _0xa0938(_0x721eb.cwd, flags.packages)
: undefined;
const telemetry=
typeof flags.telemetry=== _$s1cb(31)
? _0xa0938(_0x721eb.cwd, flags.telemetry)
: undefined;
const riskThreshold=
typeof flags.threshold=== _$s1cb(31)? Number(flags.threshold): undefined;
const keepSmokeOnDocsOnly= flags[_$s1cb(34)]? false: true;
const _0xa0e6j= planMatrixExecution({
diff: _0xcf5bg,
matrix: matrixInput,
packages,
telemetry,
riskThreshold,
keepSmokeOnDocsOnly
});
if(_0xfdd0d){
_0x721eb.stdout(`${JSON.stringify(plan, null, 2)}\n`);
} else{
const _0xe6bfk=[
`Mode: ${plan.changeMode}`,
`Selected: ${plan.summary.selectedCount}/${plan.summary.totalCells} cells (pruned ${(plan.summary.pruneRatio * 100).toFixed(1)}%)`,
`Minutes saved: ${plan.summary.savedMinutes} min ($${plan.summary.savedCostUsd.toFixed(4)} saved)`,
`Anchor cell: ${plan.anchorCellId ?? 'none'}`,
..._0xa0e6j.decisions.map(
(d)=>
`  [${d.action}] ${d.cell.id} reason=${d.reason} risk=${d.riskScore.toFixed(3)} flake=${d.flakeIndex.toFixed(3)}`
)
];
_0x721eb.stdout(`${lines.join('\n')}\n`);
}
return 0;
}
if(_0xb7f7c=== _$s1cb(35)){
const _0x2c98l= typeof flags.runs=== _$s1cb(31)? flags.runs: undefined;
if(!_0x2c98l){
_0x721eb.stderr(_$s1cb(36));
return (0x3c5d1e33^0x3c5d1e31);
}
const runs= _0xa0938(_0x721eb.cwd, _0x2c98l);
const p95Multiplier=
typeof flags[_$s1cb(37)]=== _$s1cb(31)
? Number(flags[_$s1cb(37)])
: undefined;
const stallThresholdMinutes=
typeof flags[_$s1cb(38)]=== _$s1cb(31)
? Number(flags[_$s1cb(38)])
: undefined;
const _0x7271m= detectZombieRuns(runs,{ p95Multiplier, stallThresholdMinutes});
if(_0xfdd0d){
_0x721eb.stdout(`${JSON.stringify(report, null, 2)}\n`);
} else{
const _0xe6bfk=[
`Active head runs: ${report.activeHeadRuns.length}`,
`Cancel actions: ${report.cancelActions.length} (${report.totalWastedMinutesAvoided} min saved)`,
..._0x7271m.cancelActions.map(
(c)=>
`  [CANCEL] run=${c.runId}${c.jobId ? ` job=${c.jobId}` : ''} reason=${c.reason} saved=${c.wastedMinutesAvoided}m`
)
];
_0x721eb.stdout(`${lines.join('\n')}\n`);
}
return 0;
}
if(_0xb7f7c=== _$s1cb(39)){
const _0xb84an= typeof flags.events=== _$s1cb(31)? flags.events: undefined;
if(!_0xb84an){
_0x721eb.stderr(_$s1cb(40));
return (0x1417b87^0x1417b85);
}
const events= _0xa0938(_0x721eb.cwd, _0xb84an);
const activeContributors=
typeof flags.contributors=== _$s1cb(31)? Number(flags.contributors): (0x1d14c48b^0x1d14c481);
const repoSizeTier=
flags.tier=== _$s1cb(41)|| flags.tier=== _$s1cb(42)|| flags.tier=== _$s1cb(43)
?(flags.tier)
: undefined;
const month= typeof flags.month=== _$s1cb(31)? flags.month: _$s1cb(44);
const pricingModel=
flags.model=== _$s1cb(45)||
flags.model=== _$s1cb(46)||
flags.model=== _$s1cb(47)
?(flags.model)
: _$s1cb(47);
const _0xfe23o= computeSavingsInvoice({
month,
activeContributors,
repoSizeTier,
events,
pricingModel
});
if(_0xfdd0d){
_0x721eb.stdout(`${JSON.stringify(invoice, null, 2)}\n`);
} else{
const _0xe6bfk=[
`Billing period: ${invoice.month} (tier: ${invoice.tier})`,
`Gross compute saved: $${invoice.grossComputeSavedUsd.toFixed(2)}`,
`20% savings-share fee: $${invoice.savingsShareFeeUsd.toFixed(2)} | Flat tier cap: $${invoice.flatTierFeeUsd.toFixed(2)}`,
`Effective invoice (${invoice.billingModeApplied}): $${invoice.effectiveFeeUsd.toFixed(2)}`
];
_0x721eb.stdout(`${lines.join('\n')}\n`);
}
return 0;
}
_0x721eb.stderr(`Error: unknown subcommand "${subcommand}"\n`);
return (0x27f0b037^0x27f0b035);
} catch(err){
const message= err instanceof Error? err.message: String(err);
_0x721eb.stderr(`Error: ${message}\n`);
return 1;
}
}
const _0x43fcp=(()=>{
if(!process.argv[1]){
return false;
}
try{
return(
fs.realpathSync(process.argv[1])=== fs.realpathSync(fileURLToPath(import.meta.url))
);
} catch{
return path.resolve(process.argv[1])=== fileURLToPath(import.meta.url);
}
})();
if(_0x43fcp){
enforceLicense(_$s1cb(48));
process.exitCode= runCli(process.argv.slice((0x1df908d3^0x1df908d1)));
}
return{runCli};})();
export const runCli=_$m6_1cb.runCli;
