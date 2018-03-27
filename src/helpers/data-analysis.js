import moment from 'moment';
import Chart from 'chart.js';

const Report = {};

Report.install = function(Vue, options) {
    // Generate the dates of the past Monday - Friday
    Vue.prototype.$generateDays = function () {
        var days = [];
        for (var i = 0; i <= 4; i++ ) {
            var singleDay = moment().day(-2).subtract(i,'days').format("YYYY-MM-DD");
            days.unshift(singleDay);
        }
        return days;
    }

    Vue.prototype.$emptyBar = function(id, days) {
        // Generate an empty bar graph
        new Chart(document.getElementById(id), {
            type: 'bar',
            data: {
              labels: days,
            },
            options: {
                responsive: false,
                maintainAspectRatio: true,
                scales: {
                    yAxes: [{
                      ticks: {
                        beginAtZero: true,
                        suggestedMax: 100
                      },
                     
                    }]
                  },
                }   
        })
    }

    Vue.prototype.$emptyDoughnut = function(id) {
        // Generate an empty doughnut graph with no data
        new Chart(document.getElementById(id), {
            type: 'doughnut',
            data: {
                labels: ["No Patients"],
                datasets: [{
                    data: [1],
                }]
            },
            options: {
                responsive: false,
                maintainAspectRatio: true,
                legend: {
                    display: true,
                    position: "left",
                    labels: {fontSize: 14},
                    // By default Chart JS removes data when you click it on the legend. Override the default action so it does nothing. 
                    onClick: null
                  },
            }
        })
    }

    Vue.prototype.$getTrends = function(data) {
         // Create 2 arrays - 1 for holding the positive trends and 1 for holding the negative trends
        var positiveTrends = [], negativeTrends = [];
        var startIndex = 0;
        // Determine the positive trends first. Loop through the data
        for(var i = 0; i < data.length; i++) {
            // If the data at one index is less than the one at the next, this is the start of a positive trend
            if(data[i] <= data[i+1]) {
            continue;
            } else {
            // When the if condition fails, push the starting index and ending index of the positive trend into an array  
            positiveTrends.push({
            start: startIndex, 
            end: i
          })
          // Set the new starting index
          startIndex = i + 1
        }
      }
      // Remove the instances where start and end values are the same. 
      positiveTrends = positiveTrends.filter(trend => trend.start != trend.end);
      
      // Determine the negative trends next. Reset the startIndex variable to 0. 
      startIndex = 0;
      for(var i = 0; i < data.length; i++) {
            // If the data at one index is greater than the one at the next, this is the start of a negative trend. 
            if(data[i] >= data[i+1]) {
              continue;
            } else {
              // When the condition fails, pushing the starting index and ending index of the negative trend to the array
              negativeTrends.push({
                start: startIndex, 
                end: i
              })
              startIndex = i + 1
            } 
      }
      // Remove the instances where start and end values are the same. 
      negativeTrends = negativeTrends.filter(trend => trend.start != trend.end);
      return {positiveTrends, negativeTrends};
    }

    Vue.prototype.$getTrendsIgnore = function (data) {
      // Create 2 arrays - 1 for holding the positive trends and one for holding the negative trends
      var positiveTrends = [], negativeTrends = [];
      // Keep track of the start index when a new trend begins
      // Keep a marker of the last index that was read in the data array so we know where to read next
      var startIndex = 0, marker = 0;
      // From the original data, strip out the values that aren't 0s and make a new array
      var filteredData = data.filter(value => value != 0)
      // Determine the positive trends
      for(var i = 0; i < filteredData.length; i++) {
       if(filteredData[i] <= filteredData[i+1]) {
          continue;
        } else {
           positiveTrends.push({
            // Find starting value from the original data set and determine its index
            start: data.indexOf(filteredData[startIndex], marker), 
            // Find the ending value from the original data set and determine its index. Start search from where the start value was last found
            end: data.indexOf(filteredData[i], marker)
          })
          // Set the new starting index
          startIndex = i + 1;
          // The new marker becomes the 1 index past where the last value was read
          marker = positiveTrends.slice(-1)[0].end + 1
        }
      }
       // Remove the instances where start and end values are the same. 
      positiveTrends = positiveTrends.filter(trend => trend.start != trend.end);
      // Reset the value of startIndex 
      startIndex = 0;
      // Reset the marker
      marker = 0;
      // Determine the negative trends
      for(var i =0; i < filteredData.length; i++) {
        if(filteredData[i] >= filteredData[i+1]) {
          continue;
        } else {
          negativeTrends.push({
            start: data.indexOf(filteredData[startIndex], marker),
            end: data.indexOf(filteredData[i] , marker)
          })
          // Set the new starting index
          startIndex = i + 1
          marker = negativeTrends.slice(-1)[0].end + 1
        }
      }
      negativeTrends = negativeTrends.filter(trend => trend.start != trend.end);
      return {positiveTrends, negativeTrends};
    }

}
export default Report