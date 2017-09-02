//Ves v2.0 Copyright Â© 2014-2017 Chen QingZhu TEl: 13760888450 All rights reserved.
//以下注释说明：参数>1表示必须传参，参数>0表示可不传
(function() {

	var $data = {
		_ready: [],
		_loaded: [],
		isReady: false,
		isLoaded: false
	};

	//slt>1(string, HTMLElement, ves, function)选择器字符串/element/ves对象, 或者函数（document文档准备好后回调函数）
	//prt>0(HTMLElement)父级元素
	//callback>0(function)如果获得的元素里面有未执行的js代码，执行前调用
	//callback2>0(function)如果获得的元素里面有未执行的js代码，执行后调用
	//return>返回ves对象，当第一个参数为function时除外
	window.ves = function(slt, prt, callback, callback2) {
		if(typeof(slt) == 'function') {
			if($data.isReady) {
				slt.call(ves);
				return;
			}
			$data._ready.push(slt);
			if($data._ready.length == 1) {
				var readyTime = setInterval(function() {
					if((!ves.browser.ms || ves.browser.version < 8) && document.readyState == 'interactive' || document.readyState == 'complete') {
						clearInterval(readyTime);
						readyTime = null;
						for(var i = 0; i < $data._ready.length; i++) {
							$data._ready[i].call(ves);
						}
						$data.isReady = true;
						delete $data._ready;
					}
				}, 10);
			}
		} else return new init(slt, prt, callback, callback2);
	};

	var $ = ves;

	//ves版本号
	$.version = 2.00;

	//简捷调用方式：ves(function(){})
	//fun>1(function)document文档准备好后回调函数
	ves.ready = function (fun) {
		if(typeof(fun) == 'function') ves(fun);
	};

	//fun>1(function)document文档准备好并且html全部图片加载完成后回调
	ves.loaded = function(fun) {
		if(typeof(fun) == 'function') {
			if($data.isLoaded) {
				fun.call(ves);
				return;
			}
			$data._loaded.push(fun);
			if($data._loaded.length == 1) {
				ves(function() {
					$data.images = nodeListToArray(document.images);
					var loadTime = setInterval(function() {
						for(var i = 0; i < $data.images.length; i++) {
							if(!$data.images[i].complete) return;
							$data.images.splice(i, 1);
							i -= 1;
						}
						clearInterval(loadTime);
						loadTime = null;
						for(var i = 0; i < $data._loaded.length; i++) {
							$data._loaded[i].call(ves);
						}
						$data.isLoaded = true;
						delete $data._loaded;
					}, 100);
				});
			}
		}
	};

	//ves构造函数
	//slt>1(string, HTMLElement, ves, function)选择器字符串/element/ves对象, 或者函数（document文档准备好后回调函数）
	//prt>0(HTMLElement)父级元素
	//callback>0(function)如果获得的元素里面有未执行的js代码，执行前调用
	//callback2>0(function)如果获得的元素里面有未执行的js代码，执行后调用
	function init(slt, prt, callback, callback2) {
		this.$ = [];
		if(slt) {
			if(typeof(slt) == 'string') {
				slt = slt.trim();
				if(slt.indexOf('<') > -1) {
					var holder = document.createElement('div');
					if(slt[0] != '<') {
						slt = '<div>' + slt + '</div>';
					}
					holder.innerHTML = slt;
					this.$ = nodeListToArray(holder.childNodes);
					scriptRun(holder, callback, callback2);
				} else this.$ = selector(slt, prt);
			} else {
				if(slt instanceof Array) {
					for(var i = 0; i < slt.length; i++) {
						if(!slt[i] || slt[i].nodeType !== 1) {
							slt.splice(i, 1);
							i--;
						}
					}
					this.$ = slt;
				} else if((typeof(HTMLCollection) != 'undefined' && slt instanceof HTMLCollection) || (typeof(NodeList) != 'undefined' && slt instanceof NodeList)) this.$ = nodeListToArray(slt);
				else if(slt.$ instanceof Array) this.$ = slt.$;
				else if(slt.nodeType === 1 || slt.nodeType === 11 || slt.window || slt.documentElement) this.$ = [slt];
				this.$ = this.$.unique();
			}
			if(this.$.length > 0) {
				for(var i = 0; i < this.$.length; i++) {
					this[i] = this.$[i];
				}
			}
		}
		this.length = this.$.length;
	}

	init.prototype = {

		//return>this的一级父级元素的ves对象
		parent: function() {
			var arr = [];
			for(var i = 0; i < this.$.length; i++) {
				if(this.$[i].parentNode && this.$[i].tagName.toLowerCase() != 'html')
					arr.push(this.$[i].parentNode);
			}
			return new init(arr);
		},

		//slt>0(string, number)选择器字符串，或者数字序号（第几个父级元素）
		//return>this所有元素的所有父级元素的ves对象
		parents: function(slt) {
			var arr = [];
			if (typeof (slt) == 'number') {
				var index;
				for (var i = 0; i < this.$.length; i++) {
					index =-1;
					(function () {
						if (this.parentNode && this.tagName.toLowerCase() != 'html') {
							++index;
							if (index === slt) {
								arr.push(this.parentNode);
								return;
							}
							arguments.callee.call(this.parentNode);
						}
					}).call(this.$[i]);
				}
			}
			else {
				for (var i = 0; i < this.$.length; i++) {
					(function () {
						if (this.parentNode && this.tagName.toLowerCase() != 'html') {
							arr.push(this.parentNode);
							arguments.callee.call(this.parentNode);
						}
					}).call(this.$[i]);
				}
			}
			arr = arr.unique();
			if (typeof (slt) == 'string') arr = filter(slt, arr);

			return new init(arr);
		},

		//slt>0(string, number)选择器字符串，或者数字序号（第几个子级元素）
		//return>this的所有第一级子级元素的ves对象
		children: function(slt) {
			var arr = [];
			var _arr;
			if (typeof (slt) == 'number') {
				var index;
				for (var c = 0; c < this.$.length; c++) {
					index = -1;
					_arr = this.$[c].childNodes;
					for (var i = 0; i < _arr.length; i++) {
						if (_arr[i].nodeType === 1 || _arr[i].nodeType === 11) {
							++index;
							if (index === slt) {
								arr.push(_arr[i]);
								break;
							}
						}
					}
				}
			}
			else {
				for (var c = 0; c < this.$.length; c++) {
					_arr = this.$[c].childNodes;
					for (var i = 0; i < _arr.length; i++) {
						if (_arr[i].nodeType === 1 || _arr[i].nodeType === 11) arr.push(_arr[i]);
					}
				}
			}
			if(typeof(slt) == 'string') arr = filter(slt, arr);
			return new init(arr);
		},

		//slt>1(string)选择器字符串
		//return>this所有元素下的所有子级元素的ves对象
		find: function(slt) {
			return new init(selector(slt, this.$));
		},

		//slt>1(string)选择器字符串
		//return>过滤后返回符合条件的this所有元素的ves对象
		filter: function(slt) {
			return new init(filter(slt, this.$));
		},

		//slt>0(string, number)选择器字符串,或者数字序号(第几个同级元素)
		//return>this所有同级元素
		siblings: function (slt) {
			var arr = this.parent().children(slt).$.remove(this.$);
			return new init(arr);
		},

		//return>this的后一个同级元素
		next: function() {
			var arr = [];
			for(var i = 0; i < this.$.length; i++) {
				if(this.$[i].nextSibling) {
					(function() {
						if(this.nodeType === 1 || this.nodeType === 11) {
							arr.push(this);
							return;
						}
						if(this.nextSibling) arguments.callee.call(this.nextSibling);
					}).call(this.$[i].nextSibling);
				}
			}
			return new init(arr);
		},

		//slt>0(string, number)选择器字符串,或者数字序号(后面第几个同级元素)
		//return>this后面的所有同级元素
		nexts: function(slt) {
			var arr = [];
			if (typeof (slt) == 'number') {
				var index;
				for (var i = 0; i < this.$.length; i++) {
					index = -1;
					if (this.$[i].nextSibling) {
						(function () {
							if (this.nodeType === 1 || this.nodeType === 11) {
								++index;
								if (index === slt) {
									arr.push(this);
									return;
								}
							}
							if (this.nextSibling) arguments.callee.call(this.nextSibling);
						}).call(this.$[i].nextSibling);
					}
				}
			}
			else {
				for (var i = 0; i < this.$.length; i++) {
					if (this.$[i].nextSibling) {
						(function () {
							if (this.nodeType === 1 || this.nodeType === 11) {
								arr.push(this);
							}
							if (this.nextSibling) arguments.callee.call(this.nextSibling);
						}).call(this.$[i].nextSibling);
					}
				}
			}
			arr = arr.unique();
			if(typeof(slt) == 'string') arr = filter(slt, arr);
			return new init(arr);
		},

		//return>this的前一个同级元素
		prev: function() {
			var arr = [];
			for(var i = 0; i < this.$.length; i++) {
				if(this.$[i].previousSibling) {
					(function() {
						if(this.nodeType === 1 || this.nodeType === 11) {
							arr.push(this);
							return;
						}
						if(this.previousSibling) arguments.callee.call(this.previousSibling);
					}).call(this.$[i].previousSibling);
				}
			}
			return new init(arr);
		},

		//slt>0(string, number)选择器字符串,或者数字序号(前面第几个同级元素)
		//return>this前面的所有同级元素
		prevs: function(slt) {
			var arr = [];
			if (typeof (slt) == 'number') {
				var index;
				for (var i = 0; i < this.$.length; i++) {
					index = -1;
					if (this.$[i].previousSibling) {
						(function () {
							if (this.nodeType === 1 || this.nodeType === 11) {
								++index;
								if (index === slt) {
									arr.push(this);
									return;
								}
							}
							if (this.previousSibling) arguments.callee.call(this.previousSibling);
						}).call(this.$[i].previousSibling);
					}
				}
			}
			else {
				for (var i = 0; i < this.$.length; i++) {
					if (this.$[i].previousSibling) {
						(function () {
							if (this.nodeType === 1 || this.nodeType === 11) {
								arr.push(this);
							}
							if (this.previousSibling) arguments.callee.call(this.previousSibling);
						}).call(this.$[i].previousSibling);
					}
				}
			}
			arr = arr.unique();
			if(typeof(slt) == 'string') arr = filter(slt, arr);
			return new init(arr);
		},

		//return>this[0]的序号
		index: function() {
			var s = this.parent().children().$;
			for(var c = 0; c < s.length; c++) {
				if(s[c] == this.$[0])
					return c;
			}
			return -1;
		},
		
		//num>1(number,string,array)
		//return>返回this第几个元素
		eq: function(num) {
			var arr = [];
			if(this.$.length == 0) return new init(arr);
			if(typeof(num) == 'number') num = [num];
			else if(typeof(num) == 'string') num = num.split(/[,\s\|][\s]*/gi);
			if(num instanceof Array) {
				for(var d = 0; d < num.length; d++) {
					num[d] = parseInt(num[d]);
					if(num[d] < 0 || num[d] > (this.$.length - 1)) continue;
					arr.push(this.$[num[d]]);
				}
			}
			return new init(arr);
		},
		
		//num>1(number)
		//return>返回序号<=num的元素
		lt: function(num) {
			if(num > this.$.length - 1) num = this.$.length - 1;
			return new init(this.$.slice(0, num+1));
		},

		//num>1(number)
		//return>返回序号>=num的元素
		gt: function(num) {
			if(num > this.$.length - 1) num = this.$.length - 1;
			return new init(this.$.slice(num));
		},

		//num>1(string)选择器
		//return>排除选择器指定的元素
		not: function(slt) {
			return new init(this.$.remove(selector(slt)));
		},

		//num>1(string)选择器
		//return>判断this是否是slt选择器指定的元素
		is: function(slt) {
			if(selector(slt).contains(this.$)) return true;
			return false;
		},
		
		//dom>1(HTMLElement, Array)
		//return>判断this是否包含dom
		contains: function(dom) {
			var it = this.$[0];
			var valid = false;
			if(dom instanceof Array) {
				for(var i = 0; i < dom.length; i++) {
					valid = false;
					(function() {
						if(this.parentNode) {
							if(this.parentNode == it) {
								valid = true;
								return;
							}
							arguments.callee.call(this.parentNode);
						}
					}).call(dom[i]);
					if(valid == false)
						return false;
				}
				return true;
			} else {
				(function() {
					if(this.parentNode) {
						if(this.parentNode == it) {
							valid = true;
							return;
						}
						arguments.callee.call(this.parentNode);
					}
				}).call(dom);
			}
			return valid;
		},
		
		//fun>1(function)
		//context>0(object)设置调用fun的this指针，如果未设置，默认为当前element
		//return>ves对象，对this中每个element执行fun函数
		each: function(fun, context) {
			for(var i = 0; i < this.$.length; i++) {
				if(fun.call(context || this.$[i], i, this.$[i]) == false)
					break;
			}
			return this;
		},
		
		//key>1(string, object)
		//value>0(string,funciton)
		//relative>0(boolean)
		//获取或者设置元素的css样式
		css: function(key, value, relative) {
			var val, val2;
			if(typeof(key) == 'object') {
				var _key = {};
				for(var n in key) _key[n.replace(/-[a-z]{1}/gi, function(m) {
					return m.substring(1).toUpperCase();
				})] = key[n];
				for(var i = 0; i < this.$.length; i++) {
					for(var n in _key) {
						if(typeof(_key[n]) == 'function') {
							val = _key[n].call(this.$[i], _value);
							if(typeof(val) != 'undefined') {
								setStyle(this.$[i], n, val, value);
							}
						} else {
							setStyle(this.$[i], n, _key[n], value);
						}
					}
				}
				return this;
			}
			key = key.replace(/-[a-z]{1}/gi, function(m) {
				return m.substring(1).toUpperCase();
			});
			switch(typeof(value)) {
				case 'undefined':
					{
						if(this.$.length == 0) return;
						key = key.split(/[,\s\|][\s]*/gi);
						if(key.length == 1) {
							key = key[0];
							value = getStyle(this.$[0], key);
							if(value.split(/%|\s/gi).length == 1) {
								val = parseFloat(value);
								if(!isNaN(val)) value = val;
							}
						} else {
							value = {};
							for(var i = 0; i < key.length; i++) {
								val2 = val = getStyle(this.$[0], key[i]);
								if(val.split(/%|\s/gi).length == 1) {
									val = parseFloat(val);
									if(isNaN(val)) val = val2;
								}
								value[key[i]] = val;
							}
						}
						return value;
					}
				case 'function':
					{
						for(var i = 0; i < this.$.length; i++) {
							val = value.call(this.$[i], getStyle(this.$[i], key));
							if(typeof(val) != 'undefined') {
								setStyle(this.$[i], key, val, relative);
							}
						}
						break;
					}
				default:
					{
						for(var i = 0; i < this.$.length; i++) {
							setStyle(this.$[i], key, value, relative);
						}
						break;
					}
			}
			return this;
		},
		
		//key>1(string, object)
		//value>0(string,funciton)
		//获取或者设置元素的html属性
		attr: function(key, value) {
			if(typeof(key) == 'object') {
				for(var i = 0; i < this.$.length; i++) {
					for(var n in key) {
						if(typeof(key[n]) == 'function') {
							var val = key[n].call(this.$[i], this.$[i].getAttribute(n));
							if(typeof(val) != 'undefined') {
								if(val !== null) this.$[i].setAttribute(n, val + '');
								else this.$[i].removeAttribute(n);
							}
						} else {
							if(key[n] !== null) this.$[i].setAttribute(n, key[n] + '');
							else this.$[i].removeAttribute(n);
						}
					}
				}
				return this;
			}
			if(value === null) {
				for(var i = 0; i < this.$.length; i++)
					this.$[i].removeAttribute(key);
				return this;
			}
			switch(typeof(value)) {
				case 'undefined':
					{
						if(this.$.length == 0) return;
						return this.$[0].getAttribute(key);
					}
				case 'function':
					{
						for(var i = 0; i < this.$.length; i++) {
							val = value.call(this.$[i], this.$[i].getAttribute(key));
							if(typeof(val) != 'undefined') {
								if(val !== null) this.$[i].setAttribute(key, val + '');
								else this.$[i].removeAttribute(key);
							}
						}
						break;
					}
				default:
					{
						for(var i = 0; i < this.$.length; i++)
							this.$[i].setAttribute(key, value + '');
						break;
					}
			}
			return this;
		},

		//key>1(string, object)
		//value>0(string,funciton)
		//获取或者设置元素的内置属性
		_attr: function(key, value) {
			if(typeof(key) == 'object') {
				for(var i = 0; i < this.$.length; i++) {
					for(var n in key) {
						if(typeof(key[n]) == 'function') {
							var val = key[n].call(this.$[i], this.$[i][n]);
							if(typeof(val) != 'undefined') {
								if(val != null) this.$[i][n] = val;
								else if(this.$[i][n]) delete this.$[i][n];
							}
						} else this.$[i][n] = key[n];
					}
				}
				return this;
			}
			if(value === null) {
				for(var i = 0; i < this.$.length; i++) {
					if(this.$[i][key]) delete this.$[i][key];
				}
				return this;
			}
			switch(typeof(value)) {
				case 'undefined':
					{
						if(this.$.length == 0) return;
						return this.$[0][key];
					}
				case 'function':
					{
						for(var i = 0; i < this.$.length; i++) {
							val = value.call(this.$[i], this.$[i][key]);
							if(typeof(val) != 'undefined') {
								if(val != null) this.$[i][key] = val;
								else if(this.$[i][key]) delete this.$[i][key];
							}
						}
						break;
					}
				default:
					{
						for(var i = 0; i < this.$.length; i++)
							this.$[i][key] = value;
						break;
					}
			}
			return this;
		},
		
		//value>0(string,number)
		//relative>0(boolean)相对于当前值增减值
		//return>当未指定value时返回this高度，当指定value时设置this高度
		height: function(value, relative) {
			if(!value && value != 0) {
				if(this.$.length == 0) return -1;
				if(this.$[0].getElementById) {
					return this.$[0].documentElement.clientHeight;
				} else if(this.$[0].document) {
					return this.$[0].screen.height;
				}
				return this.css('height');
			}
			this.css('height', value, relative);
			return this;
		},

		//value>0(string,number)
		//relative>0(boolean)相对于当前值增减值
		//return>当未指定value时返回this宽度，当指定value时设置this宽度
		width: function(value, relative) {
			if(!value && value != 0) {
				if(this.$.length == 0) return -1;
				if(this.$[0].getElementById) {
					return this.$[0].documentElement.clientWidth;
				} else if(this.$[0].document) {
					return this.$[0].screen.width;
				}
				return this.css('width');
			}
			this.css('width', value, relative);
			return this;
		},
		
		//显示this
		show: function() {
			for(var i = 0; i < this.$.length; i++) {
				if(getStyle(this.$[i], 'display') == 'none') {
					if(this.$[i]._display)
						this.$[i].style.display = this.$[i]._display;
					else this.$[i].style.display = 'block';
				}
			}
			return this;
		},

		//隐藏this
		hide: function() {
			for(var i = 0; i < this.$.length; i++) {
				if(getStyle(this.$[i], 'display') != 'none') {
					this.$[i]._display = getStyle(this.$[i], 'display');
					this.$[i].style.display = 'none';
				}
			}
			return this;
		},
		
		//添加className
		//name>1(string, array)
		addClass: function(name) {
			if(this.$.length==0)return this;
			var _name;
			if(typeof(name)=='string') name = name.split(/[,\s\|][\s]*/gi);
			for(var i = 0; i < this.$.length; i++) {
				_name = this.$[i].className.split(/[\s]+/g);
				this.$[i].className = _name.union(name).join(' ').trim();
			}
			return this;
		},
		removeClass: function(name) {
			if(this.$.length==0)return this;
			var _name;
			if(typeof(name)=='string') name = name.split(/[,\s\|][\s]*/gi);
			for(var i = 0; i < this.$.length; i++) {
				_name = this.$[i].className.split(/[\s]+/g);
				this.$[i].className = _name.remove(name).join(' ').trim();
				if(this.$[i].className == '') this.$[i].removeAttribute('class');
			}
			return this;
		},
		toggleClass: function(name) {
			if(this.$.length==0)return this;
			var _name;
			if(typeof(name)=='string') name = name.split(/[,\s\|][\s]*/gi);
			for(var i = 0; i < this.$.length; i++) {
				_name = this.$[i].className.split(/[\s]+/g);
				this.$[i].className = _name.remove(name).union(name.remove(_name)).join(' ').trim();
				if(this.$[i].className == '') this.$[i].removeAttribute('class');
			}
			return this;
		},
		hasAttr: function(name) {
			if(this.$.length==0)return false;
			if(typeof(name)=='string') name = name.split(/[,\s\|][\s]*/gi);
			for(var i = 0; i < this.$.length; i++) {
				for(var c = 0; c < name.length; c++) {
					if(typeof(this.$[i].getAttribute(name[c]) || this.$[i][name[c]]) == 'undefined')
						return false;
				}
			}
			return true;
		},
		noAttr: function(name) {
			if(this.$.length==0)return false;
			if(typeof(name)=='string') name = name.split(/[,\s\|][\s]*/gi);
			for(var i = 0; i < this.$.length; i++) {
				for(var c = 0; c < name.length; c++) {
					if(typeof(this.$[i].getAttribute(name[c]) || this.$[i][name[c]]) != 'undefined')
						return false;
				}
			}
			return true;
		},
		hasClass: function(name) {
			if(this.$.length==0)return false;
			if(typeof(name)=='string') name = name.split(/[,\s\|][\s]*/gi);
			for(var i = 0; i < this.$.length; i++) {
				for(var c = 0; c < name.length; c++) {
					if(this.$[i].className.split(/[\s]+/g).contains(name[c]) == false)
						return false;
				}
			}
			return true;
		},
		noClass: function(name) {
			if(this.$.length==0)return false;
			if(typeof(name)=='string') name = name.split(/[,\s\|][\s]*/gi);
			for(var i = 0; i < this.$.length; i++) {
				for(var c = 0; c < name.length; c++) {
					if(this.$[i].className.split(/[\s]+/g).contains(name[c]))
						return false;
				}
			}
			return true;
		},
		val: function(value) {
			var type = typeof(value);
			if(type == 'string' || type == 'number') {
				for(var i = 0; i < this.$.length; i++)
					this.$[i].value = value;
				return this;
			} else if(type == 'function') {
				for(var i = 0; i < this.$.length; i++)
					this.$[i].value = value.call(this.$[i]);
				return this;
			}
			if(this.$.length == 0) return null;
			return this.$[0].value;
		},
		html: function(value, callback, callback2) {
			var type = typeof(value);
			if(value == undefined){
				if(this.$.length>0)
					return this.$[0].innerHTML;
				else return '';
			}
			if(type == 'string' || type == 'number') {
				for(var i = 0; i < this.$.length; i++)
					this.$[i].innerHTML = value;
			} else if(type == 'function') {
				for(var i = 0; i < this.$.length; i++)
					this.$[i].innerHTML = value.call(this.$[i]);
			}
			scriptRun(this.$[0], callback, callback2);
			return this;
		},
		text: function(value) {
			var type = typeof(value);
			if(type == 'string' || type == 'number') {
				if(this.$[0].innerText!==undefined) {
					for(var i = 0; i < this.$.length; i++)
						this.$[i].innerText = value;
				} else {
					for(var i = 0; i < this.$.length; i++)
						this.$[i].textContent = value;
				}
				return this;
			} else if(type == 'function') {
				if(this.$[0].innerText!==undefined) {
					for(var i = 0; i < this.$.length; i++)
						this.$[i].innerText = value.call(this.$[i]);
				} else {
					for(var i = 0; i < this.$.length; i++)
						this.$[i].textContent = value.call(this.$[i]);
				}
				return this;
			}
			if(this.$.length == 0) return '';
			if(this.$[0].innerText!==undefined) return this.$[0].innerText;
			else return this.$[0].textContent;
		},
		insertBefore: function(dom) {
			if(!dom) return this;
			if(dom instanceof Array == false) {
				if((typeof(HTMLCollection) != 'undefined' && dom instanceof HTMLCollection) || (typeof(NodeList) != 'undefined' && dom instanceof NodeList)) dom = nodeListToArray(dom);
				else if(dom.$ instanceof Array) dom = dom.$;
				else if(dom.nodeType === 1) dom = [dom];
				else return this;
			}
			if(dom.length == 0 || !dom[0]) return;
			var prt = dom[0].parentNode;
			for(var i = 0; i < this.$.length; i++)
				prt.insertBefore(this.$[i], dom[0]);
			for(var i = 1; i < dom.length; i++) {
				prt = dom[i].parentNode;
				for(var c = 0; c < this.$.length; c++)
					prt.insertBefore(this.$[c].cloneNode(true), dom[i]);
			}
			return this;
		},
		insertAfter: function(dom) {
			if(!dom) return this;
			if(dom instanceof Array == false) {
				if((typeof(HTMLCollection) != 'undefined' && dom instanceof HTMLCollection) || (typeof(NodeList) != 'undefined' && dom instanceof NodeList)) dom = nodeListToArray(dom);
				else if(dom.$ instanceof Array) dom = dom.$;
				else if(dom.nodeType === 1) dom = [dom];
				else return this;
			}
			if(dom.length == 0 || !dom[0]) return;
			var prt = dom[0].parentNode;
			if(!dom[0].nextSibling) {
				for(var i = 0; i < this.$.length; i++)
					prt.appendChild(this.$[i]);
			} else {
				var next = dom[0].nextSibling;
				for(var i = 0; i < this.$.length; i++)
					prt.insertBefore(this.$[i], next);
			}
			for(var i = 1; i < dom.length; i++) {
				prt = dom[i].parentNode;
				if(!dom[i].nextSibling) {
					for(var c = 0; c < this.$.length; c++)
						prt.appendChild(this.$[c].cloneNode(true));
				} else {
					var next = dom[i].nextSibling;
					for(var c = 0; c < this.$.length; c++)
						prt.insertBefore(this.$[c].cloneNode(true), next);
				}
			}
			return this;
		},
		append: function(dom, index) {
			if(this.$.length == 0 || !dom) return this;
			if(dom instanceof Array == false) {
				if((typeof(HTMLCollection) != 'undefined' && dom instanceof HTMLCollection) || (typeof(NodeList) != 'undefined' && dom instanceof NodeList)) dom = nodeListToArray(dom);
				else if(dom.$ instanceof Array) dom = dom.$;
				else if(dom.nodeType === 1) dom = [dom];
				else return this;
			}
			if(dom.length == 0 || !dom[0]) return;
			if(typeof(index) != 'number') {
				for(var i = 0; i < dom.length; i++)
					this.$[0].appendChild(dom[i]);
				for(var i = 1; i < this.$.length; i++) {
					for(var c = 0; c < dom.length; c++)
						this.$[i].appendChild(dom[c].cloneNode(true));
				}
			} else {
				var cs = this.eq(0).children();
				if(cs.length > 0) {
					if(index > cs.$.length - 1) {
						for(var i = 0; i < dom.length; i++)
							this.$[0].appendChild(dom[i]);
					} else {
						var to = cs.$[index];
						for(var i = 0; i < dom.length; i++)
							this.$[0].insertBefore(dom[i], to);
					}
				} else {
					for(var i = 0; i < dom.length; i++)
						this.$[0].appendChild(dom[i]);
				}
				for(var i = 1; i < this.$.length; i++) {
					cs = this.eq(i).children();
					if(cs.length > 0) {
						if(index > cs.$.length - 1) {
							for(var d = 0; d < dom.length; d++)
								this.$[i].appendChild(dom[d]);
						} else {
							to = cs.$[index];
							for(var c = 0; c < dom.length; i++)
								this.$[i].insertBefore(dom[c].cloneNode(true), to);
						}
					} else {
						for(var d = 0; d < dom.length; d++)
							this.$[i].appendChild(dom[d]);
					}
				}
			}
			return this;
		},
		remove: function() {
			for(var i = 0; i < this.$.length; i++) {
				if(this.$[i].parentNode)
					this.$[i].parentNode.removeChild(this.$[i]);
				delete this[i];
			}
			this.$=[];
			return this;
		},
		appear: function(relative, client) {
			if(this.$.length == 0) return false;
			var rect, oTop, oLeft, width, height, left, top;
			for(var i = 0; i < this.$.length; i++) {
				if(this.$[i].clientWidth==0&&this.$[i].clientHeight==0)return false;
				if(relative) {
					if(typeof(relative) == 'boolean') rect = this.$[i].offsetParent;
					else rect = relative;
					if(rect && rect.getBoundingClientRect) {
						rect = rect.getBoundingClientRect();
						left = rect.left;
						top = rect.top;
						height = rect.height;
						width = rect.width;
					}
				} else {
					height = this.$[i].ownerDocument.documentElement.clientHeight;
					width = this.$[i].ownerDocument.documentElement.clientWidth;
					left = 0, top = 0;
				}
				rect = this.$[i].getBoundingClientRect();
				oTop = rect.top;
				oLeft = rect.left;
				if(client) {
					if(oTop < top || (oTop - top + this.$[i].offsetHeight) > height || oLeft < left || (oLeft - left + this.$[i].offsetWidth) > width)
						return false;
				} else {
					if((oTop > top && oTop - top >= height) || (oTop + this.$[i].offsetHeight) <= top || (oLeft > left && oLeft - left >= width) || (oLeft + this.$[i].offsetWidth) <= left)
						return false;
				}
			}
			return true;
		},
		pageRect: function() {
			var rect;
			if(this.$[0].getBoundingClientRect){
				var docE=this.$[0].ownerDocument.documentElement;
				rect=this.$[0].getBoundingClientRect();
				return {
					left: rect.left.toFixed(1)-0+docE.scrollLeft,
					top: rect.top.toFixed(1)-0+docE.scrollTop
				};
			}
			rect = {
				left: 0,
				top: 0
			};
			!function(it) {
				rect.left += it.offsetLeft;
				rect.top += it.offsetTop;
				if(it.offsetParent)
					arguments.callee(it.offsetParent);
			}(this.$[0]);
			return rect;
		},
		animate: function(anm, value, complete, style, time) {
			var _anm = {},
				ex, arg, index = 1;
			if(typeof(anm) == 'string') {
				_anm[anm] = value;
				anm = _anm;
				_anm = {};
				index = 2;
			}
			for(var i = index; i < arguments.length; i++) {
				if(typeof(arguments[i]) == 'function') {
					arg = complete;
					complete = arguments[i];
					arguments[i] = arg;
				}
				if(typeof(arguments[i]) == 'string') {
					arg = style;
					style = arguments[i];
					arguments[i] = arg;
				}
				if(typeof(arguments[i]) == 'number') {
					arg = time;
					time = arguments[i];
					arguments[i] = arg;
				}
			}
			time = time == undefined ? 0.5 : time;
			time = time * 1000;
			for(var n in anm) {
				if(typeof(anm[n]) == 'function') ex = anm[n];
				else ex = (anm[n] + '').replace('px', '');
				_anm[n.replace(/-([a-z]{1})/gi, function(m) {
					return m.substring(1).toUpperCase();
				})] = ex;
			}
			anm = {};
			for(var i = 0; i < this.$.length; i++) {
				for(var n in _anm) {
					if(typeof(_anm[n]) == 'function') {
						ex = _anm[n].call(this.$[i]) + '';
					} else ex = _anm[n];
					anm[n] = parseFloat(ex.replace(/[^0-9.\-\+]+/gi, ''));
				}
				(function(anm) {
					var it = this,
						speed = 0,
						result = 0,
						_result = 0,
						count = 0,
						_oldValue;
					if(style == 'linear') {
						count = time / 5;
					}
					ves(this).stop();
					this.animateData = anm;
					this.animateComplete = complete;
					this.animateTimer = setInterval(function() {
						var cur, _cur;
						for(var n in anm) {
							_cur = cur = getStyle(it, n) + '';
							_cur = parseFloat(_cur.replace(/[^0-9.\-\+]+/gi, ''));
							if(isNaN(_cur)) {
								_cur = 0;
								cur = '0px';
							}
							_oldValue = '_' + n + '_';
							if(it[_oldValue] == undefined) it[_oldValue] = _cur;
							if(style == 'linear') speed = parseFloat(((anm[n] - it[_oldValue]) / count).toFixed(2));
							else speed = parseFloat(((anm[n] - _cur) / 20).toFixed(2));
							if(isNaN(speed)) {
								ves(it).stop();
								return;
							}
							result = _cur + speed;
							if(cur.indexOf('px') >= 0 || getStyle(it, n, style) === undefined) {
								if(speed <= 0) result = Math.floor(result);
								else {
									result = Math.ceil(result);
								}
							}
							if((speed <= 0 && result <= anm[n]) || (speed >= 0 && result >= anm[n])) {
								ves(it).stop();
							} else {
								_result = cur.replace(_cur + '', result);
								$(it).css(n, _result);
								if($(it).css(n) == cur) {
									ves(it).stop();
								}
							}
						}
					}, 10);
				}).call(this.$[i], anm);
			}
			return this;
		},
		stop: function(end) {
			var it;
			if(end) {
				for(var i = 0; i < this.length; i++) {
					it = this.$[i];
					if(it.animateTimer) {
						ves(it).css(it.animateData);
						if(it.animateComplete) it.animateComplete.call(it);
						clearInterval(it.animateTimer);
						delete it.animateTimer;
						delete it.animateData;
						delete it.animateComplete;
					}
				}
			} else {
				for(var i = 0; i < this.length; i++) {
					it = this.$[i];
					if(it.animateTimer) {
						if(it.animateComplete) it.animateComplete.call(it);
						clearInterval(it.animateTimer);
						delete it.animateTimer;
						delete it.animateData;
						delete it.animateComplete;
					}
				}
			}
			return this;
		},
		bind: function(evt, fun, _fun, context) {
			if(typeof(evt) == 'string')
				evt = evt.split(/[,\s\|][\s]*/gi);
			if(fun === undefined) {
				var count = evt.length,
					_evts;
				for(var i = 0; i < count; i++) {
					if($event.comEvent[evt[i]]) {
						_evts = $event.comEvent[evt[i]].events;
						evt.splice(i, 1, _evts[_evts.length - 1]);
					}
				}
				var eventCollection;
				for(var i = 0; i < this.$.length; i++) {
					eventCollection = this.$[i].eventCollection;
					for(var d = 0; d < evt.length; d++) {
						eventCollection = this.$[i].eventCollection;
						for(var c = 0; c < eventCollection.length; c++) {
							if(eventCollection[c].event == evt[d])
								eventCollection[c]._fun.call(this.$[i]);
						}
					}
				}
				return this;
			}
			for(var c = 0; c < evt.length; c++) {
				if($event.comEvent[evt[c]])
					$event.comEvent[evt[c]].fun.call(this, fun, _fun, context);
				else {
					for(var i = 0; i < this.$.length; i++) {
						addEvent(this.$[i], evt[c], fun, _fun, context);
					}
				}
			}
			return this;
		},
		unbind: function(evt, fun) {
			if(typeof(evt) == 'string')
				evt = evt.split(/[,\s\|][\s]*/gi);
			var count = evt.length;
			for(var i = 0; i < count; i++) {
				if($event.comEvent[evt[i]]) {
					evt = evt.concat($event.comEvent[evt[i]].events);
					evt.splice(i, 1);
					i -= 1;
				}
			}
			if(typeof(fun) != 'function') {
				var eventCollection;
				for(var i = 0; i < this.$.length; i++) {
					eventCollection = this.$[i].eventCollection;
					if(!eventCollection)continue;
					for(var b = 0; b < evt.length; b++) {
						for(var c = 0; c < eventCollection.length; c++) {
							if(eventCollection[c].fun != $event.events[evt[b]])
								removeEvent(this.$[i], evt[b], eventCollection[c]._fun || eventCollection[c].fun);
						}
					}
				}
			} else {
				for(var i = 0; i < this.$.length; i++) {
					for(var c = 0; c < evt.length; c++)
						removeEvent(this.$[i], evt[c], fun);
				}
			}
			return this;
		}
	};
	init.prototype.on = init.prototype.bind;
	init.prototype.off = init.prototype.unbind;

	//扩展HTMLElement原型
	var extendHTMLElement=function(name, value){
		var _name=name;
		if(name in HTMLElement.prototype)_name+='V';
		if(typeof(value)=='function'){
			HTMLElement.prototype[_name]=function(){
				if((this.$ instanceof Array)==false)
					this.$=[this];
				return value.apply(this, arguments);
			};
		}
		else{
			HTMLElement.prototype[_name]=value;
		}

		if(typeof(HTMLCollection) != 'undefined'){
			_name=name;
			if(name in HTMLCollection.prototype)_name+='V';
			if(typeof(value)=='function'){
				HTMLCollection.prototype[_name]=function(){
					if((this.$ instanceof Array)==false)
						this.$=nodeListToArray(this);
					return value.apply(this, arguments);
				};
			}
			else{
				HTMLCollection.prototype[_name]=value;
			}
		}

		if(typeof(NodeList) != 'undefined'){
			_name=name;
			if(name in NodeList.prototype)_name+='V';
			if(typeof(value)=='function'){
				NodeList.prototype[_name]=function(){
					if((this.$ instanceof Array)==false)
						this.$=nodeListToArray(this);
					return value.apply(this, arguments);
				};
			}
			else{
				NodeList.prototype[_name]=value;
			}
		}
	};

	for(var n in init.prototype){
		extendHTMLElement(n,init.prototype[n]);
	}

	$.extendPrototype = function(name, value) {
		if(name in init.prototype)return false;
		init.prototype[name] = value;
		extendHTMLElement(name,value);
		return true;
	};

	function addEvent(element, event, fun, _fun, context) {
		if(typeof(fun) != 'function') return;
		var funAdded = false;
		if(typeof(_fun) == 'function') {
			context = context || element;
		} else {
			if(_fun) context = _fun;
			else context = context || element;
			_fun = fun;
		}
		var eventCollection = element.eventCollection;
		if(!eventCollection) element.eventCollection = eventCollection = [];
		for(var i = 0; i < eventCollection.length; i++) {
			if(eventCollection[i].event == event && eventCollection[i]._fun == _fun) {
				funAdded = true;
				break;
			}
		}
		if(!funAdded) {
			var fun2 = function() {
				var ev = ves.browser.ms ? window.event : arguments[0];
				if($event.eventInfo.call(element, ev) == false) return;
				if($event.events[event] && $event.events[event].call(element, ev) == false) return;
				if(fun.call(context, ev) == false)
					element.event.stopDefault();
			};
			if(element.addEventListener) element.addEventListener(event, fun2, false);
			else element.attachEvent('on' + event, fun2, false);
			eventCollection.push({
				event: event,
				fun: fun2,
				_fun: _fun
			});
		}
	}

	function removeEvent(element, event, fun) {
		if(fun && fun == $event.events[event]) return;
		var eventCollection = element.eventCollection;
		if(!eventCollection) return;
		for(var i = 0; i < eventCollection.length; i++) {
			if(eventCollection[i].event == event && (!fun || eventCollection[i]._fun == fun)) {
				if(element.removeEventListener) element.removeEventListener(event, eventCollection[i].fun, false);
				else element.detachEvent('on' + event, eventCollection[i].fun, false);
				eventCollection.splice(i, 1);
				i -= 1;
			}
		}
	}
	var $event = {
		eventInfo: function(e) {
			var target = this,
				related = (e.type == 'mouseout') ? 'toElement' : 'fromElement';
			related = e.relatedTarget || e[related];
			if(!this.event) {
				this.event = {
					stopParent: function() {
						if(this.self.stopPropagation)
							this.self.stopPropagation();
						else this.self.cancelBubble = true;
					},
					stopDefault: function() {
						if(this.self.preventDefault)
							this.self.preventDefault();
						else if(this.self.returnValue) {
							this.self.returnValue = false;
						}
						return false;
					},
					stopAll: function() {
						this.stopParent();
						this.stopDefault();
					}
				};
			}
			if(!related || (related != target && $(target).contains(related) == false))
				this.event.isRelated = false;
			else this.event.isRelated = true;
			this.event.related = related;
			var from = e.target || e.srcElement;
			if(this.event.from != from) this.event.prevFrom = this.event.from;
			this.event.from = from;
			this.event.to = e.toElement;
			if((e.type.indexOf('click') > -1 || e.type.indexOf('mouse') > -1) && $event.touchLastTime) {
				if(((new Date()) - $event.touchLastTime) < 1600) return false;
				$event.touchLastTime = null;
			}
			if(e.type.indexOf('touch') > -1) {
				$event.touchLastTime = new Date();
			}
			this.event.self = e;
			return true;
		},
		comEvent: {
			tap: {
				fun: function(f, _cx) {
					this.bind('touchstart', $event.events.touchstart);
					this.bind('mousedown',$event.events.mousedown);
					this.bind('touchend click', function(e) {
						var x = this.event['moveXL'];
						var y = this.event['moveYL'];
						if(!x || x > -8 && x < 8 && y > -8 && y < 8 && (this.event.endT - this.event.startT) < 500) {
							if(_cx && typeof(_cx) != 'function')
								return f.call(_cx, e);
							else return f.call(this, e);
						}
					}, f);
					return this;
				},
				events: ['touchend', 'click']
			},
			tapout: {
				fun: function(f, _cx) {
					$(this).bind('touchstart,click', function(e) {
						var it = this;
						if(!this.tapout) {
							this.tapout = true;
							setTimeout(function() {
								$.html.bind('touchstart,click', function() {
									if(it == this.event.from || ves(it).contains(this.event.from))
										return false;
									var back;
									if(_cx && typeof(_cx) != 'function')
										back = f.call(_cx, e);
									else back = f.call(it, e);
									if(back !== false) {
										delete it.tapout;
										$.html.unbind('touchstart,click', f);
									}
									return back;
								}, f);
							}, 20);
						}
						this.event.stopParent();
					}, f);
					return this;
				},
				events: ['touchstart', 'click']
			},
			tapstart: {
				fun: function(f, _cx) {
					this.bind('touchstart,mousedown', f, _cx);
					return this;
				},
				events: ['touchstart', 'mousedown']
			},
			tapend: {
				fun: function(f, _cx) {
					this.bind('touchstart', $event.events.touchstart)
						.bind('mousedown', $event.events.mousedown);
					this.bind('touchend,mouseup', f, _cx);
					return this;
				},
				events: ['touchend', 'mouseup']
			},
			hover: {
				fun: function(over, out, _cx) {
					if(typeof(over) == 'function') {
						this.bind('touchstart,mouseover', over, _cx);
					}
					if(typeof(out) == 'function') {
						this.bind('touchend,mouseout', out, _cx);
					}
				},
				events: ['touchstart', 'touchend', 'mouseover', 'mouseout']
			},
			press: {
				fun: function(f, _cx) {
					this.bind('touchend', $event.events.touchend)
						.bind('mouseup', $event.events.mouseup);
					var timer = null;
					this.bind('touchstart,mousedown', function(e) {
						var start = this.event.startT;
						var it = this;
						if(timer) {
							clearTimeout(timer);
							timer = null;
						}
						timer = window.setTimeout(function() {
							if(start === it.event.startT && (!it.event.endT || it.event.endT < it.event.startT)) {
								var x = it.event['moveXL'];
								var y = it.event['moveYL'];
								if((x == undefined || x > -8 && x < 8) && (y == undefined || y > -8 && y < 8)) {
									if(_cx && typeof(_cx) != 'function')
										f.call(_cx, e);
									else f.call(it, e);
								}
							}
						}, 510);
						this.event.stopParent();
					}, f);
					return this;
				},
				events: ['touchstart', 'mousedown']
			},
			swipe: {
				fun: function(f, _cx) {
					var fun=function(e){
						var x = this.event['moveXL'];
						var y = this.event['moveYL'];
						if(x < -8 || x > 8 || y < -8 || y > 8) {
							if(_cx && typeof(_cx) != 'function')
								return f.call(_cx, e);
							else return f.call(this, e);
						}
					};
					this.bind('touchstart',$event.events.touchstart);
					ves(this).bind('touchend',fun,f);
					this.bind('mousedown', function() {
						ves(this).bind('mouseup,mouseout', function(e) {
							ves(this).unbind('touchend,mouseup,mouseout', f);
							fun.call(this,e);
						}, f);
					}, f);
					return this;
				},
				events: ['touchend', 'mouseup', 'mouseout']
			},
			swiping: {
				fun: function(f, _cx) {
					var handle = function(e) {
						if(_cx && typeof(_cx) != 'function')
							return f.call(_cx, e);
						else return f.call(this, e);
					};
					this.bind('touchstart', $event.events.touchstart);
					this.bind('touchmove', handle, f);
					this.bind('mousedown', function(e) {
						$(this).bind('mousemove', handle, f);
						$(this).bind('mouseup,mouseout', function() {
							$(this).unbind('mousemove', f)
								.unbind('mouseup,mouseout', arguments.callee);
						});
					}, f);
					return this;
				},
				events: ['touchmove', 'mousedown', 'mousemove']
			},
			scrolled: {
				fun: function(f, _cx) {
					var start = 0;
					var timer = null;
					this.bind('scroll', function(e) {
						start += 1;
						var end = start;
						var it = this;
						clearTimeout(timer);
						timer = setTimeout(function() {
							if(end == start) {
								start = 0;
								f.call(it, e);
							}
						}, 300);
					}, f, _cx);
					return this;
				},
				events: ['scroll']
			},
			resized: {
				fun: function(f, _cx) {
					var start = 0;
					var timer = null;
					this.bind('resize', function(e) {
						start += 1;
						var end = start;
						var it = this;
						clearTimeout(timer);
						timer = setTimeout(function() {
							if(end == start) {
								start = 0;
								f.call(it, e);
							}
						}, 300);
					}, f, _cx);
					return this;
				},
				events: ['resize']
			},
			changeBlur: {
				fun: function(f, _cx) {
					this.bind('change,blur', function(e) {
						if(e.type == 'change') this.hasChange = true;
						else if(this.hasChange) {
							delete this.hasChange;
							return;
						}
						if(_cx && typeof(_cx) != 'function')
							return f.call(_cx, e);
						else return f.call(this, e);
					}, f);
					return this;
				},
				event: ['change', 'blur']
			}
		},
		touchLastTime: null,
		events: {
			touchstart: function(e) {
				var touch = e.targetTouches[0];
				if(typeof(this.event['startX']) != 'undefined') {
					this.event['startXL'] = touch.clientX - this.event['startX'];
					this.event['startYL'] = touch.clientY - this.event['startY'];
				}
				this.event['startX'] = touch.clientX;
				this.event['startY'] = touch.clientY;
				this.event['startT'] = new Date();
				$event.deleteEventData.call(this);
			},
			touchmove: function(e) {
				var touch = e.changedTouches[0];
				if(this.event['startX'] == undefined) {
					this.event['startX'] = touch.clientX;
					this.event['startY'] = touch.clientY;
					this.event['startT'] = new Date();
					$event.deleteEventData.call(this);
				}
				var xl = touch.clientX - (this.event['moveX']==undefined?this.event['startX']:this.event['moveX']);
				if(this.event['moveXR'] == undefined) this.event['moveXR'] = 0;
				else if(xl !== this.event['moveXS']) this.event['moveXR'] += 1;
				this.event['moveXS'] = xl;
				if(this.event['moveXSS'] == undefined)
					this.event['moveXSS'] = xl;

				var yl = touch.clientY - (this.event['moveY']==undefined?this.event['startY']:this.event['moveY']);
				if(this.event['moveYR'] == undefined) this.event['moveYR'] = 0;
				else if(yl !== this.event['moveYS']) this.event['moveYR'] += 1;
				this.event['moveYS'] = yl;
				if(this.event['moveYSS'] == undefined)
					this.event['moveYSS'] = yl;

				this.event['moveX'] = touch.clientX;
				this.event['moveY'] = touch.clientY;
				this.event['moveXL'] = touch.clientX - this.event['startX'];
				this.event['moveYL'] = touch.clientY - this.event['startY'];
				this.event['moveT'] = ((new Date()) - this.event['startT']) / 1000;
			},
			touchend: function(e) {
				var touch = e.changedTouches[0];
				if(typeof(this.event['endX']) != 'undefined') {
					this.event['endXL'] = touch.clientX - this.event['endX'];
					this.event['endYL'] = touch.clientY - this.event['endY'];
				}
				this.event['endX'] = touch.clientX;
				this.event['endY'] = touch.clientY;
				if(this.event['startX']!==undefined){
					this.event['moveXL'] = this.event['endX'] - this.event['startX'];
					this.event['moveYL'] = this.event['endY'] - this.event['startY'];
				}
				else{
					this.event['moveXL'] = 0;
					this.event['moveYL'] = 0;
				}
				this.event['endT'] = new Date();
				if(this.event['startT']) {
					this.event['moveT'] = (this.event['endT'] - this.event['startT']) / 1000;
				}
				else this.event['moveT']=0;
			},
			mouseover: function(e) {
				if(this.event.isRelated) return false;
				if(typeof(this.event['startX']) != 'undefined') {
					this.event['startXL'] = e.clientX - this.event['startX'];
					this.event['startYL'] = e.clientY - this.event['startY'];
				}
				this.event['startX'] = e.clientX;
				this.event['startY'] = e.clientY;
				this.event['startT'] = new Date();
				$event.deleteEventData.call(this);
			},
			mousedown: function(e) {
				if(typeof(this.event['startX']) != 'undefined') {
					this.event['startXL'] = e.clientX - this.event['startX'];
					this.event['startYL'] = e.clientY - this.event['startY'];
				}
				this.event['startX'] = e.clientX;
				this.event['startY'] = e.clientY;
				this.event['startT'] = new Date();
				$event.deleteEventData.call(this);
			},
			mouseup: function(e) {
				if(typeof(this.event['endX']) != 'undefined') {
					this.event['endXL'] = e.clientX - this.event['endX'];
					this.event['endYL'] = e.clientY - this.event['endY'];
				}
				this.event['endX'] = e.clientX;
				this.event['endY'] = e.clientY;
				if(this.event['startX']!==undefined){
					this.event['moveXL'] = this.event['endX'] - this.event['startX'];
					this.event['moveYL'] = this.event['endY'] - this.event['startY'];
				}
				else{
					this.event['moveXL'] =0;
					this.event['moveYL'] = 0;
				}
				this.event['endT'] = new Date();
				if(this.event['startT']) {
					this.event['moveT'] = (this.event['endT'] - this.event['startT']) / 1000;
				}
				else this.event['moveT']=0;
			},
			mouseout: function(e) {
				if(this.event.isRelated) return false;
				if(typeof(this.event['endX']) != 'undefined') {
					this.event['endXL'] = e.clientX - this.event['endX'];
					this.event['endYL'] = e.clientY - this.event['endY'];
				}
				this.event['endX'] = e.clientX;
				this.event['endY'] = e.clientY;
			},
			mousemove: function(e) {
				if(this.event['startX'] == undefined) {
					this.event['startX'] = e.clientX;
					this.event['startY'] = e.clientY;
					this.event['startT'] = new Date();
					$event.deleteEventData.call(this);
				}
				var xl = e.clientX - (this.event['moveX']==undefined?this.event['startX']:this.event['moveX']);
				if(this.event['moveXR'] == undefined) this.event['moveXR'] = 0;
				else if(xl !== this.event['moveXS']) this.event['moveXR'] += 1;
				this.event['moveXS'] = xl;
				if(this.event['moveXSS'] == undefined)
					this.event['moveXSS'] = xl;

				var yl = e.clientY - (this.event['moveY']==undefined?this.event['startY']:this.event['moveY']);
				if(this.event['moveYR'] == undefined) this.event['moveYR'] = 0;
				else if(yl !== this.event['moveYS']) this.event['moveYR'] += 1;
				this.event['moveYS'] = yl;
				if(this.event['moveYSS'] == undefined)
					this.event['moveYSS'] = yl;

				this.event['moveX'] = e.clientX;
				this.event['moveY'] = e.clientY;
				this.event['moveXL'] = e.clientX - this.event['startX'];
				this.event['moveYL'] = e.clientY - this.event['startY'];
				this.event['moveT'] = ((new Date()) - this.event['startT']) / 1000;
			},
			click: function(e) {
				if(typeof(this.event['endX']) != 'undefined') {
					this.event['endXL'] = e.clientX - this.event['endX'];
					this.event['endYL'] = e.clientY - this.event['endY'];
				}
				this.event['endX'] = e.clientX;
				this.event['endY'] = e.clientY;
				if(this.event['startX']!==undefined){
					this.event['moveXL'] = this.event['endX'] - this.event['startX'];
					this.event['moveYL'] = this.event['endY'] - this.event['startY'];
				}
				else{
					this.event['moveXL'] = 0;
					this.event['moveYL'] = 0;
				}
				this.event['endT'] = new Date();
				if(this.event['startT']) {
					this.event['moveT'] = (this.event['endT'] - this.event['startT']) / 1000;
				}
				else this.event['moveT']=0;
			}
		},
		deleteEventData: function() {
			delete this.event['moveX']; //x位置
			delete this.event['moveY']; //y位置
			delete this.event['moveT']; //移动的时长
			delete this.event['moveXS']; //x步长
			delete this.event['moveXL']; //移动的水平距离
			delete this.event['moveYS']; //y步长
			delete this.event['moveYL']; //移动的垂直距离
			delete this.event['moveXR']; //水平改变方向的次数
			delete this.event['moveYR']; //垂直改变方向的次数
			delete this.event['moveXSS']; //水平初始步长
			delete this.event['moveYSS']; //垂直初始步长
		}
	};

	function selector(slt, prt) {
		prt = prt ? prt : [document];
		if(prt instanceof Array == false) {
			if((typeof(HTMLCollection) != 'undefined' && prt instanceof HTMLCollection) || (typeof(NodeList) != 'undefined' && prt instanceof NodeList)) prt = nodeListToArray(prt);
			else if(prt.$ instanceof Array) prt = prt.$;
			else if(prt.nodeType === 1 || prt.nodeType === 11 || prt.window || prt.documentElement) prt = [prt];
		}
		if (!slt) return prt;
		var a1 = slt.split(/,/gi),
			a2, a3, a4, a5, a6, a7, k, f, tag, check, g;
		var dom = [],
			_dom;
		for(var i = 0; i < a1.length; i++) {
			_dom = prt;
			a2 = a1[i].split(/[\s>]+/gi);
			g = 0;
			for(var c = 0; c < a2.length; c++) {
				if(c > 0) g += a2[c - 1].length;
				if(c > 1) g += 1;
				if(c > 0 && _dom[0] == document) {
					if(_dom.length == 1) break;
					else _dom.shift();
				}
				if(a2[c].indexOf('#') > -1) {
					a3 = a2[c].split('#')[1].split(/[.:\[]+/gi);
					a3 = document.getElementById(a3[0]);
					if(a3 != null) _dom = a4 = [a3];
					else a4 = [];
					continue;
				}
				a3 = a2[c].split(':')[0].replace(/\[[^\]]+\]/gi, '');
				a3 = a3.split('.');
				tag = a3[0] != '' ? a3[0] : '*';
				a3.shift();
				a4 = a5 = [];
				if(a1[i].charAt(g) == '>') {
					for(var d = 0; d < _dom.length; d++) {
						a5 = ves(_dom[d]).children();
						if(tag != '*') a5 = a5.filter(tag);
						a5 = a5.$;
						a4 = a4.union(a5);
					}
				} else {
					for(var d = 0; d < _dom.length; d++)
						a4 = a4.union(nodeListToArray(_dom[d].getElementsByTagName(tag)));
				}
				if(a3.length > 0) {
					a5 = [];
					for(var d = 0; d < a4.length; d++) {
						if(typeof(a4[d].className) == 'string' && a4[d].className.split(' ').contains(a3))
							a5.push(a4[d]);
					}
					a4 = a5;
				}
				a3 = a2[c].split(':')[0];
				if(a3.indexOf('[') > -1) {
					a3 = ('a' + a3 + 'a').split(/[(\[)|(\])|(\]\[)]+/gi);
					a3.shift();
					a3.pop();
					a5 = [];
					for(var d = 0; d < a4.length; d++) {
						check = true;
						for(var x = 0; x < a3.length; x++) {
							if(a3[x][0] == '!') {
								a6 = a3[x].substring(1);
								if(a4[d][a6] || a4[d].getAttribute(a6)) {
									check = false;
									break;
								}
							} else if(a3[x].indexOf('*=') > -1) {
								a6 = a3[x].split(/[\s]*\*=[\s]*[\'\"]*/gi);
								a7 = a6[1].split(/[\'\"]$/gi)[0];
								a6 = a4[d].getAttribute(a6[0]) || a4[d][a6[0]];
								if(!a6 || typeof(a6) != 'string' || a6.indexOf(a7) < 0) {
									check = false;
									break;
								}
							} else if(a3[x].indexOf('^=') > -1) {
								a6 = a3[x].split(/[\s]*\^=[\s]*[\'\"]*/gi);
								a7 = a6[1].split(/[\'\"]$/gi)[0];
								a6 = a4[d].getAttribute(a6[0]) || a4[d][a6[0]];
								if(!a6 || typeof(a6) != 'string' || a6.indexOf(a7) != 0) {
									check = false;
									break;
								}
							} else if(a3[x].indexOf('$=') > -1) {
								a6 = a3[x].split(/[\s]*\$=[\s]*[\'\"]*/gi);
								a7 = a6[1].split(/[\'\"]$/gi)[0];
								a6 = a4[d].getAttribute(a6[0]) || a4[d][a6[0]];
								if(!a6) {
									check = false;
									break;
								}
								f = k.indexOf(a7);
								if(f > -1 && (f + a7.length) != k.length) {
									check = false;
									break;
								}
							} else if(a3[x].indexOf('!=') > -1) {
								a6 = a3[x].split(/[\s]*\!=[\s]*[\'\"]*/gi);
								a7 = a6[1].split(/[\'\"]$/gi)[0];
								a6 = a4[d].getAttribute(a6[0]) || a4[d][a6[0]];
								if(!a6 || a6 == a7) {
									check = false;
									break;
								}
							} else if(a3[x].indexOf('=') > -1) {
								a6 = a3[x].split(/[\s]*[=]+[\s]*[\'\"]*/gi);
								a7 = a6[1].split(/[\'\"]$/gi)[0];
								a6 = a4[d].getAttribute(a6[0]) || a4[d][a6[0]];
								if(!a6 || a6 != a7) {
									check = false;
									break;
								}
							} else if(a3[x].indexOf('(') > -1) {
								a6 = a3[x].split(/[\s]*\([\s]*[\'\"]*/gi);
								a7 = a6[1].split(/[\'\"\)]$/gi)[0];
								a7 = new RegExp(a7, 'gi');
								a6 = a4[d].getAttribute(a6[0]) || a4[d][a6[0]];
								if(!a6 || typeof(a6) != 'string' || a7.test(a6) == false) {
									check = false;
									break;
								}
							} else if(!a4[d][a3[x]] && a4[d].getAttribute(a3[x]) == null) {
								check = false;
								break;
							}
						}
						if(check == true) a5.push(a4[d]);
					}
					a4 = a5;
				}
				a3 = a2[c].split(':');
				if(a3.length > 1 && a4.length > 0) {
					switch(a3[1]) {
						case 'first':
							{
								a4 = [a4[0]];
								break;
							}
						case 'last':
							{
								a4 = [a4[a4.length - 1]];
								break;
							}
						case 'empty':
							{
								for(var d = 0; d < a4.length; d++) {
									if(a4[d].innerHTML.length > 0) a4.splice(d, 1);
								}
								break;
							}
						case 'odd':
							{
								for(var d = 1; d < a4.length; d++) a4.splice(d, 1);
								break;
							}
						case 'even':
							{
								for(var d = 0; d < a4.length; d++) a4.splice(d, 1);
								break;
							}
						default:
							{
								if(a3[1].indexOf('(') > -1) {
									a6 = a3[1].split(/[\(\)]/gi);
									k = parseInt(a6[1]);
									switch(a6[0]) {
										case 'eq':
											{
												if(a6[1].indexOf('|') > -1) {
													a5 = [];
													a6 = a6[1].split('|');
													for(var d = 0; d < a6.length; d++) {
														k = parseInt(a6[d]);
														if(k < 0 || k > (a4.length - 1)) continue;
														a5.push(a4[k]);
													}
													a4 = a5;
												} else {
													if(k < 0 || k > (a4.length - 1)) a4 = [];
													else a4 = [a4[k]];
												}
												break;
											}
										case 'lt':
											{
												a4.splice(k, a4.length - k);
												break;
											}
										case 'gt':
											{
												a4.splice(0, k + 1);
												break;
											}
										case 'not':
											{
												a4 = a4.remove(selector(a6[1]));
												break;
											}
									}
								}
								break;
							}
					}
				}
				_dom = a4;
			}
			dom = dom.union(a4);
		}
		if(a1.length > 1)
			dom = dom.unique();
		return dom;
	}

	function filter(slt, arr) {
		if (!slt) return arr;
		var a1 = slt.split(/,/gi),
			a2, a3, a5, a6, a7, k, f, tag, check;
		for(var i = 0; i < a1.length; i++) {
			a2 = a1[i].split(/[\s>]+/gi);
			for(var c = 0; c < a2.length; c++) {
				a3 = a2[c].split(':')[0].replace(/\[[^\]]+\]/gi, '');
				a3 = a3.split('.');
				tag = a3[0];
				a3.shift();
				a5 = [];

				if(tag) {
					for(var d = 0; d < arr.length; d++) {
						if(arr[d].tagName.toLowerCase() == tag)
							a5.push(arr[d]);
					}
					arr = a5;
				}
				if(a3.length > 0) {
					a5 = [];
					for(var d = 0; d < arr.length; d++) {
						if(typeof(arr[d].className) == 'string' && arr[d].className.split(' ').contains(a3))
							a5.push(arr[d]);
					}
					arr = a5;
				}
				a3 = a2[c].split(':')[0];
				if(a3.indexOf('[') > -1) {
					a3 = ('a' + a3 + 'a').split(/[(\[)|(\])|(\]\[)]+/gi);
					a3.shift();
					a3.pop();
					a5 = [];
					for(var d = 0; d < arr.length; d++) {
						check = true;
						for(var x = 0; x < a3.length; x++) {
							if(a3[x][0] == '!') {
								a6 = a3[x].substring(1);
								if(arr[d][a6] || arr[d].getAttribute(a6)) {
									check = false;
									break;
								}
							} else if(a3[x].indexOf('*=') > -1) {
								a6 = a3[x].split(/[\s]*\*=[\s]*[\'\"]*/gi);
								a7 = a6[1].split(/[\'\"]$/gi)[0];
								a6 = arr[d].getAttribute(a6[0]) || arr[d][a6[0]];
								if(!a6 || typeof(a6) != 'string' || a6.indexOf(a7) < 0) {
									check = false;
									break;
								}
							} else if(a3[x].indexOf('^=') > -1) {
								a6 = a3[x].split(/[\s]*\^=[\s]*[\'\"]*/gi);
								a7 = a6[1].split(/[\'\"]$/gi)[0];
								a6 = arr[d].getAttribute(a6[0]) || arr[d][a6[0]];
								if(!a6 || typeof(a6) != 'string' || a6.indexOf(a7) != 0) {
									check = false;
									break;
								}
							} else if(a3[x].indexOf('$=') > -1) {
								a6 = a3[x].split(/[\s]*\$=[\s]*[\'\"]*/gi);
								a7 = a6[1].split(/[\'\"]$/gi)[0];
								a6 = arr[d].getAttribute(a6[0]) || arr[d][a6[0]];
								if(!a6) {
									check = false;
									break;
								}
								f = k.indexOf(a7);
								if(f > -1 && (f + a7.length) != k.length) {
									check = false;
									break;
								}
							} else if(a3[x].indexOf('!=') > -1) {
								a6 = a3[x].split(/[\s]*\!=[\s]*[\'\"]*/gi);
								a7 = a6[1].split(/[\'\"]$/gi)[0];
								a6 = arr[d].getAttribute(a6[0]) || arr[d][a6[0]];
								if(!a6 || a6 == a7) {
									check = false;
									break;
								}
							} else if(a3[x].indexOf('=') > -1) {
								a6 = a3[x].split(/[\s]*[=]+[\s]*[\'\"]*/gi);
								a7 = a6[1].split(/[\'\"]$/gi)[0];
								a6 = arr[d].getAttribute(a6[0]) || arr[d][a6[0]];
								if(!a6 || a6 != a7) {
									check = false;
									break;
								}
							} else if(a3[x].indexOf('(') > -1) {
								a6 = a3[x].split(/[\s]*\([\s]*[\'\"]*/gi);
								a7 = a6[1].split(/[\'\"\)]$/gi)[0];
								a7 = new RegExp(a7, 'gi');
								a6 = arr[d].getAttribute(a6[0]) || arr[d][a6[0]];
								if(!a6 || typeof(a6) != 'string' || a7.test(a6) == false) {
									check = false;
									break;
								}
							} else if(!arr[d][a3[x]] && arr[d].getAttribute(a3[x]) == null) {
								check = false;
								break;
							}
						}
						if(check == true) a5.push(arr[d]);
					}
					arr = a5;
				}
				a3 = a2[c].split(':');
				if(a3.length > 1 && arr.length > 0) {
					switch(a3[1]) {
						case 'first':
							{
								arr = [arr[0]];
								break;
							}
						case 'last':
							{
								arr = [arr[arr.length - 1]];
								break;
							}
						case 'empty':
							{
								for(var d = 0; d < arr.length; d++) {
									if(arr[d].innerHTML.length > 0) arr.splice(d, 1);
								}
								break;
							}
						case 'odd':
							{
								for(var d = 1; d < arr.length; d++) arr.splice(d, 1);
								break;
							}
						case 'even':
							{
								for(var d = 0; d < arr.length; d++) arr.splice(d, 1);
								break;
							}
						default:
							{
								if(a3[1].indexOf('(') > -1) {
									a6 = a3[1].split(/[\(\)]/gi);
									k = parseInt(a6[1]);
									switch(a6[0]) {
										case 'eq':
											{
												if(a6[1].indexOf('|') > -1) {
													a5 = [];
													a6 = a6[1].split('|');
													for(var d = 0; d < a6.length; d++) {
														k = parseInt(a6[d]);
														if(k < 0 || k > (arr.length - 1)) continue;
														a5.push(arr[k]);
													}
													arr = a5;
												} else {
													if(k < 0 || k > (arr.length - 1)) arr = [];
													else arr = [arr[k]];
												}
												break;
											}
										case 'lt':
											{
												arr.splice(k, arr.length - k);
												break;
											}
										case 'gt':
											{
												arr.splice(0, k + 1);
												break;
											}
										case 'not':
											{
												arr = arr.remove(selector(a6[1]));
												break;
											}
									}
								}
								break;
							}
					}
				}
			}
		}
		return arr;
	}

	function scriptRun(holder, callback, callback2) {
		if(callback === false) return;
		var script = ves('script', holder);
		var loadNumber = 0;
		if(callback2 === undefined) {
			callback2 = callback;
			callback = null;
		}
		if(typeof(callback) == 'function') callback();
		if(script.length == 0) {
			if(typeof(callback2) == 'function') callback2();
			return;
		}
		var f = function() {
			if(this.run) return;
			this.run = true;
			if(this.src) {
				var _script = holder.ownerDocument.createElement('script');
				_script.async = 'async';
				_script.onerror = _script.onload = _script.onreadystatechange = function() {
					if(!this.readyState || this.readyState == 'loaded' || this.readyState == 'complete') {
						loadNumber += 1;
						if(typeof(callback2) == 'function' && (loadNumber == script.length)) {
							callback2();
						}
						script.each(f);
						_script.parentNode.removeChild(_script);
					}
				};
				_script.src = this.src;
				holder.ownerDocument.getElementsByTagName('head')[0].appendChild(_script);
				return false;
			} else if(this.innerHTML.length > 0) {
				loadNumber += 1;
				if(!this.type || this.type == 'text/javascript') eval(this.innerHTML);
				if(typeof(callback2) == 'function' && (loadNumber == script.length)) {
					callback2();
				}
			}
		};
		script.each(f);
	}
	$.extend = function() {
		var src, copyIsArray, copy, name, options, clone,
			target = arguments[0] || {},
			i = 1,
			length = arguments.length,
			deep = false;
		if(typeof target === "boolean") {
			deep = target;
			target = arguments[i] || {};
			i++;
		}
		if(typeof target != "object" && typeof(target) != 'function') {
			target = {};
		}
		if(i == length) {
			target = this;
			i--;
		}
		for(; i < length; i++) {
			if((options = arguments[i]) != null) {
				for(name in options) {
					src = target[name];
					copy = options[name];
					if(target == copy) {
						continue;
					}
					if(deep && copy && ((copyIsArray = (copy instanceof Array)) || typeof(copy) == 'object')) {
						if(copyIsArray) {
							copyIsArray = false;
							clone = src && (src instanceof Array) ? src : [];

						} else {
							clone = src && typeof(src) == 'object' ? src : {};
						}
						target[name] = this.extend(deep, clone, copy);
					} else if(copy != undefined) {
						target[name] = copy;
					}
				}
			}
		}
		return target;
	};
	$.ajax = function(para) {
		if(!para) para = {};
		if(typeof(para.url) == 'undefined')
			para.url = window.location.href;
		if(para.url == null) return;
		var data = null,
			dataString = '';
		if(para.data) {
			para.contentType = 'application/x-www-form-urlencoded;charset=' + para.charset||'utf-8';
			para.type = 'POST';
			if(typeof(para.data) == 'object') {
				data = ves.extend(true, {}, para.data);
				var value;
				var jsonString = function(_value) {
					if(window.ko) _value = ko.toJSON(_value);
					else if(window.JSON) _value = JSON.stringify(_value);
					else _value = '';
					return _value;
				};
				for(var key in data) {
					if(data[key] != null) {
						value = data[key];
						if(typeof(value) == 'function') value = value();
						if(typeof(value) == 'object') {
							value = jsonString(value);
							dataString += key + '=' + encodeURIComponent(value) + '&';
						} else dataString += key + '=' + encodeURIComponent(value) + '&';
						data[key] = value;
					} else dataString += key + '=&';
				}
				dataString = dataString.substr(0, dataString.length - 1);
			} else dataString = para.data + '';
		}
		if(!para.cache) {
			var now = new Date();
			now = '_=' + now.getFullYear() + (now.getMonth() + 1) + now.getDate() + now.getHours() + now.getMinutes() + now.getSeconds();
			if(para.url.indexOf('?') > -1)
				para.url += '&' + now;
			else para.url += '?' + now;
		}
		para.dataType = para.dataType ? para.dataType.toLowerCase() : null;
		if(para.dataType == 'jsonp') {
			para.callback = para.callback || '__jsonpcallback__';
			var _data = 'callback=' + para.callback + '&' + dataString;
			if(para.url.indexOf('?') > -1)
				para.url = para.url + '&' + _data;
			else para.url = para.url + '?' + _data;
		}
		var error = para.error || ves.ajaxError;
		if(error) {
			error = function() {
				if(para.error) para.error.call(this);
				if(ves.ajaxError) ves.ajaxError.call(this);
			};
		}
		var extend = para.url.split('?')[0].split('.');
		if(extend.length > 1) extend = extend[1];
		else extend = '';
		if(extend == 'js' || para.dataType == 'script' || para.dataType == 'jsonp') {
			ves(function() {
				var script = document.createElement('script');
				script.type = 'text/javascript';
				script.async = 'async';
				if(para.charset) script.setAttribute('charset', para.charset);
				if(typeof(para.loading) == 'function') {
					para.loading.call(para.context);
				}
				if(typeof(para.success) == 'function') {
					var _data = null,
						_callback;
					if(para.dataType == 'jsonp') {
						_callback = window[para.callback];
						window[para.callback] = function(data) {
							if(_callback == undefined) delete window[para.callback];
							else window[para.callback] = _callback;
							_data = data;
						};
					}
					script.onload = script.onreadystatechange = function() {
						if(!this.readyState || this.readyState == 'loaded' || this.readyState == 'complete') {
							$.getCookie();
							para.success.call(para.context, _data || (typeof(window[para.callback]) == 'function' ? window[para.callback](_data) : window[para.callback]));
							script.parentNode.removeChild(script);
						}
					};
				}
				if(error) {
					script.onerror = function() {
						error.call(para.context);
						$.head[0].removeChild(script);
					};
				}
				script.src = para.url;
				$.head.append(script);
			});
			return;
		}
		var formSubmited;
		if(para.file || para.form) {
			var form = para.form;
			var newInput = [];
			if(para.file) form = para.file.form;
			if(!form) {
				form = document.createElement('form');
				form.style.display='none';
				form.isNewForm=true;
				$.body.append(form);
				if(para.file) {
					para.file._prt = para.file.parentNode;
					para.file._next = para.file.nextSibling;
					form.appendChild(para.file);
				}
			}
			var _enctype = form.enctype,
				_method = form.method,
				_target = form.target,
				_action = form.action;
			form.method = para.type;
			if(para.file) {
				form.enctype = 'multipart/form-data';
				form.method = 'post';
			}
			if(!form.action) form.action = window.location.href;
			if(para.url) form.action = para.url;
			formSubmited = function() {
				if(para.file && para.file._prt) {
					if(para.file._next) {
						para.file._prt.insertBefore(para.file, para.file._next);
						delete para.file._next;
					} else para.file._prt.appendChild(para.file);
					delete para.file._prt;
				}
				if(form.isNewForm){
					form.parentNode.removeChild(form);
				}
				else{
					for(var i = 0; i < newInput.length; i++) {
						form.removeChild(newInput[i]);
					}
					form.enctype = _enctype;
					form.method = _method;
					form.target = _target;
					form.action = _action;
				}
			};
			if(window.FormData){
				if(para.file)para.contentType=false;
				dataString=new FormData(form);
				if(data) {
					for(var name in data) {
						dataString.append(name,data[name]);
					}
				}
			}
			else{
				if(data) {
					var input;
					for(var name in data) {
						input = document.createElement('textarea');
						input.type = "hidden";
						input.name = name;
						input.value = data[name];
						newInput.push(input);
						form.appendChild(input);
					}
				}

				var ifr = document.createElement('iframe');
				if(!$.ajax.count) $.ajax.count = 0;
				$.ajax.count += 1;
				ifr.name = '$ajax_iframe_' + $.ajax.count;
				ifr.id = ifr.name;
				ifr.style.display = 'none';
				$.body.append(ifr);
				if(typeof(para.loading) == 'function') {
					para.loading.call(para.context);
				}
				if(typeof(para.success) == 'function') {
					ifr.onload = function() {
						var data = null,doc;
						try{
							doc=this.contentWindow.document;
						}
						catch(e){
							para.success.call(para.context, data);
							ifr.parentNode.removeChild(ifr);
							return;
						}
						var html = doc.getElementsByTagName('body')[0].innerHTML;
						if(!para.dataType) {
							var getType = doc.contentType;
							if(getType) {
								getType = getType.toLowerCase();
								if(getType.indexOf('/json')) para.dataType = 'json';
								else if(getType.indexOf('/javascript')) para.dataType = 'script';
								else if(getType.indexOf('/xml')) para.dataType = 'xml';
								else if(getType.indexOf('/html')) para.dataType = 'html';
								else para.dataType = 'html';
							} else para.dataType = 'html';
						}
						switch(para.dataType) {
							case 'json':
								{
									if(html.length > 0) {
										var start = html.indexOf('{');
										var last = html.lastIndexOf('}') + 1;
										var str = html.substring(start, last);

										if(window.JSON) {
											try {
												data = JSON.parse(str);
												break;
											} catch(err) {}
										}
										try {
											data = eval('(' + str + ')');
										} catch(err) {
											data = {};
										}
									}
									break;
								}
							case 'script':
								{
									if(html.length > 0) {
										var start = html.indexOf('{');
										var last = html.lastIndexOf('}') + 1;
										var str = html.substring(start, last);
										try {
											eval(str);
										} catch(e) {}
									}
									break;
								}
							default:
								{
									data = html;
									break;
								}
						}
						$.getCookie();
						para.success.call(para.context, data);
						this.parentNode.removeChild(this);
						formSubmited();

					};
				}
				if(error) {
					ifr.onerror = function() {
						error.call(para.context);
						this.parentNode.removeChild(this);
						formSubmited();
					};
				}

				form.target = ifr.name;
				form.submit();
				return;
			}
		}
		para.type = para.type ? para.type.toUpperCase() : 'GET';
		para.charset = para.charset ? para.charset : 'UTF-8';
		if(para.contentType==undefined) para.contentType = 'text/html;charset=' + para.charset||'utf-8';
		if(typeof(para.async) == 'undefined') para.async = true;
		var xmlhttp = null;
		if(window.XMLHttpRequest) xmlhttp = new XMLHttpRequest();
		else {
			try {
				xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
			} catch(e) {
				xmlhttp = new ActiveXObject("Msxml2.XMLHTTP");
			}
		}
		xmlhttp.onreadystatechange = function() {
			if(xmlhttp.readyState == 2) {
				if(typeof(para.loading) == 'function') {
					para.loading.call(para.context);
				}
			} else if(xmlhttp.readyState == 4) {
				$.getCookie();
				if(xmlhttp.status != 200) {
					if(error) {
						error.call(para.context);
						if(para.file || para.form)formSubmited();
					}
				} else if(typeof(para.success) == 'function') {
					var request = null;
					if(!para.dataType) {
						var getType = xmlhttp.getResponseHeader("Content-Type");
						if(getType) {
							getType = getType.toLowerCase();
							if(getType.indexOf('/json') >= 0) para.dataType = 'json';
							else if(getType.indexOf('/javascript') >= 0) para.dataType = 'script';
							else if(getType.indexOf('/xml') >= 0) para.dataType = 'xml';
							else if(getType.indexOf('/html') >= 0) para.dataType = 'html';
							else para.dataType = 'text';
						} else para.dataType = 'text';
					}
					switch(para.dataType) {
						case 'json':
							{
								if(window.JSON) {
									try {
										request = JSON.parse(xmlhttp.responseText);
										break;
									} catch(err) {}
								}
								try {
									request = eval('(' + xmlhttp.responseText + ')');
								} catch(err) {
									request = {};
								}
								break;
							}
						case 'script':
							{
								try {
									eval(xmlhttp.responseText);
								} catch(e) {}
								break;
							}
						case 'xml':
							{
								request = xmlhttp.responseXML;
								break;
							}
						default:
							{
								request = xmlhttp.responseText;
								break;
							}
					}
					para.success.call(para.context, request);
					if(para.file || para.form)formSubmited();
				}
				else if(para.file || para.form)formSubmited();
			}
		};
		if(!para.async) {
			xmlhttp.timeout = 0;
			xmlhttp.withCredentials = false;
			xmlhttp.responseType = '';
		}
		xmlhttp.open(para.type, para.url, para.async);
		if(para.type == 'POST'&&para.contentType)
			xmlhttp.setRequestHeader('Content-Type', para.contentType);
		xmlhttp.setRequestHeader('Accept', '*/*');
		xmlhttp.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
		if(para.dataType) xmlhttp.setRequestHeader('dataType', para.dataType);
		try {
			xmlhttp.send(dataString);
		} catch(e) {
			if(typeof(error) == 'function') {
				error.call(para.context);
				if(para.file || para.form)formSubmited();
			}
		}
	};

	function getStyle(dom, key, real) {
		var cstyle=null;
		var value = dom.style[key] ? dom.style[key] : window.getComputedStyle&&(cstyle=window.getComputedStyle(dom, null))?cstyle[key] : dom.currentStyle ? dom.currentStyle[key] : dom.runtimeStyle ? dom.runtimeStyle[key] : null;
		if(real) return value;
		if(!value) value = dom[key];
		if(value == null) value = '';
		return value + '';
	}

	function setStyle(dom, key, value, relative) {
		var _value = getStyle(dom, key, true);
		var val = value - 0;
		if(isNaN(val) == false) value = val;
		if(typeof(_value) == 'undefined') {
			dom[key] = value;
			return;
		}
		if(_value == null) _value = '';
		val = parseFloat(_value.replace(/[^0-9.\-\+]+/gi, ''));
		if(isNaN(val) == false) {
			if(relative) {
				val += parseFloat(value);
				value = _value.replace(/[0-9.\-\+]+/gi, val);
			} else if(typeof(value) == 'number' && _value.indexOf('%') < 0) {
				value = _value.replace(/[0-9.\-\+]+/gi, value);
			}
		}
		var min = getStyle(dom, 'min-' + key);
		var max = getStyle(dom, 'max-' + key);
		if(min) {
			if(min.indexOf('%') >= 0) {
				var _n = 'client' + key[0].toUpperCase() + key.substring(1);
				val = dom.offsetParent ? dom.offsetParent[_n] : dom.parentNode[_n];
				min = val * parseFloat(min) / 100;
			}
			min = parseFloat(min);
			if(isNaN(min) == false) {
				if(parseFloat(value) < min) {
					value = (value + '').replace(/[0-9.\-\+]+/gi, min);
				}
			}
		}
		if(max) {
			if(max.indexOf('%') >= 0) {
				var _n = 'client' + key[0].toUpperCase() + key.substring(1);
				val = dom.offsetParent ? dom.offsetParent[_n] : dom.parentNode[_n];
				max = val * parseFloat(max) / 100;
			}
			max = parseFloat(max);
			if(isNaN(max) == false) {
				if(parseFloat(value) > max) {
					value = (value + '').replace(/[0-9.\-\+]+/gi, max);
				}
			}
		}
		var _key = key.charAt(0).toUpperCase() + key.substring(1);
		var core = $.browser.webkit ? 'webkit' : $.browser.ms ? 'ms' : $.browser.moz ? 'moz' : $.browser.o ? 'o' : '';
		if(typeof(value) == 'string')
			dom.style[core + _key] = value.replace('transform', '-' + core + '-transform');
		else dom.style[core + _key] = value;
		dom.style[key] = value;
	}
	$.query = {};
	$.cookie = {};
	$.queryUrl = function(host) {
		var url = host === true ? ('http://' + window.location.host + window.location.pathname) : '',
			_query = '';
		var query = typeof(host) == 'object' ? host : $.query;
		for(var key in query) _query += key + '=' + query[key] + '&';
		if(_query) url += '?' + _query.substring(0, _query.length - 1);
		if(typeof(host) != 'object' && window.location.hash) url += window.location.hash;
		return url;
	};
	$.setCookie = function(key, value, options) {
		options = options || {};
		var expires = '';
		var date = new Date();
		if(options.expires && (typeof options.expires == 'number' || options.expires.toUTCString)) {
			if(typeof options.expires == 'number') {
				date = new Date();
				date.setTime(date.getTime() + options.expires * 60 * 60 * 1000);
			} else {
				date = options.expires;
			}
			expires = ';expires=' + date.toUTCString();
		}
		var path = options.path ? ';path=' + options.path : '';
		var domain = options.domain ? ';domain=' + options.domain : '';
		var secure = options.secure ? ';secure' : '';
		if(value == null) {
			date = new Date();
			date.setTime(date.getTime() - 10000);
			expires = ';expires=' + date.toUTCString();
			document.cookie = [key, '=', '', expires, path, domain, secure].join('');
			delete $.cookie[key];
		} else {
			document.cookie = [key, '=', encodeURIComponent(value), expires, path, domain, secure].join('');
			if(document.cookie == '') return $;
			$.cookie[key] = value;
		}
		return $;
	};
	$.getCookie = function() {
		if(document.cookie) {
			var name, val = null,
				qs = document.cookie.split(/;[\s]*/gi),
				index;
			for(var i = 0; i < qs.length; i++) {
				index = qs[i].trim().indexOf('=');
				if(index < 0) {
					name = qs[i];
					val = '';
				} else {
					name = qs[i].substring(0, index).trim();
					val = qs[i].substr(index + 1);
					if(val != '') val = decodeURIComponent(val);
				}
				if(name.length > 0) $.cookie[name] = val;
			}
		}
	};
	$.cssRule = function(style, index) {
		var cssRules = $.browser.ms ? 'rules' : 'cssRules';
		if(document.styleSheets.length == 0) {
			return null;
		}
		style = typeof(style) == 'number' ? document.styleSheets[style] : style;
		if(typeof(index) != 'number' || index > style[cssRules].length) {
			index = style[cssRules].length - 1;
		} else if(index < 0) {
			index = 0;
		}
		return style[cssRules][index];
	};
	$.cssRules = function(style) {
		var cssRules = $.browser.ms ? 'rules' : 'cssRules';
		if(document.styleSheets.length == 0) {
			return [];
		}
		style = typeof(style) == 'number' ? document.styleSheets[style] : style;
		return style[cssRules];
	};
	$.addRule = function(selector, rules, style, index) {
		var cssRules = $.browser.ms ? 'rules' : 'cssRules';
		if(document.styleSheets.length == 0 || (typeof(style) == 'number' && style > (document.styleSheets.length - 1))) {
			style = document.createElement('style');
			style.type = 'text/css';
			$.head.append(style);
			style = style.sheet || style.styleSheet;
		} else style = typeof(style) == 'number' ? document.styleSheets[style] : style;
		if(typeof(index) != 'number' || index > style[cssRules].length) {
			index = style[cssRules].length;
		} else if(index < 0) {
			index = 0;
		}
		if(typeof(rules) == 'object') {
			var _rules = '',
				_key;
			for(var key in rules) {
				_key = key.replace(/[A-Z]{1}/g, function(m) {
					return '-' + m.toLowerCase();
				});
				_rules += _key + ':' + rules[key] + ';';
			}
			rules = _rules;
		}
		if(style.insertRule) {
			style.insertRule(selector + "{" + rules + "}", index);
		} else if(style.addRule) {
			style.addRule(selector, rules, index);
		}
		return style[cssRules][index];
	};
	$.removeRule = function(style, index) {
		if(document.styleSheets.length == 0) return;
		var cssRules = $.browser.ms ? 'rules' : 'cssRules';
		style = typeof(style) == 'number' ? document.styleSheets[style] : style;
		if(style[cssRules]) {
			if(style[cssRules].length == 0) return;
			if(typeof(index) != 'number' || index > style[cssRules].length - 1) {
				index = style[cssRules].length - 1;
			} else if(index < 0) index = 0;
		}
		if(style.deleteRule) {
			style.deleteRule(index);
		} else if(style.removeRule) {
			style.removeRule(index);
		}
	};
	$.createPrefixCss = function(index) {
		var prefix = {
			'animation': 1,
			'animationDelay': 1,
			'animationDirection': 1,
			'animationDuration': 1,
			'animationIterationCount': 1,
			'animationName': 1,
			'animationTimingFunction': 1,
			'backgroundClip': 1,
			'backgroundOrigin': 1,
			'backgroundSize': 1,
			'borderImage': 1,
			'borderRadius': 1,
			'boxShadow': 1,
			'transform': 1,
			'transition': 1,
			'userDrag': 1,
			'userSelect': 1
		};
		var cssPrefix = '',
			node, rules, _fix, _fix2, has, key, value;
		if(typeof(index) == 'number') index = [index];
		for(var x = 0; x < index.length; x++) {
			rules = ves.cssRules(index[x]);
			if(!rules) continue;
			for(var i = 0; i < rules.length; i++) {
				has = false;
				if(rules[i].style) {
					_fix = rules[i].selectorText + '{';
					for(var name in prefix) {
						if(rules[i].style[name]) {
							has = true;
							value = rules[i].style[name].replace('http://' + window.location.hostname, '') + ';';
							key = name.replace(/[A-Z]/g, function(m) {
								return '-' + m.toLowerCase();
							});
							_fix += '-webkit-' + key + ':' + value;
							_fix += '-moz-' + key + ':' + value;
							_fix += '-ms-' + key + ':' + value;
							_fix += '-o-' + key + ':' + value;
						}
					}
					if(has) {
						_fix += '}';
						cssPrefix += _fix;
					}
				} else if(rules[i].type == 7 && rules[i].cssText.indexOf('@keyframes') == 0) {
					_fix = '@-webkit-keyframes ' + rules[i].name + '{';
					for(var c = 0; c < rules[i].cssRules.length; c++) {
						_fix2 = rules[i].cssRules[c].keyText + '{';
						_fix2 += rules[i].cssRules[c].style.cssText;
						for(var name in prefix) {
							value = rules[i].cssRules[c].style[name];
							if(value) {
								value = value.replace('http://' + window.location.hostname, '') + ';';
								key = name.replace(/[A-Z]/g, function(m) {
									return '-' + m.toLowerCase();
								});
								if(rules[i].cssRules[c].style[name]) _fix2 += '-webkit-' + key + ':' + value;
								else _fix2 += key + ':' + value;
							}
						}
						_fix2 += '}';
						_fix += _fix2;
					}
					_fix += '}';
					cssPrefix += _fix + _fix.replace(/\-webkit\-/g, '-moz-') + _fix.replace(/\-webkit\-/g, '-ms-') + _fix.replace(/\-webkit\-/g, '-o-');
				}
			}
		}
		node = ves('<style type="text/css"></style>')[0];
		node.innerHTML = cssPrefix;
		return node;
	};
	Array.prototype.contains = function(e) { //是否包含
		if(e instanceof Array) {
			for(var i = 0; i < e.length; i++) {
				if(this.contains(e[i]) == false)
					return false;
			}
			return true;
		} else {
			for(var i = 0; i < this.length; i++) {
				if(this[i] === e) return true;
			}
		}
		return false;
	};
	Array.prototype.indexOf=function(o){
		for(var i = 0; i < this.length; i++) {
			if(this[i]===o){
				return i;
			}
		}
		return -1;
	};
	Array.prototype.unique = function() { //去重
		var arr = [];
		for(var i = 0; i < this.length; i++) {
			if(!arr.contains(this[i])) arr.push(this[i]);
		}
		return arr;
	};
	Array.prototype.union = function() { //并集
		var arr = this.slice(0);
		for(var i = 0; i < arguments.length; i++)
			arr = arr.concat(arguments[i]);
		return arr.unique();
	};
	Array.prototype.inall = function() { //交集
		var arr = this.slice(0);
		for(var i = 0; i < arr.length; i++) {
			for(var b = 0; b < arguments.length; b++) {
				if(arguments[b].contains(arr[i]) == false) {
					arr.splice(i, 1);
					i -= 1;
					break;
				}
			}
		}
		return arr;
	};
	Array.prototype.remove = function(e) { //删除并返回新的数组
		var arr = [];
		if(e instanceof Array == false) e = [e];
		for(var i = 0; i < this.length; i++) {
			if(!e.contains(this[i]))
				arr.push(this[i]);
		}
		return arr;
	};
	Array.prototype.each = function(f, context) {
		if(typeof(f) == 'function') {
			for(var i = 0; i < this.length; i++) {
				if(f.call(context || this[i], i, this[i]) == false)
					break;
			}
		}
		return this;
	};

	String.prototype.trim = function() {
		return this.replace(/(^[\s]+)|([\s]+$)/gi, '');
	};
	String.prototype.trimLeft = function() {
		return this.replace(/^[\s]+/gi, '');
	};
	String.prototype.trimRight = function() {
		return this.replace(/[\s]+$/gi, '');
	};
	String.prototype.reverse = function() {
		var str = '';
		for(var i = this.length - 1; i > -1; i--) {
			str += this.charAt(i);
		}
		return str;
	};
	window.requestAnimationFrame = window.requestAnimationFrame ||
	window.webkitRequestAnimationFrame ||
	window.mozRequestAnimationFrame ||
	window.oRequestAnimationFrame ||
	window.msRequestAnimationFrame ||
	function(callback) {
		return window.setTimeout(callback, 1000/60);
	};
	window.cancelAnimationFrame = window.cancelAnimationFrame ||
	window.webkitCancelRequestAnimationFrame ||
	window.mozCancelRequestAnimationFrame ||
	window.oCancelRequestAnimationFrame ||
	window.msCancelRequestAnimationFrame ||
	window.clearTimeout;

	function nodeListToArray(list) {
		var arr = [];
		for(var i = 0; i < list.length; i++)
			arr.push(list[i]);
		return arr;
	}
	(function() {
		var qs = window.location.href.split('?');
		if(qs.length > 1) {
			qs = qs[1].split('#')[0];
			qs = qs.split('&');
			var index, name, val = null;
			for(var i = 0; i < qs.length; i++) {
				if(qs[i].length == 0) continue;
				index = qs[i].indexOf('=');
				if(index < 0 || index == qs[i].length - 1) val = '';
				else val = decodeURIComponent(qs[i].substring(index + 1));
				name = qs[i].split('=');
				name = name[0].toLowerCase();
				$.query[name] = val;
			}
			if($.query._)
				delete $.query._;
		}
		$.getCookie();
		var ua = (window.userAgent || window.navigator.userAgent).toLowerCase();
		$.browser = {
			//设备
			mobile: ua.indexOf('mobile') > -1,
			desktop: ua.indexOf('mobile') < 0,
			ios: ua.indexOf('mac os x') > -1,
			android: ua.indexOf('android') > -1 || ua.indexOf('linux') > -1,
			iphone: ua.indexOf('iphone') > -1 || ua.indexOf('mac') > -1,
			ipad: ua.indexOf('ipad') > -1,
			//软件
			wechat: ua.indexOf('micromessenger') > -1,
			qq: ua.indexOf('qq/') > -1,
			qqb: ua.indexOf('qqbrowser') > -1,
			uc: ua.indexOf('ucbrowser') > -1,
			//内核
			ms: ua.indexOf('trident') > -1,
			o: ua.indexOf('presto') > 1,
			webkit: ua.indexOf('webkit') > -1,
			moz: ua.indexOf('firefox') > -1
		};
		if($.browser.ms) {
			var msie = ua.split('msie ');
			if(msie.length > 1) $.browser.version = parseInt(msie[1].split('.')[0]);
			else $.browser.version = parseInt(ua.split('rv:')[1].split('.')[0]);
		}
		$(function() {
			$.html = $(document.documentElement);
			$.body = $(document.body);
			$.head = $.body.prev();
			var className = ['ready'];
			for(var key in $.browser) {
				if($.browser[key]) className.push(key);
			}
			if($.browser.ms) {
				className.push('ms' + $.browser.version);
				if($.browser.version < 9) className.push('ms-8');
				else className.push('ms9-');
			}
			$.html.addClass(className);
			var fontFamily = $.html.css('font-family');
			if(fontFamily == "宋体" || fontFamily == 'SimSun') {
				$.body.css('font-family', 'Icon, Microsoft YaHei');
			}
		});
	})();
})();