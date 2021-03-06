var request = require('request')
  , marked = require('marked')
  , tools = require('datapackage-read')
  ;

var Catalog = function() {
  this._cache = {};
};

Catalog.prototype.load = function(datapackages) {
  var that = this;
  for (id in datapackages) {
    var dp = datapackages[id];
    dp = tools.normalize(dp);
    if (!dp.id) {
      dp.id = dp.name || 'no-id';
    }
    if (dp.resources && dp.resources.length > 0) {
      dp.download_url = dp.resources[0].url;
    } else {
      dp.download_url = '';
    }
    if (dp.readme) {
      dp.readme_html = marked(dp.readme);
    } else {
      dp.readme_html = '';
    }
    that._cache[id] = dp;
  }
}

Catalog.prototype.loadURL = function(url, cb) {
  var that = this;
  request(url, function(err, res, body) {
    if (err) {
      cb(err);
    } else {
      var urls = body.split('\n').filter(function(url) {
        return Boolean(url)
      });
      tools.loadManyUrls(urls, function(err, datapackageIndex) {
        that.load(datapackageIndex);
        cb();
      });
    }
  });
}

Catalog.prototype.get = function(id) {
  return this._cache[id];
}

Catalog.prototype.query = function(q) {
  var that = this;
  // TODO: actual search
  return Object.keys(this._cache).map(function(key) {
    return that._cache[key];
  });
}

exports.Catalog = Catalog;
