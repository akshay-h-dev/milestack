from typing import Dict, List
from datetime import datetime, timezone
import uuid

# ======================================================
# In-memory DB
# ======================================================
db = {
    "users": [],               # registered users
    "projects": [],            # projects
    "tasks": [],
    "milestones": [],
    "chat_threads": [],

    # NEW — Activity Feed
    # {id, projectId, userId, description, timestamp}
    "activities": [],

    # NEW — Project members
    # {id, projectId, userId, role}
    "project_members": [],

    # NEW — Invites
    # {id, projectId, email, name, status}
    "invites": []
}

# ======================================================
# Utility helpers
# ======================================================

def now_iso():
    return datetime.now(timezone.utc).isoformat()

def gen_id(prefix: str) -> str:
    return f"{prefix}-{uuid.uuid4().hex[:8]}"


# ======================================================
# CRUD Helpers
# ======================================================

def find(collection: str, **query):
    results = []
    for item in db.get(collection, []):
        match = True
        for k, v in query.items():
            if item.get(k) != v:
                match = False
                break
        if match:
            results.append(item)
    return results


def find_one(collection: str, key: str, value):
    for item in db.get(collection, []):
        if item.get(key) == value:
            return item
    return None


def insert(collection: str, obj: dict):
    db[collection].append(obj)
    return obj


def update(collection: str, obj_id: str, patch: dict):
    item = find_one(collection, "id", obj_id)
    if not item:
        return None
    item.update(patch)
    return item


def delete(collection: str, obj_id: str):
    item = find_one(collection, "id", obj_id)
    if not item:
        return False
    db[collection].remove(item)
    return True


# ======================================================
# Activity System
# ======================================================

def log_activity(projectId: str, userId: str, description: str):
    """
    Log an activity entry for a project.

    Structure:
    {
        id,
        projectId,
        userId,
        description,
        timestamp
    }
    """
    act = {
        "id": gen_id("act"),
        "projectId": projectId,
        "userId": userId,
        "description": description,
        "timestamp": now_iso(),
    }
    insert("activities", act)
    return act


def get_project_activities(projectId: str):
    """Returns project activities sorted newest-first."""
    acts = [
        a for a in db["activities"]
        if a["projectId"] == projectId
    ]
    acts.sort(key=lambda x: x["timestamp"], reverse=True)
    return acts


# ======================================================
# Project Member Helpers
# ======================================================

def add_member(projectId: str, userId: str, role: str = "member"):
    """Adds a user to a project with a role (default = member)."""

    # Avoid duplicates
    existing = find("project_members", projectId=projectId, userId=userId)
    if existing:
        entry = existing[0]
        # Only update role if they are not leader
        if entry.get("role") != "leader":
            entry["role"] = role
        return entry

    entry = {
        "id": gen_id("pm"),
        "projectId": projectId,
        "userId": userId,
        "role": role
    }

    insert("project_members", entry)
    return entry


def remove_member(projectId: str, userId: str):
    """Remove user from project unless they are leader."""
    entries = find("project_members", projectId=projectId, userId=userId)

    for e in entries:
        if e.get("role") == "leader":
            continue
        delete("project_members", e["id"])

    return True


def get_project_members(projectId: str):
    memberships = find("project_members", projectId=projectId)
    users = []

    for mem in memberships:
        u = find_one("users", "id", mem["userId"])
        if u:
            users.append({
                "id": u["id"],
                "name": u["name"],
                "email": u["email"],
                "status": u.get("status", "offline"),
                "role": mem.get("role", "member")
            })

    return users


# ======================================================
# Invite Helpers
# ======================================================

def create_invite(projectId: str, email: str, name: str):
    invite = {
        "id": gen_id("invite"),
        "projectId": projectId,
        "email": email,
        "name": name,
        "status": "pending",
        "createdAt": now_iso(),
    }
    insert("invites", invite)
    return invite


def get_project_invites(projectId: str):
    return find("invites", projectId=projectId)


def mark_invite_accepted(inviteId: str):
    inv = find_one("invites", "id", inviteId)
    if inv:
        inv["status"] = "accepted"
    return inv


# ======================================================
# Chat Thread Helpers
# ======================================================

def create_chat_thread(title: str, projectId: str, creatorId: str):
    thread = {
        "id": gen_id("thread"),
        "title": title,
        "projectId": projectId,
        "creatorId": creatorId,
        "messages": [],
        "createdAt": now_iso(),
        "updatedAt": now_iso(),
    }
    insert("chat_threads", thread)
    return thread


def get_chat_threads_by_project(projectId: str):
    return find("chat_threads", projectId=projectId)


def update_chat_thread(threadId: str, patch: dict):
    return update("chat_threads", threadId, patch)


def delete_chat_thread(threadId: str):
    return delete("chat_threads", threadId)


# ======================================================
# DB Initialization Safety
# ======================================================

def normalize_db():
    db.setdefault("project_members", [])
    db.setdefault("invites", [])
    db.setdefault("activities", [])
    db.setdefault("chat_threads", [])

normalize_db()
