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

    var data = {"OkPercent": 99.74439079806874, "KoPercent": 0.2556092019312695};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.9955978415222948, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.9911894273127754, 500, 1500, "View Transactions"], "isController": false}, {"data": [0.9945689069925322, 500, 1500, "View Draw Schedules"], "isController": false}, {"data": [0.0, 500, 1500, "Health Check - Version"], "isController": false}, {"data": [0.983739837398374, 500, 1500, "Check Wallet Balance"], "isController": false}, {"data": [0.9935897435897436, 500, 1500, "View Bet History"], "isController": false}, {"data": [0.88, 500, 1500, "Login"], "isController": false}, {"data": [0.9979494190020506, 500, 1500, "View Next Draw"], "isController": false}, {"data": [0.5, 500, 1500, "Banks List (Baseline)"], "isController": false}, {"data": [1.0, 500, 1500, "Place Bet (CRITICAL)"], "isController": false}, {"data": [0.9979892761394102, 500, 1500, "View Draw Results"], "isController": false}, {"data": [0.9903225806451613, 500, 1500, "Get Banks List"], "isController": false}, {"data": [1.0, 500, 1500, "Check Balance Before Bet"], "isController": false}, {"data": [0.9995602462620933, 500, 1500, "View Draws"], "isController": false}, {"data": [1.0, 500, 1500, "View Profile"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 7042, 18, 0.2556092019312695, 171.56035217267834, 150, 2156, 160.0, 178.0, 194.0, 456.0, 11.082852268506569, 25.187591244770978, 3.015749725368117], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["View Transactions", 227, 0, 0.0, 193.71365638766534, 166, 991, 177.0, 195.20000000000002, 214.79999999999995, 965.56, 0.4245379175947589, 0.9661466661617097, 0.2383879908369008], "isController": false}, {"data": ["View Draw Schedules", 1473, 7, 0.47522063815342835, 168.68295994568925, 151, 1968, 159.0, 170.0, 189.29999999999995, 333.26, 2.418369759377955, 8.443038954859562, 0.45580601910150914], "isController": false}, {"data": ["Health Check - Version", 1, 0, 0.0, 1666.0, 1666, 1666, 1666.0, 1666.0, 1666.0, 1666.0, 0.6002400960384153, 0.31008497148859543, 0.10609712635054022], "isController": false}, {"data": ["Check Wallet Balance", 246, 4, 1.6260162601626016, 175.30894308943084, 157, 1049, 163.0, 173.3, 179.64999999999998, 973.44, 0.42149342316054955, 0.09796429171114336, 0.23750166519886437], "isController": false}, {"data": ["View Bet History", 234, 0, 0.0, 181.71794871794862, 160, 1020, 168.0, 178.5, 184.75, 981.3, 0.42382244375296585, 1.4819723914317229, 0.23798623550581577], "isController": false}, {"data": ["Login", 50, 2, 4.0, 546.8599999999998, 444, 2156, 464.5, 597.4, 1253.7499999999998, 2156.0, 0.4157070761658505, 0.2512916798307241, 0.1092043002818494], "isController": false}, {"data": ["View Next Draw", 1463, 2, 0.1367053998632946, 163.5010252904988, 151, 993, 158.0, 167.0, 181.79999999999995, 290.1599999999994, 2.3970835210748374, 0.8591109885102199, 0.4517940620775816], "isController": false}, {"data": ["Banks List (Baseline)", 1, 0, 0.0, 1383.0, 1383, 1383, 1383.0, 1383.0, 1383.0, 1383.0, 0.7230657989877078, 24.86597862436732, 0.1348687183658713], "isController": false}, {"data": ["Place Bet (CRITICAL)", 160, 0, 0.0, 185.78124999999994, 173, 292, 183.5, 193.0, 200.89999999999998, 254.17999999999915, 0.3043381501185968, 0.07370689573184766, 0.28591142618563486], "isController": false}, {"data": ["View Draw Results", 1492, 3, 0.20107238605898123, 163.5415549597856, 150, 1089, 159.0, 167.0, 174.0, 284.04999999999905, 2.4205140185399694, 3.44875971977521, 0.4514825952550138], "isController": false}, {"data": ["Get Banks List", 155, 0, 0.0, 214.31612903225803, 158, 657, 168.0, 329.0, 355.39999999999947, 644.68, 0.2609884558912671, 8.975301244346653, 0.04868046394065628], "isController": false}, {"data": ["Check Balance Before Bet", 166, 0, 0.0, 167.38554216867462, 155, 420, 163.0, 173.0, 183.55000000000004, 361.0400000000011, 0.29849887433557026, 0.06937766805846263, 0.16819711962072662], "isController": false}, {"data": ["View Draws", 1137, 0, 0.0, 163.24626209322787, 150, 909, 159.0, 170.0, 178.0999999999999, 265.47999999999956, 1.8812418512611104, 2.0594454250622114, 0.4425738567360702], "isController": false}, {"data": ["View Profile", 237, 0, 0.0, 169.18987341772151, 160, 388, 167.0, 175.20000000000002, 183.1, 206.10000000000002, 0.4203014465818143, 0.18059827782812332, 0.23641956370227052], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["The operation lasted too long: It took 640 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.555555555555555, 0.014200511218403862], "isController": false}, {"data": ["The operation lasted too long: It took 631 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.555555555555555, 0.014200511218403862], "isController": false}, {"data": ["The operation lasted too long: It took 996 milliseconds, but should not have lasted longer than 300 milliseconds.", 1, 5.555555555555555, 0.014200511218403862], "isController": false}, {"data": ["The operation lasted too long: It took 529 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.555555555555555, 0.014200511218403862], "isController": false}, {"data": ["The operation lasted too long: It took 1,396 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.555555555555555, 0.014200511218403862], "isController": false}, {"data": ["The operation lasted too long: It took 1,968 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.555555555555555, 0.014200511218403862], "isController": false}, {"data": ["The operation lasted too long: It took 1,089 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.555555555555555, 0.014200511218403862], "isController": false}, {"data": ["The operation lasted too long: It took 551 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.555555555555555, 0.014200511218403862], "isController": false}, {"data": ["The operation lasted too long: It took 627 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.555555555555555, 0.014200511218403862], "isController": false}, {"data": ["The operation lasted too long: It took 948 milliseconds, but should not have lasted longer than 300 milliseconds.", 1, 5.555555555555555, 0.014200511218403862], "isController": false}, {"data": ["The operation lasted too long: It took 537 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.555555555555555, 0.014200511218403862], "isController": false}, {"data": ["The operation lasted too long: It took 999 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.555555555555555, 0.014200511218403862], "isController": false}, {"data": ["The operation lasted too long: It took 2,156 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 5.555555555555555, 0.014200511218403862], "isController": false}, {"data": ["The operation lasted too long: It took 1,238 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 5.555555555555555, 0.014200511218403862], "isController": false}, {"data": ["The operation lasted too long: It took 1,059 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.555555555555555, 0.014200511218403862], "isController": false}, {"data": ["The operation lasted too long: It took 506 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 5.555555555555555, 0.014200511218403862], "isController": false}, {"data": ["The operation lasted too long: It took 322 milliseconds, but should not have lasted longer than 300 milliseconds.", 1, 5.555555555555555, 0.014200511218403862], "isController": false}, {"data": ["The operation lasted too long: It took 1,049 milliseconds, but should not have lasted longer than 300 milliseconds.", 1, 5.555555555555555, 0.014200511218403862], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 7042, 18, "The operation lasted too long: It took 640 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 631 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 996 milliseconds, but should not have lasted longer than 300 milliseconds.", 1, "The operation lasted too long: It took 529 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 1,396 milliseconds, but should not have lasted longer than 500 milliseconds.", 1], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": ["View Draw Schedules", 1473, 7, "The operation lasted too long: It took 640 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 631 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 529 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 1,059 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 1,396 milliseconds, but should not have lasted longer than 500 milliseconds.", 1], "isController": false}, {"data": [], "isController": false}, {"data": ["Check Wallet Balance", 246, 4, "The operation lasted too long: It took 996 milliseconds, but should not have lasted longer than 300 milliseconds.", 1, "The operation lasted too long: It took 322 milliseconds, but should not have lasted longer than 300 milliseconds.", 1, "The operation lasted too long: It took 1,049 milliseconds, but should not have lasted longer than 300 milliseconds.", 1, "The operation lasted too long: It took 948 milliseconds, but should not have lasted longer than 300 milliseconds.", 1, "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["Login", 50, 2, "The operation lasted too long: It took 2,156 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, "The operation lasted too long: It took 1,238 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, "", "", "", "", "", ""], "isController": false}, {"data": ["View Next Draw", 1463, 2, "The operation lasted too long: It took 506 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 551 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["View Draw Results", 1492, 3, "The operation lasted too long: It took 1,089 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 537 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 999 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
