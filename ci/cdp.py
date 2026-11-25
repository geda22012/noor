import sys,json,subprocess,time,urllib.request
import websocket
def sock():
    out=subprocess.run(['adb','shell','cat','/proc/net/unix'],capture_output=True,text=True).stdout
    names=[l.split('@')[-1].strip() for l in out.splitlines() if 'webview_devtools_remote' in l]
    if not names: raise SystemExit('no devtools socket')
    subprocess.run(['adb','forward','tcp:9222','localabstract:'+names[-1]],check=True)
    t=json.load(urllib.request.urlopen('http://127.0.0.1:9222/json'))
    return [x for x in t if x.get('type')=='page'][0]['webSocketDebuggerUrl']
def ev(js):
    ws=websocket.create_connection(sock(),timeout=20,suppress_origin=True)
    ws.send(json.dumps({'id':1,'method':'Runtime.evaluate','params':{'expression':js,'returnByValue':True,'awaitPromise':True}}))
    while True:
        r=json.loads(ws.recv())
        if r.get('id')==1: print(json.dumps(r.get('result',{}).get('result',{}).get('value'),ensure_ascii=False)); return


def setfile(sel,path):
    ws=websocket.create_connection(sock(),timeout=20,suppress_origin=True)
    def call(i,m,p):
        ws.send(json.dumps({'id':i,'method':m,'params':p}))
        while True:
            r=json.loads(ws.recv())
            if r.get('id')==i: return r
    d=call(1,'DOM.getDocument',{'depth':1})
    n=call(2,'DOM.querySelector',{'nodeId':d['result']['root']['nodeId'],'selector':sel})
    r=call(3,'DOM.setFileInputFiles',{'files':[path],'nodeId':n['result']['nodeId']})
    print(json.dumps(r))
if sys.argv[1]=='file': setfile(sys.argv[2],sys.argv[3])
else: ev(sys.argv[1])
