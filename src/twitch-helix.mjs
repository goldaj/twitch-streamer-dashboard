/**
 * Public live status from Twitch Helix. Uses a server-side app access token.
 * Does NOT attest to viewer image or sound and does NOT handle EventSub yet.
 * https://dev.twitch.tv/docs/authentication/getting-tokens-oauth
 * https://dev.twitch.tv/docs/api/reference#get-streams
 */
export class TwitchError extends Error {
  constructor(message){super(message);this.name="TwitchError";}
}
export class TwitchHelix {
  constructor({clientId,clientSecret,channel,fetchFn=fetch,now=Date.now}={}){
    if(channel && !/^[a-zA-Z0-9_]{3,25}$/.test(channel))throw new TwitchError("Nom de chaîne Twitch invalide.");
    this.clientId=clientId;
    this.clientSecret=clientSecret;
    this.channel=channel?.toLowerCase();
    this.fetchFn=fetchFn;
    this.now=now;
    this.token=null;
    this.expiry=0;
    this.backoffUntil=0;
  }
  get configured(){return !!(this.channel && this.clientId && this.clientSecret);}
  async getToken(force=false){
    if(!this.configured)throw new TwitchError("Identifiants Twitch absents.");
    if(!force && this.token && this.now()<this.expiry-60_000)return this.token;
    const body=new URLSearchParams({
      client_id:this.clientId,client_secret:this.clientSecret,grant_type:"client_credentials"
    });
    const res=await this.fetchFn("https://id.twitch.tv/oauth2/token",{
      method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},
      body,signal:AbortSignal.timeout(10_000)
    });
    if(!res.ok)throw new TwitchError("Twitch OAuth HTTP "+res.status);
    const json=await res.json();
    if(typeof json.access_token!=="string" || !Number.isFinite(json.expires_in))
      throw new TwitchError("Twitch OAuth: réponse invalide.");
    this.token=json.access_token;
    this.expiry=this.now()+json.expires_in*1000;
    return this.token;
  }
  async poll(){
    if(this.now()<this.backoffUntil)throw new TwitchError("Twitch : attente du quota.");
    let token=await this.getToken();
    for(let retry=0;retry<2;retry++){
      const url="https://api.twitch.tv/helix/streams?user_login="+encodeURIComponent(this.channel);
      const res=await this.fetchFn(url,{
        headers:{"Authorization":"Bearer "+token,"Client-Id":this.clientId},
        signal:AbortSignal.timeout(10_000)
      });
      if(res.status===401 && retry===0){
        token=await this.getToken(true);
        continue;
      }
      if(res.status===429){
        const reset=Number(res.headers?.get?.("ratelimit-reset"));
        const until=Number.isFinite(reset) && reset>this.now()/1000
          ? reset*1000 : this.now()+60_000;
        this.backoffUntil=Math.min(this.now()+300_000,until);
        throw new TwitchError("Twitch Helix : quota atteint.");
      }
      if(!res.ok)throw new TwitchError("Twitch Helix HTTP "+res.status);
      const json=await res.json();
      if(!Array.isArray(json?.data))throw new TwitchError("Réponse Helix malformée.");
      const live=json.data.find(x=>x?.user_login?.toLowerCase()===this.channel &&
        x?.type==="live")||null;
      return {online:!!live,at:this.now(),streamId:live?.id||null,
        startedAt:live?.started_at||null};
    }
    throw new TwitchError("Twitch: authentification refusée.");
  }
}
