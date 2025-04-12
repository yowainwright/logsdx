docker_build('logsx', '.', dockerfile='Dockerfile')

local_resource(
  'logsx-dev',
  './scripts/tilt-entrypoint.sh',
  deps=['src/', 'fixtures/', 'log_rules.json'],
  resource_deps=[],
  allow_parallel=True
)