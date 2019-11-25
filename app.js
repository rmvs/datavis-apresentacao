(async function () {


    var ntsb = await d3.csv('dataset/AviationData.csv');
    var dataset = await d3.csv('dataset/Airplane_Crashes_and_Fatalities_Since_1908_20190820105639.csv');
    console.log(dataset)

    var id = 0;
    var parser = d3.utcParse("%m/%d/%YT%H:%M")
    var parser2 = d3.utcParse("%Y-%m-%d")
    dataset.forEach(s => {
        s.id = id++;
        s.Survived = s.Aboard - s.Fatalities
        s.date = parser(s.Date + 'T' + ((s.Time == null || s.Time.length == 0) ? '00:00' : s.Time))
        s.Country = getCountry(s);
        if(s.Fatalities != null && s.Fatalities.length > 0){
            s.Fatalities = parseInt(s.Fatalities)
        }else{
            s.Fatalities = 0
        }
        if(s['Fatalities Passangers'] != null && s['Fatalities Passangers'].length > 0){
            s['Fatalities Passangers'] = parseInt(s['Fatalities Passangers'])
        }else{
            s['Fatalities Passangers'] = 0
        }
        if(s['Fatalities Crew'] != null && s['Fatalities Crew'].length > 0){
            s['Fatalities Crew'] = parseInt(s['Fatalities Crew'])
        }else{
            s['Fatalities Crew'] = 0
        }
    });
    /*console.log(dataset2.filter(s => s.Country == 'Brazil'))
    console.log(dataset.filter(s => s.Operator.indexOf('Gol Airlines') > -1))*/

    facts = crossfilter(dataset);
    var all = facts.groupAll();
    countDim = facts.dimension(d => {
        return d3.timeYear(d.date)
    })    
    countGroup = countDim.group()

    aircraftOpTypeDim = facts.dimension(function (d) {
        if (d.Operator == null || d.Operator.length == 0) {
            return 'Unspecified';
        } else if (d.Operator.toLowerCase().indexOf('military') > -1) {
            return 'Military';
        } else {
            return 'Civil';
        }
    })
    aircraftOpTypeGroup = aircraftOpTypeDim.group()
    var totalCountAirOpType = 0;
    aircraftOpTypeGroup.all().forEach(d => {
        totalCountAirOpType += d.value;
    });


    let accidentsCount = dc.lineChart(document.querySelector('#count-accidents'));

    accidentsCount.width(600).height(300).x(d3.scaleTime().domain(d3.extent(dataset, d => d.date)))
        .dimension(countDim).group(countGroup).valueAccessor(function (d) {
            return d.value;
        }).brushOn(true).elasticY(true)
        .on('filtered.monitor', update)

    let pieChart = dc.pieChart('#pie-chart');

    let lolli = d3.select('#chart3')


    pieChart.width(600).height(300).radius(150)
        .dimension(aircraftOpTypeDim)
        .group(aircraftOpTypeGroup)
        //minAngleForLabel(0)
        .drawPaths(true)
        .label(function (d) {
            if (pieChart.hasFilter() && !pieChart.hasFilter(d.key)) {
                return `${d.key} (0%)`;
            }
            return all.value() ? `${d.key} (${Math.floor(d.value / all.value() * 100)}%)` : d.key;
        })
        .renderLabel(true)
        .transitionDuration(500)
        //.colors(['//3182bd', '//6baed6', '//9ecae1', '//c6dbef', '//dadaeb'])
        /*.colors(d => {
            console.log(d/all.value())
            return d3.interpolateBlues(d/all.value())
        })*/
        //.colors(['//3182bd', '//6baed6', '//9ecae1', '//c6dbef', '//dadaeb'])
        //.colorDomain([0, 4200])
        .on('filtered.monitor', update)

    //pieChart.render()

    //accidentsCount.render()


    countryDim = facts.dimension(d => d.Country)
    countryGroup = countryDim.group();

    function sort(q) {
        return q.all().sort(function (b, a) {
            return a.value - b.value;
        })
    }

    sortCountry = sort(countryGroup).slice(0, 9)
    var top100Countries = sort(countryGroup).slice(0, 100);

    var configLolliChart = {
        margin: {
            top: parseInt($('#lollipop-chart').css('margin-top')),
            left: parseInt($('#lollipop-chart').css('margin-left')),
            right: parseInt($('#lollipop-chart').css('margin-right')),
            bottom: parseInt($('#lollipop-chart').css('margin-bottom'))
        },
        width: parseInt($('#lollipop-chart').css('width')), height: parseInt($('#lollipop-chart').css('height'))
    }
    configLolliChart.width = configLolliChart.width - configLolliChart.margin.left - configLolliChart.margin.right;
    configLolliChart.height = configLolliChart.height - configLolliChart.margin.top - configLolliChart.margin.bottom;

    var svg = d3.select("#lollipop-chart")
        .append("svg")
        .attr("width", configLolliChart.width + configLolliChart.margin.left + configLolliChart.margin.right)
        .attr("height", configLolliChart.height + configLolliChart.margin.top + configLolliChart.margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + configLolliChart.margin.left + "," + configLolliChart.margin.top + ")");

    var x = d3.scaleLinear()


    var xAxis = svg.append("g")
        .attr("transform", "translate(0," + configLolliChart.height + ")")

    /*.call(d3.axisBottom(x))
    .selectAll("text")
    .attr("transform", "translate(-10,0)rotate(-45)")
    .style("text-anchor", "end");*/

    var y = d3.scaleBand()
        //.domain(sortCountry.map(function(d) { return d.key; }))
        .padding(1);

    var yAxis = svg.append("g")
        .attr("class", "myYaxis")
    //.call(d3.axisLeft(y))

    function updateLollipop(data) {
        // X axis
        x.domain([0, data[0].value])
            .range([0, configLolliChart.width])
        xAxis.transition().duration(1000)
            .call(d3.axisBottom(x))
            .selectAll("text")
            .attr("transform", "translate(-10,0)rotate(-45)")
            .style("text-anchor", "end");

        // Add Y axis
        y.range([0, configLolliChart.height]).domain(data.map(function (d) { return d.key; }));
        yAxis.transition().duration(1000).call(d3.axisLeft(y));

        var j = svg.selectAll(".myLine")
            .data(data)
        // update lines
        j
            .enter()
            .append("line")
            .attr("class", "myLine")
            .merge(j)
            .transition()
            .duration(1000)
            .attr("x1", function (d) { return x(d.value); })
            .attr("x2", x(0))
            .attr("y1", function (d) { return y(d.key); })
            .attr("y2", function (d) { return y(d.key); })
            .attr("stroke", "grey")

        var u = svg.selectAll("circle")
            .data(data)
        u
            .enter()
            .append("circle")
            .merge(u)
            .transition()
            .duration(1000)
            .attr("cx", function (d) { return x(d.value); })
            .attr("cy", function (d) { return y(d.key); })
            .attr("r", 8)
            .attr("fill", "#69b3a2");


    }

    updateLollipop(sortCountry)

    function update(filter, chart) {
        updateLollipop(sort(countryDim.group()).slice(0, 9))
        top100Countries = sort(countryDim.group()).slice(0, 99)
        buildMap()
    }


    ntsb.forEach(s => {
        //s['Event.Date'] = parser2(s['Event.Date'])
        s['Total.Fatal.Injuries'] = s['Total.Fatal.Injuries'].length == 0 ? 0 : parseInt(s['Total.Fatal.Injuries'])
        s['Total.Minor.Injuries'] = s['Total.Minor.Injuries'].length == 0 ? 0 : parseInt(s['Total.Minor.Injuries'])
        s['Total.Serious.Injuries'] = s['Total.Serious.Injuries'].length == 0 ? 0 : parseInt(s['Total.Serious.Injuries'])
        s['Total.Uninjured'] = s['Total.Uninjured'].length == 0 ? 0 : parseInt(s['Total.Uninjured'])
        s['Number.of.Engines'] = parseInt(s['Number.of.Engines'])
    })

    /*acMap = d3.map(ntsb,function(q){
        return q.Make
    })
    console.log(acMap)*/

    let world = await d3.json('https://raw.githubusercontent.com/deldersveld/topojson/master/world-countries.json');
    var w = 960,
        h = 500;
    var projection = d3.geoMercator()

    var path = d3.geoPath(projection)

    var zoom = d3.zoom()
        .scaleExtent([1 / 4, 9])
        .on('zoom', function () {
            mapSvg.attr('transform', d3.event.transform)
        });


    function getColors() {
        max = top100Countries[0].value
        min = top100Countries[top100Countries.length - 1].value
        return d3.scaleQuantize()
            .domain([min, max])
            .range(d3.schemeReds[9])
    }
    var colorScale = getColors()



    var features = topojson.feature(world, world.objects.countries1).features;

    var mapSvg = d3.select('#map')
        .append('svg')
        .attr('class', 'sea')
        .attr("width", w)
        .attr("height", h)
        .call(zoom)
        .append('g')


    mapSvg.append('g').attr("id", "layer")
    mapSvg.select('#layer').selectAll("path")
        .data(features)
        .enter().append("path")
        .attr('id', function (d) {
            return btoa(d.properties.name)
        })
        .attr('fill', function (d) {
            var f = top100Countries.find(i => i.key == d.properties.name)
            if (f != null) {
                return colorScale(f.value)
            } else {
                return '#dfdfdf'
            }
        })
        .attr("d", path)
        .on('mouseover', function (d) {
            d3.select(this)
                .style('cursor', 'pointer')
                .attr('stroke-width', 1)
                .attr('stroke', '#b71c1c')
            let coordinates = [0, 0]
            coordinates = d3.mouse(this)
            const x = coordinates[0] + 10
            const y = coordinates[1] + 890
            showTooltip(d.properties.name, x, y)
        })
        .on('mouseout', function (d) {
            d3.select(this)
                .style('cursor', 'default')
                .attr('stroke-width', 0)
                .attr('stroke', 'none');
            hideTooltip();
        })
        .transition(1000)

    function buildMap() {
        colorScale = getColors()
        mapSvg.select('#layer').selectAll('path')
            .attr('fill', function (d) {
                var f = top100Countries.find(i => i.key == d.properties.name)
                if (f != null) {
                    return colorScale(f.value)
                } else {
                    return '#dfdfdf'
                }
            })

    }


    var accident = ntsb[0];
    function drawCircles() {

        var points = projection([accident.Longitude, accident.Latitude]);
        /*mapSvg.append('circle')
              .attr("r", count)
              .attr('cx',points[0])
              .attr('cy',points[1])
              .style("fill", "red")
              .style("fill-opacity", 0.5)
              .style("stroke", "red")
              .style("stroke-opacity", 0.5)*/
        /*mapSvg.selectAll('circle')
           .data(ntsb).enter().append('circle')
           .attr("r", count)
           .style("fill", "red")
           .style("fill-opacity", 0.5)
           .style("stroke", "red")
           .style("stroke-opacity", 0.5)
           .attr('transform',function(d){
                return "translate(" + projection([d.Longitude,d.Latitude]) + ")";
           })       */
        mapSvg.selectAll('circle')
            .data(ntsb)
            .enter()
            .append('circle')
            .attr('r', d => {
                var count = d['Total.Fatal.Injuries'] + d['Total.Minor.Injuries'] + d['Total.Serious.Injuries'] + d['Total.Uninjured']
                return 1
            })
            .style("fill", "red")
            .style("fill-opacity", 0.5)
            .style("stroke", "red")
            .style("stroke-opacity", 0.5)
            .attr('transform', function (d) {
                return "translate(" + projection([d.Longitude, d.Latitude]) + ")";
            })
    }

    function showTooltip(name, x, y) {
        console.log('showing')
        var count = top100Countries.find(i => i.key == name)
        if (count == null) return;
        d3.select("#tooltip")
            .style("left", x + "px")
            .style("top", y + "px")
            .select("#qtd")
            .text(count.value)

        d3.select("#nome").text(name);

        d3.select("#tooltip")
            .classed("hidden", false)
    }
    function hideTooltip() {
        d3.select("#tooltip")
            .classed("hidden", true)
    }
    
    var operator = facts.dimension(d => d.Operator.trim())
    var groupOp = operator.group()
    var objs = operator.top(11)
    var sortGroupOp = groupOp.all().sort(function(b, a) {
        return a.value - b.value;
    }).slice(0, 15)

    var rowChartColor = d3.scaleLinear().domain([sortGroupOp[sortGroupOp.length - 1].value, sortGroupOp[0].value])
        .interpolate(d3.interpolateHcl)
        .range(["#FF0000", '#690505']);

    dc.rowChart('#operator-count')
        .width(800)
        .height(380)
        .x(d3.scaleLinear().domain([sortGroupOp[sortGroupOp.length - 1].value, sortGroupOp[0].value]))
        .dimension(operator)
        .group(groupOp)
        .elasticX(true)
        //.ordering(d => d.key)
        .cap(12)
        .othersGrouper(false)
        .colors(function(d) {
            var found = sortGroupOp.find(z => z.key == d).value
            return rowChartColor(found)
        })


    //drawCircles();

    dc.renderAll()


})();