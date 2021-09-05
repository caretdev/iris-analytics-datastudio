var cc = DataStudioApp.createCommunityConnector();

// https://developers.google.com/datastudio/connector/reference#getdata
function getData(request) {
  console.log('getData', JSON.stringify(request, '', 2));
  const cube = request.configParams.cube;
  const allFields = getFields(request, true);
  const response = cc.newGetDataResponse();


  let [where, filterFields] = getFilter(request, allFields.asArray());
  filtersApplied = !!where;

  const requestedFields = allFields.forIds(request.fields.filter(f => (!filtersApplied || !f.forFilterOnly)).map(f => f.name));
  const fields = requestedFields.asArray();
  const column = (fields, metric) => fields.filter(f => f.isMetric() == metric).map(f => f.getName());
  const metrics = column(fields, true);
  const dimensions = column(fields, false);
  console.log(metrics, dimensions);
  let query = 'SELECT ';
  query += metrics.length ? `NON EMPTY {${metrics.join(',')}} ON COLUMNS` : '';
  query += (metrics.length && dimensions.length) ? ', ' : '';
  query += dimensions.length ? (dimensions.length > 1 ? `NONEMPTYCROSSJOIN(${dimensions.join(',')})` : `NON EMPTY ${dimensions[0]}`) + ' ON ROWS' : '';
  query += ` FROM [${cube}]`;
  if (where) {
    query += ` WHERE ${where}`;
  }

  console.log('MDX', query);
  let result = MDX(query);
  // console.log(JSON.stringify(result, '', 2));
  if (result.CellData) {
    const colCount = result.Axes[0].Tuples.filter(t => t.MemberInfo.length).length;
    const colHeaderCount = result.Axes.length > 1 ? result.Axes[1].Tuples[0].MemberInfo.length : 0;
    const cellsCount = result.CellData.length
    const rowCount = colCount ? (cellsCount / colCount) : cellsCount;
    console.log('resultInfo', { colCount, colHeaderCount, cellsCount, rowCount });
    let cellIndex = 0;
    const columns = [];
    for (let i = 0; i < colCount; i++) {
      const columnInfo = result.Axes[0].Tuples[i].MemberInfo[0];
      const columnName = getName(columnInfo);
      columns.push(columnName);
    }
    for (let i = 0; i < colHeaderCount; i++) {
      const columnInfo = result.Axes[1].Tuples[0].MemberInfo[i];
      const columnName = getName(columnInfo) + '.MEMBERS';
      columns.push(columnName);
    }

    for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
      let row = {};
      let index = 0;
      for (let i = 0; i < colCount; i++) {
        const value = result.CellData[cellIndex++].ValueLogical
        row[columns[index++]] = value;
      }
      for (let i = 0; i < colHeaderCount; i++) {
        const value = result.Axes[1].Tuples[rowIndex].MemberInfo[i].text;
        row[columns[index++]] = value;
      }
      row = formatData(requestedFields, row);
      response.addRow(row);
    }
  }

  return response.setFiltersApplied(filtersApplied).setFields(requestedFields).build();
}

function getFilter(request, allFields) {
  let where = '';
  let fields = [];
  if (!request.dimensionsFilters) {
    return [where, fields];
  }

  request.dimensionsFilters.forEach(list => {
    list.forEach(filter => {
      const { fieldName, values, type, operator } = filter;
      console.log('filterInfo', [fieldName, values, type, operator]);
      if (operator == 'EQUALS' && type == 'INCLUDE') {
        const filterField = allFields.find(f => f.getId() == fieldName);
        const filterFieldName = filterField.getName().split('.').slice(0, -1).join('.');
        const value = values.pop();
        console.log('filterName', filterFieldName);
        if (value.match(/^\[[^\]]+\]$/)) {
          where += `${filterFieldName}.${value}`;
          fields.push(fieldName);
          console.log('singleFilter', where)
        } else {
          const inRange = value.match(/^(\[[^\]]+\]):(\[[^\]]+\])$/);
          if (inRange) {
            fields.push(fieldName);
            const [, from, to] = inRange;
            where += `${filterFieldName}.${from}:${filterFieldName}.${to}`;
            console.log('inRangeFilter', where)
          }
        }
      }
    })
  });
  return [where, fields];
}

function getName(info) {
  let name = [];
  for (n of ['dimName', 'hierName', 'levelName']) {
    if (info[n]) {
      name.push(`[${info[n]}]`);
    }
  }
  return name.join('.')
}
