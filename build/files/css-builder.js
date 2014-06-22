jQuery(function($) {
 var winURL = (window.URL || window.webkitURL);
 var objectURL1 = null, objectURL2 = null;
 $.ajax({url: "../assets/css/less/ace-features.less"}).done(function(less_file_data) {
	var sections = []
	var regex = /\/\/~([\w\- \&]+)/gi;
	var matches;
	while ((matches = regex.exec(less_file_data)) !== null)
	{
		sections.push({'title' : matches[1] , 'index': matches.index})
	}
	sections.push({'title' : 'EOF' , 'index': less_file_data.length})
	
			
	var depend_on = {}
	var depend_off = {}
	
	$(sections).each(function(i, info) {
		if(info.title == 'EOF') return;
		
		var next_info = sections[i + 1];
		var sub = less_file_data.substring(info.index + info.title.length + 4 , next_info.index - 1);
		sub = $.trim(sub);
		
		if(sub.length == 0) return;

		var vars = [];
		var regex = /@([\w\-]+)\:\s+([a-z]+);(?:\/\/(.*))?/gi;
		var matches;
		while ((matches = regex.exec(sub)) !== null) {
			vars.push({'name': matches[1], 'value': matches[2], 'description': matches[3]})
		}

		var section_name = info.title.toLowerCase().replace(/\W/g, '');
		$('<hr /><h4 class="text-primary"><div class="checkbox"><label><input checked type="checkbox" class="section" name="'+section_name+'" /> '+info.title+'</label></div></h4>').appendTo('#page-content');
		var group = $('<div class="list-group" />').appendTo('#page-content');

		
		$(vars).each(function(i, lessvar) {
			//lessvar.name
			//lessvar.value
			//lessvar.description
			var description = lessvar.description || '';
			if(description == '!ignore') return;
			
			var label = $('<label />').appendTo(group);
			var check = $('<input type="checkbox" name="less-var" data-section="'+section_name+'" />').prependTo(label);
			check.attr({'id' : 'id-'+lessvar.name , 'data-varname' : lessvar.name})
			check.get(0).checked = lessvar.value == 'true'
			label.wrap('<div class="checkbox list-group-item" />');
			if(lessvar.value == 'true') label.parent().addClass('active');

			
			var match
			if(description.length > 0 && (match = description.match(/\+@enable\-([\w\-]+)/))) {
				var depends = match[1];
				
				//check if a variable (feature) depends on another one
				//we should automatically enable that if so
				if(!(lessvar.name in depend_on)) depend_on[lessvar.name] = []
				depend_on[lessvar.name].push('enable-'+depends);//enable "'enable-'+depends" when lessvar.name is enabled
				
				if(!('enable-'+depends in depend_off)) depend_off['enable-'+depends] = []
				depend_off['enable-'+depends].push(lessvar.name);//disable "lessvar.name" when "'enable-'+depends" is disabled
				//for example auto-disable switch elements when checkboxes are disabled/unselected
				//or auto-enable checkboxes when switch elements are enabled/selected

				description = description.replace(match[0], '');
			}
			
			label.append(description);
		});	
	});


	$(document).on('click', 'input[type=checkbox][name=less-var]', function(e){
		$(this).closest('.list-group-item').toggleClass('active');
		
		var varname = $(this).data('varname');
		if(this.checked && varname in depend_on) {
			//we need another part to be enabled as well
			enable_depends(depend_on[varname]);				
		}		
		else if(!this.checked && varname in depend_off) {
			//we need to disable dependent parts as well
			//but we should do it recursively as `depend_off[varname]` is an array
			disable_depends(depend_off[varname]);
		}
	});
	
	
	$(document).on('click', 'input[type=checkbox].section', function(){
		var name = this.name;
		var checked = this.checked;
		$('input[type=checkbox][name=less-var][data-section="'+name+'"]').each(function() {
			this.checked = checked;
			if(checked) $(this).closest('.list-group-item').addClass('active');
			else $(this).closest('.list-group-item').removeClass('active');
		});
	});
	
	
	//for example when we disable "checkboxes" , "switch elements" are disabled automatically
	//and switch styles 4,5,6,7 are also dependent on "switch elements" so they get disabled as well
	function disable_depends(depend_offs) {
		$(depend_offs).each(function(i, varname) {
			$('#id-'+varname).get(0).checked = false;
			$('#id-'+varname).closest('.list-group-item').removeClass('active');
			if(varname in depend_off) {
				//if it contains another list of dependents
				disable_depends(depend_off[varname]);
			}
		});
	}
	
	function enable_depends(depend_ons) {
		$(depend_ons).each(function(i, varname) {
			$('#id-'+varname).get(0).checked = true;
			$('#id-'+varname).closest('.list-group-item').addClass('active');
			if(varname in depend_on) {
				//if it contains another list of dependents
				enable_depends(depend_on[varname]);
			}
		});
	}


});





$('#btn-build-css').on('click', function() {
	releaseUrlObjects();
	function showModal() {
		$('#btn-build-css').button('reset').removeClass('disabled');
		$('#btn-launch-modal').removeClass('hide');
		$('#modal-save-dialog').modal('show');
	}

	$(this).button('loading').text('Please wait...').addClass('disabled');

	var updateVars = {}
	$('input[type=checkbox][name=less-var]').each(function() {
		var varname = $(this).data('varname');
		updateVars[varname] = this.checked ? 'true' : 'false';
	});
	
	if(updateVars['enable-checkbox-asp'] === 'true') {
		updateVars['lbl_selector'] = '~ .lbl';//asp.net friendly selector
	}

	setTimeout(function() {
		parser.parse(' @import "../assets/css/less/ace.less"; ', process_output, {modifyVars: updateVars});
	} , 100);

	var parser = new(less.Parser)({});
	function process_output (e, tree) {
		var compress = $('#id-compress-css').get(0).checked;
		if(e) {
			console.log(e);
			return;
		}
		var css_output = tree.toCSS({
			'compress': compress
		});
		
		$('#save-buttons .output-size').remove();

		objectURL1 = css_output.length == 0 ? 'javascript:void(0)' : winURL.createObjectURL(new Blob([css_output], {type : 'text/css'}))

		$('#btn-save-css')
		.attr({'download' : 'ace'+(compress ? '.min':'')+'.css'})
		.find('.filesize').remove().end()
		.append('<span class="filesize"> ('+readableSize(css_output.length)+')</span>')
		.get(0).href = objectURL1;

		$('#modal-ie-alert').addClass('hide');
		$('#btn-save-css-extra').addClass('hide');


		//Here we try to count the output CSS's selector count for IE's limitations
		//I'm not familiar with inner workings of LESS parser
		//so to get a tree of the output CSS, let's parse it again!
		//It may not be the correct approach though!
		parser.parse(css_output, function($e, $tree) {
			if($e) {
				showModal();
				console.log($e);
				return;
			}

			var rules = $tree.rules;
			var totalSelectors = 0;
			var lastIndex = -1;//the index to split CSS files from
			
			var ie_limit = 4090;//4095;

			for(var i = 0, l = rules.length; i < l ; i++) {
				var rule = rules[i];
				if(rule.type == "Ruleset") {
					totalSelectors += rule.selectors.length;
					if(totalSelectors > ie_limit) break;
					lastIndex = rule.selectors[0].elements[0].index;
				}
				else if(rule.type == "Media") {
					var $rules = rule.rules[0].rules;
					for(var k = 0 ; k < $rules.length; k++) {
						if($rules[k].type == "Ruleset") {
							totalSelectors += $rules[k].selectors.length;
						}
					}
				}
				if(totalSelectors > ie_limit) break;
			}
			
			
			var css_part2 = '';
			if(totalSelectors > ie_limit) {
				css_part2 = css_output.substring(lastIndex , css_output.length);
			}
			

			if(totalSelectors > ie_limit && css_part2.length > 0) {
				$('#id-selector-limit').hide()//.html('Maximum CSS selectors allowed: <b class="text-info">4096</b>, Current CSS selectors: <b class="text-warning">' + num + '</b>');
				$('.ie-alert-min').text(compress ? '.min' : '');
				
				objectURL2 = css_part2.length == 0 ? 'javascript:void(0)' : winURL.createObjectURL(new Blob([css_part2], {type : 'text/css'}))
				
				$('#modal-ie-alert').removeClass('hide');
				$('#btn-save-css-extra').removeClass('hide')
				.attr({'download' : 'ace-part2'+(compress ? '.min':'')+'.css'})
				.find('.filesize').remove().end()
				.append('<span class="filesize"> ('+readableSize(css_part2.length)+')</span>')
				.get(0).href = objectURL2
			}


			var options = [];
			if(compress) options.push('minified');
			$('.modal-title').find('.text-muted').remove().end().append(options.length == 0 ? '' : '<span class="text-muted"> ('+options.join('/')+')</span>');

			showModal();
		})
	}

 })
 
 $(window).on('unload' , function() {
	releaseUrlObjects();
 });

 function releaseUrlObjects() {
	if(objectURL1 && typeof objectURL1 === "object") winURL.revokeObjectURL(objectURL1);
	if(objectURL2 && typeof objectURL1 === "object") winURL.revokeObjectURL(objectURL2);
	objectURL1 = objectURL2 = null;
 }

 function readableSize(size) {
	var val = size, index = 0;
	while(val > 1024) {
	 val = val / 1024;
	 index++;
	}
	var format = ['bytes', 'KB', 'MB', 'GB'];
	val = val.toFixed(1).replace(/(\.0+)$/g, '');
	//if(parseInt(val) > 100) val = parseInt(Math.round(val));
	return val + ' ' + format[index];
 }
});