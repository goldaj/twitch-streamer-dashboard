import {createServer} from "node:http";
import {readFile} from "node:fs/promises";
import {fileURLToPath} from "node:url";
import {resolve} from "node:path";
import {TwitchHelix} from "../src/twitch-helix.mjs";
import {ObsWebSocket} from "../src/obs-websocket.mjs";
import {HealthCollector} from "../src/collector.mjs";

const ROOT=fileURLToPath(new URL("./",import.meta.url));
const PAGES=Object.freeze({
  "/":["index.html","text/html; charset=utf-8"],
  "/app.mjs":["app.mjs","text/javascript; charset=utf-8"],
  "/style.css":["style.css","text/css; charset=utf-8"]
});
function json(res,status,object){
  const data=JSON.stringify(object);
  res.writeHead(status,{"Content-Type":"application/json; charset=utf-8",
    "Cache-Control":"no-store","X-Content-Type-Options":"nosniff"});
  res.end(data);
}
export function createMonitorServer({collector}={}){
  if(!collector)throw new Error("Collector requis.");
  return createServer(async(req,res)=>{
    const host=req.headers.host||"";
    if(!/^(localhost|127\.0\.0\.1)(:\d+)?$/.test(host)){
      json(res,403,{error:"Accès exclusivement local"});return;
    }
    if(req.headers.origin && req.headers.origin!=="http://"+host){
      json(res,403,{error:"Origine refusée"});return;
    }
    const pathname=new URL(req.url||"/","http://"+host).pathname;
    try{
      if(req.method==="GET" && pathname==="/api/status"){
        json(res,200,collector.status());return;
      }
      if(req.method==="POST" && pathname==="/api/intent"){
        if(req.headers["x-local-control"]!=="stream-health" ||
          req.headers["content-type"]!=="application/json"){
          json(res,403,{error:"Contrôle local requis"});return;
        }
        let size=0,parts=[];
        for await(const chunk of req){
          size+=chunk.length;if(size>1024){json(res,413,{error:"Message trop volumineux"});return;}
          parts.push(chunk);
        }
        let body;
        try{body=JSON.parse(Buffer.concat(parts).toString("utf8"));}
        catch{json(res,400,{error:"JSON invalide"});return;}
        if(typeof body?.armed!=="boolean"){
          json(res,400,{error:"Champ armed booléen requis"});return;
        }
        collector.intent(body.armed);
        json(res,200,collector.status());return;
      }
      if(req.method==="GET" && Object.hasOwn(PAGES,pathname)){
        const [name,type]=PAGES[pathname];
        const data=await readFile(resolve(ROOT,name));
        res.writeHead(200,{"Content-Type":type,"Content-Length":data.length,
          "Cache-Control":"no-store","X-Content-Type-Options":"nosniff"});
        res.end(data);return;
      }
      json(res,404,{error:"Route inconnue"});
    }catch{
      json(res,500,{error:"Erreur interne"});
    }
  });
}
if(process.argv[1] && resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const twitch=new TwitchHelix({
    clientId:process.env.TWITCH_CLIENT_ID,clientSecret:process.env.TWITCH_CLIENT_SECRET,
    channel:process.env.TWITCH_CHANNEL
  });
  const obs=new ObsWebSocket({
    url:process.env.OBS_WEBSOCKET_URL||"ws://127.0.0.1:4455",
    password:process.env.OBS_WEBSOCKET_PASSWORD||""
  });
  const collector=new HealthCollector({twitch,obs});
  const server=createMonitorServer({collector});
  server.listen(8767,"127.0.0.1",()=>{
    collector.start();
    console.log("Stream Health local: http://127.0.0.1:8767/");
    console.log("Twitch : "+(twitch.configured?"configuration détectée":"non configuré")+
      " | OBS : connexion locale | viewer : pas encore de sonde");
  });
  const shutdown=()=>{collector.stop();server.close();};
  process.once("SIGINT",shutdown);process.once("SIGTERM",shutdown);
}
