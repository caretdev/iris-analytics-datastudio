var cc = DataStudioApp.createCommunityConnector();

// https://developers.google.com/datastudio/connector/reference#getconfig
function getConfig(request) {
  let config = cc.getConfig();

  const cubesSelect = config
    .newSelectSingle()
    .setId('cube')
    .setName('Cube')
    .setHelpText(
      'Select cube'
    );
  Cubes().forEach(cube => {
    cubesSelect.addOption(config.newOptionBuilder().setLabel(cube.displayName).setValue(cube.name))
  })

  config.setDateRangeRequired(true);
  config.setIsSteppedConfig(false);

  return config.build();
}