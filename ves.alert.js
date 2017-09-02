/*Chen QingZhu*/
(function () {
	var $ = ves;
	var alerts = [];
	$.alert = function (param, type, close, closed) {
		if (param == undefined || param == null) param += '';
		var _alert = {};
		alerts.push(_alert);
		if (!param.content) param = {
			content: param
		};
		if (alerts.length == 1) $.html.addClass('ves-alert');
		var alert = document.createElement('div');
		alert.id = 'alert';
		alert.className = 'ves';
		alert.style.zIndex = '1000' + alerts.length;
		var body = document.createElement('div');
		body.className = "body";
		alert.appendChild(body);
		var content = document.createElement('div');
		content.className = "content";
		body.appendChild(content);
		param.button = param.button || $.alert.button;
		_alert.holder = $(alert);
		_alert.content = $(content);
		if (type) {
			if (typeof (type) == 'function') param.close = type;
			else if (typeof (type) == 'string') param.type = type;
			if (typeof (close) == 'function') {
				if (param.close) {
					param.closed = close;
				} else {
					param.close = close;
					if (closed !== undefined) {
						param.closed = closed;
					}
				}
			} else if (typeof (close) == 'string') {
				param.type = close;
			} else if (close === null) {
				param.closed = closed;
			}
		}
		if (param.type == 'load') {
			param.type = 'wait';
			param.style = 'load';
		}
		var focusButton = null;
		if (param.type != 'notify' && param.type != 'wait') {
			var bottom = document.createElement('div');
			bottom.className = "input";
			var button;
			if (param.type == 'confirm') {
				alert.className = 'ves confirm';
				button = document.createElement('input');
				button.type = 'button';
				button.value = param.button.no;
				button.className = 'button no';
				button.name = 'ves_alert_button_no';
				$(button).bind('tap', function () {
					$.alert.close(false);
				});
				bottom.appendChild(button);
				var closeIcon = document.createElement('span');
				closeIcon.innerHTML = '';
				closeIcon.className = "close";
				$(closeIcon).bind('tap', function () {
					$.alert.close(null);
				});
				body.appendChild(closeIcon);
			}
			focusButton = document.createElement('input');
			focusButton.type = 'button';
			focusButton.value = param.button.yes;
			focusButton.className = 'button yes';
			focusButton.name = 'ves_alert_button_yes';
			$(focusButton).bind('tap', function () {
				$.alert.close(true);
			});
			bottom.appendChild(focusButton);
			body.appendChild(bottom);

			_alert.holder.on('tap', function () {
				this.event.stopParent();
			});
		} else {
			if (param.type == 'notify') {
				param.closeTime = param.closeTime != undefined ? param.closeTime : 2;
				alert.className = 'ves notify';
				_alert.bodyTap = function () {
					if (_alert.closeTimer) {
						window.clearInterval(_alert.closeTimer);
						delete alert.closeTimer;
					}
					$.alert.close(null);
					_alert.holder.off('tap', _alert.bodyTap);
					delete _alert.bodyTap;
				};
				_alert.holder.on('tap', _alert.bodyTap);
			} else if (param.type == 'wait') {
				param.closeTime = null;
				alert.className = 'ves wait';
			}
		}
		_alert.targetParent = null;
		_alert.targetNext = null;
		$.body.append(_alert.holder);
		_alert.holder.addClass('top');
		if (alerts.length > 1) alerts[alerts.length - 2].holder.removeClass('top');
		_alert.close = param.close;
		_alert.closed = param.closed;
		_alert.context = param.context;
		if (param.style) _alert.holder.addClass(param.style);

		if (param.title) {
			_alert.content.append($('<p class="title">' + param.title + '</p>'));
		}

		if (param.url && $(param.content).length == 0) {
			$.alert('', 'load');
			$.ajax({
				url: param.url,
				dataType: param.dataType,
				context: _alert,
				success: function (request) {
					this.content.append($(request));
					setTimeout(function () {
						$.alert.close();
						_alert.holder.addClass('view');
					}, 0);
				}
			});
		} else {
			var target = $(param.content);
			if (target.length > 0) {
				_alert.target = target[0];
				if (target[0].parentNode && target[0].parentNode.parentNode) {
					_alert.targetParent = target[0].parentNode;
					_alert.targetNext = target[0].nextSibling;
				}
				_alert.content.append(target);
			} else if (param.style == 'load') {
				var _content = param.content ? '<br />' + param.content : '';
				_alert.content.append($('<p><span class="ic_load" style="margin:10px 0;"></span>' + _content + '<p>'));
			} else _alert.content.append($('<p>' + param.content + '</p>'));
			$('form', _alert.content).each(function () {
				this.onsubmit = function () {
					$.alert.close(true);
					return false;
				}
			});
			_alert.holder.addClass('view');
		}
		if (typeof (param.closeTime) == 'number' && param.closeTime >= 0) {
			var button = $('.button', _alert.holder);
			button.val(param.button.yes + ' ( ' + param.closeTime + ' )');
			param.closeTime -= 1;
			_alert.closeTimer = window.setInterval(function () {
				if ((param.closeTime > 0) == false) {
					window.clearInterval(_alert.closeTimer);
					delete _alert.closeTimer;
					button.val(param.button.yes);
					$.alert.close(_alert);
					return;
				}
				button.val(param.button.yes + ' ( ' + param.closeTime + ' )');
				param.closeTime -= 1;
			}, 1000);
		}
		_alert.holder[0].scrollTop = 0;
		if (focusButton) {
			setTimeout(function () {
				focusButton.focus();
			}, 50);
		}
		return _alert;
	};
	$.alert.close = function (number, ok) {
		if (alerts.length == 0) return;
		switch (typeof (number)) {
			case 'number':
				{
					if (number > alerts.length - 1) number = alerts.length - 1;
					else if (number < 0) number = 0;
					break;
				}
			case 'object':
				{
					if (number === null) {
						ok = number;
						number = alerts.length - 1;
						break;
					}
					_alert = number;
					number = alerts.length - 1;
					for (var i = 0; i < alerts.length; i++) {
						if (alerts[i] === _alert) {
							number = i;
							break;
						}
					}
					break;
				}
			default:
				{
					ok = number;
					number = alerts.length - 1;
					break;
				}
		}
		var _alert = alerts[number];

		if (typeof (_alert.close) == 'function') {
			if (_alert.close.call(_alert.context || _alert.target || _alert.content[0], ok) === false) {
				if (_alert.closeTime != undefined)
					_alert.closeTime = 2;
				return;
			}
		}
		if (_alert.closeTimer)
			window.clearInterval(_alert.closeTimer);

		var has = false;
		for (var i = 0; i < alerts.length; i++) {
			if (alerts[i] === _alert) {
				has = true;
				alerts.splice(i, 1);
				break;
			}
		}
		if (!has) return;

		if (alerts.length > 0) alerts[alerts.length - 1].holder.addClass('top');
		else {
			setTimeout(function () {
				$.html.removeClass('ves-alert');
			}, 20);
		}

		if (typeof (_alert.closed) == 'function') {
			_alert.closed.call(_alert.context || _alert.target || _alert.content[0], ok);
		}
		if (_alert.target && _alert.targetParent) {
			if (_alert.targetNext) _alert.targetParent.insertBefore(_alert.target, _alert.targetNext);
			else _alert.targetParent.appendChild(_alert.target);
		} else {
			var child = _alert.content.children('.alert:first');
			if (child.length == 1) {
				ves.body.append(child[0]);
			}
		}
		if (typeof (_alert.bodyTap) == 'function') {
			_alert.holder.off('tap', _alert.bodyTap);
		}
		_alert.holder.remove();
	};
	$.alert.button = {
		yes: '',
		no: ''
	};
	$.alert.closeAll = function () {
		for (var i = 0; i < alerts.length;) {
			$.alert.close();
		}
	};
})();