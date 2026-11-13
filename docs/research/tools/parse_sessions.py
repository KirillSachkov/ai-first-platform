# Сжимает журнал Claude Code или Codex в текст: сообщения владельца, ответы агента, вызовы инструментов.
# Запуск: python3 -I parse_sessions.py <journal.jsonl> claude|codex [длина вызова; 1000 и больше добавляет результаты инструментов]

import json,sys,datetime
def ts(s):
    try:
        t=datetime.datetime.fromisoformat(s.replace('Z','+00:00'))+datetime.timedelta(hours=3)
        return t.strftime('%m-%d %H:%M:%S')
    except Exception: return s
def trunc(s,n): s=s if isinstance(s,str) else json.dumps(s,ensure_ascii=False); return s if len(s)<=n else s[:n]+f'…[+{len(s)-n}]'
f=sys.argv[1]; kind=sys.argv[2]; TL=int(sys.argv[3]) if len(sys.argv)>3 else 300
out=[]
for i,l in enumerate(open(f)):
    try: d=json.loads(l)
    except: continue
    if kind=='codex':
        p=d.get('payload',{}) or {}
        t=ts(d.get('timestamp',''))
        if d['type']=='response_item':
            pt=p.get('type')
            if pt=='message':
                txt='\n'.join(c.get('text','') for c in p.get('content',[]) if isinstance(c,dict))
                kinds=(p.get('internal_chat_message_metadata_passthrough') or {}).get('content_item_kinds')
                if p.get('role')=='user':
                    tag='USER' if kinds==['user.text'] or kinds is None and not txt.startswith('# AGENTS.md') and not txt.startswith('<') else f'USER-INJECT{kinds}'
                    if tag!='USER': txt=trunc(txt,200)
                    out.append(f'\n=== [{i}] {t} {tag}\n{txt}')
                elif p.get('role')=='assistant':
                    out.append(f'\n=== [{i}] {t} ASSISTANT\n{txt}')
            elif pt=='agent_message':
                out.append(f'\n=== [{i}] {t} AGENT_MSG {trunc(json.dumps({k:v for k,v in p.items() if k!="type"},ensure_ascii=False),2500)}')
            elif pt in('function_call','custom_tool_call'):
                a=p.get('arguments') or p.get('input') or ''
                out.append(f'  [{i}] {t} TOOL {p.get("name")}: {trunc(a,TL)}')
    else:
        t=ts(d.get('timestamp',''))
        side=' SIDE' if d.get('isSidechain') else ''
        if d.get('type')=='queue-operation' and d.get('content') and d.get('operation')=='remove':
            out.append(f'\n=== [{i}] {t} USER-MIDTURN({d.get("reason")})\n{d["content"]}')
        if d.get('type')=='user':
            m=d.get('message',{}); c=m.get('content')
            if isinstance(c,str): c=[{'type':'text','text':c}]
            for b in c or []:
                if b.get('type')=='text':
                    txt=b['text']
                    meta=d.get('isMeta') or txt.startswith('Base directory for this skill') or txt.startswith('<system-reminder>') or txt.startswith('<task-notification') or txt.startswith('<local-command') or txt.startswith('<command-')
                    tag='USER-META' if meta else 'USER'
                    if meta: txt=trunc(txt,300)
                    out.append(f'\n=== [{i}] {t} {tag}{side}\n{txt}')
                elif b.get('type')=='tool_result' and TL>=1000:
                    cc=b.get('content'); 
                    if isinstance(cc,list): cc=' '.join(x.get('text','') for x in cc if isinstance(x,dict))
                    out.append(f'  [{i}] RESULT: {trunc(cc,400)}')
        elif d.get('type')=='assistant':
            for b in d.get('message',{}).get('content',[]) or []:
                if b.get('type')=='text': out.append(f'\n=== [{i}] {t} ASSISTANT{side}\n{b["text"]}')
                elif b.get('type')=='tool_use': out.append(f'  [{i}] {t} TOOL{side} {b.get("name")}: {trunc(b.get("input"),TL)}')
print('\n'.join(out))
