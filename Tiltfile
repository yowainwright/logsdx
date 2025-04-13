docker_build(
    'json-logger',
    '.',
    dockerfile='./ops/dockerfiles/json.Dockerfile'
)

k8s_yaml('./ops/k8s/json.yaml')

k8s_resource(
    'json-logger',
    labels=['logger'],
    trigger_mode=TRIGGER_MODE_AUTO,
    auto_init=True
)

docker_build(
    'react-preview-app',
    '.',
    dockerfile='./ops/dockerfiles/react.Dockerfile',
    live_update=[
        sync('opts/fixtures/react-preview', '/app'),
        sync('src', '/app/src'),
    ]
)

k8s_yaml('./ops/k8s/react.yaml')

k8s_resource(
    'react-preview-app', 
    labels=['react-preview-app'],
    port_forwards=['3001:3001'], 
    trigger_mode=TRIGGER_MODE_AUTO,
    auto_init=True
)