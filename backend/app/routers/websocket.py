import json
from datetime import datetime, timezone
from typing import Dict, List, Any
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.utils.logging_config import logger

router = APIRouter(tags=["WebSockets"])


class ConnectionManager:
    def __init__(self):
        # Map department_id (str) -> List of WebSocket connections
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, department_id: str):
        await websocket.accept()
        if department_id not in self.active_connections:
            self.active_connections[department_id] = []
        self.active_connections[department_id].append(websocket)
        logger.info(f"WebSocket connected for department {department_id}. Total active: {len(self.active_connections[department_id])}")

    def disconnect(self, websocket: WebSocket, department_id: str):
        if department_id in self.active_connections:
            if websocket in self.active_connections[department_id]:
                self.active_connections[department_id].remove(websocket)
            if not self.active_connections[department_id]:
                del self.active_connections[department_id]
        logger.info(f"WebSocket disconnected from department {department_id}")

    async def broadcast_to_department(self, department_id: str, message: Dict[str, Any]):
        dept_str = str(department_id)
        targets = self.active_connections.get(dept_str, []) + self.active_connections.get("all", [])
        
        # Deduplicate if a socket is somehow registered twice
        unique_targets = list(set(targets))
        
        message_json = json.dumps(message)
        dead_connections = []
        for connection in unique_targets:
            try:
                await connection.send_text(message_json)
            except Exception as e:
                logger.warning(f"Error broadcasting to socket: {e}")
                dead_connections.append(connection)

        # Cleanup dead sockets
        for dead in dead_connections:
            for dept_key, conn_list in list(self.active_connections.items()):
                if dead in conn_list:
                    conn_list.remove(dead)

    async def broadcast_to_all(self, message: Dict[str, Any]):
        message_json = json.dumps(message)
        all_sockets = []
        for conn_list in self.active_connections.values():
            all_sockets.extend(conn_list)
        
        for connection in set(all_sockets):
            try:
                await connection.send_text(message_json)
            except Exception:
                pass


manager = ConnectionManager()


@router.websocket("/ws/queue/{department_id}")
async def queue_websocket_endpoint(websocket: WebSocket, department_id: str):
    """
    Real-time WebSocket connection endpoint for receiving live queue updates,
    token callouts, status changes, and audio announcement signals.
    """
    await manager.connect(websocket, str(department_id))
    try:
        # Send initial welcome / handshake payload
        await websocket.send_text(json.dumps({
            "event": "CONNECTED",
            "department_id": department_id,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "message": f"Connected to live queue channel for department {department_id}"
        }))

        while True:
            # Keep connection alive and accept heartbeat pings from clients
            data = await websocket.receive_text()
            try:
                parsed = json.loads(data)
                if parsed.get("type") == "ping":
                    await websocket.send_text(json.dumps({"type": "pong", "timestamp": datetime.now(timezone.utc).isoformat()}))
            except Exception:
                pass
    except WebSocketDisconnect:
        manager.disconnect(websocket, str(department_id))
    except Exception as e:
        logger.warning(f"WebSocket error: {e}")
        manager.disconnect(websocket, str(department_id))
