docker compose down

docker images --format "{{.Repository}}:{{.Tag}}" | \
  grep -E "^tickly-" | \
  xargs -r docker rmi -f