# Ves.js

> Ves.js是原生js框架，语法类似于jQuery，但Ves更精简，而且很多功能优于jQuery，并且提供了很多特有的实用功能：

``` javascript
(function(){
	var $=window.ves;
	//定义全局变量‘$’引用ves

	ves(function(){
		//文档准备好后执行，相当于ves.ready(function(){});

		var element=document.createElement('div');
		ves.body.append(element);
		//注意: ves.body是已经封装好的ves对象，相当于ves('body')

		$(element).addClass('class1');
		//封装成ves对象后调用ves方法

		element.addClass('class1');
		document.querySelectorAll('a.test').addClass('class1').nexts().show();
		document.getElementsByTagName('a').addClass('class1').nexts().show();
		//element节点直接调用ves方法
		/*这一点是其他js框架所不具备的，ves在初始化时的同时也对DOM接口进行了扩展，
		这种调用方式，在性能和速度方面都更胜一筹。
		因为在对element封装成ves对象或者jquery对象的过程中，
		内部会有各种逻辑判断，要判断传入的参数是字符串还是函数、或者是其他类型的变量，
		并做相应的处理，这里面是有性能消耗的。
		所以，可以毫不夸张地说，ves的这个功能非常棒*/

		ves.body.children();
		ves.body[0].childrenV();
		/*这里是因为部分浏览器中dom已经有children这方法，
		除非封装成ves对象，否则如果element要直接调用ves的方法，就只能用childrenV，
		当然这种重名的情况比较少遇到。*/

		element.css('transition','opacity 1s linear');
		/*ves会根据当前浏览器自动添加对应的css前缀，比如-webkit-transition，省去了很多麻烦*/

		var boo=element.appear(relative, client);
		//判断element是否在可视范围
		//relative：boolean或者object,当为true时表示相对于它的定位父级元素是否在可视范围
		//relative为node节点时，表示相对于node，element是否在可视范围
		//relative为null或undefined时，表示相对于页面是否在可视范围
		//client: boolean, 当为true时，表示“完全”出现在可视范围

		var rect=element.pageRect();
		//rect:{left:10,top:20};获取element相对于页面的位置

		element.insertBeforeV(element2);
		//因为insertBefore是原DOM提供的方法，ves提供insertBeforeV方法, 两种用法有差别：
		//element插入到element2的前面

		element.insertAfter(element2);
		//element插入到element2的后面

		//绑定事件处理程序，用on或者bind
		element.on('tap',function(){
			//移动端无延迟点击事件
		});

		//解绑事件处理程序，用off或者unbind
		element.off('tap', /*function || undefined*/);

		//...
		//...
		//...

		//ves除了以上特色功能，还实现了很多其他功能，未能一 一列举，
		//其他功能的说明文档也将会很快呈现给大家。
		//希望能够得到大家各方面的积极反馈！
	});

})();
```
``` html
<html class="ready mobile webkit">
<!--调用ves.js后，html节点会自动添加以下className，
ready(文档准备好),mobile(移动端),desktop(桌面端),
webkit(浏览器内核), ms7(ie7), ms-8(ie6-ie8)，......等等其他特性
方便用css控制不同浏览器状态下的样式.-->
```
