"use strict";

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
    this.controlBeta = new BetaModel(alpha, beta);
    this.testBeta = new BetaModel(alpha, beta);
};

PDFPlot.prototype.getElements = function () {

    var controlData = this.controlBeta.getPDF(100);
    var testData = this.testBeta.getPDF(100);
    var allData = controlData.concat(testData);

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

    var controlLine = d3.svg.line()
	.x(function(d) { return x(d.x); })
	.y(function(d) { return y(d.y); });

    var testLine = d3.svg.line()
	.x(function(d) { return x(d.x); })
	.y(function(d) { return y(d.y); });

    return {
	"margin": margin,
	"width": width,
	"height": height,
	"xAxis": xAxis,
	"yAxis": yAxis,
	"testLine": testLine,
	"controlLine": controlLine,
	"testData": testData,
	"controlData": controlData
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
	.style("fill", "red")
	.datum(d.testData)
	.attr("class", "line")
	.attr("d", d.testLine)
	.attr("id", "testLine");

    svg.append("path")
	.datum(d.controlData)
	.attr("class", "line")
	.attr("d", d.controlLine)
	.attr("id", "controlLine");

    var title = svg.append("text")
	.attr("class", "title")
	.attr("dy", ".71em")
	.text(2000);

    this.svg = svg;
};

PDFPlot.prototype.redraw = function () {

    var d = this.getElements();

    this.svg.select('#testLine')
	.datum(d.testData)
	.transition()
	.duration(1000)
        .attr("d", d.testLine);

    this.svg.select('#controlLine')
	.datum(d.controlData)
	.transition()
	.duration(1000)
        .attr("d", d.controlLine);

    this.svg.select('.y.axis')
	.transition()
	.duration(1000)
	.call(d.yAxis);

    this.svg.select('.x.axis')
	.transition()
	.call(d.xAxis);
};

PDFPlot.prototype.updatePrior = function (alpha, beta) {
    this.controlBeta = new BetaModel(alpha, beta);
    this.testBeta = new BetaModel(alpha, beta);
};

PDFPlot.prototype.updatePosterior = function (testSuccesses, testFailures, controlSuccesses, controlFailures) {
    this.testBeta.update(testSuccesses, testFailures);
    this.controlBeta.update(controlSuccesses, controlFailures);
    console.log(this.controlBeta);
};


var getNumber = function (x, def) {
    return Number(x);    
};


var getInputs = function () {
    
    var priorAlpha = getNumber(document.getElementById("priorAlpha").value, 10);
    var priorBeta = getNumber(document.getElementById("priorBeta").value, 10);
    var controlSuccesses = getNumber(document.getElementById("controlSuccesses").value, 10);
    var controlFailures = getNumber(document.getElementById("controlFailures").value, 10);
    var testSuccesses = getNumber(document.getElementById("testSuccesses").value, 10);
    var testFailures = getNumber(document.getElementById("testFailures").value, 10);

    return {
	"priorAlpha": priorAlpha,
	"priorBeta": priorBeta,
	"controlSuccesses": controlSuccesses,
	"controlFailures": controlFailures,
	"testSuccesses": testSuccesses,
	"testFailures": testFailures
    };
};

var initializePlots = function() {
    var inputs = getInputs();
    var pdfplot = new PDFPlot(inputs.priorAlpha, inputs.priorBeta);
    pdfplot.draw();
    window.pdfplot = pdfplot;
};

initializePlots();

var updatePlots = function() {
    var inputs = getInputs();
    var pdfplot = window.pdfplot;
    pdfplot.updatePrior(inputs.priorAlpha, inputs.priorBeta);
    pdfplot.updatePosterior(inputs.testSuccesses,
			    inputs.testFailures,
			    inputs.controlSuccesses,
			    inputs.controlFailures);
    pdfplot.redraw();

};

var bindInputs = function() {
    document.getElementById("submit").onclick = function() {
	updatePlots();
    };
};


bindInputs();
