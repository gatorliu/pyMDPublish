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
	getDirDepth =  function(s) {
		if (s.substr(0,3) == "../") {
			return 1 + getDirDepth(s.substr(3))
		} else if (s.substr(0,2) == "./" ) { 
			return getDirDepth(s.substr(2))
		}
		else return 0;
	}
	getAbsMDpath =  function(baseUrl,  currUrl) {
		sp = baseUrl.split("/");
		d = Math.min( getDirDepth(currUrl)-1, sp.length) ;
		for (var i = 0; i <=d; i++) {
			if (currUrl.substr(0,3) == "../") {
				currUrl = currUrl.substr(3);
			} else if (currUrl.substr(0,2) == "./" ) continue;
			  else break;
		}
		//console.log(sp.slice(0,d).join('/'))
		//console.log(currUrl)
		return  sp.slice(0,d).join('/') + currUrl;
		
	}

	const renderer = {
  		link(href, title, text) {
			title =  title == null ? '' : '" title="'+ title
			if (href.search(/:[0-9]*\/\//) >= 0) { // 外部連結
				return '<a href="' + href + title + '" target="_blank">' + text + '</a>';
			}
			// Internal links form here
			if (href.search(/\.md$/) >= 0) { // Other MD File
				var l = '<a href="?' + getAbsMDpath(baseUrl, href)+ '">' + text + '</a>'
				return l;
			} else {	// Others
				return '<a href="' + baseUrl + href + title + '" target="_blank">' + text + '</a>';
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

	callback = function(data) {
		const [configstr, mdstring]  = splitHeader(data)
        var configs ={}
        jsyaml.loadAll(configstr, function (obj) {
            if (obj == null) return;
            configs =  obj
        });
        if (configs.type == undefined || configs.type.toLowerCase() != 'slide' ) {
 	        marked_callback(configs, mdstring)
        } else {
 	        revealjs_callback(configs, mdstring)
        }

    }

 	revealjs_callback = function(configs,mdstring) {

            if (configs.slideOptions != undefined) {
                opts = configs.slideOptions;
                //alert(opts.transition)
                if ( opts.transition != undefined ) {
                    $('#data-markdown').attr('data-transition', opts.transition)
                }
            }
        $('#revealjs-body').css('visibility', 'visible')    
		$('#revealjs-body').html(mdstring);

        Reveal.initialize({
            plugins: [ RevealMath.KaTeX, RevealMarkdown, RevealHighlight]
        });
    }

	// var mdstring
	//var config
    /* config and load  Math
        Cloudflare CDN not working. I don't know why
    */
    window.MathJax = {
        tex: {
            inlineMath: [['$', '$'], ['\\(', '\\)']]
        },
        svg: {
            fontCache: 'global'
        }
        };

        (function () {
        var script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js';
        script.async = true;
        document.head.appendChild(script);
    })();
	marked.use({ renderer });

    marked.setOptions({
        //renderer: new marked.Renderer(),
        highlight: function(code, language) {
            var validLanguage = hljs.getLanguage(language) ? language : 'bash' /* 'plaintext' */ ;
            return '<code class="hljs handlebars">' + hljs.highlight(validLanguage, code).value + '</code>';
            // return '<code class="hljs handlebars">' + hljs.highlightAuto(code).value
        },
        pedantic: false,
        gfm: true,
        breaks: false,
        sanitize: false,
        smartLists: true,
        smartypants: false,
        //xhtml: false,
        //baseUrl: baseUrl
    })
	marked_callback = function(configs, mdstring) {
        toc = [] // clean toc
        var markhtml = marked.parse(mdstring);
        if (configs.toc == undefined || configs.toc != false) {    
            var tocHTML = 'Table of Contents<ul>';
            toc.forEach(function (entry) {
                tocHTML += '<li><a href="#'+entry.anchor+'">'+entry.text+'<a></li>\n';
                });
            tocHTML += '</ul>';
            $('#toc').html(tocHTML)
            
        }
		
		$('.markdown-body').html(markhtml)
        $(document).attr("title",toc[0].text)
        if (MathJax.typesetPromise != undefined) MathJax.typesetPromise() // re-render Math
		//katex.render($('.markdown-body')) // re-render Math
	}

	getMD_Local = function(mdpath, history_push=true) {
		fetch(mdpath)
		.then(response => response.text()).catch(function(){
				alert('Chrome Browser does not support.\n\nPlease start a web servivr (python -m http.server')
			})
		.then(text => callback(text))
	}
	getMD_Web = function(mdpath, history_push=true) {
		$.get(mdpath, callback);
	}

	getMD = (location.protocol == 'file:') ? getMD_Local : getMD_Web