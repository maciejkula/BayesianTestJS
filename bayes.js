var beta = require("beta-js");
var d3 = require("d3");


var BetaModel = function (alpha, beta) {

    this.alpha = alpha;
    this.beta = beta;
};

BetaModel.prototype.distribution = function () {
    return beta.beta(this.alpha, this.beta);
};

BetaModel.prototype.getPDF = function (noPoints) {
    var pdf = [];
    var distribution = this.distribution();
    for (var i=0; i < noPoints; i++) {
	var val = distribution.pdf(i/noPoints);
	// Get rid of density singularities for plotting
	if (val == Number.POSITIVE_INFINITY) {
	    val = 0;
	};
	pdf.push({'x': i/noPoints, 'y': val});
    };
    return pdf;
};

BetaModel.prototype.getRvs = function (noSamples) {
    return this.distribution().rvs(noSamples);
};

BetaModel.prototype.update = function (successes, failures) {
    this.alpha = this.alpha + successes;
    this.beta = this.beta + failures;
};


// -----------------------------------------------

var PDFPlot = function(alpha, beta) {
    this.priorBeta = new BetaModel(alpha, beta);
    this.posteriorBeta = new BetaModel(alpha, beta);
};

PDFPlot.prototype.getElements = function () {

    var priorData = this.priorBeta.getPDF(100);
    var posteriorData = this.posteriorBeta.getPDF(100);
    var allData = priorData.concat(posteriorData);

    var margin = {top: 20, right: 20, bottom: 30, left: 50};
    var width = 960 - margin.left - margin.right;
    var height = 500 - margin.top - margin.bottom;

    var x = d3.scale.linear()
	.domain(d3.extent(allData, function(d) { return d.x; }))
    	.range([0, width]);

    var y = d3.scale.linear()
	.domain([0, d3.max(allData, function(d) { return d.y; })+1])
	.range([height, 0]);

    var xAxis = d3.svg.axis()
	.scale(x)
	.orient("bottom");

    var yAxis = d3.svg.axis()
	.scale(y)
	.orient("left");

    var priorLine = d3.svg.line()
	.x(function(d) { return x(d.x); })
	.y(function(d) { return y(d.y); });

    var posteriorLine = d3.svg.line()
	.x(function(d) { return x(d.x); })
	.y(function(d) { return y(d.y); });

    return {
	"margin": margin,
	"width": width,
	"height": height,
	"xAxis": xAxis,
	"yAxis": yAxis,
	"priorLine": priorLine,
	"posteriorLine": posteriorLine,
	"priorData": priorData,
	"posteriorData": posteriorData
    };
};

PDFPlot.prototype.draw = function () {
    var d = this.getElements();
    
    var svg = d3.select("body").append("svg")
	.attr("width", d.width + d.margin.left + d.margin.right)
	.attr("height", d.height + d.margin.top + d.margin.bottom)
	.append("g")
	.attr("transform", "translate(" + d.margin.left + "," + d.margin.top + ")");

    svg.append("g")
	.attr("class", "x axis")
	.attr("transform", "translate(0," + d.height + ")")
	.call(d.xAxis);

    svg.append("g")
	.attr("class", "y axis")
	.call(d.yAxis)
	.append("text")
	.attr("transform", "rotate(-90)")
	.attr("y", 6)
	.attr("dy", ".71em")
	.style("text-anchor", "end")
	.text("Density");

    svg.append("path")
	.datum(d.priorData)
	.attr("class", "line")
	.attr("d", d.priorLine)
	.attr("id", "priorLine");

    svg.append("path")
	.datum(d.posteriorData)
	.attr("class", "line")
	.attr("d", d.posteriorLine)
	.attr("id", "posteriorLine");

    this.svg = svg;
};

PDFPlot.prototype.redraw = function () {

    var d = this.getElements();

    this.svg.select('#priorLine')
	.datum(d.priorData)
	.transition()
	.duration(1000)
        .attr("d", d.priorLine);

    this.svg.select('#posteriorLine')
	.datum(d.posteriorData)
	.transition()
	.duration(1000)
        .attr("d", d.posteriorLine);

    this.svg.select('.y.axis')
	.transition()
	.duration(1000)
	.call(d.yAxis);

    this.svg.select('.x.axis')
	.transition()
	.call(d.xAxis);
};

PDFPlot.prototype.updatePrior = function (alpha, beta) {
    this.priorBeta = new BetaModel(alpha, beta);
    this.posteriorBeta = new BetaModel(alpha, beta);
};

PDFPlot.prototype.updatePosterior = function (successes, failures) {
    this.posteriorBeta.update(successes, failures);
};


var getNumber = function (x, def) {
    return Number(x);    
};


var getInputs = function () {
    
    var priorAlpha = getNumber(document.getElementById("priorAlpha").value, 10);
    var priorBeta = getNumber(document.getElementById("priorBeta").value, 10);
    var controlSuccesses = getNumber(document.getElementById("controlSuccesses").value, 10);
    var controlFailures = getNumber(document.getElementById("controlFailures").value, 10);
    return {
	"priorAlpha": priorAlpha,
	"priorBeta": priorBeta,
	"controlSuccesses": controlSuccesses,
	"controlFailures": controlFailures
    };
};

var initializePlots = function() {
    var inputs = getInputs();
    pdfplot = new PDFPlot(inputs.priorAlpha, inputs.priorBeta);
    pdfplot.draw();
};

initializePlots();

var updatePlots = function() {
    var inputs = getInputs();
    pdfplot.updatePrior(inputs.priorAlpha, inputs.priorBeta);
    pdfplot.redraw();
    // pdfplot.updatePosterior(10000, 10000);    
};

var bindInputs = function() {
    document.getElementById("submit").onclick = function() {
	updatePlots();
    };
};


bindInputs();
