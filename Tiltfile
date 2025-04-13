# This file intentionally left empty
# We test logsDX directly with sample log data 

# JSON Logger Service
docker_build(
    'json-logger',
    '.',
    dockerfile='./ops/dockerfiles/json.Dockerfile'
)
k8s_yaml('./ops/k8s/json.yaml')

# Configure port forwarding for json-logger
k8s_resource(
    'json-logger',
    labels=['json-logger'],
    trigger_mode=TRIGGER_MODE_AUTO,
    auto_init=True
)