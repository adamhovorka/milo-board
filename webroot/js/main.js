$(function() {

// jQuery plugin to disable selection
$.fn.extend({ 
	disableSelection: function() { 
		this.each(function() { 
			if (typeof this.onselectstart != 'undefined') {
				this.onselectstart = function() { return false; };
			} else if (typeof this.style.MozUserSelect != 'undefined') {
				this.style.MozUserSelect = 'none';
			} else {
				this.onmousedown = function() { return false; };
			}
		}); 
	} 
}); $("html").disableSelection();

function loadBoard(boardname) {
	$.get("/boards/" + boardname + ".json", function(data) {
		var board = data.content, max = 0;
		$("table").html("<tbody></tbody>");
		if (data.top) { $("tbody").append("<tr><td id='top'>Meh<div id='speak'>Speak</div></td></tr>");
		} else if (data.back) { $("tbody").append("<tr><td id='top' class='back'>Back</td></tr>"); }
		$("td#top").data("value", "meh");
		for (var i=0;i<board.length;i++) {
			var row = board[i];
			$("tbody").append("<tr id='" + i + "'></tr>");
			for (var j=0;j<row.length;j++) {
				if (row.length > max) max = row.length;
				var item = row[j], hotkey = "", speak = "", menu = "", back = "";
				if (item.hotkey) { hotkey = "<div class='hotkey'>" + item.hotkey + "</div>" }
				if (item.speak) { speak = " speak=\"" + item.speak + "\"" }
				if (item.menu) { menu = " menu=\"" + item.menu + "\"" }
				$("tr#" + i).append("<td" + speak + menu + back + ">" + item.label + hotkey + "</td>");
			}
		}
		$("td#top").attr("colspan", max);
		$("td").disableSelection();
		activateOnClick();
	});
}

function activateOnClick() {
	$("td").click(function() {
		if ($(this).attr("speak")) {
			$("td").removeClass("bg-base02");
			$(this).addClass("bg-base02");
			$.post("/speak", JSON.stringify({
				"content": $(this).attr("speak")
			}), function() {});
		}

		if ($(this).attr("menu")) {
			boardlist.push($(this).attr("menu"));
			loadBoard($(this).attr("menu"));
		}
	});

	$("div#speak").click(function() {
		$.post("/speak", JSON.stringify({
			"content": $("td#top").data("value")
		}), function() {});
	});

	$("td#top.back").click(function() {
		boardlist.pop();
		loadBoard(boardlist[boardlist.length - 1]);
	});
}

var boardlist = ["main"];
loadBoard("main");

});
