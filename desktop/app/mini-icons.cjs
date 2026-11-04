const zlib=require('node:zlib');
function crc32(buffer){let crc=0xffffffff;for(const byte of buffer){crc^=byte;for(let i=0;i<8;i++)crc=(crc>>>1)^((crc&1)?0xedb88320:0);}return(crc^0xffffffff)>>>0;}
function chunk(type,data){const t=Buffer.from(type),n=Buffer.alloc(4),crc=Buffer.alloc(4);n.writeUInt32BE(data.length);crc.writeUInt32BE(crc32(Buffer.concat([t,data])));return Buffer.concat([n,t,data,crc]);}
function iconPng(kind,color='#c9f3a7',phase=0,playing=false,enabled=true){
 const size=32,n=parseInt(color.slice(1),16),rgb=[(n>>16)&255,(n>>8)&255,n&255],shapes=[];
 const line=(x1,y1,x2,y2,w=2)=>shapes.push((x,y)=>{const dx=x2-x1,dy=y2-y1,t=Math.max(0,Math.min(1,((x-x1)*dx+(y-y1)*dy)/(dx*dx+dy*dy||1)));return(x-x1-dx*t)**2+(y-y1-dy*t)**2<(w/2)**2;});
 if(kind==='previous'){line(8,8,8,24);line(23,8,12,16);line(12,16,23,24);line(23,24,23,8);}
 if(kind==='next'){line(24,8,24,24);line(9,8,20,16);line(20,16,9,24);line(9,24,9,8);}
 if(kind==='pause'){line(12,8,12,24,3);line(21,8,21,24,3);}
 if(kind==='play'){line(11,7,25,16,2.2);line(25,16,11,25,2.2);line(11,25,11,7,2.2);}
 if(kind==='wave')for(let i=0;i<4;i++){const h=playing?5+Math.abs(Math.sin(phase+i*.9))*15:3;line(7+i*6,16-h/2,7+i*6,16+h/2,2.8);}
 const raw=Buffer.alloc(size*(size*4+1));for(let y=0;y<size;y++)for(let x=0;x<size;x++){let hits=0;for(let yy=0;yy<2;yy++)for(let xx=0;xx<2;xx++)if(shapes.some(f=>f(x+(xx+.5)/2,y+(yy+.5)/2)))hits++;const offset=y*(size*4+1)+1+x*4;for(let c=0;c<3;c++)raw[offset+c]=rgb[c];raw[offset+3]=Math.round(hits/4*255*(enabled?1:.35));}
 const header=Buffer.alloc(13);header.writeUInt32BE(size,0);header.writeUInt32BE(size,4);header[8]=8;header[9]=6;return Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',header),chunk('IDAT',zlib.deflateSync(raw)),chunk('IEND',Buffer.alloc(0))]);
}
module.exports={iconPng};
