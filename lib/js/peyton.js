var sked = {13:'vs. TEN',14:'vs. SD',15:'@ HOU',16:'@ OAK'};
var timeout;
var season_end = false;
jQuery('#popover').hide();
var load_gs_content = function(spreadsheet_data) {
    var data = [];
	var keyPattern = /gsx/;
	for(i in spreadsheet_data.feed.entry) {
		var row = {};
		for(j in spreadsheet_data.feed.entry[i]) {
			if(keyPattern.test(j)) {
				var key = j.replace('gsx$','');
				row[key] = spreadsheet_data.feed.entry[i][j].$t;				
			}
			
		}
		data.push(row);
	}
	calc_data(data);
}
var calc_data = function(data) {
    var total_tds = 0, total_yds = 0, max_weeks = 17, record_tds = 50, total_games = 17
    , record_yds = 5476, byes = 0, complete = 0, tds_broken = 'no',yds_broken = 'no'
    ,record_week_tds = '',record_week_yds = '';
    var weeks = data.length;
    jQuery.each(data,function(i,week) {
        if(parseInt(week.yards) === -1) {
            byes++;
        }
        else {
            if(week.complete && week.complete === 'no') {
                complete++;
                jQuery('.dfm-asterisk').text('*');
                jQuery('#dfm-note').text('* Not including game in progress.');
            }
            total_yds += parseInt(week.yards);
            total_tds += parseInt(week.tds);
            if(total_tds > record_tds && tds_broken === 'no') {
                record_week_tds = week.week;
                tds_broken = 'yes';
            }
            if(total_yds > record_yds && yds_broken === 'no') {
                record_week_yds = week.week;
                yds_broken = 'yes';
            }

        }
    });
    var tds_per_game = total_tds/(weeks - byes - complete);
    var yds_per_game = total_yds/(weeks - byes - complete);
    if(tds_broken !== 'yes') {
//        var record_week_tds = Math.ceil((record_tds + 1)/tds_per_game);
        record_week_tds = Math.ceil(weeks + ((record_tds + 1 - total_tds)/tds_per_game));

    }
    if(yds_broken !== 'yes') {
//        record_week_yds = Math.ceil((record_yds + 1)/yds_per_game);
        record_week_yds = Math.ceil(weeks + ((record_yds + 1 - total_yds)/yds_per_game) );

    }
    tds_per_game = tds_per_game.toFixed(1);
    yds_per_game = yds_per_game.toFixed(1);
    tds_projected = Math.round(total_tds + ((total_games - weeks) * tds_per_game));
    yds_projected = Math.round(total_yds + ((total_games - weeks) * yds_per_game));
    if((weeks - complete) >=17) { season_end = true; }
    build_page(data,record_week_tds,record_week_yds,tds_per_game,yds_per_game,tds_broken,yds_broken,tds_projected,yds_projected,total_tds,total_yds);
}

var build_page = function(data,record_week_tds,record_week_yds,tds_per_game,yds_per_game,tds_broken,yds_broken,tds_projected,yds_projected,total_tds,total_yds) {
    jQuery('#games-remaining').text( 17 - data.length );
    var bar_offset = jQuery('#tds').offset();
    
    jQuery('.progress').addClass('wk' + data.length);
    var current_tds_record = 53, current_yds_record = 5475;
    var record_broken = 'no';
    if(record_week_tds > 17) {
        if(season_end) {
            var tds_text = "Peyton Manning did not break the TD passing record ";   
        }
        else {
            var tds_text = "Peyton Manning is not currently on track to break the TD passing record "; 
        }
    }
    else {
        var tds_text = "Peyton Manning is currently on track to break the TD passing record in week " + record_week_tds;
    }
    
    if(record_week_yds > 17) {
        if(season_end) {
            var yds_text = " and did not break the passing yards record.";   
        }
        else {
            var yds_text = " and is not on track to break the passing yards record.";
        }
    }
    else {
        var yds_text = " and is on track to break the passing yards record in week " + record_week_yds + '.';
    }
    if(tds_broken === 'yes' || yds_broken === 'yes') {
        record_broken = 'yes';
        if(tds_broken === 'yes') {
            tds_text = "Peyton Manning broke the TD passing record in week " + record_week_tds;
            jQuery('#tds-record').html(total_tds + '<span>TDS</span>');
        }
        if(yds_broken === 'yes') {
            yds_text = " and broke the passing yards record in week " + record_week_yds;
            jQuery('#yards-record').html(total_yds.formatNumber(0,',') + '<span>YDS</span>');
        }

    }
    jQuery('.answer').text(record_broken);
    jQuery('#rundown').text(tds_text + yds_text);
    jQuery('#tds-projected').html(tds_projected.formatNumber(0,',') + ' (' + tds_per_game + ' per game)');
    jQuery('#yds-projected').html(yds_projected.formatNumber(0,',') +  ' (' + yds_per_game + ' per game)');
    jQuery('#current-tds').html(total_tds + '<span>TDS</span>');
    jQuery('#current-yards').html(total_yds.formatNumber(0,',') + '<span>YDS</span>');
    jQuery('#tds > .dot').each( function( i, el) {
        var offset = jQuery(el).offset();
        var left = parseInt(offset.left) - parseInt(bar_offset.left);
        if(data[i]) {
            var tds = '';
            if(parseInt(data[i].tds) !== -1) {
                jQuery(el).addClass('past');
                jQuery(el).attr({'type': 'tds','left': left,'top': offset.top,'data-title':'Week ' + data[i].week + ':', 'title':'Week ' + data[i].week, 'data-content': data[i].tds});
            }
            else {
                jQuery(el).addClass('bye');
                jQuery(el).attr({'title': 'Week ' + data[i].week + ' was a bye for Denver'});
            }
        }
        else {
                jQuery(el).addClass('future');
                jQuery(el).attr({'title': 'Week ' + (i + 1),'data-title': 'Week ' + (i + 1),'type': 'future-tds','left': left,'top': offset.top,'data-content':sked[i]});
        }
    });
    jQuery('#yds > .dot').each( function( i, el) {
        var offset = jQuery(el).offset();
        var left = parseInt(offset.left) - parseInt(bar_offset.left);
        if(data[i]) {
            if(parseInt(data[i].tds) !== -1) {
                jQuery(el).addClass('past');
                jQuery(el).attr({'type':'yds','left': left,'top': offset.top,'data-title':'Week ' + data[i].week + ':', 'title':'Week ' + data[i].week,'data-content': data[i].yards});
            }
            else {
                jQuery(el).addClass('bye');
                jQuery(el).attr({'title': 'Week ' + data[i].week + ' was a bye for Denver'});
            }
        }
        else {
//                jQuery(el).attr({'title': 'Week ' + (i + 1)});
                jQuery(el).addClass('future');
                jQuery(el).attr({'title': 'Week ' + (i + 1),'data-title': 'Week ' + (i + 1),'type': 'future','left': left,'top': offset.top,'data-content':sked[i]});
        }
    });
    jQuery('.past, .future').on("mouseenter", function(e) {
            var event = e;
            var el = this;
            timeout = setTimeout(function() {
                var stat_type = '<span>YDS</span>';
                var top = 120;
                jQuery('#popover').hide();
                if(jQuery(el).attr('type') === 'tds') {
                     parseInt(jQuery(el).attr('data-content')) === 1? stat_type = '<span>TD</span': stat_type = '<span>TDS<span>';
                     top = -24;
                }
                if(jQuery(el).attr('type') === 'future') {
                    stat_type = '';
                }
                if(jQuery(el).attr('type') === 'future-tds') {
                    stat_type = '';
                    top = -24
                }
                
                
                jQuery('.popover-label').html(jQuery(el).attr('data-title'));
                jQuery('.popover-number').html(jQuery(el).attr('data-content') + stat_type);
                var left = parseInt(jQuery(el).attr('left')) - 37;
                
                jQuery('#popover').css({'left':left,'top':top}).show();
            },100);
        });
    jQuery('.past, .future').on("mouseleave", function(e) { 
        clearTimeout(timeout);
        jQuery('#popover').hide(); 
    });

}
Number.prototype.formatNumber = function (c, d, t) {
    var n = this,
        c = isNaN(c = Math.abs(c)) ? 2 : c,
        d = d == undefined ? "," : d,
        t = t == undefined ? "." : t,
        s = n < 0 ? "-" : "",
        i = parseInt(n = Math.abs(+n || 0).toFixed(c)) + "",
        j = (j = i.length) > 3 ? j % 3 : 0;
    return s + (j ? i.substr(0, j) + d : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + d) + (c ? t + Math.abs(n - i).toFixed(c).slice(2) : "");
};

