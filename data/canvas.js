var c = document.createElement('canvas');
c.id="canv";
c.width="200";
c.height="100";
c.style="border:1px solid black";

var ctx = c.getContext("2d");
var x=0,y=0;
for(var i=0;i<10;i++)
{
	ctx.moveTo(x,y);
	ctx.lineTo(x+0.1,y+0.1);
	x+=0.1;y+=0.1;
	ctx.stroke();
}
document.body.appendChild(c);


