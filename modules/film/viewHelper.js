let render = {
  film: (film) => `<div class="xsitem">
    <a href="/filmdetail/${film.id}">
      <img src="${film.img}" alt="" width="285" height="437">
    </a>
    <a href="/filmdetail/${film.id}">
      <div class="xsinfo">
        <div class="xsname">${film.name}</div>
        <div class="xsname_en">${film.name_en}</div>
        <div class="xsname_duration">${film.time}</div>
        <div class="xsname_label">${film.format}</div>
      </div>
    </a>
  </div>`,
  filmhot: (film) => `<div class="xsitem xsitem-top">
    <a href="/filmdetail/${film.id}">
      <img src="${film.img}" alt="" width="285" height="437">
    </a>
    <a href="/filmdetail/${film.id}">
      <div class="xsinfo">
        <div class="xsname">${film.name}</div>
        <div class="xsname_en">${film.name_en}</div>
        <div class="xsname_duration">${film.time}</div>
        <div class="xsname_label">${film.format}</div>
      </div>
    </a>
  </div>`,
  filmRecommend: (film) => `<div class="xsitem xsitem-top">
    <a href="/filmdetail/${film.slug}">
      <img src="${film.img || 'img/films/1.jpg'}" alt="" width="285" height="437">
    </a>
    <a href="/filmdetail/${film.slug}">
      <div class="xsinfo">
        <div class="xsname">${film.name_vi || ''}</div>
        <div class="xsname_en">${film.name || ''}</div>
        <div class="xsname_duration">${film.duration || ''}</div>
        <div class="xsname_label">${film.format || 'HD-Vietsub'}</div>
      </div>
    </a>
  </div>`
}

module.exports = {
  render
}
