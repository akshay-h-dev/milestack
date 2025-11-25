# --------------------------------------------------------------
# app.py — FINAL VERSION WITH FULL ACTIVITY LOGGING
# --------------------------------------------------------------

from flask import Flask, request, jsonify
from flask_cors import CORS

from auth import (
    hash_password,
    verify_password,
    create_jwt,
    jwt_required
)

from models import (
    db, gen_id, now_iso,
    find_one, find, insert, update, delete,
    add_member, remove_member,

    # Chat helpers
    create_chat_thread, get_chat_threads_by_project, update_chat_thread, delete_chat_thread,

    # Activity helpers
    log_activity, get_project_activities
)

# --------------------------------------------------------------
# APP + CORS SETUP
# --------------------------------------------------------------

app = Flask(__name__)

@app.before_request
def handle_options():
    if request.method == "OPTIONS":
        response = app.make_default_options_response()
        headers = response.headers

        headers["Access-Control-Allow-Origin"] = "http://localhost:9002"
        headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
        headers["Access-Control-Allow-Headers"] = (
            "Authorization, Content-Type, X-Requested-With"
        )
        headers["Access-Control-Allow-Credentials"] = "true"

        return response

CORS(
    app,
    resources={r"/*": {"origins": ["http://localhost:9002"]}},
    supports_credentials=True,
    allow_headers=["Authorization", "Content-Type"],
    expose_headers=["Authorization"],
    methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"]
)

# --------------------------------------------------------------
# HELPERS
# --------------------------------------------------------------

def error(msg, code=400):
    return jsonify({"error": msg}), code

def user_public(u):
    return {
        "id": u["id"],
        "name": u["name"],
        "email": u["email"],
        "status": u.get("status", "offline"),
    }

def is_leader(projectId, userId):
    pm = find("project_members", projectId=projectId, userId=userId)
    return pm and pm[0]["role"] == "leader"

# --------------------------------------------------------------
# AUTH — SIGNUP / LOGIN  + LOGIN ACTIVITY
# --------------------------------------------------------------

@app.route("/api/auth/signup", methods=["POST"])
def signup():
    data = request.get_json() or {}
    name = data.get("name")
    email = data.get("email")
    password = data.get("password")

    if not all([name, email, password]):
        return error("name, email, password required")

    if find_one("users", "email", email):
        return error("email already exists")

    user = {
        "id": gen_id("user"),
        "name": name,
        "email": email,
        "password_hash": hash_password(password),
        "status": "online"
    }
    insert("users", user)

    # Accept pending invites
    invites = [i for i in db["invites"] if i["email"] == email]
    for inv in invites:
        add_member(inv["projectId"], user["id"], role="member")
        delete("invites", inv["id"])
        log_activity(inv["projectId"], user["id"], f"joined the project")

    token = create_jwt({
        "user_id": user["id"],
        "email": user["email"],
        "name": user["name"]
    })

    return jsonify({"token": token, "user": user_public(user)}), 201


@app.route("/api/auth/login", methods=["POST"])
def login():
    data = request.get_json() or {}
    email = data.get("email")
    password = data.get("password")

    user = find_one("users", "email", email)
    if not user or not verify_password(user["password_hash"], password):
        return error("invalid credentials", 401)

    user["status"] = "online"

    # Log "login" for all projects the user belongs to
    for pm in find("project_members", userId=user["id"]):
        log_activity(pm["projectId"], user["id"], "logged in")

    token = create_jwt({
        "user_id": user["id"],
        "email": user["email"],
        "name": user["name"],
    })

    return jsonify({"token": token, "user": user_public(user)})

# --------------------------------------------------------------
# PROJECTS
# --------------------------------------------------------------

@app.route("/api/projects", methods=["POST"])
@jwt_required
def create_project():
    data = request.get_json() or {}
    title = data.get("title")

    if not title:
        return error("title required")

    user_id = request.user["user_id"]

    proj = {
        "id": gen_id("proj"),
        "title": title,
        "description": data.get("description", ""),
        "status": "running",
        "members": [user_id]
    }
    insert("projects", proj)

    add_member(proj["id"], user_id, role="leader")
    log_activity(proj["id"], user_id, "created the project")

    return jsonify(proj), 201


@app.route("/api/projects", methods=["GET"])
@jwt_required
def get_projects():
    user_id = request.user["user_id"]
    visible = []

    for p in db["projects"]:
        pm = find("project_members", projectId=p["id"], userId=user_id)
        if pm:
            visible.append(p)

    return jsonify(visible)

# --------------------------------------------------------------
# TASKS + ACTIVITY
# --------------------------------------------------------------

@app.route("/api/tasks", methods=["GET"])
@jwt_required
def get_tasks():
    projectId = request.args.get("projectId")
    if not projectId:
        return error("projectId required")

    user_id = request.user["user_id"]
    pm = find("project_members", projectId=projectId, userId=user_id)

    if not pm:
        return error("Not authorized", 403)

    return jsonify(find("tasks", projectId=projectId))


@app.route("/api/tasks", methods=["POST"])
@jwt_required
def create_task_route():
    data = request.get_json() or {}
    required = ["title", "priority", "status", "projectId"]

    for r in required:
        if r not in data:
            return error(f"{r} is required")

    user_id = request.user["user_id"]

    task = {
        "id": gen_id("task"),
        "title": data["title"],
        "description": data.get("description", ""),
        "priority": data["priority"],
        "status": data["status"],
        "assigneeId": data.get("assigneeId"),
        "projectId": data["projectId"],
        "createdAt": now_iso(),
        "updatedAt": now_iso(),
    }
    insert("tasks", task)

    log_activity(data["projectId"], user_id, f"created task: {task['title']}")

    return jsonify(task), 201


@app.route("/api/tasks/<task_id>", methods=["PUT"])
@jwt_required
def update_task(task_id):
    patch = request.get_json() or {}
    task = find_one("tasks", "id", task_id)

    if not task:
        return error("task not found", 404)

    user_id = request.user["user_id"]

    allowed = ["title", "description", "priority", "status", "assigneeId"]

    for k in allowed:
        if k in patch:
            task[k] = patch[k]

    task["updatedAt"] = now_iso()

    log_activity(task["projectId"], user_id, f"updated task: {task['title']}")

    return jsonify(task)


@app.route("/api/tasks/<task_id>", methods=["DELETE"])
@jwt_required
def delete_task(task_id):
    task = find_one("tasks", "id", task_id)

    if not task:
        return error("task not found", 404)

    user_id = request.user["user_id"]
    delete("tasks", task_id)

    log_activity(task["projectId"], user_id, f"deleted task: {task['title']}")

    return jsonify({"ok": True})

# --------------------------------------------------------------
# MILESTONES + ACTIVITY
# --------------------------------------------------------------

@app.route("/api/milestones", methods=["GET"])
@jwt_required
def get_milestones():
    projectId = request.args.get("projectId")
    if not projectId:
        return error("projectId required")

    return jsonify(find("milestones", projectId=projectId))


@app.route("/api/milestones", methods=["POST"])
@jwt_required
def create_milestone():
    data = request.get_json() or {}
    required = ["title", "projectId"]

    for r in required:
        if r not in data:
            return error(f"{r} is required")

    user_id = request.user["user_id"]

    mile = {
        "id": gen_id("mile"),
        "title": data["title"],
        "description": data.get("description", ""),
        "dueDate": data.get("dueDate"),
        "progress": data.get("progress", 0),
        "status": data.get("status", "pending"),
        "projectId": data["projectId"],
        "createdAt": now_iso(),
        "updatedAt": now_iso(),
    }

    insert("milestones", mile)

    log_activity(data["projectId"], user_id, f"created milestone: {mile['title']}")

    return jsonify(mile), 201


@app.route("/api/milestones/<mile_id>", methods=["PUT"])
@jwt_required
def update_milestone(mile_id):
    patch = request.get_json() or {}
    milestone = find_one("milestones", "id", mile_id)

    if not milestone:
        return error("milestone not found", 404)

    user_id = request.user["user_id"]

    allowed = ["title", "description", "dueDate", "status", "progress"]
    for k in allowed:
        if k in patch:
            milestone[k] = patch[k]

    milestone["updatedAt"] = now_iso()

    log_activity(milestone["projectId"], user_id, f"updated milestone: {milestone['title']}")

    return jsonify(milestone)


@app.route("/api/milestones/<mile_id>", methods=["DELETE"])
@jwt_required
def delete_milestone(mile_id):
    milestone = find_one("milestones", "id", mile_id)

    if not milestone:
        return error("milestone not found", 404)

    user_id = request.user["user_id"]
    delete("milestones", mile_id)

    log_activity(milestone["projectId"], user_id, f"deleted milestone: {milestone['title']}")

    return jsonify({"ok": True})

# --------------------------------------------------------------
# CHAT THREADS + ACTIVITY
# --------------------------------------------------------------

@app.route("/api/chatThreads", methods=["GET"])
@jwt_required
def get_chat_threads():
    projectId = request.args.get("projectId")
    if not projectId:
        return error("projectId required")

    return jsonify(get_chat_threads_by_project(projectId))


@app.route("/api/chatThreads", methods=["POST"])
@jwt_required
def create_chat_thread_route():
    data = request.get_json() or {}
    title = data.get("title")
    projectId = data.get("projectId")

    if not title or not projectId:
        return error("title and projectId required")

    user_id = request.user["user_id"]

    thread = create_chat_thread(title=title, projectId=projectId, creatorId=user_id)

    log_activity(projectId, user_id, f"created chat thread: {title}")

    return jsonify(thread), 201


@app.route("/api/chatThreads/<thread_id>", methods=["PUT"])
@jwt_required
def update_chat_thread_route(thread_id):
    data = request.get_json() or {}
    thread = find_one("chat_threads", "id", thread_id)

    if not thread:
        return error("thread not found", 404)

    user_id = request.user["user_id"]

    # Append message
    if "message" in data:
        msg = data["message"]
        text = (msg.get("text") or "").strip()

        if not text:
            return error("message.text required")

        msg_obj = {
            "id": gen_id("msg"),
            "text": text,
            "senderId": msg.get("senderId", user_id),
            "timestamp": now_iso()
        }

        messages = list(thread.get("messages", []))
        messages.append(msg_obj)

        updated = update_chat_thread(thread_id, {
            "messages": messages,
            "updatedAt": now_iso()
        })

        log_activity(thread["projectId"], user_id, f"sent a message in thread: {thread['title']}")

        return jsonify(updated)

    # Patch thread
    allowed = ["title", "messages"]
    patch = {k: data[k] for k in allowed if k in data}

    if patch:
        patch["updatedAt"] = now_iso()
        updated = update_chat_thread(thread_id, patch)
        return jsonify(updated)

    return jsonify(thread)


@app.route("/api/chatThreads/<thread_id>", methods=["DELETE"])
@jwt_required
def delete_chat_thread_route(thread_id):
    thread = find_one("chat_threads", "id", thread_id)

    if not thread:
        return error("thread not found", 404)

    user_id = request.user["user_id"]
    delete_chat_thread(thread_id)

    log_activity(thread["projectId"], user_id, f"deleted chat thread: {thread['title']}")

    return jsonify({"ok": True})

# --------------------------------------------------------------
# TEAMMATES + ACTIVITY
# --------------------------------------------------------------

@app.route("/api/teammates", methods=["GET"])
@jwt_required
def get_teammates():
    projectId = request.args.get("projectId")
    if not projectId:
        return error("projectId required")

    pm_list = find("project_members", projectId=projectId)

    members = []
    for pm in pm_list:
        u = find_one("users", "id", pm["userId"])
        if u:
            members.append({
                "id": u["id"],
                "name": u["name"],
                "email": u["email"],
                "status": u.get("status", "offline"),
                "role": pm["role"]
            })

    # Sort: leader first
    members.sort(key=lambda x: 0 if x["role"] == "leader" else 1)

    return jsonify(members)


@app.route("/api/invites", methods=["GET"])
@jwt_required
def list_invites():
    projectId = request.args.get("projectId")
    if projectId:
        return jsonify([
            i for i in db["invites"]
            if i["projectId"] == projectId and i["status"] == "pending"
        ])
    return jsonify(db["invites"])

# --------------------------------------------------------------
# ACTIVITIES ENDPOINT (MAIN FEED FOR FRONTEND)
# --------------------------------------------------------------

@app.route("/api/activities", methods=["GET"])
@jwt_required
def get_activities_route():
    projectId = request.args.get("projectId")

    if not projectId:
        return error("projectId required")

    user_id = request.user["user_id"]
    pm = find("project_members", projectId=projectId, userId=user_id)

    if not pm:
        return error("Not authorized", 403)

    return jsonify(get_project_activities(projectId))

# --------------------------------------------------------------
# ROOT
# --------------------------------------------------------------

@app.route("/")
def index():
    return jsonify({"ok": True, "msg": "Milestack backend running"})

# --------------------------------------------------------------
# RUN
# --------------------------------------------------------------

if __name__ == "__main__":
    app.run(port=5000, debug=True)
