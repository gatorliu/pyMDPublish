	splitHeader= function(md) {
		var h=""
		var mdstring = md
		if ("---" == md.substring(0,3)) {
			mds = md.split('\n')
			var first = false
			var i=0
			for(i in mds) {
				if ("---" == mds[i].substring(0,3) && first == false) {
					first = true
					continue
				} else if("---" == mds[i].substring(0,3)) {
					i = parseInt(i) + 1
					break;
				}
			}
			h = mds.slice(0,i).join('\n')
			mdstring = mds.slice(i, mds.length).join('\n')
		}
		return [h, mdstring]
	}

	function getMDPath() {
		return [
			location.origin
			,location.search.replace(/^\?/, '')
			];
	};

	const renderer = {
  		link(href, title, text) {
			title =  title == null ? '' : '" title="'+ title
			if (href.search(/:[0-9]*\/\//) >= 0) { // 外部連結
				return '<a href="' + href + title + '">' + text + '</a>';
		    } else if (href.search(/\.md$/) >= 0) { // Other MD File
				var l = '<a href="" onclick="getMD(\''+  baseUrl + href +'\'); return false;">' + text + '</a>'
				return l;
			} else {	// Others
				return '<a href="' + baseUrl + href + title + '">' + text + '</a>';
			}
		  },
		heading(text, level, raw) {
			var anchor = this.options.headerPrefix + raw.toLowerCase().replace(/[^\w]+/g, '-');
			toc.push({
				anchor: anchor,
				level: level,
				text: text
			});
			return '<h'
				+ level
				+ ' id="'
				+ anchor
				+ '">'
				+ text
				+ '</h'
				+ level
				+ '>\n';
		}
	};
	// var mdstring
	//var config
	marked.use({ renderer });
	callback = function(data) {
		toc = [] // clean toc
		const [configs, mdstring]  = splitHeader(data)
		var markhtml = marked(mdstring, {
				//renderer: new marked.Renderer(),
				highlight: function(code, language) {
					var validLanguage = hljs.getLanguage(language) ? language : 'plaintext';
					return '<code class="hljs handlebars">' + hljs.highlight(validLanguage, code).value + '</code>';
					// return '<code class="hljs handlebars">' + hljs.highlightAuto(code).value
				},
				pedantic: false,
				gfm: true,
				breaks: false,
				sanitize: false,
				smartLists: true,
				smartypants: false,
				xhtml: false,
				baseUrl: baseUrl
				});
		
		var tocHTML = 'Table of Contents<ul>';
		toc.forEach(function (entry) {
		  tocHTML += '<li><a href="#'+entry.anchor+'">'+entry.text+'<a></li>\n';
		});
		tocHTML += '</ul>';
		$('#toc').html(tocHTML)
		$('#content').html(markhtml)
		$(document).attr("title",toc[0].text)

		MathJax.typesetPromise() // re-render Math
	}

	getMD_Local = function(mdpath, history_push=true) {
		if(history_push) {
			window.history.pushState({ 'mdpath': mdpath}, '');
		}
		fetch(mdpath)
		.then(response => response.text()).catch(function(){
				alert('Chrome Browser does not support.\n\nPlease start a web servivr (python -m http.server')
			})
		.then(text => callback(text))
	}
	getMD_Web = function(mdpath, history_push=true) {
		if(history_push) {
			window.history.pushState({ 'mdpath': mdpath}, '');
		}
		$.get(mdpath, callback);
	}

	window.addEventListener('popstate', function(event) {
		console.log(event)
		if (event.state == null)
			getMD(init_mdpath, false)
		else {
			console.log(event.state.mdpath) // event.state  always null  ????
			getMD(event.state.mdpath, false)
		}
	   });

	getMD = (location.protocol == 'file:') ? getMD_Local : getMD_Web