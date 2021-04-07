const viewHelper = require('./viewHelper')
let home = function (req, res, data) {
  let films = data.films || {}
  res.render('home/home', {
    locals: {
      render: viewHelper.render,

      filmHot: films,
      filmRecommend: data.filmRecommend,

      filmCinema: films,
      filmOneshot: films,
      filmMulti: films,
      filmCartoon: films
    },
    partials: {
      homehead: 'home/homehead',
      homeheader: 'home/homeheader',
      homefooter: 'home/homefooter',
      homebody: 'home/homebody',
      homesidebar: 'home/homesidebar'
    }
  })
}

let search = function (req, res, data) {
  let films = data.films || {}
  res.render('search/search', {
    locals: {
      render: viewHelper.render,

      filmHot: films,
      filmRecommend: films,

      filmCinema: films,
      filmOneshot: films,
      filmMulti: films,
      filmCartoon: films
    },
    partials: {
      searchHead: 'search/searchhead',
      homeHeader: 'home/homeheader',
      searchBody: 'search/searchbody',
      homeFooter: 'home/homefooter',
      homeSidebar: 'home/homesidebar'
    }
  })
}

let detail = function (req, res, data) {
  let films = data.films || {}
  console.log(data.film)
  res.render('filmdetail/filmdetail', {
    locals: {
      render: viewHelper.render,

      filmHot: films,
      filmRecommend: films,

      filmCinema: films,
      filmOneshot: films,
      filmMulti: films,
      filmCartoon: films,
      film: data.film,
      eps: data.eps
    },
    partials: {
      searchHead: 'filmdetail/searchhead',
      homeHeader: 'home/homeheader',
      filmDetailBody: 'filmdetail/filmdetailbody',
      homeFooter: 'home/homefooter',
      homeSidebar: 'home/homesidebar'
    }
  })
}

module.exports = {
  home,
  search,
  detail
}
