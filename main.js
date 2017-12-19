d3.select(window).on('load', main("hands.json"));

function main(handsJSON)
{
    d3.json(handsJSON, visualize)
}

function visualize(data) {
    console.log(data)

    n_hands = 40
    n_points = 56
    set = 0

    var xOutlineScale = d3.scaleLinear()
        .domain([0.1, 1.3])
        .range([0, 300])
        .nice()

    var yOutlineScale = d3.scaleLinear()
        .domain([0.1, 1.3])
        .range([0, 300])
        .nice()

    /* build a string for each hand's svg:path `d` attribute */
    hand_paths = []
    for (var i = 0; i < n_hands; i++) {
        let path = ""
        for (var j = 0; j < n_points; j++) {
            // Move to the first point in the path
            if (j == 0) {
                let p = data.outlines.points[i][j]
                x = xOutlineScale(p[0])
                y = yOutlineScale(p[1])
                path += `M${x} ${y} `
            }
            // Draw lines to the rest of the points in the path
            else {
                let p = data.outlines.points[i][j]
                x = xOutlineScale(p[0])
                y = yOutlineScale(p[1])
                path += `L${x} ${y} `
            }
        }
        hand_paths.push(path)
    }

    data.outlines.paths = hand_paths
    // console.log(data.outlines.paths)

    // default outline visualization settings
    var k
    var id_max = data.outlines.paths

    // default navigation settings
    var nav_begin = 9
    var nav_width = 300
    var nav_height = 30
    var nav_margin_left = 10
    var nav_margin_right = 10
    var nav_num_ticks = 20

    var xNavScale = d3.scaleLinear()
        .domain([0, n_hands - 1])
        .range([0, nav_width - nav_margin_left - nav_margin_right])
        .nice()

    var xNavAxis = d3.axisBottom()
        .scale(xNavScale)
        .ticks(nav_num_ticks)

    svg = d3.select("#vis-outlines")
        .attr("width", 300)
        .attr("height", 240)
        .call(d3.zoom().on("zoom", handel_outline_zoom))
        .on("mousedown.zoom", null)
        .on("dblclick.zoom", null)

    outlines = svg.append("g")
        .attr("id", "outlines")
        // .attr("transform", "translate(0,-10)")

    function handel_outline_zoom() {
        let old_k = k ? k : d3.event.transform.k
        k = d3.event.transform.k
        let nav_d = navDirection(old_k, k)

        var marker = d3.select(".xNavMarker")
        var x = parseInt(marker.attr("id").slice(1))

        if ((nav_d == "inc") && x != 39) {

            // inc the navigation bar
            next = x + 1
            next_point = xNavScale(next)
            marker.attr("id", `n${next}`)
                .attr("x1", next_point)
                .attr("x2", next_point)

            var currentClass = d3.select(point_id(x)).attr("class")
            var nextClass = d3.select(point_id(next)).attr("class")

            // need to update the point data for the next outline
            d3.select("#vis-outlines-details")
                .select(`#op${x}`)
                .remove()

            d3.select("#vis-outlines-details")
                .append("div")
                .attr("id", `op${next}`)
                .selectAll("p")
                .data(data.outlines.points[next])
                .enter()
                .append("p")
                .text(function(d,i) { return `x${i} = ${d[0].toFixed(4)}, y${i} = ${d[1].toFixed(4)}` })

            // need to update the component data for the PCA visualization
            d3.select("#sp1")
                .select(`#spcx${x}`)
                .remove()
            d3.select("#sp2")
                .select(`#spcy${x}`)
                .remove()

            d3.select("#sp1")
                .append("span")
                .attr("id", `spcx${next}`)
                .text(data.components.circles[set][next].cx)
            d3.select("#sp2")
                .append("span")
                .attr("id", `spcy${next}`)
                .text(data.components.circles[set][next].cy)


            // d3.select(outline_id(next))
            //     .transition()
            //     .duration(1000)
            //     .on("start", function(d) {
            //         d3.active(this)
            //             .attrTween("d", pathTween(data.outlines.paths[next], 4))
            //     })

            // highlight the next outline and point
            if (nextClass != "pointSelected") {
                d3.select(outline_id(next))
                    .attr("class", "outlineHighlight")
                d3.select(point_id(next))
                    .attr("class", "pointHighlight")
                }

            // un-highlight the previous outline and point
            if (currentClass != "pointSelected") {
            d3.select(outline_id(x))
                .attr("class", "outline")
            d3.select(point_id(x))
                .attr("class", "point")
            }

        } else if ((nav_d == "dec" && x != 0)) {

            // dec the navigation bar
            prev = x - 1
            prev_point = xNavScale(prev)
            marker.attr("id", `n${prev}`)
                .attr("x1", prev_point)
                .attr("x2", prev_point)

            var currentClass = d3.select(point_id(x)).attr("class")
            var prevClass = d3.select(point_id(prev)).attr("class")

            // need to update the point data for the next outline
            d3.select("#vis-outlines-details")
                .select(`#op${x}`)
                .remove()

            d3.select("#vis-outlines-details")
                .append("div")
                .attr("id", `op${prev}`)
                .selectAll("p")
                .data(data.outlines.points[prev])
                .enter()
                .append("p")
                .text(function(d,i) { return `x${i} = ${d[0].toFixed(4)}, y${i} = ${d[1].toFixed(4)}` })

            d3.select("#sp1")
                .select(`#spcx${x}`)
                .remove()
            d3.select("#sp2")
                .select(`#spcy${x}`)
                .remove()

            d3.select("#sp1")
                .append("span")
                .attr("id", `spcx${prev}`)
                .text(data.components.circles[set][prev].cx)
            d3.select("#sp2")
                .append("span")
                .attr("id", `spcy${prev}`)
                .text(data.components.circles[set][prev].cy)


            // highlight the next outline and point
            if (prevClass != "pointSelected") {
                d3.select(outline_id(prev))
                    .attr("class", "outlineHighlight")
                d3.select(point_id(prev))
                    .attr("class", "pointHighlight")
            }

            // un-highlight the previous outline and point
            if (currentClass != "pointSelected") {
                d3.select(outline_id(x))
                    .attr("class", "outline")
                d3.select(point_id(x))
                    .attr("class", "point")
            }

        } else {null}
    }


    function navDirection(old_k, k) {
        if (old_k < k) {return "inc"}
        else if (old_k > k) {return "dec"}
        else if (k > 1.0) {return "inc"}
        else {return "dec"}
    }


    outlines.selectAll("path")
        .data(data.outlines.paths)
        .enter()
        .append("path")
        .attr("id", function(d,i) {return "o" + i})
        .attr("class", function(d,i) {
            if (i == nav_begin) {return "outlineHighlight"} else {return "outline"}
        })
        .attr("d", function(d) {return d})


    // Add the current hand's outline points
    d3.select("#vis-outlines-details")
        .append("div")
        .attr("id", `op${nav_begin}`)
        .selectAll("p")
        .data(data.outlines.points[nav_begin])
        .enter()
        .append("p")
        .text(function(d,i) { return `x${i} = ${d[0].toFixed(4)}, y${i} = ${d[1].toFixed(4)}` })



    // Initialize the visualization's navigation bar
    // Used to help users scroll through the data
    nav = d3.select("#vis-nav")
        .attr("width", nav_width)
        .attr("height", nav_height)
        .call(d3.zoom().on("zoom", handel_outline_zoom))
        .on("mousedown.zoom", null)  // need to disable panning
        .on("dblclick.zoom", null)  // nuud to disable double click zoom in

    nav.append("g")
        .attr("id", "xNavAxis")
        .attr("transform", "translate(10,10)")
        .call(xNavAxis)

    nav.append("line")
        .attr("id", `n${nav_begin}`)
        .attr("class", "xNavMarker")
        .attr("x1", xNavScale(nav_begin))
        .attr("x2", xNavScale(nav_begin))
        .attr("y1", 3)
        .attr("y2", 18)
        .attr("transform", "translate(10,0)")
        .style("stroke", "red")
        .style("stroke-width", 2)



    // console.log(data.components.circles)

    // SCATTER PLOT VIS
    var xScalePCA = d3.scaleLinear()
        .domain([-0.51, 0.63])
        .range([0, 290])
        .nice()

    var yScalePCA = d3.scaleLinear()
        .domain([-0.51, 0.63])
        .range([0, 290])
        .nice()


    svg = d3.select("#vis-scatter-plot")
        .attr("width", 300)
        .attr("height", 260)
        .call(d3.zoom().on("zoom", handel_outline_zoom))
        .on("mousedown.zoom", null)
        .on("dblclick.zoom", null)

    scatter = svg.append("g")
        .attr("id", "scatter-plot")

    scatter.selectAll("circle")
        .data(data.components.circles[set])
        .enter()
        .append("svg:circle")
        .attr("id", function(d,i) {return "p" + i})
        .attr("class", function(d,i) {
            if (i == nav_begin) {return "pointHighlight"} else {return "point"}
        })
        .attr("cx", function(d) {return xScalePCA(d.cx)})
        .attr("cy", function(d) {return yScalePCA(d.cy)})
        .attr("r", 4)

        // allow user to highlight points and outlines as they mouse over them
        .on("mouseover", function(d,i) {
            // console.log("D", d)
            // console.log("scatter", scatter)

            var currentClass = d3.select(point_id(i)).attr("class")
            if (currentClass == "point") {
                d3.select(point_id(i))
                    .attr("class", "pointHover")
                d3.select(outline_id(i))
                    .attr("class", "outlineHover")
            }

            // create the tooltip label
            d3.select(point_id(i))
                .append("title")
                .attr("id", "tooltip")
                .text("Datafile row index: " + i)

        })
        .on("mouseout", function(d,i) {
            var currentClass = d3.select(point_id(i)).attr("class")
            if (currentClass == "pointHover") {
                d3.select(point_id(i))
                    .attr("class", "point")
                d3.select(outline_id(i))
                    .attr("class", "outline")
            }

            // remove tooltip label
            d3.select("#tooltip").remove()
        })

        // allow user to select/deselect points directly
        .on("mousedown", function(d,i) {
            var currentClass = d3.select(point_id(i)).attr("class")
            // console.log(currentClass)
            if (currentClass != "pointSelected") {
                d3.select(point_id(i))
                    .attr("class", "pointSelected")
                d3.select(outline_id(i))
                    .attr("class", "outlineSelected")
            } else {
                d3.select(point_id(i))
                    .attr("class", "point")
                d3.select(outline_id(i))
                    .attr("class", "outline")
            }
        })

    svg.append("g")
        .attr("id", "xAxisScatter")

    svg.append("g")
        .attr("id", "yAxisScatter")

    d3.select("#vis-scatter-plot-details")
        .selectAll("#sp1")
        .data(["1st Principal Component: "])
        .enter()
        .append("div")
        .attr("id", "sp1")
        .append("span")
        .text(function(d) {return d})

    d3.select("#sp1")
        .append("span")
        .attr("id", `spcx${nav_begin}`)
        .text(`${data.components.circles[set][nav_begin].cx}`)

    d3.select("#vis-scatter-plot-details")
        .selectAll("#sp2")
        .data(["2st Principal Component: "])
        .enter()
        .append("div")
        .attr("id", "sp2")
        .append("span")
        .text(function(d) {return d})

    d3.select("#sp2")
        .append("span")
        .attr("id", `spcy${nav_begin}`)
        .text(`${data.components.circles[set][nav_begin].cy}`)


	d3.select("#vis-scatter-plot-details")
		.append("button")
		.attr("id", "btn_pca_12")
        .text("PCA 1 - 2")
        .attr("value", 0)
		.on("mousedown", handle_trans)

    d3.select("#vis-scatter-plot-details")
        .append("button")
        .attr("id", "btn_pca_13")
        .text("PCA 1 - 3")
        .attr("value", 1)
        .on("mousedown", handle_trans)

    function handle_trans() {
        // console.log("This", this.value)
        redraw_comp(this.value)
    }

    function redraw_comp(s) {
        circles = d3.select("#vis-scatter-plot")
            .selectAll("circle")

        circles.transition()          // apply a transition
            .duration(900)         // apply it over 4000 milliseconds
            .attr('cx', function(d, i) {return xScalePCA(data.components.circles[s][i].cx)})

        circles.transition()          // apply a transition
            .duration(900)         // apply it over 4000 milliseconds
            .attr('cy', function(d, i) {return yScalePCA(data.components.circles[s][i].cy)})
    }
}


/* These functions return properly formatted id strings for the integer x */
function point_id(x) { return `#p${x}` }
function outline_id(x) { return `#o${x}` }


/* This function is taken directly from https://bl.ocks.org/mbostock/3916621 */
function pathTween(d1, precision) {
  return function() {
    var path0 = this
    var path1 = path0.cloneNode()
    var n0 = path0.getTotalLength()
    var n1 = (path1.setAttribute("d", d1), path1).getTotalLength()

    // console.log(path0, path1)

    // Uniform sampling of distance based on specified precision.
    var distances = [0], i = 0, dt = precision / Math.max(n0, n1)
    while ((i += dt) < 1) distances.push(i)
    distances.push(1)

    // Compute point-interpolators at each distance.
    var points = distances.map(function(t) {
      var p0 = path0.getPointAtLength(t * n0)
      var p1 = path1.getPointAtLength(t * n1)
      return d3.interpolate([p0.x, p0.y], [p1.x, p1.y])
    })

    return function(t) {
      return t < 1 ? "M" + points.map(function(p) { return p(t); }).join("L") : d1
    }
  }
}