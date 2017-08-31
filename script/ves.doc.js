//通过浏览器的控制台输入vesInfo，或者vesInfo.addClass的方式查看ves.js框架详细说明文档
window.vesInfo = {
	ves: {
		param: [
			{
				info: '选择器字符串/element/ves对象, 或者函数（document文档准备好后回调函数）',
				type:'string, HTMLElement, ves, function'
			},
			{
				info: '父级元素, 可不传',
				type: 'HTMLElement'
			},
			{
				info: '如果获得的元素里面有未执行的js代码，执行前调用，可不传',
				type: 'function'
			},
			{
				info: '如果获得的元素里面有未执行的js代码，执行后调用，可不传',
				type: 'function'
			}
		],
		return:'返回ves对象，当第一个参数为function时除外。'
	},
	version: 'ves版本号',
	ready: {
		param: [
			{
				info: 'document文档准备好后回调函数，简捷调用方式：ves(function(){})',
				type:'function'
			}
		],
		return: 'void'
	},
	loaded: {
		param: [
			{
				info: 'document文档准备好并且html全部图片加载完成后回调',
				type: 'function'
			}
		],
		return: 'void'
	},
	parent: {
		param: null,
		return:'返回this的一级父级元素的ves对象'
	},
	parents: {
		param: [
			{
				info: '选择器字符串，或者数字序号（第几个父级元素）, 可不传',
				type:'string, number'
			}
		],
		return: '返回this所有元素的所有父级元素的ves对象'
	},
	children: {
		param: [
			{
				info: '选择器字符串，或者数字序号（第几个子级元素）, 可不传',
				type: 'string, number'
			}
		],
		return: '返回this的所有第一级子级元素的ves对象'
	},
	find: {
		param: [
			{
				info: '选择器字符串,  必传',
				type: 'string'
			}
		],
		return: '查找this所有元素下的所有子级元素的ves对象'
	},
	filter: {
		param: [
			{
				info: '选择器字符串,  必传',
				type: 'string'
			}
		],
		return: '过滤符合条件的this所有元素的ves对象'
	}
};