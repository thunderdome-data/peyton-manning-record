        var data = [];

        function load_gs_content(spreadsheet_data) {
  
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
            build_barchart(data);
            calc_stats(data);

        }
        function build_barchart(data) {
            var game_numbers = [];
            var graph_bars = '';
            var game_number;
            jQuery.each(data, function(i,row) {
                if(game_numbers[row.gamenumber]) {
                    game_number = '';

                }
                else {
                    game_numbers[row.gamenumber] = row.gamenumber;
                    game_number = 'GM ' + row.gamenumber;
                }
                var source   = $('#dfm-bar-graph-template').html();
                var template = Handlebars.compile(source);
                if(parseInt(row['airyardsdistance-yac']) < 0) { row['airyardsdistance-yac'] = 0; }
                var context = {'game_number':game_number,'pass_yards':row['airyardsdistance-yac'],'run_yards':row.yac,'receiver':row.scorerreceiver,'url':row.gamestoryurl};

                graph_bars += template(context);

            });
            jQuery('#dfm-graph-container').html(graph_bars);
            jQuery('.dfm-graph-bar-pass,.dfm-graph-bar-run').each(function(){
                jQuery(this).tooltip({ position: { my: "left bottom-5",at:"center top",collision:"flip fit"}});
            
            });
            jQuery('.dfm-graph-bar').on('click',function() {
                open_tab(jQuery(this).attr('data-url'));
            });

        }
        
        function calc_stats(data) {
            var individual_stats = {};
            individual_stats['all'] = {yards:0,peyton:0,tds:1};
            
            jQuery.each(data,function(i,row) {
                if(parseInt(row['airyardsdistance-yac']) < 0) { row['airyardsdistance-yac'] = 0; }
                individual_stats.all.yards += parseInt(row.yac);
                individual_stats.all.peyton += parseInt(row['airyardsdistance-yac']);
                individual_stats.all.tds++;
                if(individual_stats[row.scorerreceiver]) {
                    individual_stats[row.scorerreceiver].yards += parseInt(row.yac);
                    individual_stats[row.scorerreceiver].peyton += parseInt(row['airyardsdistance-yac']);
                    individual_stats[row.scorerreceiver].tds++;
                
                }
                else {
                    individual_stats[row.scorerreceiver] = 
                        {
                         yards:parseInt(row.yac),
                         peyton:parseInt(row['airyardsdistance-yac']),
                         tds: 1
                        };
                }
            
            });
            //chrome screws up the pie chart, so we aren't building it
//            build_piechart('Manning vs. all receivers',individual_stats.all,'All receivers');
            if(window.navigator.appVersion.match(/Chrome\/(31.*?) /)) { // fix for chrome v31
                var pie_text = jQuery('#all-receivers-pie-chart g text');
                var chrome_fix = jQuery(pie_text[1]).attr('x') - 30;
                jQuery(pie_text[1]).attr('x',chrome_fix);
            }
 
            var stat_rows = '';
            individual_stats = sort_values(individual_stats,'yards',-1);
            jQuery.each(individual_stats,function(i,individual_stat) {
                if(i !== 'all') {
                    stat_rows += '<tr class="stats-table-row"><td>' + [i,individual_stat.peyton,individual_stat.yards,individual_stat.tds].join('</td><td class="stat">') + '</td></tr>';
                }
            });
            jQuery('.stats-table-rows').html(stat_rows);
        }
        
        function build_piechart(title,individual_stat,receiver) {
            var data_table = google.visualization.arrayToDataTable([
                ['Player', 'Total Yards'],
                [receiver, individual_stat.yards],
                ['Peyton Manning', individual_stat.peyton]
            ]);
            var options = {
                chartArea:{left:10,top:10,width:"90%",height:"90%"},
                colors: ['#f9b446','#e08900'],
//                tooltip: { 'trigger': 'none' },
                legend: 'none',
                pieSliceText: 'none'
            };
            var chart = new google.visualization.PieChart(document.getElementById('all-receivers-pie-chart'));
            chart.draw(data_table, options);        
        }
      
        function open_tab(url) {
            var win=window.open(url, '_blank');
            win.focus();
        
        }
        function sort_values(object,key,direction) {
            var sorted = [];
            var sorted_object ={};
            for(i in object) {
                sorted.push([i,object[i]]);
            }
            if(direction == -1) {
                sorted.sort( function(a,b) { return a[1][key] - b[1][key]});
            }
            else {
                sorted.sort( function(a,b) { return b[1][key] - a[1][key]});    
            
            }
            sorted = sorted.reverse();
            for(var i = 0; i < sorted.length; i++) {
                sorted_object[ sorted[i][0] ] = sorted[i][1];
            }
            return sorted_object;

        }
