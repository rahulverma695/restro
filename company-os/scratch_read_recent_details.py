import json
import os

log_path = r'C:\Users\Nik\.gemini\antigravity\brain\676fe67a-acd9-4060-9e8c-e268ad70f463\.system_generated\logs\transcript.jsonl'
if os.path.exists(log_path):
    with open(log_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    print(f"Total history steps: {len(lines)}")
    # Let's search for conversation from step 800 onwards
    for idx in range(800, len(lines)):
        try:
            item = json.loads(lines[idx])
            role = item.get("source", "UNKNOWN")
            step_type = item.get("type", "UNKNOWN")
            content = item.get("content", "")
            if content and role != "SYSTEM":
                # Check if this contains model response or user input
                if step_type in ["USER_INPUT", "PLANNER_RESPONSE"] or "ui" in content.lower() or "theme" in content.lower():
                    print(f"[{idx}] Step {item.get('step_index')}: {role} ({step_type})")
                    print(content[:600])
                    print("=" * 60)
        except Exception as e:
            pass
else:
    print("Log path does not exist:", log_path)
