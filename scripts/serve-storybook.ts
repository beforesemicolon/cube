import {createServer} from 'node:http'
import {readFile} from 'node:fs/promises'
import {resolve,extname,sep} from 'node:path'
const root=resolve('storybook-static')
const types:Record<string,string>={'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.webm':'video/webm','.vtt':'text/vtt','.woff':'font/woff','.woff2':'font/woff2'}
createServer(async(req,res)=>{
    try{const pathname=decodeURIComponent(new URL(req.url??'/', 'http://127.0.0.1').pathname),file=resolve(root,'.'+(pathname==='/'?'/index.html':pathname));if(!file.startsWith(root+sep)){res.writeHead(403).end();return}const data=await readFile(file);res.writeHead(200,{'Content-Type':types[extname(file)]??'application/octet-stream'}).end(data)}catch{res.writeHead(404).end('Not found')}
}).listen(6006,'127.0.0.1')
