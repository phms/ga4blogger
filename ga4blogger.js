"use strict";

 var ga4blogger_ua = "UA-XXXXX-X";
 var ga4blogger_track_postview = "h2.title a";

/*!
 * ga4blogger
 * https://github.com/phms/ga4blogger
 *
 * Copyright 2011, @fabiophms
 * Licensed under the MIT license (http://www.opensource.org/licenses/mit-license.php)
*/

/*
 * Includes jQuery JavaScript Library
 * http://jquery.com/
 * Copyright 2011, John Resig
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * Includes Sizzle.js
 * http://sizzlejs.com/
 * Copyright 2011, The Dojo Foundation
 * Released under the MIT, BSD, and GPL Licenses.
 *
 * Includes jQuery.appear v1.1.1
 * http://code.google.com/p/jquery-appear/
 * Copyright (c) 2009 Michael Hixson
 * Licensed under the MIT license (http://www.opensource.org/licenses/mit-license.php)
 *
 * Adaptation to 'Debuging Javascript with Google Analytics'
 * http://www.directperformance.com.br/en/javascript-debug-simples-com-google-analytics
 * 2010, Eduardo Cereto
*/

var ga4blogger = {
	version : 1.0,
	ua : window.ga4blogger_ua,
	path : String(document.location.pathname).toLowerCase(),
	host : String(document.location.hostname).toLowerCase(), //TODO: trocar de host para hostname
	protocol : String(document.location.protocol).toLowerCase(),
	a : document.createElement("a"),

	str2link : function(url) {
		ga4blogger.a.href = url;
		return ga4blogger.a;
	},

	get_text : function (element) {
		return jQuery.trim(element.innerText || element.textContent);
	},

	track_postview : function (){
		return (window.ga4blogger_track_postview && ga4blogger.path === "/");
	},

	load_ga : function () {
		if (!ga4blogger.ua) {
			throw "GA account not set!";
		}
		if (typeof(window._gaq) === "undefined") {
			window._gaq = [];
		}
		window._gaq.push(['_setAccount', ga4blogger.ua]);
		if (!ga4blogger.track_postview()) {
			window._gaq.push(['_trackPageview']);
		}
		window._gaq.push(['_trackPageLoadTime']);

		(function () {
			var ga = document.createElement('script');
			ga.type = 'text/javascript';
			ga.async = true;
			ga.src = ('https:' === document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
			var s = document.getElementsByTagName('script')[0];
			s.parentNode.insertBefore(ga, s);
		})();
	},

	apply_selector : function () {
		jQuery(document).ready(function () {
			try {
				ga4blogger.path = (ga4blogger.path === "/") ? "/" : (ga4blogger.path + "/");

				jQuery.expr[':'].external = function (obj) {
					return (obj.hostname && obj.hostname !== ga4blogger.host);
				};
				jQuery("a:external").mousedown(function () {
					var external = "(" + ga4blogger.get_text(this) + ") " + this.href;
					window._gaq.push(['_trackEvent', 'External Link', ga4blogger.path, external]);
				});
				jQuery("a[href*='#']").mousedown(function () {
					var hash = this.hash;
					if (hash) {
						hash = this.pathname + hash;
					} else {
						hash = this.pathname + "#";
					}
					hash = "(" + ga4blogger.get_text(this) + ") " + hash;
					window._gaq.push(['_trackEvent', 'Hash Link', ga4blogger.path, hash]);
				});
				if (ga4blogger.track_postview()) {
					jQuery(ga4blogger_track_postview).appear(function() {
						window._gaq.push(['_trackPageview', ga4blogger.str2link(jQuery(this).attr('href')).pathname]);
					});
				}
			} catch (e) {
				_track_error_event(e);
			}
		});
	},

	script_load : function (url, callback, id) {
		var script = document.createElement("script");
		script.type = "text/javascript";
		script.async = "true";
		script.src = url;
		if (id) {
			script.id = id;
		}
		if (callback) {
			if (script.readyState) { // for IE
				script.onreadystatechange = function () {
					if (script.readyState === "loaded" || script.readyState === "complete") {
						script.onreadystatechange = null;
						callback();
					}
				};
			} else {
				script.onload = function () {
					callback();
				};
			}
		}
		var script_aux = document.getElementsByTagName('script')[0];
		script_aux.parentNode.insertBefore(script, script_aux);
	},

	prepare_selectors : function (){
		if (ga4blogger.track_postview()) {
			// jQuery.appear v1.1.1
			(function($){$.fn.appear=function(f,o){var s=$.extend({one:true},o);return this.each(function(){var t=$(this);t.appeared=false;if(!f){t.trigger('appear',s.data);return;}var w=$(window);var c=function(){if(!t.is(':visible')){t.appeared=false;return;}var a=w.scrollLeft();var b=w.scrollTop();var o=t.offset();var x=o.left;var y=o.top;if(y+t.height()>=b||y<=b+w.height()&&x+t.width()>=a&&x<=a+w.width()){if(!t.appeared)t.trigger('appear',s.data);}else{t.appeared=false;}};var m=function(){t.appeared=true;if(s.one){w.unbind('scroll',c);var i=$.inArray(c,$.fn.appear.checks);if(i>=0)$.fn.appear.checks.splice(i,1);}f.apply(this,arguments);};if(s.one)t.one('appear',s.data,m);else t.bind('appear',s.data,m);w.scroll(c);$.fn.appear.checks.push(c);(c)();});};$.extend($.fn.appear,{checks:[],timeout:null,checkAll:function(){var l=$.fn.appear.checks.length;if(l>0)while(l--)($.fn.appear.checks[l])();},run:function(){if($.fn.appear.timeout)clearTimeout($.fn.appear.timeout);$.fn.appear.timeout=setTimeout($.fn.appear.checkAll,20);}});$.each(['append','prepend','after','before','attr','removeAttr','addClass','removeClass','toggleClass','remove','css','show','hide'],function(i,n){var u=$.fn[n];if(u){$.fn[n]=function(){var r=u.apply(this,arguments);$.fn.appear.run();return r;}}});})(jQuery);
		}

		ga4blogger.apply_selector();
	}
};

// http://www.directperformance.com.br/en/javascript-debug-simples-com-google-analytics
function _track_error_event(exception) {
	if (typeof(window._gaq) !== "undefined") {
		window._gaq.push(['_trackEvent', 'Exception ' + (exception.name || 'Error'), //event category
			exception.message || exception, //event action
			document.location.href //event label
		]);
	}
	if (typeof(console) !== "undefined" && typeof(console.error) !== "undefined") {
		console.error((exception.name || 'Error') + ": " + (exception.message || exception));
	}
}

try {
	ga4blogger.load_ga();
	if (typeof(jQuery) === "undefined") {
		ga4blogger.script_load(
			// jQuery - most recent version in the 1.x.x family
			ga4blogger.protocol + "//ajax.googleapis.com/ajax/libs/jquery/1/jquery.min.js",
			ga4blogger.prepare_selectors
		);
	} else {
		ga4blogger.prepare_selectors();
	}
} catch (e) {
	_track_error_event(e);
}
