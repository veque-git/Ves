/*Chen QingZhu*/
! function() {
	var $ = ves;
	//文本裁剪
	$.textCutter = function(slt) {
		var target = $(slt)._attr('_html', function() {
			return this.innerHTML;
		});
		var set = function() {
			target.each(function() {
				this.innerHTML = this._html;
				(function() {
					if(this.scrollHeight > this.offsetHeight) {
						this.innerHTML = this.innerHTML.substr(0, this.innerHTML.length - 1);
						if((this.scrollHeight > this.offsetHeight) == false) {
							this.innerHTML = this.innerHTML.substr(0, this.innerHTML.length - 2) + '...';
							return;
						}
						arguments.callee.call(this);
					}
				}).call(this);
			});
		};
		$(window).bind('resized', set);
		set();
	};
	//qq对话链接
	$.qqChat = function(prt) {
		prt = prt ? $(prt) : null;
		$('[qq]', prt).bind('tap', function() {
			window.open('http://wpa.qq.com/msgrd?v=1&uin=' + this.getAttribute('qq') + '&site=qq&menu=yes');
			return false;
		});
	};
	//提示,相当于alt,title效果
	$.tipView = function(prt) {
		$.tipView.mark = false;
		prt = prt ? $(prt) : document;
		var tip = $('[tip]', prt);
		if(this.tipView.tip == null) {
			this.tipView.tip = $('<div id="tip"></div>');
			$.body.append(this.tipView.tip);
			this.tipView.tip.bind('tapin', function() {
				this.event.target.className = 'view hover';
				if($.tipView.timer) {
					clearTimeout($.tipView.timer);
					$.tipView.timer = null;
				}
				return 0;
			}).bind('tapout', function() {
				this.event.target.className = 'hide';
				return 0;
			});
		}
		tip.bind('tap', function(e) {
			if($.tipView.timer) {
				clearTimeout($.tipView.timer);
				$.tipView.timer = null;
			}
			var it = $(this);
			var desp = it.attr('tip');
			if(desp == '') return;
			$.tipView.tip.html('');
			desp = $('<div>' + desp + '</div>');
			var loadobj = $('img:first,iframe:first', desp);
			if(loadobj.length > 0) {
				$.tipView.tip.append($('<i class="ic-load"></i>'));
				$.tipView.tip.addClass('loading');
				loadobj.bind('load', function() {
					$.tipView.tip.removeClass('loading');
				}, 1);
			}
			$.tipView.tip.css('display', 'block').append(desp);
			var tipos = it.attr('tipos');
			if(tipos != null) {
				eval("tipos={" + tipos + "};");
				if(tipos.left != null && tipos.left != undefined)
					left = parseInt(tipos.left);
				if(tipos.top != null && tipos.top != undefined)
					top = parseInt(tipos.top);
			}
			$.followCursor($.tipView.tip[0], tipos);
			$.tipView.tip.removeClass('hide').addClass('view');
			it.bind('tapout', function() {
				setTimeout(function() {
					if($.tipView.tip.noClass('hover')) {
						$.tipView.tip[0].className = 'hide';
						$.tipView.timer = setTimeout(function() {
							$.tipView.tip.css('display', 'none');
						}, 300);
					}
				}, 200);
				return 0;
			}, 1);
			return 0;
		});
	};
	//设置跟随鼠标定位
	$.followCursor = function(element, pos, center) {
		var eh = element.offsetHeight;
		var ew = element.offsetWidth;
		var dw = document.documentElement.clientWidth;
		var dh = document.documentElement.clientHeight;
		var left = 0,
			top = 0;
		if(pos) {
			if(pos.nodeType === 1) {
				pos = pos.getBoundingClientRect();
				left = 0 - pos.left;
				top = 0 - pos.top;
			} else {
				if(pos.left != undefined) {
					left = pos.left;
				}
				if(pos.top != undefined) {
					top = pos.top;
				}
			}
		}
		if(center) {
			top -= eh / 2;
		}
		var e = this.event.self;
		left = e.clientX - ew / 2 + left;
		if(dw - left < ew) left = dw - ew;
		if(left < 0) left = 0;

		top = e.clientY + top;
		if(dh - top < eh) top = e.clientY - eh;
		if(top < 0) top = 0;

		element.style.left = left + 'px';
		element.style.top = top + 'px';
	};
	//设置跟随目标元素定位
	$.followTarget = function(element, target, pos, pos2) {
		var eh = element.offsetHeight;
		var ew = element.offsetWidth;
		var dw = document.documentElement.clientWidth;
		var dh = document.documentElement.clientHeight;
		var left = 0,
			top = 0;
		if(pos) {
			if(pos.left != undefined) {
				left = pos.left;
			}
			if(pos.top != undefined) {
				top = pos.top;
			}
		}
		var e = target.getBoundingClientRect();
		left = e.left + left;
		if(dw - left < ew) {
			if(pos2.left != undefined)
				left = e.left + pos2.left;
			else left = dw - ew;
		}
		if(left < 0) left = 0;

		top = e.top + target.offsetHeight + top;
		if(dh - top < eh) {
			if(pos2.top != undefined)
				top = e.top + target.offsetHeight + pos2.top;
			else top = top - eh + target.offsetHeight;
		}
		if(top < 0) top = 0;

		element.style.left = left + 'px';
		element.style.top = top + 'px';
	};
	//图片自动铺满容器
	$.imgCover = function(select) {
		if(!$.imgCover.start) {
			$.imgCover.start = true;
			$(window).bind('resized', function() {
				$('[imgcover]').each($.imgCover);
			});
		}
		if(this === ves) {
			var it;
			if(!select) {
				it = $('[imgcover]');
			} else it = $(select);
			it._attr('_src', function() {
				return this.src;
			}).attr('src', '');
			it.on('load', $.imgCover);
			it.attr('src', function() {
				return this._src;
			});
			return this;
		}
		var target = this,
			$target = $(this),
			scale = target.width / target.height;
		$target.css({
			'margin-top': '0px',
			'margin-left': '0px'
		});
		var prt = target.parentNode;
		prt.style.overflow = 'hidden';
		var wscale = prt.clientWidth / prt.clientHeight;
		if(scale < wscale) {
			$target.css({
				width: '100%',
				height: 'auto',
				'margin': 0
			});
			if(target.offsetHeight > prt.clientHeight)
				target.style.marginTop = '-' + (target.offsetHeight - prt.clientHeight) / 2 + 'px';
			else target.style.marginTop = (prt.clientHeight - target.offsetHeight) / 2 + 'px';
		} else {
			$target.css({
				width: 'auto',
				height: '100%',
				'margin': 0
			});
			if(target.offsetWidth > prt.clientWidth)
				target.style.marginLeft = '-' + (target.offsetWidth - prt.clientWidth) / 2 + 'px';
			else target.style.marginLeft = (prt.clientWidth - target.offsetWidth) / 2 + 'px';
		}
	};
	//获取选中的可编辑文本内容
	$.getEditSelect = function(element) {
		if(window.getSelection) {
			var para = element.value != undefined ? 'value' : 'innerHTML';
			return element[para].substr(element.selectionStart, element.selectionEnd - element.selectionStart);
		} else if(document.selection) {
			var para = element.value != undefined ? 'text' : 'htmlText';
			return document.selection.createRange()[para];
		}
		return '';
	};
	//设置选中的可编辑文本内容
	$.setEditSelect = function(element, value) {
		element.focus();
		if(document.selection) {
			var para = element.value != undefined ? 'text' : 'htmlText';
			var slt = document.selection.createRange();
			slt[para] = value;
			slt.moveEnd('character', -1 * value.length);
			slt.moveEnd('character', value.length);
			slt.select();
		} else {
			var start = element.selectionStart || 0;
			var end = element.selectionEnd || 0;
			var para = element.value != undefined ? 'value' : 'innerHTML';
			element[para] = element[para].substring(0, start) + value + element[para].substring(end);
			element.selectionStart = start;
			element.selectionEnd = element.selectionStart + value.length;
		}
		return true;
	};
	//复制可编辑文本内容时, 改变剪贴板的内容
	$.copyEditSelect = function(param) {
		ves(param.element).on('copy', function() {
			var _text = $.getEditSelect(this);
			if(typeof(param.copy) == 'function') {
				var back = param.copy(_text);
				if(back) {
					$.setEditSelect(this, back);
					var it = this;
					setTimeout(function() {
						$.setEditSelect(it, _text);
					}, 5);
				}
			}
		});
	};
	//获取选中的普通文本内容
	$.getSelect = function(w) {
		w = w || window;
		if(w.getSelection) {
			var sel = w.getSelection();
			if(sel.rangeCount) {
				var container = w.document.createElement("div");
				for(var i = 0; i < sel.rangeCount; i++) {
					container.appendChild(sel.getRangeAt(i).cloneContents());
				}
				return container.innerHTML;
			}
		} else if(w.document.selection) {
			if(w.document.selection.type == "Text") {
				return w.document.selection.createRange().htmlText;
			}
		}
		return '';
	};
	//滚动加载
	var _pm;
	$.scrollLoad = function(pm) {
		if($.scrollLoad.loading) delete $.scrollLoad.loading;
		pm.bottom = pm.bottom || 0;
		pm.valid = true;
		if(!_pm) {
			$(window).on('scrolled', function() {
				if(_pm.valid && !_pm.holder.hasClass('ves_scrollLoading') && (this.pageYOffset || ves.body[0].scrollTop) >= ves.body[0].scrollHeight - ves.body[0].clientHeight - _pm.bottom) {
					if(!_pm.page) _pm.page = 1;
					_pm.page += 1;
					_pm.holder.addClass('ves_scrollLoading');
					_pm.data.page = _pm.page;
					ves.ajax({
						url: _pm.url,
						data: _pm.data,
						dataType: 'json',
						success: function(request) {
							if(request.data instanceof Array) {
								if(_pm.handle) _pm.list(_pm.handle(_pm.list().concat(request.data)));
								else _pm.list(_pm.list().concat(request.data));
							}
							if(!request.data || request.data.length == 0) {
								delete _pm.valid;
								_pm.holder.addClass('ves_scrollLoadComplete');
							}
							_pm.holder.removeClass('ves_scrollLoading');
						}
					});
				}
			});
		}
		_pm = pm;
		window.scrollBy(0, -5);
	};
}();