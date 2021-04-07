const films = require('./model')
const view = require('./view')

let home = function (req, res) {
  let sql = 'SELECT *, P.description as fdescription FROM videos P WHERE P.video_status_id = 2 ORDER BY P.created_at DESC LIMIT 10'
  global.db.query(sql, function (error, results, fields) {
    if (error) throw error
    console.log(results)
    view.home(req, res, { films, filmRecommend: results })
  })
}

let search = function (req, res) {
  view.search(req, res, { films })
}

let detail = function (req, res) {
  let slug = req.params.slug || ''
  let sql = ''
  if (slug) {
    sql = 'SELECT *, P.description as fdescription FROM videos P INNER JOIN episodes Pr ON Pr.video_id = P.id WHERE P.slug = "' + slug + '" ORDER BY Pr.position'
  } else {
    sql = 'SELECT *, P.description as fdescription FROM videos P INNER JOIN episodes Pr ON Pr.video_id = P.id WHERE P.id = 20862 ORDER BY Pr.position'
  }
  global.db.query(sql, function (error, results, fields) {
    if (error) throw error
    view.detail(req, res, { films, film: results[0], eps: results })
  })
}

module.exports = {
  home,
  search,
  detail
}
