docker_build(
    'logsdx',
    '.',
    live_update=[
        sync('.', '/app'),
        run('bun install'),
        run('bun run build'),
    ],
)

local_resource(
  'logsdx-dev',
  './scripts/tilt-entrypoint.sh',
  deps=['src/', 'fixtures/', 'log_rules.json'],
  resource_deps=[],
  allow_parallel=True
)