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
	pdf.push({'x': i/noPoints, 'y': distribution.pdf(i/noPoints)});
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

var pdfPlot = function(alpha, beta) {

    this.priorBeta = new BetaModel(alpha, beta);
    this.posteriorBeta = new BetaModel(alpha, beta);

    var priorData = this.priorBeta.getPDF(100);
    var posteriorData = this.posteriorBeta.getPDF(100);
    var allData = priorData.concat(posteriorData);

    var margin = {top: 20, right: 20, bottom: 30, left: 50};
    var width = 960 - margin.left - margin.right;
    var height = 500 - margin.top - margin.bottom;

    this.width = width;
    this.height = height;

    var x = d3.scale.linear()
	.domain(d3.extent(allData, function(d) { return d.x; }))
    	.range([0, width]);

    var y = d3.scale.linear()
	.domain(d3.extent(allData, function(d) { return d.y; }))
	.range([height, 0]);

    var xAxis = d3.svg.axis()
	.scale(x)
	.orient("bottom");

    var yAxis = d3.svg.axis()
	.scale(y)
	.orient("left");

    this.x = x;
    this.y = y;
    this.xAxis = xAxis;
    this.yAxis = yAxis;

    var priorLine = d3.svg.line()
	.x(function(d) { return x(d.x); })
	.y(function(d) { return y(d.y); });

    var posteriorLine = d3.svg.line()
	.x(function(d) { return x(d.x); })
	.y(function(d) { return y(d.y); });

    var svg = d3.select("body").append("svg")
	.attr("width", width + margin.left + margin.right)
	.attr("height", height + margin.top + margin.bottom)
	.append("g")
	.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    svg.append("g")
	.attr("class", "x axis")
	.attr("transform", "translate(0," + height + ")")
	.call(xAxis);

    svg.append("g")
	.attr("class", "y axis")
	.call(yAxis)
	.append("text")
	.attr("transform", "rotate(-90)")
	.attr("y", 6)
	.attr("dy", ".71em")
	.style("text-anchor", "end")
	.text("Density");

    svg.append("path")
	.datum(priorData)
	.attr("class", "line")
	.attr("d", priorLine)
	.attr("id", "priorLine");

    svg.append("path")
	.datum(posteriorData)
	.attr("class", "line")
	.attr("d", posteriorLine)
	.attr("id", "posteriorLine");

    this.priorLine = priorLine;
    this.posteriorLine = posteriorLine;
    this.svg = svg;
};

pdfPlot.prototype.getElements = function () {

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
	.domain(d3.extent(allData, function(d) { return d.y; }))
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
	"posteriorLine": posteriorLine
    };
};

pdfPlot.prototype.redraw = function () {



    this.svg.select('#priorLine')
	.datum(priorData)
	.transition()
	.duration(1000)
        .attr("d", priorLine);

    this.svg.select('#posteriorLine')
	.datum(posteriorData)
	.transition()
	.duration(1000)
        .attr("d", posteriorLine);

    this.svg.select('.y.axis')
	.transition()
	.duration(10000)
	.call(yAxis);

    this.svg.select('.x.axis')
	.transition()
	.call(xAxis);


};

pdfPlot.prototype.update = function (successes, failures) {
    this.posteriorBeta.update(successes, failures);
    this.redraw();
};

var pdfplot = new pdfPlot(10, 100);
pdfplot.update(10000, 10000);

var betaD = new BetaModel(10, 100);

// console.log(betaD.getRvs(10));

// betaD.update(100, 10);
// console.log(betaD.getRvs(10));
