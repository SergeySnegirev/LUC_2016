/**************************************************
Trivantis (http://www.trivantis.com)
**************************************************/

var ocmOrig = document.oncontextmenu
var ocmNone = new Function( "return false" )

// Text Object
function ObjText(n,a,x,y,w,h,v,z,c,d,cl) {
	ObjInline.apply(this, arguments)
	this.sline = 0
	this.heading = 0;
	this.oh = h;
	this.ow = w;
}

{ // Setup prototypes
ObjText.prototype = new ObjInline()
var p=ObjText.prototype
p.constructor = ObjText
p.build = ObjTextBuild
p.sizeTo  = ObjTextSizeTo
p.addOuterShadow = ObjInitOuterShadow
p.addTextShadow = ObjInitTextShadow
p.addOpacity = ObjInitOpacity
p.addIe8Attr = ObjInitIe8Attr
p.initRotateAngle = ObjInitRotateAngle
p.initHasOuterShadow = ObjInitHasOuterShadow
p.initHasTextShadow = ObjInitHasTextShadow
p.initHasBorder	= ObjInitHasBorder
p.initHasOutline	= ObjInitHasOutline
p.addBorder = ObjInitBorder
p.addOutline = ObjInitOutline
p.initSLine = ObjInitSLine
p.activate = ObjTextActivate
p.initList = ObjInitList
p.loadProps = ObjLoadProps
p.respChanges = ObjRespChanges
p.setDegradations = ObjDegradeEffects
p.addHeading = ObjAddHeading
p.degradeBullets = ObjDegradeBullets
}

function ObjTextSizeTo( w, h, bResp ) { 
    var tempObj = {xOffset:0, yOffset:0, width: w, height: h, xOuterOffset:0, yOuterOffset:0};
		
	AdjustAttributesForEffects(this, tempObj);
	
	ModifyTextEffect(this, tempObj);
	
	FindAndModifyObjCSS(this);
	
	if(this.objLyr)
		if(typeof(bResp) == "undefined")
			this.objLyr.clipTo( ((tempObj.yOffset<0)?tempObj.yOffset:0), tempObj.width, tempObj.height, ((tempObj.xOffset<0)?tempObj.xOffset:0));
}

function ObjTextActivate()
{
	ObjAdjustList(this);
	this.objLyr.theObj = this;
	
	if(document.documentMode < 8)
	  this.degradeBullets();
  
	if(is.ie8 && !this.v)
		this.objLyr.hide();
	
	ObjInlineActivate.apply(this);
}


function ObjTextBuild() {
  this.setDegradations();	//echo LD-768 : Check if we need to gracefully degrade effects

  var wCSS = this.w
  if( this.sline ) wCSS = -1

  var outerRadians = (this.outerShadowDirection + this.r) * (Math.PI / 180.0);
  var xOuterOffset = this.outerShadowDepth * Math.cos(outerRadians);
  //Multiply by -1 because a negative offset means this shadow is in the positive y-direction on the screen
  var yOuterOffset = -1 * this.outerShadowDepth * Math.sin(outerRadians);
  var borderOffset = 0;
  if(this.lineStyle >2)
		borderOffset = this.borderWeight;
  var textRadians = (this.textShadowDirection + this.r) * (Math.PI / 180.0);
  var xTextOffset = this.textShadowDepth * Math.cos(textRadians);
  //Multiply by -1 because a negative offset means this shadow is in the positive y-direction on the screen
  var yTextOffset = -1 * this.textShadowDepth * Math.sin(textRadians);
  var vis = this.v;
  
  if(is.ie8)
	  if(!this.v)
		  vis = 1;
  
  xOuterOffset = parseFloat(xOuterOffset.toFixed(5));
  yOuterOffset = parseFloat(yOuterOffset.toFixed(5));
  
  xTextOffset = parseFloat(xTextOffset.toFixed(5));
  yTextOffset = parseFloat(yTextOffset.toFixed(5));
  
  if(is.vml)
  {
 	//Due to limitations on IE8 and IE9 only one shadow can be applied
	if(this.hasOuterShadow && this.hasTextShadow)
		this.hasTextShadow = 0;
	if(this.hasTextShadow && this.bgColor)
		this.hasTextShadow = 0;
  }
  
  if( this.bgColor || this.clip  || this.hasOuterShadow >0 || this.hasBorder > 0 || this.hasOutline > 0)
    this.css = buildCSS(this.name,this.x,this.y,wCSS,this.h,vis,this.z,this.bgColor,'background-clip:padding-box;')
  else
    this.css = buildCSS(this.name,this.x,this.y,wCSS,null,vis,this.z,this.bgColor)

  if(this.hasBorder > 0)
  {
	if(this.lineStyle <3)
	{
		var tempStr = this.css.substring(0, this.css.length-2);
		tempStr += ObjAddBorderCSS(this);
		tempStr += '}\n';
		this.css = tempStr;
		
		 if(this.hasOutline > 0)
		 {
			var tempStr = this.css.substring(0, this.css.length-2);
			tempStr += ObjAddOutlineCSS(this);
			tempStr += '}\n';
			this.css = tempStr;
		 }
	}
	else if(!is.ie8)
	{
		//Outline for raised and cutout bevel border rendered in svg is placed around the svg tag instead of the parent div because FF was placing some weird margin on the bottom of the parent div. 
		this.divInt = ObjAddSVGBorder(this);
	}
	else
	{
		this.divInt = ObjAddVMLBorder(this);
		
		if(this.hasOutline > 0)
		{
			var tempStr = this.css.substring(0, this.css.length-2);
			tempStr += ObjAddOutlineCSS(this);
			tempStr += '}\n';
			this.css = tempStr;
		}
	}
  }
  
  if(this.hasOutline > 0 && this.hasBorder == 0)
  {
	var tempStr = this.css.substring(0, this.css.length-2);
	tempStr += ObjAddOutlineCSS(this);
	tempStr += '}\n';
	this.css = tempStr;
  }
  
  //Rotation
  if(this.r > 0 || this.vf == 1 || this.hf == 1)
  {
	var tempStr = this.css.substring(0, this.css.length-2);
	tempStr += addRotateCSS(this.r, 0, this.w, this.h, this.x, this.y, this.r, 0, 0, this.vf, this.hf, 0, 0, 0, 0);
	tempStr += '}\n';
	this.css = tempStr;
  }
  
  if(is.ie9)
  {
	var tempStr = this.css.substring(0, this.css.length-2);
	tempStr += '-ms-transform:rotate(' + this.r +'deg);';
	if(this.vf == 1)
	{
		tempStr += '-ms-filter:"flipv";';
	}
	if(this.hf == 1)
	{
		tempStr += '-ms-filter:"fliph";';
	}
	
	tempStr += '}\n';
	this.css = tempStr;
  }
 
 //Add opacity CSS
  if(this.opacity >= 0 && this.opacity < 100)
  {
	var tempStr = this.css.substring(0, this.css.length-2);
	tempStr += addOpacityCSS(this.opacity);
	tempStr += '}\n';
	this.css = tempStr;
  }
  
  //Add outer shadow CSS
  if(this.hasOuterShadow >0)
  {
    var tempStr = this.css.substring(0, this.css.length-2);
	tempStr += ObjBoxShadow(xOuterOffset, yOuterOffset, this);
	tempStr += '}\n';
	this.css = tempStr;
  }
  
  //Add text shadow CSS
  if(this.hasTextShadow >0)
  {
	var tempStr = this.css.substring(0, this.css.length-2);
	tempStr += ObjTextShadow(xTextOffset, yTextOffset, this);
	tempStr += '}\n';
	this.css = tempStr;
  }
  
  if(is.ie8 && (((this.r % 360) != 0) || this.vf == 1 || this.hf == 1) )
  {
	var tempStr = '';
	var flipStr = '';
	var deg2radians = Math.PI * 2 / 360;
	var rad = this.r * deg2radians ;
    var costheta = Math.cos(rad);
    var sintheta = Math.sin(rad);
    var M11 = costheta;
    var M12 = -sintheta;
    var M21 = sintheta;
    var M22 = costheta;
	
	if(this.vf == 1)
	{
		flipStr += 'flipv';
	}
	if(this.hf == 1)
	{
		flipStr += 'fliph';
	}
	
	if(this.hasTextShadow >0 || this.hasOuterShadow >0)
	{
		tempStr = this.css.substring(0, this.css.length-3);
		tempStr += ' '+flipStr+' progid:DXImageTransform.Microsoft.Matrix(M11='+M11+', M12='+M12+', M21='+M21+', M22='+M22+',sizingMethod=\'auto expand\');';
	}
	else
	{
		tempStr = this.css.substring(0, this.css.length-2);
		tempStr += 'filter:progid:DXImageTransform.Microsoft.Matrix(M11='+M11+', M12='+M12+', M21='+M21+', M22='+M22+',sizingMethod=\'auto expand\') '+flipStr+';';
	}
	tempStr += '}\n';
	this.css = tempStr;
  }
  
  var divStart
  var divEnd
  divStart = '<' + this.divTag + ' id="'+this.name+'"'
  if( this.addClasses ) divStart += ' class="'+this.addClasses+'"'
  if( this.altName ) divStart += ' alt="'+this.altName+'"'
  else { if( this.altName != null ) divStart += ' alt=""' }
  divStart += '><a name="'+this.name+'anc"'
  if( this.hasOnUp ) divStart += ' href="javascript:' +this.name+ '.onUp()"'
  divStart += '>'
  divEnd   = '</a></' + this.divTag + '>'
  this.div = divStart + '\n'+ divEnd + '\n';
    
}

function ObjInitOuterShadow(direction, depth, opacity, redHex, greenHex, blueHex, red, green, blue, blurRadius, shadowType){
	this.originalShadowDirection = direction;
	this.outerShadowDirection = direction;
	this.originalOuterShadowDepth = depth;
	this.outerShadowDepth = depth;
	this.outerShadowOpacity = opacity;
	this.outerShadowRed = red;
	this.outerShadowGreen = green;
	this.outerShadowBlue = blue;
	this.outerShadowRedHex = redHex;
	this.outerShadowGreenHex = greenHex;
	this.outerShadowBlueHex = blueHex;
 	this.outerShadowBlurRadius = blurRadius;
	this.outerShadowType = shadowType;
}

function ObjInitTextShadow(direction, depth, opacity, redHex, greenHex, blueHex, red, green, blue, blurRadius, shadowType){
	this.textShadowDirection = direction;
	this.textShadowDepth = depth;
	this.textShadowOpacity = opacity;
	this.textShadowRed = red;
	this.textShadowGreen = green;
	this.textShadowBlue = blue;
	this.textShadowRedHex = redHex;
	this.textShadowGreenHex = greenHex;
	this.textShadowBlueHex = blueHex;
 	this.textShadowBlurRadius = blurRadius;
	this.textShadowType = shadowType;
}

function ObjInitOpacity(opacity){
	this.opacity = opacity;
}

function ObjInitIe8Attr(xPos, yPos, width, height, offsetX, offsetY){
	this.ie8x = xPos;
	this.ie8y = yPos;
	this.ie8Width = width;
	this.ie8Height = height;
	this.ie8AddedOffsetX = offsetX;
	this.ie8AddedOffsetY = offsetY;
}

function ObjInitBorder(borderWeight, lineStyle, red, green, blue, borderPath){
	this.borderWeight = borderWeight;
	this.lineStyle = lineStyle;
	this.borderRed = red;
	this.borderGreen = green;
	this.borderBlue = blue;
	if(borderPath)
	{
		var borderPaths = borderPath.split("|");
		if(borderPaths.length == 4)
		{
			this.borderLeft = borderPaths[0];
			this.borderTop = borderPaths[1];
			this.borderBottom = borderPaths[2];
			this.borderRight = borderPaths[3];
		}
	}
}

function ObjInitOutline(red, green, blue){
	this.outlineRed = red;
	this.outlineGreen = green;
	this.outlineBlue = blue;
}

function ObjInitSLine(boolVal){
	this.sline = boolVal;
}

function ObjInitHasOuterShadow(boolVal){
	this.hasOuterShadow = boolVal;
	
	if(boolVal == 0)
	{
		this.originalShadowDirection = 0;
		this.originalOuterShadowDepth = 0;
		this.outerShadowDirection = 0;
		this.outerShadowDepth = 0;
		this.outerShadowOpacity = 0;
		this.outerShadowRed = 0;
		this.outerShadowGreen = 0;
		this.outerShadowBlue = 0;
		this.outerShadowRedHex = null;
		this.outerShadowGreenHex = null;
		this.outerShadowBlueHex = null;
		this.outerShadowBlurRadius = 0;
		this.outerShadowType = null; 
	}
}

function ObjInitHasTextShadow(boolVal){
	this.hasTextShadow = boolVal;
	
	if(boolVal == 0)
	{
		this.textShadowDirection = 0;
		this.textShadowDepth = 0;
		this.textShadowOpacity = 0;
		this.textShadowRed = 0;
		this.textShadowGreen = 0;
		this.textShadowBlue = 0;
		this.textShadowRedHex = null;
		this.textShadowGreenHex = null;
		this.textShadowBlueHex = null;
		this.textShadowBlurRadius = 0;
		this.textShadowType = null; 
	}
}

function ObjInitHasBorder(boolVal){
	this.hasBorder = boolVal;
}

function ObjInitHasOutline(boolVal){
	this.hasOutline = boolVal;
}

function ObjInitRotateAngle(angle, vertFlip, horzFlip){
	this.r = angle;
	this.vf = vertFlip;
	this.hf = horzFlip;
}

function ObjTextShadow(xOffset, yOffset, thisObj)
{
	var shadowCSS = '';
	var blurRadius = thisObj.textShadowBlurRadius*2.4;
	if(is.vml)
	{
		//echo bug 21656 : This is a graceful degradation
		/*var red = (thisObj.textShadowRedHex ==0)?thisObj.textShadowRedHex+'0':thisObj.textShadowRedHex;
		var green = (thisObj.textShadowGreenHex ==0)?thisObj.textShadowGreenHex+'0':thisObj.textShadowGreenHex;
		var blue = (thisObj.textShadowBlueHex ==0)?thisObj.textShadowBlueHex+'0':thisObj.textShadowBlueHex;
		var opa = (Math.floor(thisObj.textShadowOpacity*100)).toString(16);
		//shadowCSS = 'filter:progid:DXImageTransform.Microsoft.DropShadow(Color=#'+opa+''+red+''+green+''+blue+', OffX='+xOffset+', OffY='+yOffset+', enabled=true); ';
		shadowCSS = 'filter:progid:DXImageTransform.Microsoft.Glow(Color=#'+opa+''+red+''+green+''+blue+',strength='+(blurRadius/3.0)+', enabled=true); ';*/
	}
	else
	{
		shadowCSS ='text-shadow:'+xOffset+'px '+yOffset+'px '+blurRadius+'px rgba('+thisObj.textShadowRed+','+thisObj.textShadowGreen+','+thisObj.textShadowBlue+','+thisObj.textShadowOpacity+');';
	}
	
	return shadowCSS;
}

function ObjBoxShadow(xOffset, yOffset, thisObj)
{
	var shadowCSS = '';
	var blurRadius = thisObj.outerShadowBlurRadius*2.4;
	if(is.ie8)
	{
		
		var red = (thisObj.outerShadowRedHex ==0)?thisObj.outerShadowRedHex+'0':thisObj.outerShadowRedHex;
		var green = (thisObj.outerShadowGreenHex ==0)?thisObj.outerShadowGreenHex+'0':thisObj.outerShadowGreenHex;
		var blue = (thisObj.outerShadowBlueHex ==0)?thisObj.outerShadowBlueHex+'0':thisObj.outerShadowBlueHex;
		var opa = (Math.floor(thisObj.outerShadowOpacity*100)).toString(16);
		shadowCSS = 'filter:progid:DXImageTransform.Microsoft.DropShadow(Color=#'+opa+''+red+''+green+''+blue+', OffX='+xOffset+', OffY='+yOffset+', enabled=true);';
	}
	else
	{
		shadowCSS ='box-shadow:'+xOffset+'px '+yOffset+'px '+blurRadius+'px rgba('+thisObj.outerShadowRed+','+thisObj.outerShadowGreen+','+thisObj.outerShadowBlue+','+thisObj.outerShadowOpacity+');';
	}
	
	return shadowCSS;
}

function ObjAddBorderCSS(thisObj)
{
	var borderCSS = '';
	var lineStyle = '';
	if(thisObj.lineStyle == 0)
		lineStyle = 'solid';
	else if(thisObj.lineStyle == 1)
		lineStyle = 'dashed';
	else
		lineStyle = 'dotted';
	
	borderCSS = 'border-style:'+lineStyle+';border-width:'+thisObj.borderWeight+'px;border-color:rgb('+thisObj.borderRed+','+thisObj.borderGreen+','+thisObj.borderBlue+');';
	return borderCSS;
}

function ObjAddOutlineCSS(thisObj)
{
	var outlineCSS = '';
	if(thisObj.hasOutline)
		outlineCSS = 'outline-style:solid;outline-width:thin;outline-color:rgb('+thisObj.outlineRed+','+thisObj.outlineGreen+','+thisObj.outlineBlue+');';
	return outlineCSS;
}


function ObjAddSVGBorder(thisObj)
{
	var svgDiv = '';
	svgDiv = '<svg id="'+thisObj.name+'border" width="'+ (thisObj.w) + 'px" height="' + (thisObj.h) + 'px" '
	svgDiv += 'style = "' + ObjAddOutlineCSS(thisObj) + '"';
	svgDiv += '>\n';
	svgDiv += '<defs>\n';
	
	if(thisObj.lineStyle === 3) //Lowered Border
	{
		var tlRed = Math.floor(thisObj.borderRed/2); 
		var tlBlue = Math.floor(thisObj.borderBlue/2); 
		var tlGreen = Math.floor(thisObj.borderGreen/2); 
		var brRed = Math.floor(thisObj.borderRed+((255-thisObj.borderRed)/2)); 
		var brBlue = Math.floor(thisObj.borderBlue+((255-thisObj.borderBlue)/2)); 
		var brGreen = Math.floor(thisObj.borderGreen+((255-thisObj.borderGreen)/2)); 
		svgDiv +='<linearGradient id="gradLeft'+thisObj.name+'" x1="0%" y1="0%" x2="100%" y2="0%">\n';
		svgDiv +='<stop offset="0%" style="stop-color:rgb('+tlRed+','+tlGreen+','+tlBlue+');stop-opacity:1" />\n';
		svgDiv +='<stop offset="100%" style="stop-color:rgb('+thisObj.borderRed+','+thisObj.borderGreen+','+thisObj.borderBlue+');stop-opacity:1" />\n';
		svgDiv +='</linearGradient>\n';
		svgDiv +='<linearGradient id="gradTop'+thisObj.name+'" x1="0%" y1="0%" x2="0%" y2="100%">\n';
		svgDiv +='<stop offset="0%" style="stop-color:rgb('+tlRed+','+tlGreen+','+tlBlue+');stop-opacity:1" />\n';
		svgDiv +='<stop offset="100%" style="stop-color:rgb('+thisObj.borderRed+','+thisObj.borderGreen+','+thisObj.borderBlue+');stop-opacity:1" />\n';
		svgDiv +='</linearGradient>\n';
		svgDiv +='<linearGradient id="gradBottom'+thisObj.name+'" x1="0%" y1="0%" x2="0%" y2="100%">\n';
		svgDiv +='<stop offset="0%" style="stop-color:rgb('+thisObj.borderRed+','+thisObj.borderGreen+','+thisObj.borderBlue+');stop-opacity:1" />\n';
		svgDiv +='<stop offset="100%" style="stop-color:rgb('+brRed+','+brGreen+','+brBlue+');stop-opacity:1" />\n';
		svgDiv +='</linearGradient>\n';
		svgDiv +='<linearGradient id="gradRight'+thisObj.name+'" x1="0%" y1="0%" x2="100%" y2="0%">\n';
		svgDiv +='<stop offset="0%" style="stop-color:rgb('+thisObj.borderRed+','+thisObj.borderGreen+','+thisObj.borderBlue+');stop-opacity:1" />\n';
		svgDiv +='<stop offset="100%" style="stop-color:rgb('+brRed+','+brGreen+','+brBlue+');stop-opacity:1" />\n';
		svgDiv +='</linearGradient>\n';
	}
	else
	{
		var tlRed = Math.floor(thisObj.borderRed+((255-thisObj.borderRed)*(3/4))); 
		var tlBlue = Math.floor(thisObj.borderBlue+((255-thisObj.borderBlue)*(3/4)));
		var tlGreen = Math.floor(thisObj.borderGreen+((255-thisObj.borderGreen)*(3/4))); 
		var brRed = Math.floor(thisObj.borderRed/4); 
		var brBlue = Math.floor(thisObj.borderBlue/4); 
		var brGreen = Math.floor(thisObj.borderGreen/4); 
		svgDiv +='<linearGradient id="gradLeft'+thisObj.name+'" x1="0%" y1="0%" x2="100%" y2="0%">\n';
		svgDiv +='<stop offset="0%" style="stop-color:rgb('+tlRed+','+tlGreen+','+tlBlue+');stop-opacity:1" />\n';
		svgDiv +='<stop offset="100%" style="stop-color:rgb('+thisObj.borderRed+','+thisObj.borderGreen+','+thisObj.borderBlue+');stop-opacity:1" />\n';
		svgDiv +='</linearGradient>\n';
		svgDiv +='<linearGradient id="gradTop'+thisObj.name+'" x1="0%" y1="0%" x2="0%" y2="100%">\n';
		svgDiv +='<stop offset="0%" style="stop-color:rgb('+tlRed+','+tlGreen+','+tlBlue+');stop-opacity:1" />\n';
		svgDiv +='<stop offset="100%" style="stop-color:rgb('+thisObj.borderRed+','+thisObj.borderGreen+','+thisObj.borderBlue+');stop-opacity:1" />\n';
		svgDiv +='</linearGradient>\n';
		svgDiv +='<linearGradient id="gradBottom'+thisObj.name+'" x1="0%" y1="0%" x2="0%" y2="100%">\n';
		svgDiv +='<stop offset="0%" style="stop-color:rgb('+thisObj.borderRed+','+thisObj.borderGreen+','+thisObj.borderBlue+');stop-opacity:1" />\n';
		svgDiv +='<stop offset="100%" style="stop-color:rgb('+brRed+','+brGreen+','+brBlue+');stop-opacity:1" />\n';
		svgDiv +='</linearGradient>\n';
		svgDiv +='<linearGradient id="gradRight'+thisObj.name+'" x1="0%" y1="0%" x2="100%" y2="0%">\n';
		svgDiv +='<stop offset="0%" style="stop-color:rgb('+thisObj.borderRed+','+thisObj.borderGreen+','+thisObj.borderBlue+');stop-opacity:1" />\n';
		svgDiv +='<stop offset="100%" style="stop-color:rgb('+brRed+','+brGreen+','+brBlue+');stop-opacity:1" />\n';
		svgDiv +='</linearGradient>\n';
	}	
	svgDiv +='</defs>\n';
	svgDiv +='<polygon points="'+thisObj.borderLeft+'" style="fill:url(#gradLeft'+thisObj.name+')" />\n';
	svgDiv +='<polygon points="'+thisObj.borderTop+'" style="fill:url(#gradTop'+thisObj.name+')" />\n';
	svgDiv +='<polygon points="'+thisObj.borderBottom+'" style="fill:url(#gradBottom'+thisObj.name+')"/>\n';
	svgDiv +='<polygon points="'+thisObj.borderRight+'" style="fill:url(#gradRight'+thisObj.name+')"/>\n';
	svgDiv += '</svg>\n';
	
	return svgDiv;
}

function ObjAddVMLBorder(thisObj)
{
	var vmlDiv = '';
	vmlDiv = '<div id="'+thisObj.name+'border" style="width:'+ (thisObj.w) +'px;height:'+ (thisObj.h) +'px;';
	if(thisObj.hasOutline)
		vmlDiv += 'position:absolute;left:-1px;top:-1px;">\n'
	else
		vmlDiv +='">\n';
	
	if(thisObj.lineStyle === 3) //Lowered Border
	{
		var tlRed = Math.floor(thisObj.borderRed/2); 
		var tlBlue = Math.floor(thisObj.borderBlue/2); 
		var tlGreen = Math.floor(thisObj.borderGreen/2); 
		var brRed = Math.floor(thisObj.borderRed+((255-thisObj.borderRed)/2)); 
		var brBlue = Math.floor(thisObj.borderBlue+((255-thisObj.borderBlue)/2)); 
		var brGreen = Math.floor(thisObj.borderGreen+((255-thisObj.borderGreen)/2)); 
		vmlDiv +='<v:polyline points="'+thisObj.borderLeft+'" strokeweight="0px"> <v:stroke dashstyle="solid" opacity="0" />\n';
		vmlDiv +='<v:fill type="gradient" color="rgb('+tlRed+','+tlGreen+','+tlBlue+')" color2="rgb('+thisObj.borderRed+','+thisObj.borderGreen+','+thisObj.borderBlue+')" angle="90"></v:fill>\n </v:polyline>\n';
		vmlDiv +='<v:polyline points="'+thisObj.borderTop+'" strokeweight="0px"> <v:stroke dashstyle="solid" opacity="0" />\n';
		vmlDiv +='<v:fill type="gradient" color="rgb('+tlRed+','+tlGreen+','+tlBlue+')" color2="rgb('+thisObj.borderRed+','+thisObj.borderGreen+','+thisObj.borderBlue+')" angle="0"></v:fill>\n </v:polyline>\n';
		vmlDiv +='<v:polyline points="'+thisObj.borderBottom+'" strokeweight="0px"> <v:stroke dashstyle="solid" opacity="0" />\n';
		vmlDiv +='<v:fill type="gradient" color="rgb('+thisObj.borderRed+','+thisObj.borderGreen+','+thisObj.borderBlue+')" color2="rgb('+brRed+','+brGreen+','+brBlue+')" opacity2="75%" angle="180"></v:fill>\n </v:polyline>\n';
		vmlDiv +='<v:polyline points="'+thisObj.borderRight+'" strokeweight="0px"> <v:stroke dashstyle="solid" opacity="0" />\n';
		vmlDiv +='<v:fill type="gradient" color="rgb('+thisObj.borderRed+','+thisObj.borderGreen+','+thisObj.borderBlue+')" color2="rgb('+brRed+','+brGreen+','+brBlue+')" opacity2="75%" angle="270"></v:fill>\n </v:polyline>\n';
	}
	else
	{
		var tlRed = Math.floor(thisObj.borderRed+((255-thisObj.borderRed)*(3/4))); 
		var tlBlue = Math.floor(thisObj.borderBlue+((255-thisObj.borderBlue)*(3/4)));
		var tlGreen = Math.floor(thisObj.borderGreen+((255-thisObj.borderGreen)*(3/4))); 
		var brRed = Math.floor(thisObj.borderRed/4); 
		var brBlue = Math.floor(thisObj.borderBlue/4); 
		var brGreen = Math.floor(thisObj.borderGreen/4); 
		vmlDiv +='<v:polyline points="'+thisObj.borderLeft+'" strokeweight="0px"> <v:stroke dashstyle="solid" opacity="0" />\n';
		vmlDiv +='<v:fill type="gradient" color2="rgb('+tlRed+','+tlGreen+','+tlBlue+')" color="rgb('+thisObj.borderRed+','+thisObj.borderGreen+','+thisObj.borderBlue+')" opacity="90%" opacity2="65%" angle="90"></v:fill>\n </v:polyline>\n';
		vmlDiv +='<v:polyline points="'+thisObj.borderTop+'" strokeweight="0px"> <v:stroke dashstyle="solid" opacity="0" />\n';
		vmlDiv +='<v:fill type="gradient" color2="rgb('+tlRed+','+tlGreen+','+tlBlue+')" color="rgb('+thisObj.borderRed+','+thisObj.borderGreen+','+thisObj.borderBlue+')" opacity="90%" opacity2="65%" angle="0"></v:fill>\n </v:polyline>\n';
		vmlDiv +='<v:polyline points="'+thisObj.borderBottom+'" strokeweight="0px"> <v:stroke dashstyle="solid" opacity="0" />\n';
		vmlDiv +='<v:fill type="gradient" color="rgb('+thisObj.borderRed+','+thisObj.borderGreen+','+thisObj.borderBlue+')" color2="rgb('+brRed+','+brGreen+','+brBlue+')" angle="180" opacity2="90%"></v:fill>\n </v:polyline>\n';
		vmlDiv +='<v:polyline points="'+thisObj.borderRight+'" strokeweight="0px"> <v:stroke dashstyle="solid" opacity="0" />\n';
		vmlDiv +='<v:fill type="gradient" color="rgb('+thisObj.borderRed+','+thisObj.borderGreen+','+thisObj.borderBlue+')" color2="rgb('+brRed+','+brGreen+','+brBlue+')" angle="270" opacity2="90%"></v:fill>\n </v:polyline>\n';
	}	
	vmlDiv += '</div>\n';
	
	return vmlDiv;
}

function ObjAdjustList(thisObj)
{
	var ele = document.getElementById(thisObj.name);
	var ol;
	var marg = 0;
	ObjSetupUL(thisObj);
	if(ele)
		ol = ele.getElementsByTagName('ol');
	if(is.firefox)
	{
		if(ol.length >0)
		{
			var upOl = ol[0]; //up-most
			
			var li = upOl.getElementsByTagName('li');
			
			for (var index=0; index < li.length; index++)
			{
				var tmpLI = li[index];
				var lpad = parseFloat(tmpLI.style.paddingLeft);
				var lmarg = parseInt(tmpLI.style.marginLeft);
				
				if(!(tmpLI.style.listStyleType.length >0))
					ObjAdjustTxtIndent(thisObj, tmpLI);
				
				if(lpad >0)
					lpad +=1.5;
				else if(lpad == 0 || isNaN(lpad) )
					lpad = 5;
				if(lmarg > 24)
					lmarg = Math.floor(lmarg*2/3);
				
				tmpLI.style.paddingLeft = lpad+'px';
				tmpLI.style.marginLeft = lmarg+'px';
			}
			
			marg = parseInt(upOl.style.marginLeft);
			if(marg >0)
				marg -=3;
			
			upOl.style.marginLeft = marg+'px';
			
			for(var subIndex=1; subIndex < ol.length; subIndex++)
			{
				var tmpOl = ol[subIndex];
				if(tmpOl.parentNode != upOl)
				{
					var mIn = parseInt(tmpOl.style.marginLeft);
					if(mIn >0)
						mIn -=3;
					else
						mIn = 5;
					
					tmpOl.style.marginLeft = mIn+'px';
				}
			}
			
		}
	}
	else if(is.chrome || is.awesomium)
	{
		if(ol.length >0)
		{
			var upOl = ol[0]; //up-most
			var li = upOl.getElementsByTagName('li');
			
			for (var index=0; index < li.length; index++)
			{
				var tmpLI = li[index];
				var lmarg = parseFloat(tmpLI.style.marginLeft);
				var lpad = parseFloat(tmpLI.style.paddingLeft);
				
				if(!(tmpLI.style.listStyleType.length >0))
					ObjAdjustTxtIndent(thisObj, tmpLI);
				
				if(isNaN(lpad))
					lpad = 0;
				
				if(lmarg >16)
					lmarg = (lmarg/2.0) * 1.5;
				else if(lmarg ==16)
					lpad = lpad/2;
				
				tmpLI.style.marginLeft = lmarg+'px';
				tmpLI.style.paddingLeft = lpad+'px';
			}
			
			marg = parseInt(upOl.style.marginLeft);
			if(marg >0)
				marg +=3;
			
			upOl.style.marginLeft = marg+'px';
			
			for(var subIndex =1; subIndex < ol.length; subIndex++)
			{
				var tmpOl = ol[subIndex];
				if(tmpOl.parentNode == upOl)
				{
					var mIn = parseInt(tmpOl.style.marginLeft);
					if(mIn >0)
						mIn -=3;
					
					tmpOl.style.marginLeft = mIn+'px';
				}
				if(tmpOl.parentNode != upOl)
				{
					var mIn = parseInt(tmpOl.style.marginLeft);
					if(mIn >0)
						mIn +=3;
					
					tmpOl.style.marginLeft = mIn+'px';
				}
			}
			
		}
	}
	else
	{
		if(ol.length >0)
		{
			var upOl = ol[0]; //up-most
			var li = upOl.getElementsByTagName('li');
			
			for (var index=0; index < li.length; index++)
			{
				var tmpLI = li[index];
				var lmarg = parseFloat(tmpLI.style.marginLeft);
				var lpad = parseFloat(tmpLI.style.paddingLeft);
				
				if(!(tmpLI.style.listStyleType.length >0))
					ObjAdjustTxtIndent(thisObj, tmpLI);
				
				if(lmarg >16)
					lmarg = (lmarg/2.0) * 1.5;
				else if(lmarg ==16)
					lpad = lpad/2;
				
				tmpLI.style.marginLeft = lmarg+'px';
				tmpLI.style.paddingLeft = lpad+'px';
			}
			
			marg = parseInt(upOl.style.marginLeft);
			if(marg >0)
				marg +=3;
			
			upOl.style.marginLeft = marg+'px';
			
			for(var subIndex =1; subIndex < ol.length; subIndex++)
			{
				var tmpOl = ol[subIndex];
				if(tmpOl.parentNode != upOl)
				{
					var mIn = parseInt(tmpOl.style.marginLeft);
					if(mIn >0)
						mIn +=3;
					
					tmpOl.style.marginLeft = mIn+'px';
				}
			}
			
		}
	}	
	ObjListAlign(thisObj);
	
}
function ObjSetupUL(thisObj)
{
	var ele = document.getElementById(thisObj.name);
	var ul;
	if(ele)
		ul = ele.getElementsByTagName('ul');
	if(ul.length >0)
	{
		ObjAdjustTxtIndent(thisObj, null);
		var upUl;

		for(var index=0; index < ul.length; index++)
		{
			upUl = ul[index];
			
			var li = upUl.getElementsByTagName('li');
			
			for (var subIndex=0; subIndex < li.length; subIndex++)
			{
				var tmpLI = li[subIndex];
				var lmarg = parseInt(tmpLI.style.marginLeft);
				var origLMarg = lmarg;
				
				if(lmarg < 13)
					lmarg+=3;
				else if(lmarg >=13 && lmarg <24)
					lmarg -= (lmarg%13);
				else if(lmarg >=24)
				{
					lmarg = Math.floor(lmarg*2/3);
					while(lmarg >16)
						lmarg-=(lmarg/4);
				}
				
				if(origLMarg>48)
					lmarg = Math.floor(origLMarg*2/3)-lmarg;
				
				tmpLI.style.marginLeft = lmarg+'px';
			}
		}
		
		for(var index=0; index < ul.length; index++)
		{
			upUl = ul[index];
			upUl.style.marginLeft = 10+'px';
		}
	}
}
function ObjListAlign(thisObj)
{
	var ele = document.getElementById(thisObj.name);
	var ol;
	var ul;
	
	if(ele)
	{
		ol = ele.getElementsByTagName('ol');
		ul = ele.getElementsByTagName('ul');
	}
	
	if(!is.firefox)
	{
		if(ol.length >0)
		{
			var upOl = ol[0]; //up-most
			
			if(upOl.style.textAlign.indexOf("center")>-1 || upOl.style.textAlign.indexOf("right")>-1)
				upOl.style.listStylePosition="inside";
			
			for(var index=1; index < ol.length; index++)
			{
				var tmpOl = ol[index];
				if(tmpOl.style.textAlign.indexOf("center")>-1 || tmpOl.style.textAlign.indexOf("right")>-1)
				{
					tmpOl.style.listStylePosition="inside";
				}
			}
			
		}
		if(ul.length >0)
		{
			for(var index=0; index < ul.length; index++)
			{
				var upUl = ul[index];
				upUl.style.listStylePosition="inside";
			}
		}
	}
	if(thisObj.hasBorder || thisObj.hasOutline)
	{
		var margInc = (thisObj.hasBorder>0?2:0)+(thisObj.hasOutline>0?2:0);
		
		if(ol.length >0)
		{
			var upOl;
			
			for(var index=0; index < ol.length; index++)
			{
				var upOl = ol[index];
				var curMarg = parseInt(upOl.style.marginLeft);
				upOl.style.marginLeft = curMarg+margInc+'px';
			}
		}
		
		if(ul.length >0)
		{
			var upUl;

			for(var index=0; index < ul.length; index++)
			{
				var upUl = ul[index];
				var curMarg = parseInt(upUl.style.marginLeft);
				upUl.style.marginLeft = curMarg+margInc+'px';
			}
		}
	}
}

function ObjInitList(liType, fSize)
{
	this.bltType = liType;
	this.fSize = fSize;
}

function ObjAdjustTxtIndent(thisObj, liItem)
{
	var ele = document.getElementById(thisObj.name);
	var ul;
	if(ele)
		ul = ele.getElementsByTagName('ul');
	if(!liItem)
	{
		if(ul.length >0)
		{
			var upUl;

			for(var index=0; index < ul.length; index++)
			{
				upUl = ul[index];
				
				var li = upUl.getElementsByTagName('li');
				
				for (var subIndex=0; subIndex < li.length; subIndex++)
				{
					var tmpLI = li[subIndex];
					var txtIndent = parseInt(tmpLI.style.textIndent);
					txtIndent = 20;
					
					if(is.firefox)
					{
						if(thisObj.fSize >= 48)
							txtIndent+=10;
						switch(thisObj.bltType)
						{
							case 0://BLT
								if(thisObj.fSize >=18)
									txtIndent-=2;
								if(thisObj.fSize >30)
									txtIndent-=2;
							break;
							case 1://DIA
								if(thisObj.fSize <10)
									txtIndent+=2;
								if(thisObj.fSize >=10)
									txtIndent+=4;
								if(thisObj.fSize >=16)
									txtIndent+=2;
								if(thisObj.fSize >30)
									txtIndent-=2;
							break;
							case 2://SQR
								if(thisObj.fSize <18)
									txtIndent+=3;
								if(thisObj.fSize >30)
									txtIndent-=4;
							break;
							case 3://HSQR
								if(thisObj.fSize >=9)
									txtIndent+=2;
								if(thisObj.fSize >12)
									txtIndent+=3;
								if(thisObj.fSize >30)
									txtIndent-=2;
							break;
							case 4://4DIA
								if(thisObj.fSize >=11)
									txtIndent+=2;
								if(thisObj.fSize >16)
									txtIndent+=4;
								if(thisObj.fSize >30)
									txtIndent+=2;
							break;
							case 5://ARR
								if(thisObj.fSize >=11)
									txtIndent+=4;
								if(thisObj.fSize >16)
									txtIndent+=2;
								if(thisObj.fSize >22)
									txtIndent+=4;
							break;
							case 6://CHK
								if(thisObj.fSize >=9)
									txtIndent+=2;
								if(thisObj.fSize >12)
									txtIndent+=1;
								if(thisObj.fSize >16)
									txtIndent+=2;
								if(thisObj.fSize >30)
									txtIndent+=8;
							break;	
						}
					}
					else if(is.chrome || is.awesomium)
					{
						if(thisObj.fSize >= 48)
							txtIndent+=10;
						switch(thisObj.bltType)
						{
							case 0://BLT
								if(thisObj.fSize >18)
									txtIndent-=2;
								if(thisObj.fSize >24)
									txtIndent-=2;
							break;
							case 1://DIA
								if(thisObj.fSize >12)
									txtIndent+=4;
								if(thisObj.fSize >30)
									txtIndent-=2;
							break;
							case 2://SQR
								if(thisObj.fSize <18)
									txtIndent+=2;
								if(thisObj.fSize >24)
									txtIndent-=2;
							break;
							case 3://HSQR
								if(thisObj.fSize <9)
									txtIndent-=2;
								if(thisObj.fSize >12)
									txtIndent+=3;
								if(thisObj.fSize >30)
									txtIndent-=2;
							break;
							case 4://4DIA
								if(thisObj.fSize >=11)
									txtIndent+=2;
								if(thisObj.fSize >16)
									txtIndent+=4;
								if(thisObj.fSize >30)
									txtIndent+=2;
							break;
							case 5://ARR
								if(thisObj.fSize <9)
									txtIndent-=1;
								if(thisObj.fSize >10)
									txtIndent+=2;
								if(thisObj.fSize >16)
									txtIndent+=4;
								if(thisObj.fSize >22)
									txtIndent+=4;
							break;
							case 6://CHK
								if(thisObj.fSize >=9)
									txtIndent+=2;
								if(thisObj.fSize >12)
									txtIndent+=1;
								if(thisObj.fSize >=16)
									txtIndent+=1;
								if(thisObj.fSize >=22)
									txtIndent+=1;
								if(thisObj.fSize >30)
									txtIndent+=8;
							break;	
						}
					}
					else
					{
						if(thisObj.fSize >= 48)
							txtIndent+=10;
						switch(thisObj.bltType)
						{
							case 0://BLT
								if(thisObj.fSize >=18)
									txtIndent-=2;
								if(thisObj.fSize >=26)
									txtIndent-=2;
							break;
							case 1://DIA
								if(thisObj.fSize >8)
									txtIndent+=4;
								if(thisObj.fSize >10)
									txtIndent+=2;
								if(thisObj.fSize >=16)
									txtIndent+=4;
								if(thisObj.fSize >30)
									txtIndent-=2;
							break;
							case 2://SQR
								if(thisObj.fSize <18)
									txtIndent+=1;
								if(thisObj.fSize >24)
									txtIndent-=2;
							break;
							case 3://HSQR
								if(thisObj.fSize >8)
									txtIndent+=3;
								if(thisObj.fSize >12)
									txtIndent+=3;
								if(thisObj.fSize >=16)
									txtIndent+=2;
								if(thisObj.fSize >30)
									txtIndent-=2;
							break;
							case 4://4DIA
								if(thisObj.fSize >=11)
									txtIndent+=2;
								if(thisObj.fSize >16)
									txtIndent+=4;
								if(thisObj.fSize >30)
									txtIndent+=2;
							break;
							case 5://ARR
								if(thisObj.fSize >10)
									txtIndent+=2;
								if(thisObj.fSize >12)
									txtIndent+=2;
								if(thisObj.fSize >=16)
									txtIndent+=3;
								if(thisObj.fSize >=22)
									txtIndent+=3;
							break;
							case 6://CHK
								if(thisObj.fSize ==8)
									txtIndent+=2;
								if(thisObj.fSize >=9)
									txtIndent+=5;
								if(thisObj.fSize >=12)
									txtIndent+=3;
								if(thisObj.fSize >=16)
									txtIndent+=2;
								if(thisObj.fSize >=22)
									txtIndent+=2;
								if(thisObj.fSize >30)
									txtIndent+=8;
							break;	
						}
					}
					tmpLI.style.textIndent =  ((-1)*txtIndent)+'px';
				}
			}
		}
	}
	else if(liItem)
	{
		var tmpLI = liItem;
		var txtIndent = parseInt(tmpLI.style.textIndent);
		txtIndent = 20;
		
		if(is.firefox)
		{
			if(thisObj.fSize >= 48)
				txtIndent+=10;
			switch(thisObj.bltType)
			{
				case 0://BLT
					if(thisObj.fSize >=18)
						txtIndent-=2;
					if(thisObj.fSize >30)
						txtIndent-=2;
				break;
				case 1://DIA
					if(thisObj.fSize <10)
						txtIndent+=2;
					if(thisObj.fSize >=10)
						txtIndent+=4;
					if(thisObj.fSize >=16)
						txtIndent+=2;
					if(thisObj.fSize >30)
						txtIndent-=2;
				break;
				case 2://SQR
					if(thisObj.fSize <18)
						txtIndent+=3;
					if(thisObj.fSize >30)
						txtIndent-=4;
				break;
				case 3://HSQR
					if(thisObj.fSize >=9)
						txtIndent+=2;
					if(thisObj.fSize >12)
						txtIndent+=3;
					if(thisObj.fSize >30)
						txtIndent-=2;
				break;
				case 4://4DIA
					if(thisObj.fSize >=11)
						txtIndent+=2;
					if(thisObj.fSize >16)
						txtIndent+=4;
					if(thisObj.fSize >30)
						txtIndent+=2;
				break;
				case 5://ARR
					if(thisObj.fSize >=11)
						txtIndent+=4;
					if(thisObj.fSize >16)
						txtIndent+=2;
					if(thisObj.fSize >22)
						txtIndent+=4;
				break;
				case 6://CHK
					if(thisObj.fSize >=9)
						txtIndent+=2;
					if(thisObj.fSize >12)
						txtIndent+=1;
					if(thisObj.fSize >16)
						txtIndent+=2;
					if(thisObj.fSize >30)
						txtIndent+=8;
				break;	
			}
		}
		else if(is.chrome || is.awesomium)
		{
			if(thisObj.fSize >= 48)
				txtIndent+=10;
			switch(thisObj.bltType)
			{
				case 0://BLT
					if(thisObj.fSize >18)
						txtIndent-=2;
					if(thisObj.fSize >24)
						txtIndent-=2;
				break;
				case 1://DIA
					if(thisObj.fSize >12)
						txtIndent+=4;
					if(thisObj.fSize >30)
						txtIndent-=2;
				break;
				case 2://SQR
					if(thisObj.fSize <18)
						txtIndent+=2;
					if(thisObj.fSize >24)
						txtIndent-=2;
				break;
				case 3://HSQR
					if(thisObj.fSize <9)
						txtIndent-=2;
					if(thisObj.fSize >12)
						txtIndent+=3;
					if(thisObj.fSize >30)
						txtIndent-=2;
				break;
				case 4://4DIA
					if(thisObj.fSize >=11)
						txtIndent+=2;
					if(thisObj.fSize >16)
						txtIndent+=4;
					if(thisObj.fSize >30)
						txtIndent+=2;
				break;
				case 5://ARR
					if(thisObj.fSize <9)
						txtIndent-=1;
					if(thisObj.fSize >10)
						txtIndent+=2;
					if(thisObj.fSize >16)
						txtIndent+=4;
					if(thisObj.fSize >22)
						txtIndent+=4;
				break;
				case 6://CHK
					if(thisObj.fSize >=9)
						txtIndent+=2;
					if(thisObj.fSize >12)
						txtIndent+=1;
					if(thisObj.fSize >=16)
						txtIndent+=1;
					if(thisObj.fSize >=22)
						txtIndent+=1;
					if(thisObj.fSize >30)
						txtIndent+=8;
				break;	
			}
		}
		else
		{
			if(thisObj.fSize >= 48)
				txtIndent+=10;
			switch(thisObj.bltType)
			{
				case 0://BLT
					if(thisObj.fSize >=18)
						txtIndent-=2;
					if(thisObj.fSize >=26)
						txtIndent-=2;
				break;
				case 1://DIA
					if(thisObj.fSize >8)
						txtIndent+=4;
					if(thisObj.fSize >10)
						txtIndent+=2;
					if(thisObj.fSize >=16)
						txtIndent+=4;
					if(thisObj.fSize >30)
						txtIndent-=2;
				break;
				case 2://SQR
					if(thisObj.fSize <18)
						txtIndent+=1;
					if(thisObj.fSize >24)
						txtIndent-=2;
				break;
				case 3://HSQR
					if(thisObj.fSize >8)
						txtIndent+=3;
					if(thisObj.fSize >12)
						txtIndent+=3;
					if(thisObj.fSize >=16)
						txtIndent+=2;
					if(thisObj.fSize >30)
						txtIndent-=2;
				break;
				case 4://4DIA
					if(thisObj.fSize >=11)
						txtIndent+=2;
					if(thisObj.fSize >16)
						txtIndent+=4;
					if(thisObj.fSize >30)
						txtIndent+=2;
				break;
				case 5://ARR
					if(thisObj.fSize >10)
						txtIndent+=2;
					if(thisObj.fSize >12)
						txtIndent+=2;
					if(thisObj.fSize >=16)
						txtIndent+=3;
					if(thisObj.fSize >=22)
						txtIndent+=3;
				break;
				case 6://CHK
					if(thisObj.fSize ==8)
						txtIndent+=2;
					if(thisObj.fSize >=9)
						txtIndent+=5;
					if(thisObj.fSize >=12)
						txtIndent+=3;
					if(thisObj.fSize >=16)
						txtIndent+=2;
					if(thisObj.fSize >=22)
						txtIndent+=2;
					if(thisObj.fSize >30)
						txtIndent+=8;
				break;	
			}
		}
		tmpLI.style.textIndent =  ((-1)*txtIndent)+'px';
	}
}

function ObjLoadProps()
{
	if(is.jsonData != null)
	{
		var respValues = is.jsonData[is.clientProp.device];
		var newValues;
		newValues = respValues[is.clientProp.width];
		var obj = newValues[this.name];
		if(obj)
		{
			this.x = typeof(obj.x)!="undefined"?obj.x:this.x;
			this.y = typeof(obj.y)!="undefined"?obj.y:this.y;
			this.w = typeof(obj.w)!="undefined"?obj.w:this.w;
			this.h = typeof(obj.h)!="undefined"?obj.h:this.h;
            if( typeof(obj.txtscale) != "undefined" )
                this.txtscale = obj.txtscale;
			if(typeof obj.src != "undefined")
			{
				var txtDiv = document.getElementById(this.name);
				if(txtDiv)
				{
					var txtSrc = obj.src;
					var scriptEval;
					var scriptOpen = 0;
					var scriptClose = 0;
					while(scriptOpen != -1)
					{
						scriptOpen = txtSrc.indexOf("<script");
						scriptClose = txtSrc.indexOf(">", scriptOpen);
						if(scriptOpen>-1 && scriptClose >-1)
						{
							scriptEval = txtSrc.substring(scriptClose+1, txtSrc.indexOf("</", scriptClose));
							scriptEval = scriptEval.substring(scriptEval.indexOf("(")+1, scriptEval.indexOf(";", scriptEval.indexOf("("))-1);
							txtSrc = txtSrc.replace(txtSrc.substring(scriptOpen,txtSrc.indexOf("</script>", scriptClose)+("</script>").length), ""+eval(scriptEval)+"");
						}
					}
					txtDiv.innerHTML = txtSrc;
				}
					
			}
				
		}
	}
}

function ObjRespChanges()
{
	AdjustAttributesForEffects(this);
	
	ModifyTextEffect(this);

	//Adjust the CSS
	FindAndModifyObjCSSBulk(this);

}

//echo LD-768 : Putting all degradation rules for IE into this function.
//echo bug 21691 : Graceful Degradation
function ObjDegradeEffects()
{
	if(is.vml)
	{
		this.hasTextShadow = false;
		
		if(this.opacity < 100){
			this.hasOuterShadow = false;
			return;
		}
		if(this.r > 0){
			this.hasOuterShadow = false;
			return;
		}
		if(this.vf == 1 || this.hf == 1){
			this.hasOuterShadow = false;
			return;
		}
		if(is.ie8){
			this.hasOuterShadow = this.outerShadowDepth == 0 ? false : true;
		}
	}
	
	return;
}

function ObjAddHeading(num){
	switch(num){
		case 1:
			this.heading = 1;
			break;
		case 2:
			this.heading = 2;
			break;
		case 3:
			this.heading = 3;
			break;
		case 4:
			this.heading = 4;
			break;
		case 5:
			this.heading = 5;
			break;
		case 6:
			this.heading = 6;
			break;
	}
}

//IE7 Degradation
function ObjDegradeBullets()
{
	var ele = document.getElementById(this.name);
	var ul;
	if(ele)
		ul= ele.getElementsByTagName('ul');
	if(ul && ul.length>0)
	{
		for(var index = 0; index < ul.length; index++)
		{
			ul[index].style.listStyleType = 'disc';
			var li = ul[index].getElementsByTagName('li');
			if(li && li.length>0)
			{
				for(var index2 = 0; index2 < li.length; index2++)
				{
					li[index2].className = "";
				}
			}
		}
	}
}