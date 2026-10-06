#!/usr/bin/env bash
# One-time server preparation. Run ON THE SERVER as root (Ubuntu/Debian):
#   ssh -i ~/lifecome root@<server-ip> 'bash -s' < deploy/server-setup.sh
#
# Installs Docker, Nginx, certbot, fail2ban and automatic security updates; adds 2 GB of swap
# (a 2 GB box can run out of memory building the image); opens only SSH + HTTP/HTTPS in the
# firewall; creates /opt/lifecome-api. It does NOT touch SSH settings - disable password login
# yourself once key login is confirmed working.
set -euo pipefail

if [[ $EUID -ne 0 ]]; then
  echo "Run as root." >&2
  exit 1
fi

export DEBIAN_FRONTEND=noninteractive

apt-get update
apt-get install -y ca-certificates curl rsync ufw nginx certbot python3-certbot-nginx fail2ban unattended-upgrades

# Docker + the compose plugin. Prefer the distro packages; fall back to Docker's official
# convenience script if the compose plugin isn't available for this release.
if ! command -v docker >/dev/null 2>&1; then
  apt-get install -y docker.io docker-compose-v2 || true
fi
if ! docker compose version >/dev/null 2>&1; then
  curl -fsSL https://get.docker.com | sh
fi
systemctl enable --now docker

# Swap (skipped if the server already has some).
if [[ -z "$(swapon --show --noheadings)" ]]; then
  fallocate -l 2G /swapfile
  chmod 600 /swapfile
  mkswap /swapfile
  swapon /swapfile
  echo '/swapfile none swap sw 0 0' >> /etc/fstab
fi

# Firewall: SSH must be allowed BEFORE enabling, or this session would be cut off.
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable

systemctl enable --now fail2ban
dpkg-reconfigure -f noninteractive unattended-upgrades

mkdir -p /opt/lifecome-api

echo
echo "Server ready. Next, from your Mac:"
echo "  SERVER=root@<ip> SSH_KEY=~/lifecome DOMAIN=api.example.com ./deploy/deploy.sh --first-time --push-env"
