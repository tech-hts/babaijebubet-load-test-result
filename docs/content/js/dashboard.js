/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 97.55959137343928, "KoPercent": 2.4404086265607265};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.9736095346197503, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [1.0, 500, 1500, "View Transactions"], "isController": false}, {"data": [0.9972451790633609, 500, 1500, "View Draw Schedules"], "isController": false}, {"data": [0.0, 500, 1500, "Health Check - Version"], "isController": false}, {"data": [0.9682539682539683, 500, 1500, "Check Wallet Balance"], "isController": false}, {"data": [0.9830508474576272, 500, 1500, "View Bet History"], "isController": false}, {"data": [0.92, 500, 1500, "Login"], "isController": false}, {"data": [1.0, 500, 1500, "View Next Draw"], "isController": false}, {"data": [0.5, 500, 1500, "Banks List (Baseline)"], "isController": false}, {"data": [0.0, 500, 1500, "Place Bet (CRITICAL)"], "isController": false}, {"data": [1.0, 500, 1500, "View Draw Results"], "isController": false}, {"data": [1.0, 500, 1500, "Get Banks List"], "isController": false}, {"data": [1.0, 500, 1500, "Check Balance Before Bet"], "isController": false}, {"data": [1.0, 500, 1500, "View Draws"], "isController": false}, {"data": [1.0, 500, 1500, "View Profile"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 1762, 43, 2.4404086265607265, 172.29568671963648, 3, 2907, 158.0, 172.70000000000005, 262.8499999999999, 458.0, 5.205917373050367, 11.141591322560059, 1.3993401612371883], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["View Transactions", 53, 0, 0.0, 165.30188679245282, 157, 185, 165.0, 173.0, 174.0, 185.0, 0.22917234192513417, 0.07452577134870085, 0.1286856412177267], "isController": false}, {"data": ["View Draw Schedules", 363, 1, 0.27548209366391185, 167.99173553718992, 151, 1540, 157.0, 168.60000000000002, 196.60000000000002, 356.2400000000008, 1.172874609041797, 4.094752663402758, 0.22105937455572933], "isController": false}, {"data": ["Health Check - Version", 1, 0, 0.0, 2907.0, 2907, 2907, 2907.0, 2907.0, 2907.0, 2907.0, 0.3439972480220158, 0.1777095158238734, 0.06080420106639147], "isController": false}, {"data": ["Check Wallet Balance", 63, 2, 3.1746031746031744, 187.33333333333331, 156, 1001, 160.0, 167.2, 177.2, 1001.0, 0.22694197489949713, 0.05119491816580453, 0.12787648390332992], "isController": false}, {"data": ["View Bet History", 59, 0, 0.0, 189.57627118644064, 157, 985, 162.0, 168.0, 175.0, 985.0, 0.23660950608768186, 0.07694430227265436, 0.1328617832035323], "isController": false}, {"data": ["Login", 25, 1, 4.0, 542.8399999999999, 434, 1886, 452.0, 800.6000000000015, 1691.5999999999995, 1886.0, 0.42279722645019446, 0.25557762028581094, 0.1110668495264671], "isController": false}, {"data": ["View Next Draw", 352, 0, 0.0, 160.51420454545456, 149, 331, 156.0, 166.0, 178.69999999999993, 268.46999999999997, 1.1629059433744096, 0.4167836730648518, 0.21918051471802835], "isController": false}, {"data": ["Banks List (Baseline)", 1, 0, 0.0, 1364.0, 1364, 1364, 1364.0, 1364.0, 1364.0, 1364.0, 0.7331378299120235, 25.212352226906155, 0.13674738819648094], "isController": false}, {"data": ["Place Bet (CRITICAL)", 39, 39, 100.0, 8.128205128205128, 3, 40, 6.0, 14.0, 33.0, 40.0, 0.15698207989180313, 0.06469378683041105, 0.12294885554025986], "isController": false}, {"data": ["View Draw Results", 373, 0, 0.0, 161.04289544235925, 151, 390, 157.0, 166.0, 174.3, 274.8599999999999, 1.1583635087544952, 1.6504417571023522, 0.2160619435274498], "isController": false}, {"data": ["Get Banks List", 40, 0, 0.0, 313.59999999999997, 157, 468, 316.0, 418.59999999999997, 440.95, 468.0, 0.1377994122855066, 4.738873343392691, 0.025702820064972424], "isController": false}, {"data": ["Check Balance Before Bet", 40, 0, 0.0, 160.32500000000002, 154, 174, 159.5, 165.9, 172.85, 174.0, 0.15470476529353294, 0.0349785359224465, 0.08717250934996924], "isController": false}, {"data": ["View Draws", 291, 0, 0.0, 161.44673539518908, 150, 390, 157.0, 169.8, 180.0, 245.75999999999806, 0.9482379392932205, 1.038061259714551, 0.22336657563093668], "isController": false}, {"data": ["View Profile", 62, 0, 0.0, 164.33870967741942, 158, 189, 164.0, 169.0, 172.85, 189.0, 0.2369061584137986, 0.0999447855808213, 0.13325971410776175], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["400/Bad Request", 39, 90.69767441860465, 2.213393870601589], "isController": false}, {"data": ["The operation lasted too long: It took 1,886 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 2.3255813953488373, 0.056753688989784334], "isController": false}, {"data": ["The operation lasted too long: It took 972 milliseconds, but should not have lasted longer than 300 milliseconds.", 1, 2.3255813953488373, 0.056753688989784334], "isController": false}, {"data": ["The operation lasted too long: It took 1,540 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 2.3255813953488373, 0.056753688989784334], "isController": false}, {"data": ["The operation lasted too long: It took 1,001 milliseconds, but should not have lasted longer than 300 milliseconds.", 1, 2.3255813953488373, 0.056753688989784334], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 1762, 43, "400/Bad Request", 39, "The operation lasted too long: It took 1,886 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, "The operation lasted too long: It took 972 milliseconds, but should not have lasted longer than 300 milliseconds.", 1, "The operation lasted too long: It took 1,540 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 1,001 milliseconds, but should not have lasted longer than 300 milliseconds.", 1], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": ["View Draw Schedules", 363, 1, "The operation lasted too long: It took 1,540 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["Check Wallet Balance", 63, 2, "The operation lasted too long: It took 972 milliseconds, but should not have lasted longer than 300 milliseconds.", 1, "The operation lasted too long: It took 1,001 milliseconds, but should not have lasted longer than 300 milliseconds.", 1, "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["Login", 25, 1, "The operation lasted too long: It took 1,886 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["Place Bet (CRITICAL)", 39, 39, "400/Bad Request", 39, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
