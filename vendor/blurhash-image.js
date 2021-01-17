/* @dtinth/blurhash-image@0.1.0 */!function(e,t){"object"==typeof exports&&"undefined"!=typeof module?t(exports):"function"==typeof define&&define.amd?define(["exports"],t):t((e=e||self).dtinthBlurhashImage={})}(this,(function(e){"use strict"
"undefined"!=typeof Symbol&&(Symbol.iterator||(Symbol.iterator=Symbol("Symbol.iterator"))),"undefined"!=typeof Symbol&&(Symbol.asyncIterator||(Symbol.asyncIterator=Symbol("Symbol.asyncIterator")))
var t="undefined"!=typeof globalThis?globalThis:"undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:{}
function r(e){return e&&e.__esModule&&Object.prototype.hasOwnProperty.call(e,"default")?e.default:e}function o(e,t){return e(t={exports:{}},t.exports),t.exports}var n=o((function(e,t){Object.defineProperty(t,"__esModule",{value:!0})
var r=["0","1","2","3","4","5","6","7","8","9","A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z","a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z","#","$","%","*","+",",","-",".",":",";","=","?","@","[","]","^","_","{","|","}","~"]
t.decode83=function(e){for(var t=0,o=0;o<e.length;o++)t=83*t+r.indexOf(e[o])
return t},t.encode83=function(e,t){for(var o="",n=1;n<=t;n++){var a=Math.floor(e)/Math.pow(83,t-n)%83
o+=r[Math.floor(a)]}return o}}))
r(n)
var a=o((function(e,t){Object.defineProperty(t,"__esModule",{value:!0}),t.sRGBToLinear=function(e){var t=e/255
return t<=.04045?t/12.92:Math.pow((t+.055)/1.055,2.4)},t.linearTosRGB=function(e){var t=Math.max(0,Math.min(1,e))
return t<=.0031308?Math.round(12.92*t*255+.5):Math.round(255*(1.055*Math.pow(t,1/2.4)-.055)+.5)},t.sign=function(e){return e<0?-1:1},t.signPow=function(e,r){return t.sign(e)*Math.pow(Math.abs(e),r)}}))
r(a)
var i=o((function(e,r){var o,n=t&&t.__extends||(o=function(e,t){return(o=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(e,t){e.__proto__=t}||function(e,t){for(var r in t)t.hasOwnProperty(r)&&(e[r]=t[r])})(e,t)},function(e,t){function r(){this.constructor=e}o(e,t),e.prototype=null===t?Object.create(t):(r.prototype=t.prototype,new r)})
Object.defineProperty(r,"__esModule",{value:!0})
var a=function(e){function t(t){var r=e.call(this,t)||this
return r.name="ValidationError",r.message=t,r}return n(t,e),t}(Error)
r.ValidationError=a}))
r(i)
var s=o((function(e,t){Object.defineProperty(t,"__esModule",{value:!0})
var r=function(e){if(!e||e.length<6)throw new i.ValidationError("The blurhash string must be at least 6 characters")
var t=n.decode83(e[0]),r=Math.floor(t/9)+1,o=t%9+1
if(e.length!==4+2*o*r)throw new i.ValidationError("blurhash length mismatch: length is "+e.length+" but it should be "+(4+2*o*r))}
t.isBlurhashValid=function(e){try{r(e)}catch(e){return{result:!1,errorReason:e.message}}return{result:!0}}
var o=function(e){var t=e>>8&255,r=255&e
return[a.sRGBToLinear(e>>16),a.sRGBToLinear(t),a.sRGBToLinear(r)]},s=function(e,t){var r=Math.floor(e/361),o=Math.floor(e/19)%19,n=e%19
return[a.signPow((r-9)/9,2)*t,a.signPow((o-9)/9,2)*t,a.signPow((n-9)/9,2)*t]}
t.default=function(e,t,i,c){r(e),c|=1
for(var u=n.decode83(e[0]),l=Math.floor(u/9)+1,h=u%9+1,f=(n.decode83(e[1])+1)/166,d=new Array(h*l),v=0;v<d.length;v++)if(0===v){var m=n.decode83(e.substring(2,6))
d[v]=o(m)}else m=n.decode83(e.substring(4+2*v,6+2*v)),d[v]=s(m,f*c)
for(var M=4*t,p=new Uint8ClampedArray(M*i),y=0;y<i;y++)for(var b=0;b<t;b++){for(var g=0,w=0,P=0,_=0;_<l;_++)for(v=0;v<h;v++){var B=Math.cos(Math.PI*b*v/t)*Math.cos(Math.PI*y*_/i),T=d[v+_*h]
g+=T[0]*B,w+=T[1]*B,P+=T[2]*B}var x=a.linearTosRGB(g),R=a.linearTosRGB(w),O=a.linearTosRGB(P)
p[4*b+0+y*M]=x,p[4*b+1+y*M]=R,p[4*b+2+y*M]=O,p[4*b+3+y*M]=255}return p}}))
r(s)
var c=o((function(e,t){Object.defineProperty(t,"__esModule",{value:!0}),t.default=function(e,t,r,o,s){if(o<1||o>9||s<1||s>9)throw new i.ValidationError("BlurHash must have between 1 and 9 components")
if(t*r*4!==e.length)throw new i.ValidationError("Width and height must match the pixels array")
for(var c=[],u=function(n){for(var i=function(o){var i=0==o&&0==n?1:2,s=function(e,t,r,o){for(var n=0,i=0,s=0,c=4*t,u=0;u<t;u++)for(var l=0;l<r;l++){var h=o(u,l)
n+=h*a.sRGBToLinear(e[4*u+0+l*c]),i+=h*a.sRGBToLinear(e[4*u+1+l*c]),s+=h*a.sRGBToLinear(e[4*u+2+l*c])}var f=1/(t*r)
return[n*f,i*f,s*f]}(e,t,r,(function(e,a){return i*Math.cos(Math.PI*o*e/t)*Math.cos(Math.PI*n*a/r)}))
c.push(s)},s=0;s<o;s++)i(s)},l=0;l<s;l++)u(l)
var h,f,d=c[0],v=c.slice(1),m=""
if(m+=n.encode83(o-1+9*(s-1),1),v.length>0){var M=Math.max.apply(Math,v.map((function(e){return Math.max.apply(Math,e)}))),p=Math.floor(Math.max(0,Math.min(82,Math.floor(166*M-.5))))
h=(p+1)/166,m+=n.encode83(p,1)}else h=1,m+=n.encode83(0,1)
return m+=n.encode83((a.linearTosRGB((f=d)[0])<<16)+(a.linearTosRGB(f[1])<<8)+a.linearTosRGB(f[2]),4),v.forEach((function(e){m+=n.encode83(function(e,t){return 19*Math.floor(Math.max(0,Math.min(18,Math.floor(9*a.signPow(e[0]/t,.5)+9.5))))*19+19*Math.floor(Math.max(0,Math.min(18,Math.floor(9*a.signPow(e[1]/t,.5)+9.5))))+Math.floor(Math.max(0,Math.min(18,Math.floor(9*a.signPow(e[2]/t,.5)+9.5))))}(e,h),2)})),m}}))
r(c)
var u=o((function(e,t){Object.defineProperty(t,"__esModule",{value:!0}),t.decode=s.default,t.isBlurhashValid=s.isBlurhashValid,t.encode=c.default,function(e){for(var r in e)t.hasOwnProperty(r)||(t[r]=e[r])}(i)}))
r(u)
var l=u.decode
class h{constructor(e){void 0===e&&(e=16),this.size=e,this.canvas=null,this.cache={}}toDataURL(e){try{const t=this
if(t.cache[e])return Promise.resolve(t.cache[e])
t.canvas||(t.canvas=document.createElement("canvas"),t.canvas.width=t.size,t.canvas.height=t.size)
const r=t.canvas.getContext("2d"),o=l(e,t.size,t.size),n=r.createImageData(t.size,t.size)
n.data.set(o),r.putImageData(n,0,0)
const a=t.canvas.toDataURL(e)
return t.cache[e]=a,Promise.resolve(a)}catch(e){return Promise.reject(e)}}}const f=new h
class d extends HTMLElement{constructor(){super(),this.converter=f}connectedCallback(){try{const e=this,t=e.getAttribute("blurhash"),r=function(r,o){try{var n=Promise.resolve(e.converter.toDataURL(t)).then((function(t){e.style.backgroundImage='url("'+t+'")'}))}catch(e){return o(e)}return n&&n.then?n.then(void 0,o):n}(0,(function(e){console.warn("Cannot decode blurhash",t,e)}))
return Promise.resolve(r&&r.then?r.then((function(){})):void 0)}catch(e){return Promise.reject(e)}}}customElements.define("blurhash-image",d),e.BlurhashImage=d,e.BlurhashToDataUrlConverter=h,e.defaultConverter=f,Object.defineProperty(e,"__esModule",{value:!0})}))