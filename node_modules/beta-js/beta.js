/*
 * A snippet that builds upon jStat to provide
 * the probability density function and the log
 * probability density function for the Beta distribution.
 */

var jStat = require('jStat');
var gammaln = jStat.jStat.gammaln;

var BetaDistribution = function (alpha, beta) {

    this.alpha = alpha;
    this.beta = beta;

    this.betaInverse = (gammaln(this.alpha + this.beta)
			- gammaln(this.alpha)
			- gammaln(this.beta));
};

BetaDistribution.prototype.lpdf = function(x) {
    if (x < 0 || x > 1) {
	return Number.NEGATIVE_INFINITY;
    };
    return (this.betaInverse
	    + (this.alpha - 1) * Math.log(x)
	    + (this.beta - 1) * Math.log(1 - x));
};

BetaDistribution.prototype.pdf = function(x) {
    if (x < 0 || x > 1) {
	return 0;
    };
    if (this.alpha == 1 && this.beta == 1) {
		return 1;
    };
    return Math.exp(this.lpdf(x));
};

BetaDistribution.prototype.rv = function () {
    return jStat.jStat.beta.sample(this.alpha, this.beta);
};

BetaDistribution.prototype.rvs = function(n) {
    var rvs = [];

    for (var i=0; i < n; i++) {
	rvs.push(this.rv());
    };

    return rvs;
};


var beta = function(alpha, beta) {
  return new BetaDistribution(alpha, beta);  
};

  
module.exports.lngamma = gammaln;
module.exports.beta = beta;