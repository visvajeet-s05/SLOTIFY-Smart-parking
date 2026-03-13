import os
import subprocess
import sys
import json

def setup_cloudflare_tunnel():
    """
    Automates the creation and configuration of a Cloudflare Tunnel
    for the Slotify Edge Node.
    """
    print("☁️  Slotify Edge Node - Cloudflare Tunnel Setup", flush=True)
    
    # 1. Install cloudflared if not present
    try:
        subprocess.run(["cloudflared", "--version"], check=True, capture_output=True)
        print("✅ cloudflared is already installed.", flush=True)
    except (subprocess.CalledProcessError, FileNotFoundError):
        print("📥 cloudflared not found. Please install it first:", flush=True)
        print("   Windows: choco install cloudflared", flush=True)
        print("   Linux: curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb", flush=True)
        return

    # 2. Authenticate
    print("\n🔑 Step 1: Login to Cloudflare...", flush=True)
    subprocess.run(["cloudflared", "tunnel", "login"], check=True)

    # 3. Create Tunnel
    tunnel_name = f"slotify-edge-{os.getenv('EDGE_NODE_ID', 'default')}"
    print(f"\n🏗️  Step 2: Creating tunnel '{tunnel_name}'...", flush=True)
    try:
        result = subprocess.run(["cloudflared", "tunnel", "create", tunnel_name], check=True, capture_output=True, text=True)
        print(f"✅ Tunnel created successfully.", flush=True)
    except subprocess.CalledProcessError as e:
        if "already exists" in e.stderr:
            print(f"ℹ️  Tunnel '{tunnel_name}' already exists. Continuing...", flush=True)
        else:
            print(f"❌ Error creating tunnel: {e.stderr}", flush=True)
            return

    # 4. Route DNS
    domain = os.getenv("DDNS_DOMAIN")
    if not domain:
        domain = input("\n🌐 Enter your Cloudflare domain (e.g. edge1.slotify.com): ")
    
    print(f"\n🌍 Step 3: Routing {domain} to tunnel...", flush=True)
    subprocess.run(["cloudflared", "tunnel", "route", "dns", tunnel_name, domain], check=True)

    # 5. Create Config
    config_dir = os.path.expanduser("~/.cloudflared")
    if not os.path.exists(config_dir):
        os.makedirs(config_dir)
        
    config_path = os.path.join(config_dir, "config.yaml")
    
    # We need to find the credentials file
    creds_file = ""
    for file in os.listdir(config_dir):
        if file.endswith(".json"):
            creds_file = os.path.join(config_dir, file)
            break

    config_content = f"""
tunnel: {tunnel_name}
credentials-file: {creds_file}

ingress:
  - hostname: {domain}
    service: http://localhost:{os.getenv('PYTHON_SERVICE_PORT', '5000')}
  - service: http_status:404
"""
    with open(config_path, "w") as f:
        f.write(config_content)
    
    print(f"✅ Config generated at {config_path}", flush=True)
    print(f"\n🚀 Setup Complete! Start your tunnel with:", flush=True)
    print(f"   cloudflared tunnel run {tunnel_name}", flush=True)

if __name__ == "__main__":
    setup_cloudflare_tunnel()
