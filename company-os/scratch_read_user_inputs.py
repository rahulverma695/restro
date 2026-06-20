import json
import os

log_path = r'C:\Users\Nik\.gemini\antigravity\brain\676fe67a-acd9-4060-9e8c-e268ad70f463\.system_generated\logs\transcript.jsonl'
if os.path.exists(log_path):
    with open(log_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    print(f"Total history steps: {len(lines)}")
    
    # Let's filter for USER_INPUT steps
    user_inputs = []
    for idx, line in enumerate(lines):
        try:
            item = json.loads(line)
            if item.get("type") == "USER_INPUT":
                user_inputs.append((idx, item))
        except Exception as e:
            pass
            
    print(f"Total User Inputs: {len(user_inputs)}")
    for idx, (step_idx, item) in enumerate(user_inputs):
        content = item.get("content", "")
        print(f"[{idx+1}] Step {step_idx}: User Input:")
        print(content)
        print("=" * 60)
else:
    print("Log path does not exist:", log_path)
