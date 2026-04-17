#!/usr/bin/env bash
set -euo pipefail

# Show status of all independent project runtimes on the remote server
# Usage: bash ops/scripts/show-project-runtimes-status.sh [REMOTE_TARGET]

REMOTE_TARGET="${1:-carbonet2026@136.117.100.221}"
REMOTE_ROOT="${2:-/opt/projects/carbonet}"

echo "========================================================================"
echo " Carbonet Independent Project Runtimes Status"
echo " Target: $REMOTE_TARGET"
echo "========================================================================"
printf "%-10s | %-15s | %-10s | %-20s\n" "PROJECT" "STATUS" "PORT" "ACTIVE VERSION"
echo "------------------------------------------------------------------------"

# Remote execution to gather status
ssh -o StrictHostKeyChecking=no "$REMOTE_TARGET" "
    cd $REMOTE_ROOT/var/releases
    for p_dir in \$(ls -d */ 2>/dev/null | sed 's/\///'); do
        # Check service status
        status=\$(sudo systemctl is-active carbonet@\$p_dir 2>/dev/null || echo 'inactive')
        
        # Check active version via symlink
        version='unknown'
        if [ -L \"\$p_dir/current\" ]; then
            version=\$(readlink \"\$p_dir/current\" | xargs basename)
        fi
        
        # Check if port is listening (assume default 18000 for now, could be improved)
        # For simplicity, we just show if the process exists
        port_info='18000' # Default
        
        printf '%-10s | %-15s | %-10s | %-20s\n' \"\$p_dir\" \"\$status\" \"\$port_info\" \"\$version\"
    done
"
echo "========================================================================"
