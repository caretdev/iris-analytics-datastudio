var cc = DataStudioApp.createCommunityConnector();

function getFields(request, original) {
  const cube = request.configParams.cube;
  const fields = cc.getFields();
  const types = cc.FieldType;
  const aggregations = cc.AggregationType;

  Measures(cube).forEach(measure => {
    const id = `[Measures].[${measure.name}]`
    const normId = normalizeId(id);
    fields
      .newMetric()
      .setGroup('Metric')
      .setId(normId)
      .setName(original ? id : measure.caption)
      .setType(getType(measure.type, types.NUMBER))
      .setAggregation(aggregations.SUM);
  })

  Filters(cube).forEach(filter => {
    const id = `${filter.value}.MEMBERS`;
    const normId = normalizeId(id);
    fields
      .newDimension()
      .setGroup('Dimension')
      .setId(normId)
      .setType(getType(filter.type, types.TEXT))
      // .setType(types.TEXT)
      .setName(original ? id : filter.caption);
  })

  return fields;
}

function getRealFields(request) {
}

function normalizeId(id) {
  return id
    .replaceAll(/\./g, '_')
    .replaceAll(/[\[\]%]/g, '')
}

function getType(type, defaultType) {
  const types = cc.FieldType;
  switch (type.toLowerCase()) {
    case 'day':
      return types.YEAR_MONTH_DAY;
    case 'year':
      return types.YEAR;
    case 'month':
      return types.MONTH;
    case 'week':
      return types.WEEK;
    case 'integer':
      return types.NUMBER;
    case 'number':
      return types.NUMBER;
    case 'boolean':
      return types.BOOLEAN;
    default:
      return defaultType;
  }
}

// https://developers.google.com/datastudio/connector/reference#getschema
function getSchema(request) {
  return cc.newGetSchemaResponse()
    .setFields(getFields(request))
    .build();
}


function formatData(requestedFields, data) {
  const types = cc.FieldType;
  var row = requestedFields.asArray().map(field => {
    var value = data[field.getName()] || '';
    switch (field.getType()) {
      case types.YEAR_MONTH_DAY:
        return toDate(value);
      case types.YEAR:
        return parseInt(value);
      case types.NUMBER:
        return parseInt(value);
      case types.BOOLEAN:
        return value == '1';
      default:
        return value;
    }
  });
  return row;
}

function toDate(value) {
  var d = new Date(date),
    month = '' + (d.getMonth() + 1),
    day = '' + d.getDate(),
    year = d.getFullYear();

  if (month.length < 2)
    month = '0' + month;
  if (day.length < 2)
    day = '0' + day;

  return [year, month, day].join('');
}