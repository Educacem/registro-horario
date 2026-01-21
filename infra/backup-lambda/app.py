# app.py
import json
import os
import subprocess
from datetime import datetime, timezone

import boto3

secrets = boto3.client("secretsmanager")
s3 = boto3.client("s3")


def _get_env(name: str, default: str | None = None) -> str:
    val = os.environ.get(name, default)
    if not val:
        raise ValueError(f"Missing required env var: {name}")
    return val


def _load_db_secret(secret_name: str) -> dict:
    resp = secrets.get_secret_value(SecretId=secret_name)
    if "SecretString" in resp and resp["SecretString"]:
        return json.loads(resp["SecretString"])
    return json.loads(resp["SecretBinary"].decode("utf-8"))


def handler(event, context):
    secret_name = _get_env("SECRET_NAME", "prod/timply/rds/backup")
    bucket = _get_env("S3_BUCKET", "timply-db-backups-weekly")
    prefix = os.environ.get("S3_PREFIX", "backups/weekly")
    schema = os.environ.get("PG_SCHEMA")
    compress_level = os.environ.get("PG_COMPRESS", "6")

    db = _load_db_secret(secret_name)

    host = db["host"]
    port = str(db.get("port", 5432))
    dbname = db.get("dbName") or db.get("dbname") or db.get("database") or "postgres"
    user = db.get("userName") or db.get("username") or db.get("user") or "postgres"
    password = db["password"]

    now = datetime.now(timezone.utc)
    date_path = now.strftime("%Y/%m/%d")
    ts = now.strftime("%Y%m%d-%H%M%S")
    file_name = f"{dbname}-{ts}.dump"
    local_path = f"/tmp/{file_name}"

    prefix = prefix.strip("/")
    s3_key = f"{prefix}/{date_path}/{file_name}" if prefix else f"{date_path}/{file_name}"

    env = os.environ.copy()
    env["PGPASSWORD"] = password

    # (Opcional) ayuda a depurar qué pg_dump estás usando
    try:
        v = subprocess.run(["pg_dump", "--version"], env=env, capture_output=True, text=True, check=True)
        print("[INFO] pg_dump version:", (v.stdout or v.stderr).strip())
    except Exception as e:
        print("[WARN] Could not read pg_dump version:", repr(e))

    cmd = [
        "pg_dump",
        "-h", host,
        "-p", port,
        "-U", user,
        "-F", "c",
        "-Z", str(compress_level),
        "-f", local_path,
    ]

    if schema:
        cmd += ["-n", schema]

    # ✅ dbname al FINAL (sin -d)
    cmd.append(dbname)

    print(f"[INFO] Running: {' '.join(cmd[:-1])} ... (db -> {dbname}, output -> {local_path})")

    try:
        res = subprocess.run(cmd, env=env, capture_output=True, text=True, check=True)
        if res.stdout:
            print("[pg_dump stdout]", res.stdout[-2000:])
        if res.stderr:
            print("[pg_dump stderr]", res.stderr[-2000:])
    except subprocess.CalledProcessError as e:
        print("[ERROR] pg_dump failed")
        print("stdout:", (e.stdout or "")[-4000:])
        print("stderr:", (e.stderr or "")[-4000:])
        raise

    print(f"[INFO] Uploading to s3://{bucket}/{s3_key}")
    s3.upload_file(local_path, bucket, s3_key)

    try:
        os.remove(local_path)
    except Exception:
        pass

    return {
        "ok": True,
        "bucket": bucket,
        "key": s3_key,
        "db": dbname,
        "timestamp_utc": now.isoformat(),
    }
