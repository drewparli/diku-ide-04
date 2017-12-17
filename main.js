d3.select(window).on('load', main("hands.json"));

function main(handsJSON)
{
    d3.json(handsJSON, visualize)
}

function visualize(data) {

    n_hands = 40
    n_points = 56

    var xOutlineScale = d3.scaleLinear()
        .domain([0.1, 1.3])
        .range([0, 400])
        .nice()

    var yOutlineScale = d3.scaleLinear()
        .domain([0.1, 1.3])
        .range([0, 400])
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
    var nav_width = 400
    var nav_height = 50
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
        .attr("width", 400)
        .attr("height", 320)
        .call(d3.zoom().on("zoom", handel_outline_zoom))
        .on("mousedown.zoom", null)

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

            // highlight the next outline and point
            d3.select(outline_id(next))
                .attr("class", "outlineHighlight")
            d3.select(point_id(next))
                .attr("class", "pointHighlight")

            // un-highlight the previous outline and point
            d3.select(outline_id(x))
                .attr("class", "outline")
            d3.select(point_id(x))
                .attr("class", "point")

        } else if ((nav_d == "dec" && x != 0)) {

            // dec the navigation bar
            prev = x - 1
            prev_point = xNavScale(prev)
            marker.attr("id", `n${prev}`)
                .attr("x1", prev_point)
                .attr("x2", prev_point)

            // highlight the next outline and point
            d3.select(outline_id(prev))
                .attr("class", "outlineHighlight")
            d3.select(point_id(prev))
                .attr("class", "pointHighlight")

            // un-highlight the previous outline and point
            d3.select(outline_id(x))
                .attr("class", "outline")
            d3.select(point_id(x))
                .attr("class", "point")

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
        .attr("class", "outline")
        .attr("d", function(d) {return d})


    // Initialize the visualization's navigation bar
    // Used to help users scroll through the data
    nav = d3.select("#vis-nav")
        .attr("width", nav_width)
        .attr("height", nav_height)
        .call(d3.zoom().on("zoom", handel_outline_zoom))
        .on("mousedown.zoom", null)  // need to diable for panning


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



    console.log(data.components.circles)

    // SCATTER PLOT VIS
    var xScalePCA = d3.scaleLinear()
        .domain([0.85, 1.2])
        .range([0, 380])
        .nice()

    var yScalePCA = d3.scaleLinear()
        .domain([0.85, 1.2])
        .range([0, 380])
        .nice()


    svg = d3.select("#vis-scatter-plot")
        .attr("width", 400)
        .attr("height", 250)
        .call(d3.zoom().on("zoom", handel_outline_zoom))
        .on("mousedown.zoom", null)

    scatter = svg.append("g")
        .attr("id", "scatter-plot")
        // .attr("transform", "translate (150, 125) scale(1)")

    scatter.selectAll("polyline")
        .data(data.components.circles)
        .enter()
        .append("circle")
        .attr("id", function(d,i) {return "p" + i})
        .attr("class", "point")
        .attr("cx", function(d) {return xScalePCA(d.cx)})
        .attr("cy", function(d) {return yScalePCA(d.cy)})
        .attr("r", 4)
        .on("mouseover", function(d,i) {
            console.log(d,i)
            d3.select(point_id(i))
                .attr("class", "pointHighlight")
            d3.select(outline_id(i))
                .attr("class", "outlineHighlight")
            // create the tooltip label
			scatter.append("title")
                .attr("id", "tooltip")
                .text("Datafile row index: " + i)
        })
        .on("mouseout", function(d,i) {
            console.log(d,i)
            d3.select(point_id(i))
                .attr("class", "point")
            d3.select(outline_id(i))
                .attr("class", "outline")
			scatter.select("#tooltip").remove()
        })

    svg.append("g")
        .attr("id", "xAxisScatter")

    svg.append("g")
        .attr("id", "yAxisScatter")
}


/* These functions return properly formatted id strings for the integer x */
function point_id(x) { return `#p${x}` }
function outline_id(x) { return `#o${x}` }