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
    'react-client',
    '.',
    dockerfile='./ops/dockerfiles/react.Dockerfile',
    live_update=[
        sync('ops/svcs/react-client', '/app'),
        sync('src', '/app/src'),
        sync('packages', '/app/packages'),
    ]
)

k8s_yaml('./ops/k8s/react.yaml')

k8s_resource(
    'react-client',
    labels=['react-client'],
    port_forwards=['8080:80'],
    trigger_mode=TRIGGER_MODE_AUTO,
    auto_init=True
)