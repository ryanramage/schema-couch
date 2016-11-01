module.exports = [
  { from: '_db'     , to  : '../..',    description: "Access to this database"  },
  { from: '_db/*'   , to  : '../../*' },
  { from: '_ddoc'   , to  : '',         description: "Access to this design document"  },
  { from: '_ddoc/*' , to  : '*'},

  { from: '/schemas', to: '_show/schemas'},
  { from: '/counts',  to: '_view/list_by_type', query: { reduce: 'true', group_level: '1' }},
  { from: '/:type/schema', to: '_show/schemas', query: { type: ':type' }},
  { from: '/:type',   to: '_show/type_routes',  query: { type: ':type' }},
  { from: '/',        to: '_show/types'},

  { from: '/*', to: '_show/unhandled' }
]
