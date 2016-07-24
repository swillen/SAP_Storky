	 $( document ).ready(function() {
		    $.getJSON("../main.menu", function(data) {
				$.each(data, function(i, item) {
					var itemContent = "";
					if (item.subMenu.length > 0) {
						itemContent += "<li class=\"dropdown\"><a href=\"#\" class=\"dropdown-toggle\" data-toggle=\"dropdown\">" + item.name + " <b class=\"caret\"></b></a>";
						itemContent += "<ul class=\"dropdown-menu\">";
						$.each(item.subMenu, function(j, subitem) {
							itemContent += "<li><a href=\"" + subitem.link + "\" >" + subitem.name + "</a></li>";
						});
						itemContent += "</ul>";
					} else {
						itemContent += "<li><a href=\"" + item.link + "\" >" + item.name + "</a>";
					}
					itemContent += "</li>"
					$("#main-menu").append(itemContent);
				});
			});
		  });
	