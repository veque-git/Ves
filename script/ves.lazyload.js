!function(){
	var $=window.ves;
	$.lazyLoad = function(element, relative) {
		return new _lazyLoad(element,relative);
	};
	var _lazyLoad=function(element,relative){
		this.imgs=[];
		if(element)this.imgs = $(element).$;
		else this.imgs=$('img[lazy]').$;
		if(relative)this.relative=$(relative)[0];
		this.init();
	};

	_lazyLoad.prototype = {
		init: function() {
			var _this = this;
			_this.setPlaceholder();
			_this.load();

			if(_this.imgs.length>0){
				$(window).bind('scroll',function(){
					_this.load();
					if(_this.imgs.length==0){
						$(window).unbind('scroll',arguments.callee);
					}
				});
			}
		},
		setPlaceholder: function(){
			var img,prt;
			var canvas=document.createElement('canvas');
			for(var i = 0; i < this.imgs.length; i++){
				img=this.imgs[i];
				if(img.getAttribute("lazy")&&!img.lazyLoad){
					canvas.width=img.getAttribute('width');
					img.removeAttribute('width');
					canvas.height=img.getAttribute('height');
					img.removeAttribute('height');
					img.lazyLoad=this;
					img.src = canvas.toDataURL('image/png');
					if(img.getAttribute('_lazy')){
						this.imgs.splice(i, 1);
						i--;
					}
				}
				else{
					this.imgs.splice(i, 1);
					i--;
				}
			}
		},
		load: function(target) {
			var img;
			for (var i = 0; i < this.imgs.length; i++) {
				img= this.imgs[i];
				if(target){
					if(target!=img)continue;
					else img=target;
				}
				if (img.lazyLoad){
					if($(img).appear(this.relative)){
						!function(img){
							var c = new Image();
							c.onload = function(){
								img.src = this.src;
								img.removeAttribute('lazy');
								delete img.lazyLoad;
							};
							c.src = img.getAttribute('lazy');
						}(img);
					}
				}
				else{
					this.imgs.splice(i, 1);
					i--;
				}
				if(target)break;
			}
		}
	};
}();
